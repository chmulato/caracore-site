/**
 * Reauthorize Microsoft - Gerencia o processo de reautorização Microsoft
 * 
 * Esta página é exibida quando ocorre o erro AADSTS70000 (escopos não autorizados).
 * Ela força um novo consentimento usando prompt=consent e só redireciona para o portal
 * após obter um token válido.
 */

(function() {
    'use strict';

    console.log('🔐 Reauthorize Microsoft carregado');

    // Elementos DOM
    const elements = {
        btnReauthorize: document.getElementById('btnReauthorize'),
        alertContainer: document.getElementById('alertContainer')
    };

    // Estado
    let isProcessing = false;
    let userEmail = null;
    let userProvider = 'microsoft';

    /**
     * Inicialização
     */
    async function init() {
        console.log('🚀 Inicializando Reauthorize Microsoft...');

        // Obter parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        userEmail = urlParams.get('email');
        userProvider = urlParams.get('provider') || 'microsoft';

        if (userEmail) {
            console.log('📧 Email detectado:', userEmail);
            // Salvar email para uso posterior
            localStorage.setItem('user_email', userEmail);
            localStorage.setItem('auth_user_email', userEmail);
        }

        // Configurar event listeners
        if (elements.btnReauthorize) {
            elements.btnReauthorize.addEventListener('click', handleReauthorize);
        }

        // Limpar cache de autenticação antes de iniciar
        clearAuthCache();

        console.log('✅ Reauthorize Microsoft inicializado');
    }

    /**
     * Limpar cache de autenticação OAuth/OIDC
     */
    function clearAuthCache() {
        console.log('🧹 Limpando cache de autenticação OAuth/OIDC...');
        
        const prefixesToRemove = [
            'oidc.', 'oidc.user', 'oidc.storage', 'oidc.metadata', 'oidc.authority', 
            'oidc.client', 'oidc.states', 'oidc.signin', 'oidc.pkce.',
            'auth_', 'cara_core_', 'microsoft_oauth_', 'entra_oauth_',
            'cara_core_oidc_provider', 'cara_core_session_id', 
            'cara_core_token_expires_at', 'auth_user_info', 'auth_expires_at', 
            'auth_last_activity'
        ];

        const keysToPreserve = ['user_email', 'auth_user_email', 'auth_provider'];

        const clearStorage = (storage) => {
            if (!storage || typeof storage.length !== 'number') return;
            const keysToRemove = [];
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (!key) continue;
                if (keysToPreserve.includes(key)) {
                    continue;
                }
                if (prefixesToRemove.some(prefix => key.startsWith(prefix))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => {
                try {
                    storage.removeItem(key);
                } catch (err) {
                    console.warn(`⚠️ Erro ao remover ${key}:`, err);
                }
            });
        };

        try { clearStorage(localStorage); } catch (err) { console.warn('⚠️ Erro ao limpar localStorage:', err); }
        try { clearStorage(sessionStorage); } catch (err) { console.warn('⚠️ Erro ao limpar sessionStorage:', err); }

        if (window.OIDCAuth && typeof window.OIDCAuth.clearStaleState === 'function') {
            try { window.OIDCAuth.clearStaleState(); } catch (err) { console.warn('⚠️ Erro ao limpar estado OIDCAuth:', err); }
        }

        console.log('✅ Cache de autenticação limpo');
    }

    /**
     * Mostrar alerta
     */
    function showAlert(type, message, details = null) {
        if (!elements.alertContainer) return;

        const alertClass = {
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info',
            'success': 'alert-success'
        }[type] || 'alert-info';

        const icon = {
            'error': 'bi-exclamation-triangle-fill',
            'warning': 'bi-exclamation-triangle-fill',
            'info': 'bi-info-circle-fill',
            'success': 'bi-check-circle-fill'
        }[type] || 'bi-info-circle-fill';

        elements.alertContainer.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="bi ${icon}"></i> ${message}
                ${details ? `<div class="mt-2 small">${details}</div>` : ''}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
            </div>
        `;
    }

    /**
     * Aguardar OIDCAuth estar disponível
     */
    async function waitForOIDCAuth(timeout = 10000) {
        const startTime = Date.now();
        while (!window.OIDCAuth) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Timeout aguardando OIDCAuth inicializar');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Aguardar um pouco mais para garantir que está totalmente inicializado
        await new Promise(resolve => setTimeout(resolve, 300));
        return window.OIDCAuth;
    }

    /**
     * Iniciar processo de reautorização
     */
    async function handleReauthorize() {
        if (isProcessing) {
            console.warn('⚠️ Reautorização já em andamento');
            return;
        }

        isProcessing = true;
        console.log('🔄 Iniciando processo de reautorização Microsoft...');

        // Atualizar UI
        if (elements.btnReauthorize) {
            elements.btnReauthorize.disabled = true;
            elements.btnReauthorize.innerHTML = '<span class="loading-spinner"></span> Iniciando reautorização...';
        }

        try {
            // Limpar cache novamente antes de iniciar
            clearAuthCache();

            // Aguardar um pouco para garantir que o cache foi limpo
            await new Promise(resolve => setTimeout(resolve, 500));

            // Marcar que estamos em processo de reautorização ANTES de iniciar o login
            // Isso garante que a configuração dinâmica inclua prompt=consent
            sessionStorage.setItem('microsoft_reauthorize', 'true');
            if (userEmail) {
                sessionStorage.setItem('microsoft_reauthorize_email', userEmail);
            }

            // Aguardar um pouco para garantir que a flag foi salva
            await new Promise(resolve => setTimeout(resolve, 200));

            // Aguardar OIDCAuth estar disponível
            console.log('⏳ Aguardando OIDCAuth estar disponível...');
            await waitForOIDCAuth();
            console.log('✅ OIDCAuth disponível');

            // Trocar para provider Microsoft
            console.log('🔄 Trocando para provider Microsoft...');
            await window.OIDCAuth.switchProvider('entra');
            console.log('✅ Provider Microsoft configurado');

            // Iniciar login - a configuração dinâmica já incluirá prompt=consent
            console.log('🔐 Iniciando login Microsoft com prompt=consent (via configuração dinâmica)...');
            await window.OIDCAuth.login();

            // Se chegamos aqui, o redirecionamento não ocorreu
            throw new Error('Redirecionamento para Microsoft não ocorreu');

        } catch (error) {
            console.error('❌ Erro ao iniciar reautorização:', error);
            showAlert('error', 'Erro ao iniciar reautorização', error.message || 'Por favor, tente novamente.');
            
            // Restaurar botão
            if (elements.btnReauthorize) {
                elements.btnReauthorize.disabled = false;
                elements.btnReauthorize.innerHTML = '<i class="bi bi-shield-check"></i> Reautorizar Aplicativo';
            }
            
            isProcessing = false;
        }
    }

    /**
     * Obter configuração Microsoft com prompt=consent
     */
    async function getMicrosoftConfigWithConsent(baseUrl) {
        // Usar a configuração dinâmica existente
        if (typeof window.getProviderConfig === 'function') {
            const config = await window.getProviderConfig('entra');
            // Adicionar prompt=consent
            if (config) {
                config.extraQueryParams = {
                    ...(config.extraQueryParams || {}),
                    prompt: 'consent'
                };
            }
            return config;
        }

        // Fallback: usar generateMicrosoftConfig se disponível
        if (typeof window.generateMicrosoftConfig === 'function') {
            const config = window.generateMicrosoftConfig();
            config.extraQueryParams = {
                ...(config.extraQueryParams || {}),
                prompt: 'consent'
            };
            return config;
        }

        throw new Error('Não foi possível obter configuração Microsoft');
    }

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exportar para uso global se necessário
    window.ReauthorizeMicrosoft = {
        init,
        handleReauthorize,
        clearAuthCache
    };

})();

