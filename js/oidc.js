// oidc.js - OIDC Authorization Code + PKCE using MSAL Browser
// Requires: msal-browser loaded via CDN and config.js & logging.js initialized

(function () {
  let msalInstance;
  let msalInitPromise = null;
  let googleTokens = null;
  let currentProvider = (window.CARA_CORE_CONFIG && window.CARA_CORE_CONFIG.provider) || 'azure';
  const GOOGLE_STATE_KEY = 'google_oauth_state';
  const GOOGLE_VERIFIER_KEY = 'google_pkce_verifier';
  const GOOGLE_REQUEST_ID_KEY = 'google_oauth_request_id';
  const GOOGLE_LOGIN_STARTED_AT_KEY = 'google_oauth_login_started_at';
  const GOOGLE_NONCE_KEY = 'google_oauth_nonce';
  function buildMsalConfig() {
    const cfg = window.CARA_CORE_CONFIG || {};
    const runtimeOidc = (cfg.oidc) ? cfg.oidc : (window.OIDC_CONFIGS && window.OIDC_CONFIGS[currentProvider]) || {};
    return {
      auth: {
        clientId: runtimeOidc.clientId,
        authority: runtimeOidc.authority,
        redirectUri: runtimeOidc.redirectUri || (location.origin + '/secure/'),
        postLogoutRedirectUri: runtimeOidc.postLogoutRedirectUri || (location.origin + '/secure/'),
        navigateToLoginRequestUrl: true,
      },
      cache: {
        cacheLocation: runtimeOidc.cacheLocation || 'sessionStorage',
        storeAuthStateInCookie: false,
      },
      system: { loggerOptions: { loggerCallback: () => {} } }
    };
  }
  let lastIdTokenClaims = null;

  function base64UrlEncode(buffer) {
    if (!buffer) return '';
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
  }

  async function pkceChallengeFromVerifier(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
  }

  function decodeJwt(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const raw = atob(padded);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    try {
      if (typeof TextDecoder !== 'undefined') {
        return JSON.parse(new TextDecoder().decode(bytes));
      }
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  function clearAuthSearchParams() {
    if (window.history && typeof window.history.replaceState === 'function') {
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  function pseudoIdFromClaims(claims, salt) {
    const sub = (claims && claims.sub) ? String(claims.sub) : '';
    if (!sub) return undefined;
    // hash(sub + salt) using subtle crypto
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(sub + (salt || '')))
      .then(buf => Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0')).join(''));
  }

  async function ensureMsalReady() {
    if (currentProvider !== 'azure') {
      return;
    }
    if (!msalInstance) {
      init();
    }
    if (!msalInstance) {
      throw new Error('MSAL instance não disponível.');
    }
    if (typeof msalInstance.initialize === 'function') {
      if (!msalInitPromise) {
        msalInitPromise = msalInstance.initialize().catch(err => {
          msalInitPromise = null;
          throw err;
        });
      }
      await msalInitPromise;
    }
  }

  async function login() {
    const cfg = window.CARA_CORE_CONFIG || {};
    const runtimeConfig = (cfg.oidc) ? cfg.oidc : (window.OIDC_CONFIGS && window.OIDC_CONFIGS[currentProvider]) || {};
    const clientId = runtimeConfig.clientId;
    if (!clientId || String(clientId).startsWith('REPLACE')) {
      if (cfg.environment !== 'prod') console.warn('OIDC login bloqueado: clientId não configurado em js/config.js');
      alert('Defina o clientId do Entra ID em js/config.js para continuar.');
      return;
    }
    if (currentProvider === 'google') {
      const redirectUri = runtimeConfig.redirectUri || (location.origin + '/secure/');
      const scopes = Array.isArray(runtimeConfig.scopes) && runtimeConfig.scopes.length ? runtimeConfig.scopes.join(' ') : 'openid profile email';
      if (cfg.environment !== 'prod') {
        console.info('[Google OAuth] redirectUri em uso:', redirectUri, '\nGaranta que esteja registrado em Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs > Authorized redirect URIs.');
      }
      const codeVerifier = generateCodeVerifier();
      let codeChallenge;
      try {
        codeChallenge = await pkceChallengeFromVerifier(codeVerifier);
      } catch (err) {
        if (cfg.environment !== 'prod') console.error('Falha ao gerar PKCE challenge para Google OAuth', err);
        throw err;
      }
      const state = self.crypto.randomUUID();
      const nonce = self.crypto.randomUUID();
      const requestId = self.crypto.randomUUID();
      sessionStorage.setItem(GOOGLE_VERIFIER_KEY, codeVerifier);
      sessionStorage.setItem(GOOGLE_STATE_KEY, state);
      sessionStorage.setItem(GOOGLE_REQUEST_ID_KEY, requestId);
      sessionStorage.setItem(GOOGLE_LOGIN_STARTED_AT_KEY, String(Date.now()));
      sessionStorage.setItem(GOOGLE_NONCE_KEY, nonce);
      await Logging.sendLog({
        ts: new Date().toISOString(),
        event: 'oidc.login.start',
        request_id: requestId,
        flow: 'authorization_code_pkce',
        status: 'ok',
      });
      const authParams = new URLSearchParams({
        client_id: runtimeConfig.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        prompt: 'select_account',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        nonce,
      });
      location.href = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
      return;
    }
    await ensureMsalReady();
    const requestId = self.crypto.randomUUID();
    const start = performance.now();
    try {
      const res = await msalInstance.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
      });
      // loginRedirect does not resolve on success (it navigates), but keep here for API symmetry
      await Logging.sendLog({
        ts: new Date().toISOString(),
        event: 'oidc.login.start',
        request_id: requestId,
        flow: 'authorization_code_pkce',
        status: 'ok'
      });
      return res;
    } catch (err) {
      await Logging.sendLog({
        ts: new Date().toISOString(),
        event: 'oidc.login.error',
        request_id: requestId,
        flow: 'authorization_code_pkce',
        status: 'error',
        error_code: String(err && err.errorCode || 'unknown'),
        latency_ms: Math.round(performance.now() - start),
      });
      if (cfg.environment !== 'prod') console.log('login error', err);
      throw err;
    }
  }

  async function handleRedirect() {
    const cfg = window.CARA_CORE_CONFIG || {};
    if (currentProvider === 'google') {
      const params = new URLSearchParams(window.location.search || '');
      if (!params.has('code') && !params.has('error')) {
        return null;
      }
      const storedRequestId = sessionStorage.getItem(GOOGLE_REQUEST_ID_KEY);
      const requestId = storedRequestId || self.crypto.randomUUID();
      const startedAt = Number(sessionStorage.getItem(GOOGLE_LOGIN_STARTED_AT_KEY) || Date.now());
      const baseLatency = Math.max(0, Date.now() - startedAt);
      sessionStorage.removeItem(GOOGLE_LOGIN_STARTED_AT_KEY);
      sessionStorage.removeItem(GOOGLE_REQUEST_ID_KEY);

      const stateParam = params.get('state');
      const storedState = sessionStorage.getItem(GOOGLE_STATE_KEY);
      if (storedState && stateParam && storedState !== stateParam) {
        await Logging.sendLog({
          ts: new Date().toISOString(),
          event: 'oidc.callback.error',
          request_id: requestId,
          flow: 'authorization_code_pkce',
          status: 'error',
          error_code: 'google_state_mismatch',
          latency_ms: baseLatency,
        });
        sessionStorage.removeItem(GOOGLE_STATE_KEY);
        sessionStorage.removeItem(GOOGLE_VERIFIER_KEY);
        sessionStorage.removeItem(GOOGLE_NONCE_KEY);
        clearAuthSearchParams();
        throw new Error('google_state_mismatch');
      }
      sessionStorage.removeItem(GOOGLE_STATE_KEY);

      if (params.has('error')) {
        const errorCode = params.get('error') || 'unknown';
        const errorDescription = params.get('error_description') || '';
        await Logging.sendLog({
          ts: new Date().toISOString(),
          event: 'oidc.callback.error',
          request_id: requestId,
          flow: 'authorization_code_pkce',
          status: 'error',
          error_code: `google_oauth_error:${errorCode}`,
          latency_ms: baseLatency,
        });
        clearAuthSearchParams();
        sessionStorage.removeItem(GOOGLE_NONCE_KEY);
        throw new Error(`google_oauth_error:${errorCode}${errorDescription ? ':' + errorDescription : ''}`);
      }

      const code = params.get('code');
      if (!code) {
        clearAuthSearchParams();
        sessionStorage.removeItem(GOOGLE_NONCE_KEY);
        return null;
      }
      const codeVerifier = sessionStorage.getItem(GOOGLE_VERIFIER_KEY);
      if (!codeVerifier) {
        await Logging.sendLog({
          ts: new Date().toISOString(),
          event: 'oidc.callback.error',
          request_id: requestId,
          flow: 'authorization_code_pkce',
          status: 'error',
          error_code: 'google_missing_verifier',
          latency_ms: baseLatency,
        });
        clearAuthSearchParams();
        sessionStorage.removeItem(GOOGLE_NONCE_KEY);
        throw new Error('google_missing_verifier');
      }
      sessionStorage.removeItem(GOOGLE_VERIFIER_KEY);

      const storedNonce = sessionStorage.getItem(GOOGLE_NONCE_KEY);
      if (!storedNonce) {
        await Logging.sendLog({
          ts: new Date().toISOString(),
          event: 'oidc.callback.error',
          request_id: requestId,
          flow: 'authorization_code_pkce',
          status: 'error',
          error_code: 'google_missing_nonce',
          latency_ms: baseLatency,
        });
        clearAuthSearchParams();
        throw new Error('google_missing_nonce');
      }
      sessionStorage.removeItem(GOOGLE_NONCE_KEY);

      const runtimeConfig = (cfg.oidc) ? cfg.oidc : (window.OIDC_CONFIGS && window.OIDC_CONFIGS[currentProvider]) || {};
      const redirectUri = runtimeConfig.redirectUri || (location.origin + '/secure/');
      const tokenEndpoint = runtimeConfig.tokenEndpoint || cfg.googleTokenEndpoint || '/oauth/google/token';
      let tokenJson = null;
      let tokenRespOk = false;
      const exchangeStart = performance.now();
      try {
        const tokenResp = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
            nonce: storedNonce,
          }),
        });
        tokenRespOk = tokenResp.ok;
        tokenJson = await tokenResp.json().catch(() => null);
      } catch (err) {
        tokenRespOk = false;
      }
      if (!tokenRespOk || !tokenJson || tokenJson.error) {
        const errorCode = tokenJson && (tokenJson.error || tokenJson.error_description)
          ? String(tokenJson.error || tokenJson.error_description)
          : 'network';
        await Logging.sendLog({
          ts: new Date().toISOString(),
          event: 'oidc.callback.error',
          request_id: requestId,
          flow: 'authorization_code_pkce',
          status: 'error',
          error_code: `google_token_exchange:${errorCode}`,
          latency_ms: Math.round(performance.now() - exchangeStart),
        });
        clearAuthSearchParams();
        throw new Error('google_token_exchange_failed');
      }

      googleTokens = tokenJson;
      const idClaims = decodeJwt(tokenJson.id_token);
      if (idClaims) {
        lastIdTokenClaims = idClaims;
      }
      const pseudo = await pseudoIdFromClaims(idClaims, cfg.pseudoSaltHint);
      await Logging.sendLog({
        ts: new Date().toISOString(),
        event: 'oidc.login.success',
        request_id: requestId,
        flow: 'authorization_code_pkce',
        status: 'ok',
        latency_ms: baseLatency ? Math.round(baseLatency) : Math.round(performance.now() - exchangeStart),
        user_pseudo_id: pseudo,
        idp_iss: idClaims && idClaims.iss ? String(idClaims.iss) : undefined,
        http_status: 200,
      });
      clearAuthSearchParams();
      return { provider: 'google', tokens: tokenJson, idTokenClaims: idClaims };
    }
    await ensureMsalReady();
    const requestId = self.crypto.randomUUID();
    const start = performance.now();
    try {
      const tokenResp = await msalInstance.handleRedirectPromise();
      if (!tokenResp) {
        // not a redirect
        return null;
      }
      // Extract only claims needed for pseudo id and issuer
      const idTokenClaims = tokenResp.idTokenClaims || {};
      lastIdTokenClaims = idTokenClaims;
      const iss = String(idTokenClaims.iss || '');
      const pseudo = await pseudoIdFromClaims(idTokenClaims, cfg.pseudoSaltHint);

      await Logging.sendLog({
        ts: new Date().toISOString(),
        event: 'oidc.login.success',
        request_id: requestId,
        user_pseudo_id: pseudo,
        idp_iss: iss,
        flow: 'authorization_code_pkce',
        status: 'ok',
        latency_ms: Math.round(performance.now() - start),
        http_status: 200,
      });
      return tokenResp;
    } catch (err) {
      await Logging.sendLog({
        ts: new Date().toISOString(),
        event: 'oidc.callback.error',
        request_id: requestId,
        flow: 'authorization_code_pkce',
        status: 'error',
        error_code: String(err && err.errorCode || 'unknown'),
        latency_ms: Math.round(performance.now() - start),
      });
      if (cfg.environment !== 'prod') console.log('redirect error', err);
      throw err;
    }
  }

  async function logout() {
    if (currentProvider === 'google') {
      googleTokens = null;
      lastIdTokenClaims = null;
      sessionStorage.removeItem(GOOGLE_VERIFIER_KEY);
      sessionStorage.removeItem(GOOGLE_STATE_KEY);
      sessionStorage.removeItem(GOOGLE_REQUEST_ID_KEY);
      sessionStorage.removeItem(GOOGLE_LOGIN_STARTED_AT_KEY);
      const logoutRedirect = (window.location && window.location.origin)
        ? window.location.origin + '/secure/logout.html'
        : '/secure/logout.html';
      const googleLogoutUrl = 'https://accounts.google.com/Logout?continue=' + encodeURIComponent(logoutRedirect);
      location.href = googleLogoutUrl;
      return;
    }
    const cfg = window.CARA_CORE_CONFIG || {};
    await ensureMsalReady();
    try {
      await msalInstance.logoutRedirect();
      await Logging.sendLog({
        event: 'oidc.logout',
        status: 'ok',
        flow: 'authorization_code_pkce',
        ts: new Date().toISOString(),
        request_id: self.crypto.randomUUID(),
      });
    } catch (err) {
      await Logging.sendLog({
        event: 'oidc.logout.error',
        status: 'error',
        flow: 'authorization_code_pkce',
        ts: new Date().toISOString(),
        request_id: self.crypto.randomUUID(),
        error_code: String(err && err.errorCode || 'unknown'),
      });
      if (cfg.environment !== 'prod') console.log('logout error', err);
    }
  }

  function init() {
    if (currentProvider !== 'azure') {
      msalInstance = null;
      msalInitPromise = null;
      return Promise.resolve();
    }
    const cfg = buildMsalConfig();
    const msalGlobal = (typeof window !== 'undefined' && window.msal) ? window.msal : null;
    if (!msalGlobal || typeof msalGlobal.PublicClientApplication !== 'function') {
      throw new Error('MSAL global indisponível. Verifique se msal-browser.min.js foi carregado.');
    }
    msalInstance = new msalGlobal.PublicClientApplication(cfg);
    msalInitPromise = (typeof msalInstance.initialize === 'function')
      ? msalInstance.initialize().catch(err => {
          msalInitPromise = null;
          throw err;
        })
      : Promise.resolve();
    return msalInitPromise;
  }

  function getCurrentUserEmail() {
    if (currentProvider === 'google') {
      try {
        let claims = lastIdTokenClaims;
        if (!claims && googleTokens && googleTokens.id_token) {
          claims = decodeJwt(googleTokens.id_token);
          if (claims) {
            lastIdTokenClaims = claims;
          }
        }
        if (claims && (claims.email || claims.preferred_username)) {
          return String(claims.email || claims.preferred_username).toLowerCase();
        }
      } catch (e) {
        return null;
      }
      return null;
    }
    if (!msalInstance) return null;
    try {
      // prefer claims from recent redirect
      const emailFromClaims = (lastIdTokenClaims && (lastIdTokenClaims.email || lastIdTokenClaims.preferred_username)) || null;
      if (emailFromClaims) return String(emailFromClaims).toLowerCase();
      // fallback to account username
      const accts = msalInstance.getAllAccounts();
      if (accts && accts.length > 0 && accts[0].username) {
        return String(accts[0].username).toLowerCase();
      }
    } catch (_) {}
    return null;
  }

  // allow runtime provider switching
  async function setProvider(provider) {
    if (!provider) return;
    currentProvider = provider;
    // update global config.provider
    if (window.CARA_CORE_CONFIG) window.CARA_CORE_CONFIG.provider = provider;
    // update runtime oidc reference if we have explicit OIDC_CONFIGS
    if (window.OIDC_CONFIGS && window.OIDC_CONFIGS[provider]) {
      window.CARA_CORE_CONFIG.oidc = window.OIDC_CONFIGS[provider];
    }
    if (provider !== 'google') {
      googleTokens = null;
      sessionStorage.removeItem(GOOGLE_VERIFIER_KEY);
      sessionStorage.removeItem(GOOGLE_STATE_KEY);
      sessionStorage.removeItem(GOOGLE_REQUEST_ID_KEY);
      sessionStorage.removeItem(GOOGLE_LOGIN_STARTED_AT_KEY);
    }
    // re-init msal instance
    try {
      if (msalInstance && typeof msalInstance.logoutRedirect === 'function') {
        // Attempt graceful cleanup of existing instance state (best-effort)
      }
    } catch (e) {}
    try {
      msalInitPromise = null;
      return init();
    } catch (e) { console.error('OIDC setProvider init error', e); }
  }

  window.OIDC = { init, login, logout, handleRedirect, getCurrentUserEmail, setProvider, _currentProvider: () => currentProvider };
})();
