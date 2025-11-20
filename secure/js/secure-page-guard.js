/**
 * secure-page-guard.js - Proteção OIDC para páginas da área restrita
 * 
 * Este script garante que todas as páginas da área restrita estejam protegidas
 * por autenticação OIDC e autorização adequada.
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-01-XX
 */

(function() {
    'use strict';

    const CONFIG = {
        loginUrl: '/secure/index.html',
        maxWaitTime: 10000, // 10 segundos para aguardar OIDCAuth
        checkInterval: 200
    };

    /**
     * Aguarda componente estar disponível
     */
    async function waitForComponent(componentName, maxWaitTime = CONFIG.maxWaitTime) {
        const startTime = Date.now();
        
        while (!window[componentName]) {
            if (Date.now() - startTime > maxWaitTime) {
                console.warn(`[SecurePageGuard] Timeout aguardando ${componentName}`);
                return null;
            }
            await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
        }
        
        return window[componentName];
    }

    /**
     * Verifica autenticação OIDC
     */
    async function checkOIDCAuthentication() {
        try {
            // Aguardar OIDCAuth estar disponível
            const OIDCAuth = await waitForComponent('OIDCAuth', CONFIG.maxWaitTime);
            
            if (!OIDCAuth) {
                console.warn('[SecurePageGuard] OIDCAuth não disponível');
                return { authenticated: false, reason: 'oidc_not_available' };
            }

            // Verificar se está inicializado
            if (!OIDCAuth.isInitialized) {
                // Tentar inicializar
                const provider = localStorage.getItem('auth_provider') || 
                               sessionStorage.getItem('cara_core_oidc_provider') ||
                               'google';
                
                try {
                    await OIDCAuth.initialize(provider);
                } catch (initError) {
                    console.warn('[SecurePageGuard] Erro ao inicializar OIDCAuth:', initError);
                }
            }

            // Verificar autenticação
            const isAuthenticated = await OIDCAuth.isAuthenticated();
            
            if (!isAuthenticated) {
                return { authenticated: false, reason: 'not_authenticated' };
            }

            // Obter informações do usuário
            const user = await OIDCAuth.getUser();
            const email = user?.profile?.email || user?.profile?.preferred_username;
            const provider = user?.provider || localStorage.getItem('auth_provider') || 'google';

            return {
                authenticated: true,
                email: email,
                provider: provider,
                user: user
            };

        } catch (error) {
            console.error('[SecurePageGuard] Erro ao verificar autenticação OIDC:', error);
            return { authenticated: false, reason: 'error', error: error.message };
        }
    }

    /**
     * Verifica autenticação via SessionManager (fallback)
     */
    function checkSessionManagerAuth() {
        try {
            if (typeof SessionManager === 'undefined' || !SessionManager) {
                return { authenticated: false, reason: 'session_manager_not_available' };
            }

            const isAuthenticated = SessionManager.isAuthenticated();
            if (!isAuthenticated) {
                return { authenticated: false, reason: 'not_authenticated' };
            }

            const userInfo = SessionManager.getUserInfo();
            const email = userInfo?.email || localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
            const provider = localStorage.getItem('auth_provider') || 'google';

            return {
                authenticated: true,
                email: email,
                provider: provider,
                userInfo: userInfo
            };

        } catch (error) {
            console.error('[SecurePageGuard] Erro ao verificar SessionManager:', error);
            return { authenticated: false, reason: 'error', error: error.message };
        }
    }

    /**
     * Verifica autenticação via tokens no storage (fallback final)
     */
    function checkStorageAuth() {
        try {
            const accessToken = localStorage.getItem('auth_access_token') || 
                              sessionStorage.getItem('cara_core_access_token');
            
            if (!accessToken) {
                return { authenticated: false, reason: 'no_token' };
            }

            // Verificar se token expirou
            const expiresAt = localStorage.getItem('auth_expires_at');
            if (expiresAt) {
                const now = Math.floor(Date.now() / 1000);
                if (now >= parseInt(expiresAt)) {
                    return { authenticated: false, reason: 'token_expired' };
                }
            }

            const email = localStorage.getItem('user_email') || 
                         localStorage.getItem('auth_user_email') ||
                         sessionStorage.getItem('cara_core_user_email');
            
            const provider = localStorage.getItem('auth_provider') || 'google';

            return {
                authenticated: true,
                email: email,
                provider: provider
            };

        } catch (error) {
            console.error('[SecurePageGuard] Erro ao verificar storage:', error);
            return { authenticated: false, reason: 'error', error: error.message };
        }
    }

    /**
     * Aguarda requireAuthorization estar disponível
     */
    async function waitForRequireAuthorization(maxWaitTime = 5000) {
        const startTime = Date.now();
        
        while (typeof requireAuthorization !== 'function') {
            if (Date.now() - startTime > maxWaitTime) {
                console.warn('[SecurePageGuard] Timeout aguardando requireAuthorization');
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return true;
    }

    /**
     * Verifica autorização do usuário
     */
    async function checkAuthorization(email, provider) {
        if (!email) {
            return { authorized: false, reason: 'no_email' };
        }

        try {
            // Aguardar requireAuthorization estar disponível
            const isAvailable = await waitForRequireAuthorization(5000);
            
            if (!isAvailable) {
                console.warn('[SecurePageGuard] requireAuthorization não disponível, tentando verificação direta via API');
                // Fallback: verificar diretamente via API
                return await checkAuthorizationViaAPI(email, provider);
            }

            // Verificar se requireAuthorization está disponível
            if (typeof requireAuthorization === 'function') {
                const isAuthorized = await requireAuthorization({
                    email: email,
                    provider: provider,
                    showLoading: false,
                    redirectOnFail: false // Não redirecionar aqui, vamos fazer manualmente
                });
                
                return { authorized: isAuthorized, reason: isAuthorized ? 'authorized' : 'not_authorized' };
            }

            // Fallback: verificar via API diretamente
            return await checkAuthorizationViaAPI(email, provider);

        } catch (error) {
            console.error('[SecurePageGuard] Erro ao verificar autorização:', error);
            return { authorized: false, reason: 'error', error: error.message };
        }
    }

    /**
     * Verifica autorização via API diretamente (fallback)
     */
    async function checkAuthorizationViaAPI(email, provider) {
        try {
            const backendUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5051'
                : 'https://caracore-backend-docker.azurewebsites.net';

            const response = await fetch(`${backendUrl}/api/check-authorization`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    provider: provider
                })
            });

            if (response.ok) {
                const result = await response.json();
                return { authorized: result.authorized === true, reason: result.authorized ? 'authorized' : 'not_authorized' };
            }

            return { authorized: false, reason: 'api_error' };

        } catch (error) {
            console.error('[SecurePageGuard] Erro ao verificar autorização:', error);
            return { authorized: false, reason: 'error', error: error.message };
        }
    }

    /**
     * Redireciona para página de login
     */
    function redirectToLogin(reason = 'not_authenticated') {
        const currentUrl = window.location.pathname;
        const redirectUrl = new URL(CONFIG.loginUrl, window.location.origin);
        
        redirectUrl.searchParams.set('redirect', currentUrl);
        redirectUrl.searchParams.set('error', reason);
        redirectUrl.searchParams.set('message', encodeURIComponent('Por favor, faça login para acessar esta página'));

        console.log('[SecurePageGuard] Redirecionando para login:', redirectUrl.toString());
        window.location.href = redirectUrl.toString();
    }

    /**
     * Protege a página atual
     */
    async function protectPage() {
        console.log('[SecurePageGuard] Iniciando proteção da página...');

        // Aguardar um pouco para scripts carregarem
        await new Promise(resolve => setTimeout(resolve, 500));

        // Tentar verificar autenticação em ordem de prioridade
        let authResult = null;

        // 1. Tentar OIDCAuth primeiro (mais confiável)
        authResult = await checkOIDCAuthentication();
        
        // 2. Se OIDCAuth não funcionou, tentar SessionManager
        if (!authResult.authenticated) {
            console.log('[SecurePageGuard] OIDCAuth não autenticado, tentando SessionManager...');
            authResult = checkSessionManagerAuth();
        }

        // 3. Se SessionManager não funcionou, tentar storage
        if (!authResult.authenticated) {
            console.log('[SecurePageGuard] SessionManager não autenticado, tentando storage...');
            authResult = checkStorageAuth();
        }

        // Se não está autenticado, redirecionar para login
        if (!authResult.authenticated) {
            console.warn('[SecurePageGuard] Usuário não autenticado, redirecionando...', authResult.reason);
            redirectToLogin(authResult.reason);
            return false;
        }

        console.log('[SecurePageGuard] Usuário autenticado:', authResult.email);

        // Verificar autorização
        const authzResult = await checkAuthorization(authResult.email, authResult.provider);
        
        if (!authzResult.authorized) {
            console.warn('[SecurePageGuard] Usuário não autorizado, redirecionando...', authzResult.reason);
            
            // Redirecionar para primeiro acesso se não autorizado
            if (authzResult.reason === 'not_authorized') {
                const firstAccessUrl = new URL('/secure/first-access.html', window.location.origin);
                firstAccessUrl.searchParams.set('email', authResult.email || '');
                firstAccessUrl.searchParams.set('provider', authResult.provider);
                window.location.href = firstAccessUrl.toString();
            } else {
                redirectToLogin('not_authorized');
            }
            return false;
        }

        console.log('[SecurePageGuard] Página protegida com sucesso');
        return true;
    }

    // Executar proteção quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            protectPage().catch(error => {
                console.error('[SecurePageGuard] Erro fatal na proteção:', error);
                redirectToLogin('protection_error');
            });
        });
    } else {
        protectPage().catch(error => {
            console.error('[SecurePageGuard] Erro fatal na proteção:', error);
            redirectToLogin('protection_error');
        });
    }

    // Exportar função para uso manual se necessário
    window.SecurePageGuard = {
        protect: protectPage,
        checkAuth: checkOIDCAuthentication,
        checkAuthz: checkAuthorization
    };

})();

