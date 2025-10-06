/**
 * auth-standalone.js - Versão standalone da autenticação OIDC
 * Compatível com carregamento via script tag
 */

(function() {
    'use strict';
    
    const PROVIDER_STORAGE_KEY = 'cara_core_oidc_provider';

    function generateNonce(size = 32) {
        const defaultSize = typeof size === 'number' && size > 0 ? size : 32;
        if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
            const buffer = new Uint8Array(defaultSize);
            window.crypto.getRandomValues(buffer);
            return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
        }

        const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let nonce = '';
        for (let i = 0; i < defaultSize; i += 1) {
            const index = Math.floor(Math.random() * alphabet.length);
            nonce += alphabet.charAt(index);
        }
        return nonce;
    }

    function persistProvider(provider) {
        if (!provider) return;
        try {
            sessionStorage.setItem(PROVIDER_STORAGE_KEY, provider);
        } catch (err) {
            console.debug('Não foi possível armazenar provider na sessionStorage', err);
        }
        try {
            localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
        } catch (err) {
            console.debug('Não foi possível armazenar provider na localStorage', err);
        }
    }

    function clearStoredProvider() {
        try {
            sessionStorage.removeItem(PROVIDER_STORAGE_KEY);
        } catch (err) {
            console.debug('Não foi possível remover provider da sessionStorage', err);
        }
        try {
            localStorage.removeItem(PROVIDER_STORAGE_KEY);
        } catch (err) {
            console.debug('Não foi possível remover provider da localStorage', err);
        }
    }

    function readStoredProvider() {
        let value = null;
        try {
            value = sessionStorage.getItem(PROVIDER_STORAGE_KEY) || null;
        } catch (err) {
            value = null;
        }

        if (!value) {
            try {
                value = localStorage.getItem(PROVIDER_STORAGE_KEY) || null;
            } catch (err) {
                value = null;
            }
        }

        return value;
    }

    function clearOidcStorage() {
        const prefixes = [
            'oidc.',
            'oidc.user',
            'oidc.storage',
            'oidc.metadata',
            'oidc.authority',
            'oidc.client',
            'oidc.states',
            'oidc.signin'
        ];

        const cleanup = (store) => {
            if (!store || typeof store.length !== 'number') return;
            try {
                const keysToRemove = [];
                for (let i = 0; i < store.length; i += 1) {
                    const key = store.key(i);
                    if (!key) continue;
                    if (prefixes.some(prefix => key.startsWith(prefix))) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => {
                    try {
                        store.removeItem(key);
                    } catch (err) {
                        console.debug('Falha ao remover item OIDC do storage', key, err);
                    }
                });
            } catch (err) {
                console.debug('Não foi possível iterar no storage OIDC', err);
            }
        };

        try {
            cleanup(sessionStorage);
        } catch (err) {
            console.debug('Falha ao limpar sessionStorage OIDC', err);
        }
        try {
            cleanup(localStorage);
        } catch (err) {
            console.debug('Falha ao limpar localStorage OIDC', err);
        }
    }

    function isAuthorityMismatchError(error) {
        if (!error) return false;
        let text = '';
        if (typeof error === 'string') {
            text = error;
        } else if (error && typeof error === 'object') {
            text = error.message || error.error_description || JSON.stringify(error);
        }
        text = String(text || '').toLowerCase();
        return text.includes('authority mismatch') || text.includes('settings vs. signin state');
    }

    function isHttpStatusError(error, statusCode) {
        if (!error) return false;
        const code = Number(statusCode);
        let working = '';
        if (typeof error === 'string') {
            working = error;
        } else if (error && typeof error === 'object') {
            working = error.message || error.error || error.error_description || JSON.stringify(error);
        }
        working = String(working || '').toLowerCase();
        return working.includes(` ${code}`) || working.includes(`(${code})`) || working.includes(`status ${code}`);
    }

    // Aguardar carregamento do oidc-client-ts
    function waitForOidc() {
        return new Promise((resolve) => {
            if (window.oidc) {
                resolve(window.oidc);
                return;
            }
            
            const checkOidc = () => {
                if (window.oidc) {
                    resolve(window.oidc);
                } else {
                    setTimeout(checkOidc, 100);
                }
            };
            
            checkOidc();
        });
    }

    class OIDCAuthManager {
        constructor() {
            this.userManager = null;
            this.currentProvider = null;
            this.isInitialized = false;
            this.providerStorageKey = PROVIDER_STORAGE_KEY;
            this.lastNonce = null;
            this.currentConfig = null;
            
            // Verificar se o logger está disponível
            this.logger = window.logOIDC || {
                info: (...args) => console.log('[INFO]', ...args),
                error: (...args) => console.error('[ERROR]', ...args),
                debug: (...args) => console.log('[DEBUG]', ...args),
                authEvent: (event, data) => console.log('[AUTH EVENT]', event, data),
                authError: (error, context) => console.error('[AUTH ERROR]', error, context),
                tokenEvent: (event, data) => console.log('[TOKEN EVENT]', event, data)
            };
        }

        async initialize(provider = null) {
            let resolvedProvider = provider;
            try {
                if (!resolvedProvider) {
                    const storedProvider = readStoredProvider();
                    if (storedProvider) {
                        resolvedProvider = storedProvider;
                    }
                }

                if (!resolvedProvider) {
                    resolvedProvider = 'google';
                }

                this.logger.info('Inicializando OIDC Auth Manager', { provider: resolvedProvider });
                
                // Aguardar oidc-client-ts estar disponível
                const oidc = await waitForOidc();
                
                // Obter configuração dinâmica (prioriza função dinâmica se disponível)
                let config;
                if (window.getProviderConfig) {
                    this.logger.debug('Usando configuração dinâmica', { provider: resolvedProvider });
                    config = await window.getProviderConfig(resolvedProvider);
                } else {
                    // Fallback para arquivo estático
                    this.logger.debug('Usando configuração estática', { provider: resolvedProvider });
                    const configResponse = await fetch(`/secure/config/${resolvedProvider}.json`);
                    if (!configResponse.ok) {
                        throw new Error(`Falha ao carregar configuração do ${resolvedProvider}`);
                    }
                    config = await configResponse.json();
                }
                
                this.currentProvider = resolvedProvider;
                this.currentConfig = config;
                
                // Configurar UserManager
                this.userManager = new oidc.UserManager({
                    ...config,
                    userStore: new oidc.WebStorageStateStore({ store: window.localStorage }),
                    loadUserInfo: true,
                    automaticSilentRenew: true,
                    includeIdTokenInSilentRenew: true,
                    monitorSession: true,
                    checkSessionInterval: 30000
                });

                this.patchUserManagerForNonce();

                // Configurar eventos
                this.setupEventHandlers();
                
                this.isInitialized = true;
                this.logger.authEvent('auth_initialized', { provider: resolvedProvider, config: { ...config, client_secret: '[MASKED]' } });
                persistProvider(this.currentProvider);
                this.logger.debug('provider_state_after_initialize', {
                    provider: this.currentProvider,
                    storedProvider: readStoredProvider()
                });
                
                return true;
            } catch (error) {
                this.logger.authError(error, { context: 'initialize', provider: resolvedProvider || provider });
                throw error;
            }
        }

        setupEventHandlers() {
            if (!this.userManager) return;

            this.userManager.events.addUserLoaded(user => {
                this.logger.authEvent('user_loaded', { 
                    provider: this.currentProvider,
                    userId: user.profile?.sub,
                    name: user.profile?.name 
                });
            });

            this.userManager.events.addUserUnloaded(() => {
                this.logger.authEvent('user_unloaded', { provider: this.currentProvider });
            });

            this.userManager.events.addAccessTokenExpiring(() => {
                this.logger.tokenEvent('access_token_expiring', { provider: this.currentProvider });
            });

            this.userManager.events.addAccessTokenExpired(() => {
                this.logger.tokenEvent('access_token_expired', { provider: this.currentProvider });
            });

            this.userManager.events.addSilentRenewError(error => {
                this.logger.authError(error, { context: 'silent_renew', provider: this.currentProvider });
            });
        }

        getCurrentTokenEndpointSafe() {
            try {
                return this.userManager?.settings?.metadata?.token_endpoint
                    || this.currentConfig?.metadata?.token_endpoint
                    || null;
            } catch (err) {
                this.logger.debug('token_endpoint_lookup_failed', { error: err?.message });
                return null;
            }
        }

        shouldAttachNonce() {
            const tokenEndpoint = this.getCurrentTokenEndpointSafe();
            if (!tokenEndpoint) {
                return false;
            }

            try {
                const parsed = new URL(tokenEndpoint, window.location.origin);
                const sameOrigin = parsed.origin === window.location.origin;
                if (!sameOrigin) {
                    return false;
                }
                return parsed.pathname.startsWith('/oauth/');
            } catch (err) {
                return typeof tokenEndpoint === 'string' && tokenEndpoint.startsWith('/oauth/');
            }
        }

        prepareNonceArgs(args = {}, context = 'signinRedirect') {
            const incomingArgs = args && typeof args === 'object' ? { ...args } : {};
            if (!this.shouldAttachNonce()) {
                return { args: incomingArgs, nonce: null, attached: false };
            }

            const baseExtras = (this.userManager?.settings?.extraTokenParams && typeof this.userManager.settings.extraTokenParams === 'object')
                ? this.userManager.settings.extraTokenParams
                : {};
            const providedExtras = (incomingArgs.extraTokenParams && typeof incomingArgs.extraTokenParams === 'object')
                ? incomingArgs.extraTokenParams
                : {};

            const mergedExtras = { ...baseExtras, ...providedExtras };
            const nonceValue = incomingArgs.nonce || mergedExtras.nonce || generateNonce();
            mergedExtras.nonce = nonceValue;

            const preparedArgs = {
                ...incomingArgs,
                nonce: nonceValue,
                extraTokenParams: mergedExtras
            };

            this.lastNonce = nonceValue;
            this.logger.debug('nonce_attached_to_request', {
                context,
                nonceLength: nonceValue.length,
                provider: this.currentProvider,
                tokenEndpoint: this.getCurrentTokenEndpointSafe()
            });

            return { args: preparedArgs, nonce: nonceValue, attached: true };
        }

        patchUserManagerForNonce() {
            if (!this.userManager || this.userManager.__caraNoncePatched) {
                return;
            }

            const managerInstance = this;
            const wrapMethod = (methodName, context) => {
                const original = managerInstance.userManager[methodName];
                if (typeof original !== 'function') {
                    return;
                }
                const bound = original.bind(managerInstance.userManager);
                managerInstance.userManager[methodName] = async function patchedSignin(args = {}) {
                    const prepared = managerInstance.prepareNonceArgs(args, context);
                    if (!prepared.attached) {
                        return bound(args);
                    }
                    return bound(prepared.args);
                };
            };

            wrapMethod('signinRedirect', 'signinRedirect');
            wrapMethod('signinSilent', 'signinSilent');
            wrapMethod('signinPopup', 'signinPopup');

            Object.defineProperty(this.userManager, '__caraNoncePatched', {
                value: true,
                enumerable: false,
                configurable: false,
                writable: false
            });
        }

        async login(provider = null) {
            if (provider && provider !== this.currentProvider) {
                await this.initialize(provider);
            }
            
            if (!this.isInitialized) {
                throw new Error('Auth manager não foi inicializado');
            }

            try {
                this.logger.authEvent('login_started', { provider: this.currentProvider });
                persistProvider(this.currentProvider);
                await this.userManager.signinRedirect();
            } catch (error) {
                this.logger.authError(error, { context: 'login', provider: this.currentProvider });
                throw error;
            }
        }

        async handleAuthCallback() {
            if (!this.isInitialized) {
                throw new Error('Auth manager não foi inicializado');
            }

            try {
                const user = await this.userManager.signinRedirectCallback();
                const storedProvider = readStoredProvider();
                this.logger.authEvent('login_success', { 
                    provider: this.currentProvider,
                    storedProvider,
                    userId: user.profile?.sub,
                    name: user.profile?.name,
                    expired: user?.expired,
                    expiresAt: user?.expires_at,
                    hasAccessToken: Boolean(user?.access_token),
                    hasIdToken: Boolean(user?.id_token)
                });
                return user;
            } catch (error) {
                this.logger.authError(error, { context: 'callback', provider: this.currentProvider });
                throw error;
            }
        }

        async getCurrentUser() {
            if (!this.isInitialized) {
                return null;
            }

            try {
                const user = await this.userManager.getUser();
                const storedProvider = readStoredProvider();

                if (!user) {
                    this.logger.debug('get_current_user_empty', {
                        provider: this.currentProvider,
                        storedProvider
                    });
                } else {
                    this.logger.debug('get_current_user_result', {
                        provider: this.currentProvider,
                        storedProvider,
                        expired: user.expired,
                        expiresAt: user.expires_at,
                        scope: user.scope,
                        sessionState: user.session_state
                    });
                }

                return user;
            } catch (error) {
                this.logger.authError(error, { 
                    context: 'get_user', 
                    provider: this.currentProvider,
                    storedProvider: readStoredProvider()
                });
                return null;
            }
        }

        async logout() {
            if (!this.isInitialized) {
                return;
            }

            try {
                this.logger.authEvent('logout_started', { provider: this.currentProvider });
                await this.userManager.signoutRedirect();
            } catch (error) {
                this.logger.authError(error, { context: 'logout', provider: this.currentProvider });
                throw error;
            }
        }

        async isAuthenticated() {
            const user = await this.getCurrentUser();
            const authenticated = Boolean(user) && !user.expired;
            this.logger.debug('is_authenticated_check', {
                provider: this.currentProvider || readStoredProvider(),
                hasUser: Boolean(user),
                expired: user?.expired,
                expiresAt: user?.expires_at,
                authenticated
            });
            return authenticated;
        }

        getLastUsedProvider() {
            return this.currentProvider || readStoredProvider() || null;
        }

        /**
         * Trocar para um provedor diferente
         * @param {string} newProvider - Novo provedor ('google' ou 'entra')
         */
        async switchProvider(newProvider) {
            if (this.currentProvider === newProvider) {
                this.logger.debug('Provider já é o atual', { provider: newProvider });
                return;
            }

            try {
                this.logger.authEvent('switching_provider', { 
                    from: this.currentProvider, 
                    to: newProvider 
                });

                // Persistir seleção antes de reinicializar
                persistProvider(newProvider);
                this.logger.debug('provider_persisted_before_switch', {
                    targetProvider: newProvider,
                    storedProvider: readStoredProvider()
                });

                // Limpar caches antigos para evitar authority mismatch
                clearOidcStorage();
                try {
                    if (this.userManager && typeof this.userManager.clearStaleState === 'function') {
                        await this.userManager.clearStaleState();
                    }
                } catch (clearError) {
                    this.logger.debug('Falha ao limpar stale state antes do switch', { error: clearError });
                }

                // Fazer logout local primeiro
                if (this.userManager) {
                    try {
                        await this.userManager.removeUser();
                    } catch (error) {
                        this.logger.debug('Erro ao remover usuário atual', { error });
                    }
                }

                // Reinicializar com novo provedor
                await this.initialize(newProvider);
                
                this.logger.authEvent('provider_switched', { provider: newProvider });
                
            } catch (error) {
                this.logger.authError(error, { 
                    context: 'switchProvider', 
                    from: this.currentProvider, 
                    to: newProvider 
                });
                throw error;
            }
        }
    }

    // Tornar disponível globalmente
    window.OIDCAuth = new OIDCAuthManager();
    
    // Inicializar automaticamente se houver parâmetros de callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('state')) {
        // Função async para handle do callback
        (async function handleCallback() {
            try {
                const storedProviderBeforeInit = (function() {
                    try {
                        return window.OIDCAuth.getLastUsedProvider ? window.OIDCAuth.getLastUsedProvider() : null;
                    } catch (err) {
                        console.warn('Nao foi possivel ler provider antes do callback', err);
                        return null;
                    }
                })();

                const providerHint = storedProviderBeforeInit || 'desconhecido';
                if (window.logOIDC && providerHint === 'google') {
                    const codeParam = urlParams.get('code') || '';
                    window.logOIDC.authEvent('google_callback_step_detected', {
                        step: 4,
                        provider: providerHint,
                        hasCode: Boolean(codeParam),
                        codeLength: codeParam ? codeParam.length : 0,
                        hasState: urlParams.has('state'),
                        timestamp: new Date().toISOString(),
                        currentPath: window.location.pathname
                    });
                }

                await window.OIDCAuth.initialize();
                await window.OIDCAuth.handleAuthCallback();
                
                // Redirecionar para área restrita após sucesso
                window.location.href = '/secure/restrita.html';
            } catch (error) {
                console.error('Erro no callback de autenticação:', error);
                let reason = 'unknown';
                try {
                    if (error && typeof error === 'object') {
                        reason = error.message || error.error || JSON.stringify(error).slice(0, 200);
                    } else if (error) {
                        reason = String(error).slice(0, 200);
                    }
                } catch (parseError) {
                    console.warn('Não foi possível serializar o erro do callback', parseError);
                }

                if (isAuthorityMismatchError(error)) {
                    if (window.logOIDC) {
                        window.logOIDC.authError(error, {
                            context: 'callback_authority_mismatch',
                            action: 'resetting_oidc_storage'
                        });
                    }
                    clearOidcStorage();
                    clearStoredProvider();
                    try {
                        if (window.OIDCAuth && typeof window.OIDCAuth.userManager?.clearStaleState === 'function') {
                            await window.OIDCAuth.userManager.clearStaleState();
                        }
                    } catch (clearError) {
                        console.debug('Falha ao limpar estado antigo do oidc-client', clearError);
                    }

                    const params = new URLSearchParams({
                        error: 'callback_failed',
                        reason: 'authority_state_mismatch_reset'
                    });
                    window.location.href = `/secure/index.html?${params.toString()}`;
                    return;
                }

                if (isHttpStatusError(error, 405)) {
                    if (window.logOIDC) {
                        window.logOIDC.authError(error, {
                            context: 'callback_http_405',
                            action: 'advising_retry',
                            lastProvider: storedProviderBeforeInit || 'desconhecido'
                        });
                    }

                    clearOidcStorage();
                    clearStoredProvider();

                    const params = new URLSearchParams({
                        error: 'callback_failed',
                        reason: 'http_405_retry'
                    });
                    window.location.href = `/secure/index.html?${params.toString()}`;
                    return;
                }

                const params = new URLSearchParams({
                    error: 'callback_failed',
                    reason: reason
                });
                window.location.href = `/secure/index.html?${params.toString()}`;
            }
        })();
    }
    
    console.log('OIDC Auth Manager carregado e disponível em window.OIDCAuth');
})();