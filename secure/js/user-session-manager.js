/**
 * User Session Manager - static no-op fallback.
 * No live OAuth/OIDC session handling is active in this static deploy.
 */
(function() {
  'use strict';

  function noopSession() {
    return { email: null, provider: null };
  }

  window.userSessionManager = {
    getCurrentStoredUser: noopSession,
    detectUserChange: () => ({ isDifferentUser: false, isDifferentProvider: false, reason: 'static_simulation' }),
    normalizeProvider: (provider) => provider || null,
    isDifferentUser: () => false,
    clearAllAuthData: () => undefined,
    clearOidcKeys: () => undefined,
    clearProviderKeys: () => undefined,
    handleUserLogout: () => undefined
  };
})();            };
            
            clearFromStore(sessionStorage);
            clearFromStore(localStorage);
        }
        
        /**
         * Limpar chaves relacionadas a providers
         * @param {string} specificProvider - Se fornecido, limpa apenas este provider
         */
        clearProviderKeys(specificProvider = null) {
            const providers = specificProvider 
                ? [this.normalizeProvider(specificProvider)]
                : ['google', 'microsoft', 'entra', 'azure'];
            
            providers.forEach(provider => {
                const keys = [
                    `${provider}_pkce_verifier`,
                    `${provider}_oauth_state`,
                    `${provider}_oauth_nonce`,
                    `${provider}_oauth_request_id`,
                    `${provider}_oauth_login_started_at`
                ];
                
                // Também limpar variações do Microsoft
                if (provider === 'microsoft') {
                    keys.push(
                        'entra_pkce_verifier',
                        'entra_oauth_state',
                        'entra_oauth_nonce',
                        'azure_pkce_verifier',
                        'azure_oauth_state'
                    );
                }
                
                keys.forEach(key => {
                    try {
                        sessionStorage.removeItem(key);
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.debug(`Erro ao remover ${key}:`, e);
                    }
                });
            });
        }
        
        /**
         * Limpar dados específicos de um provider (mantém dados do outro)
         * @param {string} provider - Provider a limpar
         */
        clearProviderData(provider) {
            if (!provider) return;
            
            const normalizedProvider = this.normalizeProvider(provider);
            console.log(`🧹 Limpando dados do provider: ${normalizedProvider}`);
            
            // Limpar chaves específicas do provider
            this.clearProviderKeys(normalizedProvider);
            
            // Limpar dados OIDC se o provider atual corresponder
            const currentProvider = this.normalizeProvider(
                localStorage.getItem('auth_provider') || 
                sessionStorage.getItem('cara_core_oidc_provider')
            );
            
            if (currentProvider === normalizedProvider) {
                // Limpar dados OIDC compartilhados apenas se for o provider atual
                const oidcKeys = [
                    'cara_core_oidc_provider',
                    'cara_core_id_token',
                    'cara_core_access_token',
                    'cara_core_token_type',
                    'cara_core_expires_at',
                    'cara_core_user_profile',
                    'oidc.user'
                ];
                
                oidcKeys.forEach(key => {
                    try {
                        sessionStorage.removeItem(key);
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.debug(`Erro ao remover OIDC key ${key}:`, e);
                    }
                });
            }
        }
        
        /**
         * Processar novo login de usuário
         * Limpa dados anteriores se for um usuário diferente ou provider diferente
         * @param {string} userEmail - Email do novo usuário
         * @param {string} provider - Provider do novo usuário
         */
        handleUserLogin(userEmail, provider = null) {
            if (!userEmail) {
                console.warn('UserSessionManager: Email não fornecido');
                return;
            }
            
            const email = userEmail.toLowerCase().trim();
            const normalizedProvider = this.normalizeProvider(provider);
            
            // Detectar mudanças
            const change = this.detectUserChange(email, normalizedProvider);
            
            if (change.isDifferentUser) {
                // Usuário diferente: limpar TUDO
                console.log(`🔄 Novo usuário detectado: ${email}. Limpando todos os dados...`);
                this.clearAllAuthData();
            } else if (change.isDifferentProvider) {
                // Mesmo usuário, provider diferente: limpar apenas dados do provider anterior
                const stored = this.getCurrentStoredUser();
                const previousProvider = this.normalizeProvider(stored.provider);
                
                console.log(`🔄 Provider mudou para ${email}: ${previousProvider} -> ${normalizedProvider}`);
                console.log(`🧹 Limpando dados do provider anterior (${previousProvider})...`);
                
                // Limpar dados do provider anterior
                if (previousProvider) {
                    this.clearProviderData(previousProvider);
                }
                
                // Limpar dados compartilhados que podem conflitar
                const sharedKeys = [
                    'auth_access_token',
                    'auth_refresh_token',
                    'auth_id_token',
                    'cara_core_id_token',
                    'cara_core_access_token',
                    'oidc.user'
                ];
                
                sharedKeys.forEach(key => {
                    try {
                        sessionStorage.removeItem(key);
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.debug(`Erro ao remover shared key ${key}:`, e);
                    }
                });
            }
            
            // Atualizar referência do usuário atual
            // Validar email antes de salvar - NUNCA salvar emails falsos
            const isValidEmail = (email) => {
                if (!email) return false;
                if (email.includes('user@caracore.com.br') || 
                    email.includes('example@') || 
                    email === 'user@caracore.com.br' ||
                    email.includes('placeholder') ||
                    email.includes('test@') ||
                    !email.includes('@') ||
                    !email.includes('.')) {
                    return false;
                }
                return email.length > 5;
            };
            
            if (!isValidEmail(email)) {
                console.error('❌ ERRO CRÍTICO: Tentativa de salvar email inválido bloqueada:', email);
                throw new Error(`Email inválido detectado: ${email}. Não será salvo no storage.`);
            }
            
            this.currentUserEmail = email;
            this.currentUserProvider = normalizedProvider || 'google';
            
            // Armazenar referência do usuário atual (apenas se email válido)
            try {
                sessionStorage.setItem('cara_core_user_email', email);
                if (normalizedProvider) {
                    sessionStorage.setItem('cara_core_oidc_provider', normalizedProvider);
                    localStorage.setItem('auth_provider', normalizedProvider);
                }
            } catch (e) {
                console.warn('Erro ao armazenar referência do usuário:', e);
            }
        }
        
        /**
         * Limpar dados ao fazer logout
         */
        handleUserLogout() {
            console.log('🚪 Logout: Limpando dados do usuário...');
            this.clearAllAuthData();
            this.currentUserEmail = null;
            this.currentUserProvider = null;
        }
        
        /**
         * Obter email do usuário atual
         */
        getCurrentUserEmail() {
            return this.currentUserEmail || this.getCurrentStoredUser().email;
        }
        
        /**
         * Verificar se há um usuário logado
         */
        hasActiveUser() {
            return !!this.getCurrentUserEmail();
        }
    }
    
    // Criar instância global
    const userSessionManager = new UserSessionManager();
    
    // Expor globalmente
    window.UserSessionManager = UserSessionManager;
    window.userSessionManager = userSessionManager;
    
    console.log('✅ UserSessionManager carregado e pronto para uso');
    
})();

