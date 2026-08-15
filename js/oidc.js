/**
 * OIDC runtime - static no-op fallback.
 * Authentication flows were intentionally removed for the static hosting mode.
 */
(function () {
  'use strict';
  window.__STATIC_OIDC_DISABLED__ = true;
  window.OIDC = {
    login() { return Promise.resolve(false); },
    logout() { return Promise.resolve(true); },
    handleRedirect() { return Promise.resolve(null); },
    setProvider() { return null; },
    getCurrentProvider() { return null; },
    isAuthenticated() { return false; }
  };
})();
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
