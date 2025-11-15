/**
 * User Session Manager - Gerencia sessões de múltiplos usuários
 * 
 * Previne conflitos quando diferentes usuários usam o mesmo navegador
 * - Detecta mudança de usuário
 * - Limpa dados do usuário anterior
 * - Associa dados OAuth ao email do usuário
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-11-15
 */

(function() {
    'use strict';
    
    class UserSessionManager {
        constructor() {
            this.currentUserEmail = null;
            this.currentUserProvider = null;
            this.storagePrefix = 'cara_core_user_';
        }
        
        /**
         * Obter email do usuário atual armazenado
         */
        getCurrentStoredUser() {
            try {
                const email = localStorage.getItem('auth_user_email') || 
                             localStorage.getItem('user_email') ||
                             sessionStorage.getItem('cara_core_user_email');
                const provider = localStorage.getItem('auth_provider') ||
                                sessionStorage.getItem('cara_core_oidc_provider');
                return { email, provider };
            } catch (e) {
                console.warn('Erro ao obter usuário atual:', e);
                return { email: null, provider: null };
            }
        }
        
        /**
         * Detectar se um novo usuário está fazendo login
         * @param {string} newUserEmail - Email do novo usuário
         * @param {string} newUserProvider - Provider do novo usuário
         * @returns {boolean} - true se é um usuário diferente
         */
        isDifferentUser(newUserEmail, newUserProvider = null) {
            if (!newUserEmail) return false;
            
            const stored = this.getCurrentStoredUser();
            const storedEmail = stored.email ? stored.email.toLowerCase().trim() : null;
            const newEmail = newUserEmail.toLowerCase().trim();
            
            // Se não há usuário armazenado, não é um usuário diferente
            if (!storedEmail) return false;
            
            // Se o email é diferente, é um usuário diferente
            if (storedEmail !== newEmail) {
                console.log(`🔄 Detectado novo usuário: ${newEmail} (anterior: ${storedEmail})`);
                return true;
            }
            
            // Se o provider mudou para o mesmo email, também limpar (pode ser o mesmo usuário com outro provider)
            if (newUserProvider && stored.provider && newUserProvider !== stored.provider) {
                console.log(`🔄 Provider mudou para ${newEmail}: ${stored.provider} -> ${newUserProvider}`);
                return true;
            }
            
            return false;
        }
        
        /**
         * Limpar todos os dados de autenticação e sessão
         */
        clearAllAuthData() {
            console.log('🧹 Limpando todos os dados de autenticação...');
            
            // Lista de chaves a serem removidas
            const keysToRemove = [
                // Dados de autenticação
                'auth_user_email',
                'auth_user_role',
                'auth_user_info',
                'auth_access_token',
                'auth_refresh_token',
                'auth_provider',
                'auth_expires_at',
                'auth_last_activity',
                'auth_check_timestamp',
                'user_email',
                
                // Dados OIDC
                'cara_core_oidc_provider',
                'cara_core_id_token',
                'cara_core_access_token',
                'cara_core_token_type',
                'cara_core_expires_at',
                'cara_core_user_profile',
                'cara_core_auth_time',
                'cara_core_user_email',
                'cara_core_session_id',
                'cara_core_token_expires_at',
                
                // Dados OAuth por provider
                'google_oauth_state',
                'google_pkce_verifier',
                'google_oauth_request_id',
                'google_oauth_login_started_at',
                'google_oauth_nonce',
                'microsoft_oauth_state',
                'microsoft_pkce_verifier',
                'entra_oauth_state',
                'entra_pkce_verifier',
                
                // Dados de autorização
                'auth_logs',
                'oidc_logs',
                'oidc_logs_count'
            ];
            
            // Remover chaves específicas
            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                } catch (e) {
                    console.debug(`Erro ao remover ${key}:`, e);
                }
            });
            
            // Limpar dados OIDC (chaves que começam com 'oidc.')
            this.clearOidcKeys();
            
            // Limpar dados de provider
            this.clearProviderKeys();
            
            console.log('✅ Dados de autenticação limpos');
        }
        
        /**
         * Limpar chaves OIDC do storage
         */
        clearOidcKeys() {
            const oidcPrefixes = [
                'oidc.',
                'oidc.user',
                'oidc.storage',
                'oidc.metadata',
                'oidc.authority',
                'oidc.client',
                'oidc.states',
                'oidc.signin'
            ];
            
            const clearFromStore = (store) => {
                if (!store || typeof store.length !== 'number') return;
                try {
                    const keysToRemove = [];
                    for (let i = 0; i < store.length; i++) {
                        const key = store.key(i);
                        if (!key) continue;
                        if (oidcPrefixes.some(prefix => key.startsWith(prefix))) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => {
                        try {
                            store.removeItem(key);
                        } catch (e) {
                            console.debug(`Erro ao remover OIDC key ${key}:`, e);
                        }
                    });
                } catch (e) {
                    console.debug('Erro ao limpar chaves OIDC:', e);
                }
            };
            
            clearFromStore(sessionStorage);
            clearFromStore(localStorage);
        }
        
        /**
         * Limpar chaves relacionadas a providers
         */
        clearProviderKeys() {
            const providers = ['google', 'microsoft', 'entra', 'azure'];
            providers.forEach(provider => {
                const keys = [
                    `${provider}_pkce_verifier`,
                    `${provider}_oauth_state`,
                    `${provider}_oauth_nonce`,
                    `${provider}_oauth_request_id`,
                    `${provider}_oauth_login_started_at`
                ];
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
         * Processar novo login de usuário
         * Limpa dados anteriores se for um usuário diferente
         * @param {string} userEmail - Email do novo usuário
         * @param {string} provider - Provider do novo usuário
         */
        handleUserLogin(userEmail, provider = null) {
            if (!userEmail) {
                console.warn('UserSessionManager: Email não fornecido');
                return;
            }
            
            const email = userEmail.toLowerCase().trim();
            
            // Verificar se é um usuário diferente
            if (this.isDifferentUser(email, provider)) {
                console.log(`🔄 Novo usuário detectado: ${email}. Limpando dados do usuário anterior...`);
                this.clearAllAuthData();
            }
            
            // Atualizar referência do usuário atual
            this.currentUserEmail = email;
            this.currentUserProvider = provider || 'google';
            
            // Armazenar referência do usuário atual
            try {
                sessionStorage.setItem('cara_core_user_email', email);
                if (provider) {
                    sessionStorage.setItem('cara_core_oidc_provider', provider);
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

