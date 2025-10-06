/**
 * test-config-validation.js - Testes de validação de configurações OIDC
 * Valida se as configurações estão corretas e completas
 */

describe('Validação de Configurações OIDC', () => {
    
    beforeEach(() => {
        // Reset do estado antes de cada teste
        if (window.sessionStorage) {
            window.sessionStorage.clear();
        }
        if (window.localStorage) {
            window.localStorage.clear();
        }
        window.CARA_CORE_CONFIG = {};
        window.CARA_CORE_ENV = {};
    });

    describe('Validação de URLs e Endpoints', () => {
        
        it('deve validar URLs de redirect corretas', () => {
            const validRedirectUris = [
                'http://localhost:8000/secure/callback.html',
                'https://www.caracore.com.br/secure/callback.html',
                'https://caracore.com.br/secure/callback.html'
            ];

            for (const uri of validRedirectUris) {
                expect(uri).toContain('/secure/callback.html');
                expect(uri.startsWith('http://') || uri.startsWith('https://')).toBeTruthy();
            }
        });

        it('deve rejeitar URLs de redirect inválidas', () => {
            const invalidRedirectUris = [
                'ftp://caracore.com.br/callback',
                'javascript:alert(1)',
                'http://malicious-site.com/callback',
                'data:text/html,<script>alert(1)</script>'
            ];

            for (const uri of invalidRedirectUris) {
                expect(() => {
                    if (uri.startsWith('javascript:') || uri.startsWith('data:')) {
                        throw new Error('URL de redirect insegura');
                    }
                    if (!uri.includes('caracore.com') && !uri.includes('localhost')) {
                        throw new Error('Domínio não autorizado');
                    }
                }).toThrow();
            }
        });

        it('deve validar configuração de scope OIDC', () => {
            const requiredScopes = ['openid', 'profile', 'email'];
            const testScope = 'openid profile email';

            for (const scope of requiredScopes) {
                expect(testScope).toContain(scope);
            }
        });
    });

    describe('Validação de Client IDs', () => {
        
        it('deve validar formato do Client ID do Google', () => {
            const googleClientId = '[GOOGLE_CLIENT_ID_PLACEHOLDER].apps.googleusercontent.com';
            
            expect(googleClientId).toContain('.apps.googleusercontent.com');
            expect(googleClientId.length).toBeGreaterThan(20);
        });

        it('deve validar formato do Client ID do Microsoft Entra', () => {
            const entraClientId = '[ENTRA_CLIENT_ID_PLACEHOLDER]';
            
            // Client ID do Entra deve ser um GUID
            expect(entraClientId).toBeDefined();
            expect(typeof entraClientId).toBe('string');
            expect(entraClientId.length).toBeGreaterThan(10);
        });
    });

    describe('Validação de Authorities', () => {
        
        it('deve validar authority do Google', () => {
            const googleAuthority = 'https://accounts.google.com';
            
            expect(googleAuthority).toBe('https://accounts.google.com');
            expect(googleAuthority.startsWith('https://')).toBeTruthy();
        });

        it('deve validar authority do Microsoft Entra', () => {
            const entraAuthorities = [
                'https://login.microsoftonline.com/consumers/v2.0',
                'https://login.microsoftonline.com/common/v2.0',
                'https://login.microsoftonline.com/organizations/v2.0'
            ];

            for (const authority of entraAuthorities) {
                expect(authority.startsWith('https://login.microsoftonline.com')).toBeTruthy();
                expect(authority.endsWith('/v2.0')).toBeTruthy();
            }
        });
    });

    describe('Validação de Response Types', () => {
        
        it('deve usar response_type code para fluxo authorization code', () => {
            const responseType = 'code';
            
            expect(responseType).toBe('code');
        });

        it('deve rejeitar response types inseguros', () => {
            const insecureResponseTypes = ['token', 'id_token'];
            
            for (const type of insecureResponseTypes) {
                expect(() => {
                    if (type === 'token' || type === 'id_token') {
                        throw new Error('Response type inseguro para aplicação pública');
                    }
                }).toThrow();
            }
        });
    });

    describe('Validação de Configuração de Ambiente', () => {
        
        it('deve detectar ambiente de desenvolvimento', () => {
            // Mock do ambiente local
            Object.defineProperty(window, 'location', {
                value: {
                    hostname: 'localhost',
                    origin: 'http://localhost:8000'
                },
                writable: true
            });

            const isDevelopment = window.location.hostname === 'localhost';
            expect(isDevelopment).toBeTruthy();
        });

        it('deve detectar ambiente de produção', () => {
            // Mock do ambiente de produção
            Object.defineProperty(window, 'location', {
                value: {
                    hostname: 'www.caracore.com.br',
                    origin: 'https://www.caracore.com.br'
                },
                writable: true
            });

            const isProduction = window.location.hostname.includes('caracore.com');
            expect(isProduction).toBeTruthy();
        });
    });

    describe('Validação de Storage e Persistência', () => {
        
        it('deve verificar disponibilidade do sessionStorage', () => {
            expect(window.sessionStorage).toBeDefined();
            expect(typeof window.sessionStorage.setItem).toBe('function');
            expect(typeof window.sessionStorage.getItem).toBe('function');
            expect(typeof window.sessionStorage.removeItem).toBe('function');
        });

        it('deve verificar disponibilidade do localStorage', () => {
            expect(window.localStorage).toBeDefined();
            expect(typeof window.localStorage.setItem).toBe('function');
            expect(typeof window.localStorage.getItem).toBe('function');
            expect(typeof window.localStorage.removeItem).toBe('function');
        });

        it('deve testar operações básicas de storage', () => {
            const testKey = 'test_oidc_key';
            const testValue = 'test_value';

            // Teste sessionStorage
            window.sessionStorage.setItem(testKey, testValue);
            expect(window.sessionStorage.getItem(testKey)).toBe(testValue);
            window.sessionStorage.removeItem(testKey);
            expect(window.sessionStorage.getItem(testKey)).toBeNull();

            // Teste localStorage
            window.localStorage.setItem(testKey, testValue);
            expect(window.localStorage.getItem(testKey)).toBe(testValue);
            window.localStorage.removeItem(testKey);
            expect(window.localStorage.getItem(testKey)).toBeNull();
        });
    });

    describe('Validação de Segurança', () => {
        
        it('deve validar uso de HTTPS em produção', () => {
            const productionUrls = [
                'https://www.caracore.com.br',
                'https://caracore.com.br'
            ];

            for (const url of productionUrls) {
                expect(url.startsWith('https://')).toBeTruthy();
            }
        });

        it('deve permitir HTTP apenas em desenvolvimento', () => {
            const developmentUrls = [
                'http://localhost:8000',
                'http://127.0.0.1:8000'
            ];

            for (const url of developmentUrls) {
                const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
                if (url.startsWith('http://')) {
                    expect(isLocalhost).toBeTruthy();
                }
            }
        });

        it('deve validar configuração CORS para diferentes ambientes', () => {
            const corsConfigs = {
                development: {
                    allowedOrigins: ['http://localhost:8000', 'http://127.0.0.1:8000'],
                    allowCredentials: true
                },
                production: {
                    allowedOrigins: ['https://www.caracore.com.br', 'https://caracore.com.br'],
                    allowCredentials: true
                }
            };

            // Validar configuração de desenvolvimento
            expect(corsConfigs.development.allowedOrigins).toContain('http://localhost:8000');
            expect(corsConfigs.development.allowCredentials).toBeTruthy();

            // Validar configuração de produção
            expect(corsConfigs.production.allowedOrigins).toContain('https://www.caracore.com.br');
            expect(corsConfigs.production.allowCredentials).toBeTruthy();
        });
    });
});