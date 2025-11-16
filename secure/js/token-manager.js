/**
 * Token Manager - Gerenciamento de sessões e renovação automática de tokens
 * Fase 7 - Sistema de Refresh Tokens
 * 
 * Funcionalidades:
 * - Armazenamento seguro de session_id
 * - Renovação automática de access tokens
 * - Monitoramento de expiração
 * - Integração com sistema OAuth existente
 */

(function() {
    'use strict';

    /**
     * TokenManager - Classe principal para gerenciamento de tokens
     */
    class TokenManager {
        constructor() {
            this.sessionId = null;
            this.accessToken = null;
            this.idToken = null;
            this.expiresAt = null;
            this.refreshTimer = null;
            this.isRefreshing = false;
            
            // Configurações
            this.refreshBeforeExpiry = 5 * 60 * 1000; // 5 minutos antes de expirar
            this.maxRetries = 3;
            this.retryDelay = 1000; // 1 segundo
            
            // Endpoints - Detectar URL do backend (produção ou local)
            this.baseUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5051'
                : 'https://caracore-backend-docker.azurewebsites.net';
            this.createSessionEndpoint = '/auth/session/create';
            this.refreshSessionEndpoint = '/auth/session/refresh';
            this.revokeSessionEndpoint = '/auth/session/revoke';
            
            // Carregar sessão salva se existir
            this.loadSavedSession();
        }

        /**
         * Carrega sessão salva do localStorage
         */
        loadSavedSession() {
            try {
                const savedSessionId = localStorage.getItem('cara_core_session_id');
                const savedExpiresAt = localStorage.getItem('cara_core_token_expires_at');
                
                if (savedSessionId && savedExpiresAt) {
                    const expiresAt = new Date(savedExpiresAt);
                    const now = new Date();
                    
                    // Se ainda não expirou, restaurar sessão
                    if (expiresAt > now) {
                        this.sessionId = savedSessionId;
                        this.expiresAt = expiresAt;
                        
                        // Tentar recuperar tokens do sessionStorage
                        this.accessToken = sessionStorage.getItem('cara_core_access_token');
                        this.idToken = sessionStorage.getItem('cara_core_id_token');
                        
                        // Agendar renovação se necessário
                        this.scheduleRefresh();
                        
                        console.log('[TokenManager] Sessão restaurada:', this.sessionId);
                    } else {
                        // Sessão expirada, limpar
                        this.clearSession();
                    }
                }
            } catch (error) {
                console.error('[TokenManager] Erro ao carregar sessão salva:', error);
                this.clearSession();
            }
        }

        /**
         * Inicializa sessão após login bem-sucedido
         * @param {Object} sessionData - Dados da sessão retornados pelo backend
         */
        async initSession(sessionData) {
            try {
                if (!sessionData || !sessionData.session_id) {
                    throw new Error('Dados de sessão inválidos');
                }

                this.sessionId = sessionData.session_id;
                this.accessToken = sessionData.access_token;
                this.idToken = sessionData.id_token;
                
                // Calcular expiração
                if (sessionData.expires_at) {
                    this.expiresAt = new Date(sessionData.expires_at);
                } else if (sessionData.expires_in) {
                    this.expiresAt = new Date(Date.now() + sessionData.expires_in * 1000);
                } else {
                    // Default: 1 hora
                    this.expiresAt = new Date(Date.now() + 3600 * 1000);
                }

                // Salvar no localStorage
                localStorage.setItem('cara_core_session_id', this.sessionId);
                localStorage.setItem('cara_core_token_expires_at', this.expiresAt.toISOString());
                
                // Salvar tokens no sessionStorage
                if (this.accessToken) {
                    sessionStorage.setItem('cara_core_access_token', this.accessToken);
                }
                if (this.idToken) {
                    sessionStorage.setItem('cara_core_id_token', this.idToken);
                }

                // Agendar renovação
                this.scheduleRefresh();

                console.log('[TokenManager] Sessão inicializada:', this.sessionId);
                
                // Disparar evento customizado
                this.dispatchEvent('sessionInitialized', {
                    sessionId: this.sessionId,
                    expiresAt: this.expiresAt
                });

                return true;
            } catch (error) {
                console.error('[TokenManager] Erro ao inicializar sessão:', error);
                throw error;
            }
        }

        /**
         * Cria sessão no backend após login OAuth
         * @param {Object} userData - Dados do usuário
         * @param {Object} tokens - Tokens OAuth
         */
        async createSession(userData, tokens) {
            try {
                const response = await fetch(this.baseUrl + this.createSessionEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        user_data: userData,
                        tokens: tokens
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error_description || `HTTP ${response.status}`);
                }

                const sessionData = await response.json();
                
                // Inicializar sessão local
                await this.initSession(sessionData);
                
                return sessionData;
            } catch (error) {
                console.error('[TokenManager] Erro ao criar sessão:', error);
                throw error;
            }
        }

        /**
         * Agenda renovação automática de token
         */
        scheduleRefresh() {
            // Cancelar timer anterior se existir
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
            }

            if (!this.sessionId || !this.expiresAt) {
                return;
            }

            const now = Date.now();
            const expiresAtTime = this.expiresAt.getTime();
            const timeUntilExpiry = expiresAtTime - now;
            const refreshTime = Math.max(0, timeUntilExpiry - this.refreshBeforeExpiry);

            if (refreshTime > 0) {
                this.refreshTimer = setTimeout(() => {
                    this.refreshToken();
                }, refreshTime);
                
                console.log(
                    `[TokenManager] Renovação agendada em ${Math.round(refreshTime / 1000)}s ` +
                    `(expira em ${Math.round(timeUntilExpiry / 1000)}s)`
                );
            } else {
                // Já está próximo de expirar, renovar imediatamente
                this.refreshToken();
            }
        }

        /**
         * Renova access token usando session_id
         */
        async refreshToken(retryCount = 0) {
            if (this.isRefreshing) {
                console.log('[TokenManager] Renovação já em andamento, aguardando...');
                return;
            }

            if (!this.sessionId) {
                console.warn('[TokenManager] Sem session_id para renovar');
                return;
            }

            this.isRefreshing = true;

            try {
                const response = await fetch(this.baseUrl + this.refreshSessionEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        session_id: this.sessionId
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    
                    // Se sessão expirada ou inválida, fazer logout
                    if (response.status === 401 || response.status === 404) {
                        console.warn('[TokenManager] Sessão expirada ou inválida, fazendo logout');
                        await this.logout();
                        return;
                    }

                    // Retry em caso de erro temporário
                    if (retryCount < this.maxRetries && response.status >= 500) {
                        console.log(`[TokenManager] Tentativa ${retryCount + 1}/${this.maxRetries} falhou, tentando novamente...`);
                        await this.delay(this.retryDelay * (retryCount + 1));
                        this.isRefreshing = false;
                        return this.refreshToken(retryCount + 1);
                    }

                    throw new Error(errorData.error_description || `HTTP ${response.status}`);
                }

                const data = await response.json();

                // Atualizar tokens
                this.accessToken = data.access_token;
                this.idToken = data.id_token;
                
                // Atualizar expiração
                if (data.expires_at) {
                    this.expiresAt = new Date(data.expires_at);
                } else if (data.expires_in) {
                    this.expiresAt = new Date(Date.now() + data.expires_in * 1000);
                }

                // Atualizar storage
                localStorage.setItem('cara_core_token_expires_at', this.expiresAt.toISOString());
                if (this.accessToken) {
                    sessionStorage.setItem('cara_core_access_token', this.accessToken);
                }
                if (this.idToken) {
                    sessionStorage.setItem('cara_core_id_token', this.idToken);
                }

                // Re-agendar próxima renovação
                this.scheduleRefresh();

                console.log('[TokenManager] Tokens renovados com sucesso');

                // Disparar evento
                this.dispatchEvent('tokenRefreshed', {
                    expiresAt: this.expiresAt
                });

            } catch (error) {
                console.error('[TokenManager] Erro ao renovar token:', error);
                
                // Retry em caso de erro de rede
                if (retryCount < this.maxRetries && error.message.includes('fetch')) {
                    console.log(`[TokenManager] Erro de rede, tentando novamente... (${retryCount + 1}/${this.maxRetries})`);
                    await this.delay(this.retryDelay * (retryCount + 1));
                    this.isRefreshing = false;
                    return this.refreshToken(retryCount + 1);
                }

                // Se falhou completamente, fazer logout
                console.error('[TokenManager] Falha ao renovar token, fazendo logout');
                await this.logout();
            } finally {
                this.isRefreshing = false;
            }
        }

        /**
         * Obtém access token atual (renova se necessário)
         * @returns {string|null} Access token ou null se não disponível
         */
        async getAccessToken() {
            // Se não há sessão, retornar null
            if (!this.sessionId) {
                return null;
            }

            // Verificar se está próximo de expirar
            const now = Date.now();
            const expiresAtTime = this.expiresAt ? this.expiresAt.getTime() : 0;
            const timeUntilExpiry = expiresAtTime - now;

            // Se expirou ou está muito próximo, tentar renovar
            if (timeUntilExpiry < this.refreshBeforeExpiry) {
                if (!this.isRefreshing) {
                    await this.refreshToken();
                }
            }

            return this.accessToken;
        }

        /**
         * Obtém ID token atual
         * @returns {string|null} ID token ou null se não disponível
         */
        getIdToken() {
            return this.idToken;
        }

        /**
         * Verifica se há uma sessão ativa
         * @returns {boolean}
         */
        hasActiveSession() {
            return !!this.sessionId && !!this.expiresAt && this.expiresAt > new Date();
        }

        /**
         * Faz logout e revoga sessão
         */
        async logout() {
            try {
                // Cancelar timer de renovação
                if (this.refreshTimer) {
                    clearTimeout(this.refreshTimer);
                    this.refreshTimer = null;
                }

                // Revogar sessão no backend se houver session_id
                if (this.sessionId) {
                    try {
                        await fetch(this.baseUrl + this.revokeSessionEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                session_id: this.sessionId
                            })
                        });
                    } catch (error) {
                        console.warn('[TokenManager] Erro ao revogar sessão no backend:', error);
                    }
                }

                // Limpar sessão local
                this.clearSession();

                console.log('[TokenManager] Logout realizado');

                // Disparar evento
                this.dispatchEvent('sessionEnded', {});

            } catch (error) {
                console.error('[TokenManager] Erro ao fazer logout:', error);
                // Mesmo com erro, limpar sessão local
                this.clearSession();
            }
        }

        /**
         * Limpa dados da sessão local
         */
        clearSession() {
            this.sessionId = null;
            this.accessToken = null;
            this.idToken = null;
            this.expiresAt = null;
            this.isRefreshing = false;

            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
            }

            // Limpar storage
            localStorage.removeItem('cara_core_session_id');
            localStorage.removeItem('cara_core_token_expires_at');
            sessionStorage.removeItem('cara_core_access_token');
            sessionStorage.removeItem('cara_core_id_token');
        }

        /**
         * Dispara evento customizado
         * @param {string} eventName - Nome do evento
         * @param {Object} detail - Dados do evento
         */
        dispatchEvent(eventName, detail) {
            const event = new CustomEvent(`tokenManager:${eventName}`, {
                detail: detail,
                bubbles: true
            });
            window.dispatchEvent(event);
        }

        /**
         * Delay helper para retries
         * @param {number} ms - Milissegundos
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Criar instância global
    const tokenManager = new TokenManager();

    // Expor globalmente
    window.TokenManager = TokenManager;
    window.tokenManager = tokenManager;

    // Integração automática com sistema OAuth existente
    // Escutar eventos de login bem-sucedido
    window.addEventListener('oidc:userLoaded', async function(event) {
        try {
            const user = event.detail;
            
            // Extrair dados do usuário
            const userData = {
                email: user.profile?.email || user.profile?.preferred_username,
                name: user.profile?.name,
                provider: window.CARA_CORE_CONFIG?.provider || 'google',
                user_id: user.profile?.sub || user.profile?.oid
            };

            // Extrair tokens
            const tokens = {
                access_token: user.access_token,
                id_token: user.id_token,
                refresh_token: user.refresh_token,
                expires_in: user.expires_in || 3600
            };

            // Criar sessão no backend
            if (tokens.refresh_token) {
                await tokenManager.createSession(userData, tokens);
                console.log('[TokenManager] Sessão criada após login OAuth');
            }
        } catch (error) {
            console.error('[TokenManager] Erro ao criar sessão após login:', error);
        }
    });

    // Escutar eventos de logout
    window.addEventListener('oidc:userUnloaded', function() {
        tokenManager.logout();
    });

    console.log('[TokenManager] Inicializado e pronto para uso');

})();

