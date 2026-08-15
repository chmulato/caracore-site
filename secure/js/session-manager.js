/**
 * Session Manager - static no-op fallback.
 * No live OAuth/OIDC dependencies are active in this static deploy.
 */
const SessionManager = (() => {
  'use strict';
  return {
    isAuthenticated() { return false; },
    getUserInfo() { return null; },
    saveSession() { return null; },
    clearSession() { return null; },
    validateSession() { return { valid: false, reason: 'static_simulation' }; },
    logout() { return true; },
    handleUserLogout() { return true; },
    getSession() { return null; },
    isMinimalSession() { return false; },
    setProvider() { return null; },
    getProvider() { return null; }
  };
})();
window.SessionManager = SessionManager;                }
                
                // Verificar se precisa refresh
                if (data.user && data.user.expires_in < CONFIG.REFRESH_BEFORE) {
                    console.log('[SessionManager] Token próximo da expiração, fazendo refresh...');
                    await refreshToken();
                }
                
                updateLastActivity();
                return { valid: true };
            } else {
                console.log('[SessionManager] Token inválido');
                
                // Notificação de sessão inválida
                if (typeof NotificationBridge !== 'undefined') {
                    NotificationBridge.sessionExpired();
                }
                
                return { valid: false, reason: 'invalid_token' };
            }
        } catch (error) {
            console.warn('[SessionManager] Erro ao validar sessão no backend:', error);
            
            // Se for erro de rede (ERR_NAME_NOT_RESOLVED, ERR_FAILED, etc), 
            // assumir que o token local é válido (modo offline)
            if (error.message && (
                error.message.includes('Failed to fetch') || 
                error.message.includes('ERR_NAME_NOT_RESOLVED') ||
                error.message.includes('ERR_FAILED') ||
                error.message.includes('network')
            )) {
                console.log('[SessionManager] Erro de rede - assumindo token local válido (modo offline)');
                // Atualizar última atividade mesmo sem validação no backend
                updateLastActivity();
                return { valid: true, reason: 'offline_mode' };
            }
            
            // Para outros erros, considerar inválido
            return { valid: false, reason: 'validation_error' };
        }
    }
    
    /**
     * Faz refresh do token
     */
    async function refreshToken() {
        const refreshTokenVal = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        const provider = localStorage.getItem(CONFIG.STORAGE_KEYS.PROVIDER);
        
        if (!refreshTokenVal) {
            console.log('[SessionManager] Nenhum refresh token disponível');
            return false;
        }
        
        try {
            // Usar endpoint específico por provider
            const endpoint = provider === 'google' 
                ? '/auth/token/refresh/google'
                : provider === 'microsoft'
                ? '/auth/token/refresh/microsoft'
                : '/auth/token/refresh'; // Fallback para legado
            
            const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh_token: refreshTokenVal
                    // Não precisa enviar provider - já está no endpoint
                })
            });
            
            if (!response.ok) {
                console.error('[SessionManager] Erro ao fazer refresh:', response.status);
                
                // Notificação de falha no refresh
                if (typeof NotificationBridge !== 'undefined') {
                    NotificationBridge.showError('refresh_failed');
                }
                
                await logout();
                return false;
            }
            
            const data = await response.json();
            
            // Salvar novos tokens (não mostra notificação de login, apenas de refresh)
            const oldSaveSession = saveSession;
            saveSession = function(sessionData) {
                const { access_token, refresh_token, provider, expires_in } = sessionData;
                
                if (access_token) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, access_token);
                }
                
                if (refresh_token) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
                }
                
                if (provider) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.PROVIDER, provider);
                }
                
                if (expires_in) {
                    const expiresAt = Math.floor(Date.now() / 1000) + expires_in;
                    localStorage.setItem(CONFIG.STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
                }
                
                updateLastActivity();
            };
            
            saveSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token || refreshTokenVal,
                provider: provider,
                expires_in: data.expires_in
            });
            
            saveSession = oldSaveSession;
            
            console.log('[SessionManager] Token refresh bem-sucedido');
            
            // Notificação de sessão renovada
            if (typeof NotificationBridge !== 'undefined') {
                NotificationBridge.sessionRefreshed();
            }
            
            return true;
        } catch (error) {
            console.error('[SessionManager] Erro ao fazer refresh:', error);
            
            // Notificação de erro de rede no refresh
            if (typeof NotificationBridge !== 'undefined') {
                NotificationBridge.showError('network_error');
            }
            
            return false;
        }
    }
    
    /**
     * Logout LOCAL - Revoga tokens e limpa sessão local
     * @param {boolean} silent - Se true, não mostra mensagens
     */
    async function logoutLocal(silent = false) {
        if (!silent) {
            console.log('[SessionManager] Iniciando logout local...');
        }
        
        const accessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        const refreshTokenVal = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        const provider = localStorage.getItem(CONFIG.STORAGE_KEYS.PROVIDER);
        
        // Tentar revogar token no backend
        if (accessToken && provider) {
            try {
                await fetch(`${CONFIG.BACKEND_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        access_token: accessToken,
                        refresh_token: refreshTokenVal,
                        provider: provider
                    })
                });
                
                if (!silent) {
                    console.log('[SessionManager] Tokens revogados no backend');
                }
            } catch (error) {
                console.error('[SessionManager] Erro ao revogar tokens:', error);
                
                // Notificação de falha parcial no logout (se não for silencioso)
                if (!silent && typeof NotificationBridge !== 'undefined') {
                    NotificationBridge.showWarning('logout_partial');
                }
            }
        }
        
        // Limpar TODA a sessão local
        clearSession();
        
        // Limpar sessionStorage também
        sessionStorage.clear();
        
        // Limpar cookies (se existirem)
        document.cookie.split(";").forEach(cookie => {
            const name = cookie.split("=")[0].trim();
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        
        // Parar verificações
        stopSessionCheck();
        
        if (!silent) {
            console.log('[SessionManager] Logout local completo');
            
            // Notificação de logout bem-sucedido
            if (typeof NotificationBridge !== 'undefined') {
                NotificationBridge.logoutSuccess();
            }
        }
        
        return true;
    }
    
    /**
     * Logout FEDERADO - Faz logout também no provedor OAuth
     * @param {string} provider - Provedor OAuth (google ou microsoft)
     * @param {string} returnUrl - URL para retornar após logout federado
     */
    async function logoutFederated(provider, returnUrl) {
        console.log(`[SessionManager] Iniciando logout federado com ${provider}...`);
        
        // Primeiro fazer logout local
        await logoutLocal(true);
        
        // URLs de logout dos provedores
        const logoutUrls = {
            'google': 'https://accounts.google.com/Logout',
            'microsoft': 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
        };
        
        // Redirecionar para logout do provedor
        const logoutUrl = logoutUrls[provider?.toLowerCase()];
        
        if (logoutUrl) {
            const post_logout_redirect_uri = returnUrl || window.location.origin + '/secure/index.html';
            
            // Microsoft aceita post_logout_redirect_uri
            if (provider === 'microsoft') {
                window.location.href = `${logoutUrl}?post_logout_redirect_uri=${encodeURIComponent(post_logout_redirect_uri)}`;
            } else {
                // Google não aceita redirect, apenas faz logout
                window.location.href = logoutUrl;
            }
        } else {
            console.warn('[SessionManager] Provedor não suportado para logout federado:', provider);
            // Fallback para logout local apenas
            redirectToLogin();
        }
    }
    
    /**
     * Logout com opção de escolha (local ou federado)
     * Mantém compatibilidade com código existente
     */
    async function logout() {
        await logoutLocal();
        redirectToLogin();
    }
    
    /**
     * Redireciona para login
     */
    function redirectToLogin() {
        // Salvar URL atual para retornar depois do login
        sessionStorage.setItem('auth_return_url', window.location.href);
        
        // Redirecionar para página de login
        window.location.href = '/secure/index.html';
    }
    
    /**
     * Inicia verificação periódica de sessão
     */
    function startSessionCheck() {
        // Verificar imediatamente
        validateSession().then(result => {
            if (!result.valid) {
                // Para sessão mínima expirada, não redirecionar imediatamente
                // Deixar a verificação de autorização tratar
                const isMinimalSession = localStorage.getItem('auth_minimal_session') === 'true';
                if (result.reason === 'minimal_session_expired' && isMinimalSession) {
                    console.log('[SessionManager] Sessão mínima expirada, aguardando verificação de autorização...');
                    // Não redirecionar - deixar verificação de autorização tratar
                    return;
                }
                console.log('[SessionManager] Sessão inválida, redirecionando para login...');
                redirectToLogin();
            }
        });
        
        // Verificar periodicamente
        checkInterval = setInterval(async () => {
            const result = await validateSession();
            if (!result.valid) {
                // Para sessão mínima expirada, não redirecionar imediatamente
                const isMinimalSession = localStorage.getItem('auth_minimal_session') === 'true';
                if (result.reason === 'minimal_session_expired' && isMinimalSession) {
                    console.log('[SessionManager] Sessão mínima expirada durante verificação periódica');
                    // Não redirecionar - deixar verificação de autorização tratar
                    return;
                }
                console.log('[SessionManager] Sessão inválida durante verificação periódica');
                redirectToLogin();
            }
        }, CONFIG.CHECK_INTERVAL);
        
        console.log('[SessionManager] Verificação de sessão iniciada');
    }
    
    /**
     * Para verificação de sessão
     */
    function stopSessionCheck() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
            console.log('[SessionManager] Verificação de sessão parada');
        }
    }
    
    /**
     * Monitora atividade do usuário
     */
    function setupActivityMonitoring() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                updateLastActivity();
            }, { passive: true });
        });
        
        console.log('[SessionManager] Monitoramento de atividade configurado');
    }
    
    /**
     * Protege uma página (requer autenticação)
     */
    function requireAuth() {
        if (!isAuthenticated()) {
            console.log('[SessionManager] Página protegida - autenticação necessária');
            redirectToLogin();
            return false;
        }
        
        // Iniciar verificações
        startSessionCheck();
        setupActivityMonitoring();
        
        return true;
    }
    
    // API pública
    return {
        isAuthenticated,
        getUserInfo,
        saveSession,
        clearSession,
        validateSession,
        refreshToken,
        logout,                // Logout padrão (local + redirect)
        logoutLocal,          // Logout local apenas
        logoutFederated,      // Logout federado (provedor + local)
        redirectToLogin,
        requireAuth,
        startSessionCheck,
        stopSessionCheck,
        updateLastActivity
    };
})();

// Export para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}
