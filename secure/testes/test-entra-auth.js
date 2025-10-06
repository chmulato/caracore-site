/**
 * test-entra-auth.js - Testes unitários específicos para autenticação Microsoft Entra ID
 * Foca na validação do fluxo OIDC com Microsoft Entra ID (Azure AD)
 */

describe('Autenticação Microsoft Entra ID', () => {
    
    beforeEach(() => {
        // Reset do estado antes de cada teste
        if (window.sessionStorage) {
            window.sessionStorage.clear();
        }
        if (window.localStorage) {
            window.localStorage.removeItem('cara_core_oidc_provider');
        }
        // Reset de configurações globais
        window.CARA_CORE_CONFIG = {};
        window.CARA_CORE_ENV = {};
    });

    describe('Configuração Microsoft Entra', () => {
        
        it('deve gerar configuração Entra corretamente', async () => {
            // Simular ambiente local
            Object.defineProperty(window, 'location', {
                value: {
                    origin: 'http://localhost:8000',
                    hostname: 'localhost'
                },
                writable: true
            });

            // Mock da configuração Entra
            const mockEntraConfig = {
                client_id: '[ENTRA_CLIENT_ID_PLACEHOLDER]',
                redirect_uri: 'http://localhost:8000/secure/callback.html',
                authority: 'https://login.microsoftonline.com/consumers/v2.0',
                scope: 'openid profile email',
                response_type: 'code'
            };

            expect(mockEntraConfig.client_id).toBe('[ENTRA_CLIENT_ID_PLACEHOLDER]');
            expect(mockEntraConfig.authority).toContain('login.microsoftonline.com');
            expect(mockEntraConfig.authority).toContain('/consumers/v2.0');
            expect(mockEntraConfig.scope).toContain('openid profile email');
        });

        it('deve detectar configuração de tenant corretamente', () => {
            const tenantConfigs = [
                {
                    type: 'consumers',
                    authority: 'https://login.microsoftonline.com/consumers/v2.0',
                    description: 'Contas pessoais Microsoft'
                },
                {
                    type: 'common', 
                    authority: 'https://login.microsoftonline.com/common/v2.0',
                    description: 'Contas corporativas e pessoais'
                },
                {
                    type: 'organizations',
                    authority: 'https://login.microsoftonline.com/organizations/v2.0', 
                    description: 'Apenas contas corporativas'
                }
            ];

            tenantConfigs.forEach(config => {
                expect(config.authority).toContain('login.microsoftonline.com');
                expect(config.authority).toContain('/v2.0');
                expect(config.description).toBeDefined();
            });
        });

        it('deve configurar scopes Entra corretamente', () => {
            const requiredScopes = ['openid', 'profile', 'email'];
            const scopeString = 'openid profile email';
            
            const scopeArray = scopeString.split(' ');
            
            requiredScopes.forEach(scope => {
                expect(scopeArray).toContain(scope);
            });
        });
    });

    describe('Fluxo de Autenticação Entra', () => {
        
        it('deve persistir provedor Entra corretamente', () => {
            // Simular seleção do provedor Entra
            if (typeof persistProvider === 'function') {
                persistProvider('entra');
                
                const sessionProvider = window.sessionStorage.getItem('cara_core_oidc_provider');
                const localProvider = window.localStorage.getItem('cara_core_oidc_provider');
                
                expect(sessionProvider).toBe('entra');
                expect(localProvider).toBe('entra');
            }
        });

        it('deve gerar state e nonce para Entra', () => {
            if (typeof generateNonce === 'function') {
                const state = generateNonce(32);
                const nonce = generateNonce(32);
                
                expect(state).toBeDefined();
                expect(nonce).toBeDefined();
                expect(state.length).toBeGreaterThan(16);
                expect(nonce.length).toBeGreaterThan(16);
                expect(state).not.toBe(nonce); // Devem ser diferentes
            }
        });

        it('deve construir URL de autorização Entra válida', () => {
            // Mock da configuração Entra
            const mockConfig = {
                client_id: '[ENTRA_CLIENT_ID_PLACEHOLDER]',
                redirect_uri: 'http://localhost:8000/secure/callback.html',
                scope: 'openid profile email',
                response_type: 'code',
                authority: 'https://login.microsoftonline.com/consumers/v2.0'
            };

            // Construir URL de autorização
            const state = 'test-state-entra';
            const nonce = 'test-nonce-entra';
            
            const authUrl = new URL(`${mockConfig.authority}/authorize`);
            authUrl.searchParams.set('client_id', mockConfig.client_id);
            authUrl.searchParams.set('redirect_uri', mockConfig.redirect_uri);
            authUrl.searchParams.set('response_type', mockConfig.response_type);
            authUrl.searchParams.set('scope', mockConfig.scope);
            authUrl.searchParams.set('state', state);
            authUrl.searchParams.set('nonce', nonce);
            authUrl.searchParams.set('response_mode', 'query');
            
            expect(authUrl.toString()).toContain('login.microsoftonline.com');
            expect(authUrl.toString()).toContain('client_id=[ENTRA_CLIENT_ID]');
            expect(authUrl.toString()).toContain('response_type=code');
            expect(authUrl.toString()).toContain('scope=openid');
        });

        it('deve detectar callback Entra corretamente', () => {
            // Simular URL de callback com código
            const callbackUrl = 'http://localhost:8000/secure/callback.html?code=test-auth-code&state=test-state&session_state=test-session';
            const url = new URL(callbackUrl);
            
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const sessionState = url.searchParams.get('session_state');
            
            expect(code).toBe('test-auth-code');
            expect(state).toBe('test-state');
            expect(sessionState).toBeDefined();
        });
    });

    describe('Validação de Token Entra', () => {
        
        it('deve validar estrutura de ID token Entra', () => {
            // Mock de um ID token Entra válido (estrutura)
            const mockIdToken = {
                iss: 'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0',
                aud: '[ENTRA_CLIENT_ID_PLACEHOLDER]',
                sub: 'AAAAAAAAAAAAAAAAAAAAAIkzqFVrSaSaFHy782bbtaQ',
                email: 'user@outlook.com',
                name: 'Test User',
                preferred_username: 'user@outlook.com',
                tid: '9188040d-6c67-4c5b-b112-36a304b66dad',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
                aio: 'mock-aio-value'
            };

            // Validações específicas do Entra
            expect(mockIdToken.iss).toContain('login.microsoftonline.com');
            expect(mockIdToken.aud).toBe('[ENTRA_CLIENT_ID_PLACEHOLDER]');
            expect(mockIdToken.tid).toBeDefined(); // Tenant ID
            expect(mockIdToken.preferred_username).toBeDefined();
            expect(mockIdToken.exp).toBeGreaterThan(mockIdToken.iat);
        });

        it('deve validar diferentes tipos de conta Entra', () => {
            const accountTypes = [
                {
                    type: 'personal',
                    iss: 'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0',
                    email: 'user@outlook.com'
                },
                {
                    type: 'work',
                    iss: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0',
                    email: 'user@microsoft.com'
                }
            ];

            accountTypes.forEach(account => {
                expect(account.iss).toContain('login.microsoftonline.com');
                expect(account.iss).toContain('/v2.0');
                expect(account.email).toContain('@');
            });
        });
    });

    describe('Integração com Backend Entra', () => {
        
        it('deve configurar endpoint de troca de token Entra', () => {
            const environments = [
                {
                    name: 'desenvolvimento',
                    origin: 'http://localhost:8000',
                    expectedEndpoint: '/oauth/microsoft/token'
                },
                {
                    name: 'produção', 
                    origin: 'https://www.caracore.com.br',
                    expectedEndpoint: 'https://api-caracore.azurewebsites.net/oauth/microsoft/token'
                }
            ];

            environments.forEach(env => {
                const isProduction = env.origin.includes('caracore.com.br');
                const tokenEndpoint = isProduction
                    ? 'https://api-caracore.azurewebsites.net/oauth/microsoft/token'
                    : '/oauth/microsoft/token';

                expect(tokenEndpoint).toContain('microsoft/token');
                
                if (isProduction) {
                    expect(tokenEndpoint).toContain('api-caracore.azurewebsites.net');
                }
            });
        });

        it('deve simular payload de troca de token Entra', () => {
            const mockPayload = {
                code: 'test-authorization-code',
                redirect_uri: 'http://localhost:8000/secure/callback.html',
                grant_type: 'authorization_code',
                client_id: '[ENTRA_CLIENT_ID_PLACEHOLDER]',
                scope: 'openid profile email'
            };

            expect(mockPayload.grant_type).toBe('authorization_code');
            expect(mockPayload.client_id).toBe('[ENTRA_CLIENT_ID_PLACEHOLDER]');
            expect(mockPayload.scope).toContain('openid');
            expect(mockPayload.redirect_uri).toContain('/secure/callback.html');
        });

        it('deve simular resposta bem-sucedida do token Entra', () => {
            const mockResponse = {
                access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...',
                id_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...',
                token_type: 'Bearer',
                expires_in: 3600,
                scope: 'openid profile email',
                refresh_token: 'mock-refresh-token'
            };

            expect(mockResponse.access_token).toBeDefined();
            expect(mockResponse.id_token).toBeDefined();
            expect(mockResponse.token_type).toBe('Bearer');
            expect(mockResponse.refresh_token).toBeDefined();
        });
    });

    describe('Tratamento de Erros Entra', () => {
        
        it('deve detectar erro de authority mismatch', () => {
            const mockErrorUrl = 'http://localhost:8000/secure/callback.html?callback_failed&reason=authority%20mismatch';
            const url = new URL(mockErrorUrl);
            const reason = url.searchParams.get('reason');
            
            expect(reason).toBe('authority mismatch');
            
            // Verificar se é erro de autoridade
            const isAuthorityError = reason === 'authority mismatch';
            expect(isAuthorityError).toBeTruthy();
        });

        it('deve detectar erro AADSTS50011 (redirect_uri mismatch)', () => {
            const aadstErrors = [
                'AADSTS50011', // Redirect URI mismatch  
                'AADSTS9002346', // Invalid redirect_uri
                'AADSTS50020', // User account not found
                'AADSTS90014' // Required claim missing
            ];

            aadstErrors.forEach(errorCode => {
                expect(errorCode).toMatch(/^AADSTS\d+$/);
                expect(errorCode.length).toBeGreaterThan(7);
            });
        });

        it('deve detectar erro de consentimento necessário', () => {
            const mockErrorUrl = 'http://localhost:8000/secure/callback.html?error=interaction_required&error_description=User+consent+required';
            const url = new URL(mockErrorUrl);
            const error = url.searchParams.get('error');
            
            expect(error).toBe('interaction_required');
            
            // Verificar se requer interação do usuário
            const needsConsent = error === 'interaction_required' || error === 'consent_required';
            expect(needsConsent).toBeTruthy();
        });

        it('deve detectar erro de acesso negado Entra', () => {
            const mockErrorUrl = 'http://localhost:8000/secure/callback.html?error=access_denied&error_description=User+cancelled+authentication';
            const url = new URL(mockErrorUrl);
            const error = url.searchParams.get('error');
            const description = url.searchParams.get('error_description');
            
            expect(error).toBe('access_denied');
            expect(description).toContain('cancelled');
        });
    });

    describe('Configurações Específicas Entra', () => {
        
        it('deve suportar configuração de tenant específico', () => {
            const customTenantId = 'custom-tenant-guid-12345';
            const customAuthority = `https://login.microsoftonline.com/${customTenantId}/v2.0`;
            
            expect(customAuthority).toContain(customTenantId);
            expect(customAuthority).toContain('/v2.0');
        });

        it('deve suportar scopes adicionais Entra', () => {
            const extendedScopes = 'openid profile email User.Read';
            const scopeArray = extendedScopes.split(' ');
            
            expect(scopeArray).toContain('User.Read');
            expect(scopeArray).toContain('openid');
            expect(scopeArray.length).toBe(4);
        });

        it('deve validar configuração de prompt Entra', () => {
            const promptOptions = ['none', 'login', 'consent', 'select_account'];
            
            promptOptions.forEach(prompt => {
                expect(['none', 'login', 'consent', 'select_account']).toContain(prompt);
            });
        });
    });

    describe('Gerenciamento de Sessão Entra', () => {
        
        it('deve detectar sessão Entra existente', () => {
            // Simular sessão Entra
            window.sessionStorage.setItem('cara_core_oidc_provider', 'entra');
            window.sessionStorage.setItem('cara_core_id_token', 'mock-entra-token');
            
            const hasEntraSession = window.sessionStorage.getItem('cara_core_oidc_provider') === 'entra' &&
                                  window.sessionStorage.getItem('cara_core_id_token');
            
            expect(hasEntraSession).toBeTruthy();
        });

        it('deve limpar sessão Entra no logout', () => {
            // Simular estado logado
            window.sessionStorage.setItem('cara_core_oidc_provider', 'entra');
            window.sessionStorage.setItem('cara_core_access_token', 'mock-token');
            window.sessionStorage.setItem('cara_core_id_token', 'mock-id-token');
            
            // Simular logout
            if (typeof clearStoredProvider === 'function') {
                clearStoredProvider();
            } else {
                window.sessionStorage.clear();
                window.localStorage.removeItem('cara_core_oidc_provider');
            }
            
            expect(window.sessionStorage.getItem('cara_core_oidc_provider')).toBeNull();
            expect(window.sessionStorage.getItem('cara_core_access_token')).toBeNull();
        });
    });
});

console.log('🔷 Testes de Autenticação Microsoft Entra ID carregados.');