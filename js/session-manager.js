/**
 * Session Manager - Controle de Sessão OAuth 2.1
 * 
 * Gerencia:
 * - Validação de sessão
 * - Auto-refresh de tokens
 * - Redirecionamento para login quando não autenticado
 * - Expiração automática de sessão
 * - Logout com revogação de token
 * 
 * Integração com NotificationBridge (opcional):
 * - Exibe notificações visuais para eventos de sessão
 * - Login bem-sucedido, logout, refresh, erros
 * - Funciona mesmo se NotificationBridge não estiver carregado
 */

const SessionManager = (function() {
    'use strict';
    
    // Configuração
    const CONFIG = {
        BACKEND_URL: window.location.hostname === 'localhost' 
            ? 'http://localhost:5051'
            : 'https://caracore-backend-docker.azurewebsites.net',
        
        CHECK_INTERVAL: 60000,  // Verificar sessão a cada 60 segundos
        REFRESH_BEFORE: 300,    // Refresh token 5 min antes de expirar
        SESSION_TIMEOUT: 3600,  // Timeout de sessão: 1 hora (segundos)
        
        STORAGE_KEYS: {
            ACCESS_TOKEN: 'auth_access_token',
            REFRESH_TOKEN: 'auth_refresh_token',
            PROVIDER: 'auth_provider',
            USER_INFO: 'auth_user_info',
            EXPIRES_AT: 'auth_expires_at',
            LAST_ACTIVITY: 'auth_last_activity'
        }
    };
    
    let checkInterval = null;
    let activityTimeout = null;
    
    /**
     * Verifica se usuário está autenticado
     */
    function isAuthenticated() {
        const accessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        const expiresAt = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPIRES_AT);
        
        if (!accessToken || !expiresAt) {
            return false;
        }
        
        // Verificar se token expirou
        const now = Math.floor(Date.now() / 1000);
        if (now >= parseInt(expiresAt)) {
            console.log('[SessionManager] Token expirado');
            return false;
        }
        
        return true;
    }
    
    /**
     * Obtém informações do usuário
     */
    function getUserInfo() {
        const userInfoStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
        if (!userInfoStr) return null;
        
        try {
            return JSON.parse(userInfoStr);
        } catch (e) {
            console.error('[SessionManager] Erro ao parsear user info:', e);
            return null;
        }
    }
    
    /**
     * Salva tokens e informações do usuário
     */
    function saveSession(data) {
        const { access_token, refresh_token, provider, user, expires_in } = data;
        
        if (access_token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, access_token);
        }
        
        if (refresh_token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
        }
        
        if (provider) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.PROVIDER, provider);
        }
        
        if (user) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(user));
        }
        
        // Calcular expiração
        if (expires_in) {
            const expiresAt = Math.floor(Date.now() / 1000) + expires_in;
            localStorage.setItem(CONFIG.STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
        }
        
        // Atualizar última atividade
        updateLastActivity();
        
        console.log('[SessionManager] Sessão salva com sucesso');
        
        // Notificação de login bem-sucedido (se NotificationBridge disponível)
        if (typeof NotificationBridge !== 'undefined' && user) {
            NotificationBridge.loginSuccess();
        }
    }
    
    /**
     * Limpa sessão
     */
    function clearSession() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('[SessionManager] Sessão limpa');
    }
    
    /**
     * Atualiza timestamp da última atividade
     */
    function updateLastActivity() {
        const now = Math.floor(Date.now() / 1000);
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString());
    }
    
    /**
     * Verifica timeout de inatividade
     */
    function checkInactivityTimeout() {
        const lastActivity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
        if (!lastActivity) return false;
        
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - parseInt(lastActivity);
        
        if (elapsed > CONFIG.SESSION_TIMEOUT) {
            console.log('[SessionManager] Timeout de inatividade');
            
            // Notificação de timeout
            if (typeof NotificationBridge !== 'undefined') {
                NotificationBridge.inactivityTimeout(5);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Valida sessão com backend
     */
    async function validateSession() {
        if (!isAuthenticated()) {
            return { valid: false, reason: 'no_token' };
        }
        
        // Verificar se é sessão mínima (não validar no backend)
        const isMinimalSession = localStorage.getItem('auth_minimal_session') === 'true';
        if (isMinimalSession) {
            // Para sessão mínima, apenas verificar se não expirou localmente
            const expiresAt = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPIRES_AT);
            if (expiresAt) {
                const now = Math.floor(Date.now() / 1000);
                if (now < parseInt(expiresAt)) {
                    updateLastActivity();
                    console.log('[SessionManager] Sessão mínima válida (não validada no backend)');
                    return { valid: true, reason: 'minimal_session' };
                } else {
                    console.log('[SessionManager] Sessão mínima expirada');
                    return { valid: false, reason: 'minimal_session_expired' };
                }
            }
            // Se não tem expiresAt, considerar válida por enquanto
            updateLastActivity();
            return { valid: true, reason: 'minimal_session' };
        }
        
        // Verificar timeout de inatividade
        if (checkInactivityTimeout()) {
            await logout();
            return { valid: false, reason: 'inactivity_timeout' };
        }
        
        const accessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        const provider = localStorage.getItem(CONFIG.STORAGE_KEYS.PROVIDER);
        
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/auth/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    provider: provider
                })
            });
            
            if (!response.ok) {
                console.error('[SessionManager] Erro ao validar sessão:', response.status);
                return { valid: false, reason: 'validation_failed' };
            }
            
            const data = await response.json();
            
            if (data.valid) {
                // Atualizar user info
                if (data.user) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(data.user));
                }
                
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
            const response = await fetch(`${CONFIG.BACKEND_URL}/auth/token/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh_token: refreshTokenVal,
                    provider: provider
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
