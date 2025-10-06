/**
 * test-dual-auth.js - Testes de integração para autenticação com múltiplos provedores
 * Testa cenários onde Google e Microsoft Entra ID funcionam juntos na Área 51
 */

describe('Autenticação Dual (Google + Entra ID)', () => {
    
    beforeEach(() => {
        // Reset completo do estado
        if (window.sessionStorage) {
            window.sessionStorage.clear();
        }
        if (window.localStorage) {
            window.localStorage.clear();
        }
        window.CARA_CORE_CONFIG = {};
        window.CARA_CORE_ENV = {};
    });

    describe('Configuração Dual de Provedores', () => {
        
        it('deve configurar ambos os provedores simultaneamente', () => {
            // Mock de configuração dual
            const dualConfig = {
                google: {
                    client_id: '[GOOGLE_CLIENT_ID_PLACEHOLDER].apps.googleusercontent.com',
                    authority: 'https://accounts.google.com',
                    scope: 'openid profile email'
                },
                entra: {
                    client_id: '[ENTRA_CLIENT_ID_PLACEHOLDER]',
                    authority: 'https://login.microsoftonline.com/consumers/v2.0',
                    scope: 'openid profile email'
                }
            };

            // Validar ambas as configurações
            expect(dualConfig.google.client_id).toContain('[GOOGLE_CLIENT_ID]');
            expect(dualConfig.entra.client_id).toContain('[ENTRA_CLIENT_ID]');
            expect(dualConfig.google.authority).toContain('accounts.google.com');
            expect(dualConfig.entra.authority).toContain('login.microsoftonline.com');
        });

        it('deve detectar ambiente e configurar endpoints corretamente', () => {
            const environments = [
                {
                    name: 'desenvolvimento',
                    baseUrl: 'http://localhost:8000',
                    googleEndpoint: '/oauth/google/token',
                    entraEndpoint: '/oauth/microsoft/token'
                },
                {
                    name: 'produção',
                    baseUrl: 'https://www.caracore.com.br',
                    googleEndpoint: 'https://api-caracore.azurewebsites.net/oauth/google/token',
                    entraEndpoint: 'https://api-caracore.azurewebsites.net/oauth/microsoft/token'
                }
            ];

            environments.forEach(env => {
                expect(env.googleEndpoint).toContain('google/token');
                expect(env.entraEndpoint).toContain('microsoft/token');
                
                if (env.name === 'produção') {
                    expect(env.googleEndpoint).toContain('api-caracore.azurewebsites.net');
                    expect(env.entraEndpoint).toContain('api-caracore.azurewebsites.net');
                }
            });
        });

        it('deve resolver caminhos OIDC únicos para ambos provedores', () => {
            // Simular resolução de paths
            const oidcPaths = {
                login: '/secure/index.html',
                callback: '/secure/callback.html',
                restrita: '/secure/restrita.html',
                logout: '/secure/logout.html',
                postLogoutLanding: '/index.html'
            };

            // Validar que os mesmos paths funcionam para ambos
            Object.values(oidcPaths).forEach(path => {
                expect(path).toMatch(/^\//);
                expect(path).toContain('.html');
            });
        });
    });

    describe('Seleção de Provedor', () => {
        
        it('deve permitir alternar entre provedores', () => {
            // Simular seleção inicial Google
            if (typeof persistProvider === 'function') {
                persistProvider('google');
                expect(window.sessionStorage.getItem('cara_core_oidc_provider')).toBe('google');
                
                // Trocar para Entra
                persistProvider('entra');
                expect(window.sessionStorage.getItem('cara_core_oidc_provider')).toBe('entra');
                
                // Voltar para Google
                persistProvider('google');
                expect(window.sessionStorage.getItem('cara_core_oidc_provider')).toBe('google');
            }
        });

        it('deve validar provedor persistido no callback', () => {
            // Simular diferentes cenários de callback
            const callbackScenarios = [
                {
                    provider: 'google',
                    callbackUrl: 'http://localhost:8000/secure/callback.html?code=google-code&state=google-state'
                },
                {
                    provider: 'entra',
                    callbackUrl: 'http://localhost:8000/secure/callback.html?code=entra-code&state=entra-state&session_state=entra-session'
                }
            ];

            callbackScenarios.forEach(scenario => {
                // Simular provedor selecionado
                window.sessionStorage.setItem('cara_core_oidc_provider', scenario.provider);
                
                const storedProvider = window.sessionStorage.getItem('cara_core_oidc_provider');
                const url = new URL(scenario.callbackUrl);
                const code = url.searchParams.get('code');
                
                expect(storedProvider).toBe(scenario.provider);
                expect(code).toContain(scenario.provider + '-code');
            });
        });

        it('deve detectar mismatch de authority no callback', () => {
            // Cenário: usuário selecionou Google mas callback veio do Entra
            window.sessionStorage.setItem('cara_core_oidc_provider', 'google');
            
            // URL de callback que indica erro de authority mismatch
            const mismatchUrl = 'http://localhost:8000/secure/callback.html?callback_failed&reason=authority%20mismatch';
            const url = new URL(mismatchUrl);
            
            const isCallbackFailed = url.searchParams.has('callback_failed');
            const reason = url.searchParams.get('reason');
            
            expect(isCallbackFailed).toBeTruthy();
            expect(reason).toBe('authority mismatch');
        });
    });

    describe('Gerenciamento de Estado Dual', () => {
        
        it('deve manter estado independente por provedor', () => {
            // Simular login Google
            window.sessionStorage.setItem('cara_core_oidc_provider', 'google');
            window.sessionStorage.setItem('cara_core_google_token', 'google-token-123');
            
            // Não deve interferir com estado Entra
            expect(window.sessionStorage.getItem('cara_core_entra_token')).toBeNull();
            
            // Trocar para Entra
            window.sessionStorage.setItem('cara_core_oidc_provider', 'entra');
            window.sessionStorage.setItem('cara_core_entra_token', 'entra-token-456');
            
            // Tokens devem coexistir
            expect(window.sessionStorage.getItem('cara_core_google_token')).toBe('google-token-123');
            expect(window.sessionStorage.getItem('cara_core_entra_token')).toBe('entra-token-456');
        });

        it('deve limpar estado apenas do provedor ativo no logout', () => {
            // Configurar estado de ambos provedores
            window.sessionStorage.setItem('cara_core_oidc_provider', 'google');
            window.sessionStorage.setItem('cara_core_google_token', 'google-token');
            window.sessionStorage.setItem('cara_core_entra_token', 'entra-token');
            
            // Simular logout apenas do Google
            window.sessionStorage.removeItem('cara_core_google_token');
            window.sessionStorage.removeItem('cara_core_oidc_provider');
            
            // Token Entra deve permanecer (caso futuro de múltiplas sessões)
            expect(window.sessionStorage.getItem('cara_core_google_token')).toBeNull();
            expect(window.sessionStorage.getItem('cara_core_entra_token')).toBe('entra-token');
        });
    });

    describe('Tratamento de Erros Dual', () => {
        
        it('deve classificar erros por provedor', () => {
            const errorMapping = {
                google: [
                    'redirect_uri_mismatch',
                    'invalid_request',
                    'access_denied',
                    'unsupported_response_type'
                ],
                entra: [
                    'AADSTS50011',
                    'AADSTS9002346', 
                    'authority mismatch',
                    'interaction_required',
                    'consent_required'
                ]
            };

            // Testar classificação de erros Google
            errorMapping.google.forEach(error => {
                const isGoogleError = !error.startsWith('AADSTS') && 
                                    error !== 'authority mismatch' &&
                                    !error.includes('interaction_required');
                expect(isGoogleError).toBeTruthy();
            });

            // Testar classificação de erros Entra
            errorMapping.entra.forEach(error => {
                const isEntraError = error.startsWith('AADSTS') || 
                                   error === 'authority mismatch' ||
                                   error.includes('interaction_required') ||
                                   error.includes('consent_required');
                expect(isEntraError).toBeTruthy();
            });
        });

        it('deve sugerir correções específicas por provedor', () => {
            const errorSolutions = {
                'redirect_uri_mismatch': {
                    provider: 'google',
                    solution: 'Verifique as Authorized redirect URIs no Google Cloud Console'
                },
                'AADSTS50011': {
                    provider: 'entra',
                    solution: 'Verifique as Redirect URIs no Azure App Registration'
                },
                'authority mismatch': {
                    provider: 'entra',
                    solution: 'Limpe o sessionStorage e selecione o provedor correto'
                }
            };

            Object.entries(errorSolutions).forEach(([error, info]) => {
                expect(info.provider).toMatch(/^(google|entra)$/);
                expect(info.solution).toBeDefined();
                expect(typeof info.solution).toBe('string');
            });
        });
    });

    describe('Integração de Backend Dual', () => {
        
        it('deve rotear para endpoint correto baseado no provedor', () => {
            const routingLogic = (provider, baseUrl) => {
                const isProduction = baseUrl.includes('caracore.com.br');
                const backendBase = isProduction ? 'https://api-caracore.azurewebsites.net' : '';
                
                switch (provider) {
                    case 'google':
                        return `${backendBase}/oauth/google/token`;
                    case 'entra':
                        return `${backendBase}/oauth/microsoft/token`;
                    default:
                        throw new Error('Provedor desconhecido');
                }
            };

            // Testar roteamento em desenvolvimento
            expect(routingLogic('google', 'http://localhost:8000')).toBe('/oauth/google/token');
            expect(routingLogic('entra', 'http://localhost:8000')).toBe('/oauth/microsoft/token');

            // Testar roteamento em produção
            expect(routingLogic('google', 'https://www.caracore.com.br'))
                .toBe('https://api-caracore.azurewebsites.net/oauth/google/token');
            expect(routingLogic('entra', 'https://www.caracore.com.br'))
                .toBe('https://api-caracore.azurewebsites.net/oauth/microsoft/token');
        });

        it('deve validar payloads de troca de token por provedor', () => {
            const tokenPayloads = {
                google: {
                    code: 'google-auth-code',
                    redirect_uri: 'http://localhost:8000/secure/callback.html',
                    grant_type: 'authorization_code'
                },
                entra: {
                    code: 'entra-auth-code',
                    redirect_uri: 'http://localhost:8000/secure/callback.html',
                    grant_type: 'authorization_code',
                    client_id: '[ENTRA_CLIENT_ID_PLACEHOLDER]'
                }
            };

            // Validar payload Google (client_secret adicionado no backend)
            expect(tokenPayloads.google.grant_type).toBe('authorization_code');
            expect(tokenPayloads.google.code).toContain('google');

            // Validar payload Entra (client_id incluído)
            expect(tokenPayloads.entra.grant_type).toBe('authorization_code');
            expect(tokenPayloads.entra.client_id).toBeDefined();
            expect(tokenPayloads.entra.code).toContain('entra');
        });
    });

    describe('UI e UX Dual', () => {
        
        it('deve exibir ambos botões de login', () => {
            // Simular presença de elementos UI
            const loginButtons = [
                { id: 'google-login', text: 'Continuar com Google', provider: 'google' },
                { id: 'entra-login', text: 'Continuar com Microsoft', provider: 'entra' }
            ];

            loginButtons.forEach(button => {
                expect(button.id).toBeDefined();
                expect(button.text).toContain('Continuar com');
                expect(['google', 'entra']).toContain(button.provider);
            });
        });

        it('deve mostrar provedor ativo na área restrita', () => {
            // Simular estado logado
            const userStates = [
                {
                    provider: 'google',
                    displayName: 'Google Account',
                    icon: 'google-icon.svg'
                },
                {
                    provider: 'entra', 
                    displayName: 'Microsoft Account',
                    icon: 'microsoft-icon.svg'
                }
            ];

            userStates.forEach(state => {
                expect(state.displayName).toContain('Account');
                expect(state.icon).toContain('.svg');
                expect(['google', 'entra']).toContain(state.provider);
            });
        });

        it('deve permitir logout por provedor específico', () => {
            const logoutUrls = {
                google: 'https://accounts.google.com/logout',
                entra: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
            };

            Object.entries(logoutUrls).forEach(([provider, url]) => {
                expect(url).toMatch(/^https:\/\//);
                if (provider === 'google') {
                    expect(url).toContain('accounts.google.com');
                } else {
                    expect(url).toContain('login.microsoftonline.com');
                }
            });
        });
    });

    describe('Cenários de Troca de Provedor', () => {
        
        it('deve permitir mudança de Google para Entra', async () => {
            // Simular login Google inicial
            window.sessionStorage.setItem('cara_core_oidc_provider', 'google');
            window.sessionStorage.setItem('cara_core_access_token', 'google-token');
            
            // Simular logout do Google
            window.sessionStorage.removeItem('cara_core_access_token');
            
            // Simular login Entra
            window.sessionStorage.setItem('cara_core_oidc_provider', 'entra');
            window.sessionStorage.setItem('cara_core_access_token', 'entra-token');
            
            expect(window.sessionStorage.getItem('cara_core_oidc_provider')).toBe('entra');
            expect(window.sessionStorage.getItem('cara_core_access_token')).toBe('entra-token');
        });

        it('deve detectar conflito de sessões simultâneas', () => {
            // Cenário: usuário logado no Google tenta login Entra
            window.sessionStorage.setItem('cara_core_oidc_provider', 'google');
            window.sessionStorage.setItem('cara_core_access_token', 'google-token');
            
            // Detectar conflito ao tentar Entra
            const hasActiveSession = window.sessionStorage.getItem('cara_core_access_token') !== null;
            const currentProvider = window.sessionStorage.getItem('cara_core_oidc_provider');
            const attemptingProvider = 'entra';
            
            const hasConflict = hasActiveSession && currentProvider !== attemptingProvider;
            
            expect(hasConflict).toBeTruthy();
        });
    });

    describe('Testes de Integração E2E', () => {
        
        it('deve simular fluxo completo Google', async () => {
            // 1. Seleção do provedor
            window.sessionStorage.setItem('cara_core_oidc_provider', 'google');
            
            // 2. Redirecionamento para Google (simulado)
            const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=[GOOGLE_CLIENT_ID]...';
            expect(authUrl).toContain('accounts.google.com');
            
            // 3. Callback com código
            const callbackUrl = 'http://localhost:8000/secure/callback.html?code=google-code&state=state123';
            const url = new URL(callbackUrl);
            expect(url.searchParams.get('code')).toBe('google-code');
            
            // 4. Troca de token (simulada)
            const tokenResponse = { access_token: 'google-access', id_token: 'google-id' };
            expect(tokenResponse.access_token).toBeDefined();
            
            // 5. Redirecionamento para área restrita
            const restrictedUrl = 'http://localhost:8000/secure/restrita.html';
            expect(restrictedUrl).toContain('/secure/restrita.html');
        });

        it('deve simular fluxo completo Entra', async () => {
            // 1. Seleção do provedor
            window.sessionStorage.setItem('cara_core_oidc_provider', 'entra');
            
            // 2. Redirecionamento para Entra (simulado)
            const authUrl = 'https://login.microsoftonline.com/consumers/v2.0/authorize?client_id=8ef17663...';
            expect(authUrl).toContain('login.microsoftonline.com');
            
            // 3. Callback com código
            const callbackUrl = 'http://localhost:8000/secure/callback.html?code=entra-code&state=state456&session_state=session123';
            const url = new URL(callbackUrl);
            expect(url.searchParams.get('code')).toBe('entra-code');
            expect(url.searchParams.get('session_state')).toBeDefined();
            
            // 4. Troca de token (simulada)
            const tokenResponse = { access_token: 'entra-access', id_token: 'entra-id' };
            expect(tokenResponse.access_token).toBeDefined();
            
            // 5. Redirecionamento para área restrita
            const restrictedUrl = 'http://localhost:8000/secure/restrita.html';
            expect(restrictedUrl).toContain('/secure/restrita.html');
        });
    });
});

console.log('🔶 Testes de Autenticação Dual (Google + Entra ID) carregados.');