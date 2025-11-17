/**
 * Notification Bridge
 * Integra NotificationManager com ErrorMessages e SessionManager
 * Fornece API unificada para exibir notificações em toda a aplicação
 */

const NotificationBridge = (function() {
    'use strict';
    
    /**
     * Exibe notificação a partir de código de erro
     */
    function showError(errorCode, options = {}) {
        const msg = ErrorMessages.get(errorCode);
        
        return NotificationManager.error(
            msg.title,
            msg.message,
            options
        );
    }
    
    /**
     * Exibe notificação de sucesso a partir de código
     */
    function showSuccess(successCode, options = {}) {
        const msg = ErrorMessages.get(successCode);
        
        return NotificationManager.success(
            msg.title,
            msg.message,
            options
        );
    }
    
    /**
     * Exibe notificação de aviso a partir de código
     */
    function showWarning(warningCode, options = {}) {
        const msg = ErrorMessages.get(warningCode);
        
        return NotificationManager.warning(
            msg.title,
            msg.message,
            options
        );
    }
    
    /**
     * Exibe notificação de informação a partir de código
     */
    function showInfo(infoCode, options = {}) {
        const msg = ErrorMessages.get(infoCode);
        
        return NotificationManager.info(
            msg.title,
            msg.message,
            options
        );
    }
    
    /**
     * Exibe notificação customizada
     */
    function showCustom(type, title, message, options = {}) {
        return NotificationManager.show(type, title, message, options);
    }
    
    /**
     * Processa resposta de erro da API
     */
    function handleApiError(error, defaultCode = 'unknown_error') {
        console.error('[NotificationBridge] API Error:', error);
        
        let errorCode = defaultCode;
        
        // Tentar extrair código de erro da resposta
        if (error.response) {
            const data = error.response.data || {};
            errorCode = data.error || data.code || data.error_code || defaultCode;
            
            // Tratar status HTTP específicos
            if (error.response.status === 401) {
                errorCode = 'not_authenticated';
            } else if (error.response.status === 403) {
                errorCode = 'permission_denied';
            } else if (error.response.status === 429) {
                errorCode = 'rate_limit_exceeded';
            } else if (error.response.status >= 500) {
                errorCode = 'server_error';
            }
        } else if (error.request) {
            // Erro de rede (sem resposta)
            errorCode = 'network_error';
        }
        
        return showError(errorCode);
    }
    
    /**
     * Exibe notificação de sessão expirada
     */
    function sessionExpired() {
        return showError('token_expired', {
            autoDismiss: false,
            onClick: () => {
                if (window.SessionManager) {
                    SessionManager.redirectToLogin();
                }
            }
        });
    }
    
    /**
     * Exibe notificação de sessão renovada
     */
    function sessionRefreshed() {
        return showSuccess('session_refreshed', {
            duration: 3000
        });
    }
    
    /**
     * Exibe notificação de login bem-sucedido
     */
    function loginSuccess() {
        return showSuccess('login_success', {
            duration: 3000
        });
    }
    
    /**
     * Exibe notificação de logout bem-sucedido
     */
    function logoutSuccess() {
        return showSuccess('logout_success', {
            duration: 3000
        });
    }
    
    /**
     * Exibe notificação de consentimento registrado
     */
    function consentRegistered() {
        return showSuccess('consent_registered', {
            duration: 4000
        });
    }
    
    /**
     * Exibe notificação de consentimento revogado
     */
    function consentRevoked() {
        return showSuccess('consent_revoked', {
            duration: 4000
        });
    }
    
    /**
     * Exibe notificação de limite de requisições
     */
    function rateLimitExceeded(retryAfter = null) {
        const msg = ErrorMessages.get('rate_limit_exceeded');
        let message = msg.message;
        
        if (retryAfter) {
            message += ` Tente novamente em ${retryAfter} segundos.`;
        }
        
        return NotificationManager.warning(
            msg.title,
            message,
            { duration: 7000 }
        );
    }
    
    /**
     * Exibe notificação de timeout de inatividade
     */
    function inactivityTimeout(redirectDelay = 5) {
        const msg = ErrorMessages.get('session_timeout');
        const message = `${msg.message} Você será redirecionado em ${redirectDelay} segundos.`;
        
        return NotificationManager.warning(
            msg.title,
            message,
            {
                autoDismiss: false,
                onClick: () => {
                    if (window.SessionManager) {
                        SessionManager.redirectToLogin();
                    }
                }
            }
        );
    }
    
    /**
     * Exibe notificação de PKCE inválido
     */
    function pkceError() {
        return showError('pkce_invalid', {
            autoDismiss: false,
            onClick: () => {
                if (window.SessionManager) {
                    SessionManager.redirectToLogin();
                }
            }
        });
    }
    
    /**
     * Integração com SessionManager
     * Instala hooks para exibir notificações automaticamente
     */
    function integrateWithSessionManager() {
        if (!window.SessionManager) {
            // Verificar se é sessão mínima (não precisa de SessionManager)
            const isMinimalSession = localStorage.getItem('auth_minimal_session') === 'true';
            if (!isMinimalSession) {
                // Só mostrar aviso se não for sessão mínima
                console.debug('[NotificationBridge] SessionManager não encontrado (pode ser sessão mínima)');
            }
            return;
        }
        
        console.log('[NotificationBridge] Integrando com SessionManager...');
        
        // Hooks não implementados ainda no SessionManager
        // TODO: Adicionar eventos no SessionManager:
        // - onSessionExpired
        // - onSessionRefreshed
        // - onLogout
        // - onError
    }
    
    /**
     * Inicializa o bridge
     */
    function init() {
        console.log('[NotificationBridge] Inicializado');
        
        // Tentar integrar com SessionManager se disponível
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', integrateWithSessionManager);
        } else {
            integrateWithSessionManager();
        }
    }
    
    // API pública
    return {
        init,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showCustom,
        handleApiError,
        
        // Atalhos específicos
        sessionExpired,
        sessionRefreshed,
        loginSuccess,
        logoutSuccess,
        consentRegistered,
        consentRevoked,
        rateLimitExceeded,
        inactivityTimeout,
        pkceError,
        
        // Gerenciamento
        dismiss: NotificationManager.dismiss,
        dismissAll: NotificationManager.dismissAll,
        setPosition: NotificationManager.setPosition,
        
        // Configuração de idioma
        setLanguage: ErrorMessages.setLanguage,
        getLanguage: ErrorMessages.getLanguage
    };
})();

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationBridge.init());
} else {
    NotificationBridge.init();
}

// Export para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationBridge;
}
