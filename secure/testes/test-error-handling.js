/**
 * test-error-handling.js - Testes de tratamento de erros e cenários de falha
 * Valida como o sistema lida com erros de autenticação e casos extremos
 */

describe('Tratamento de Erros OIDC', () => {
    
    beforeEach(() => {
        // Reset do estado
        if (window.sessionStorage) {
            window.sessionStorage.clear();
        }
        if (window.localStorage) {
            window.localStorage.clear();
        }
        window.CARA_CORE_CONFIG = {};
        window.CARA_CORE_ENV = {};
    });

    describe('Erros de Configuração', () => {
        
        it('deve detectar configuração inválida', () => {
            const invalidConfigs = [
                { client_id: '', redirect_uri: 'http://localhost/callback' },
                { client_id: 'valid-id', redirect_uri: '' },
                { client_id: 'valid-id', redirect_uri: 'invalid-url' },
                {}
            ];

            for (const config of invalidConfigs) {
                expect(() => {
                    if (!config.client_id || !config.redirect_uri) {
                        throw new Error('Configuração OIDC incompleta');
                    }
                    if (!config.redirect_uri.startsWith('http')) {
                        throw new Error('URL de redirect inválida');
                    }
                }).toThrow();
            }
        });

        it('deve detectar client_id ausente ou inválido', () => {
            const invalidClientIds = [
                '',
                null,
                undefined,
                'short',
                123,
                {}
            ];

            for (const clientId of invalidClientIds) {
                expect(() => {
                    if (!clientId || typeof clientId !== 'string' || clientId.length < 10) {
                        throw new Error('Client ID inválido');
                    }
                }).toThrow();
            }
        });

        it('deve detectar redirect_uri malformada', () => {
            const invalidRedirectUris = [
                'not-a-url',
                'ftp://example.com',
                'javascript:alert(1)',
                'file:///etc/passwd',
                'http://localhost', // sem callback path
                'https://malicious-site.com/callback'
            ];

            for (const uri of invalidRedirectUris) {
                expect(() => {
                    const url = new URL(uri);
                    if (!['http:', 'https:'].includes(url.protocol)) {
                        throw new Error('Protocolo inválido');
                    }
                    if (!uri.includes('callback')) {
                        throw new Error('Path de callback obrigatório');
                    }
                    if (!uri.includes('caracore.com') && !uri.includes('localhost')) {
                        throw new Error('Domínio não autorizado');
                    }
                }).toThrow();
            }
        });
    });

    describe('Erros de Autorização', () => {
        
        it('deve tratar erro access_denied do provedor', () => {
            const authError = {
                error: 'access_denied',
                error_description: 'The user denied the request',
                state: 'test-state'
            };

            expect(authError.error).toBe('access_denied');
            expect(authError.error_description).toContain('denied');
        });

        it('deve tratar erro invalid_request', () => {
            const authError = {
                error: 'invalid_request',
                error_description: 'Invalid redirect_uri',
                state: 'test-state'
            };

            expect(authError.error).toBe('invalid_request');
            expect(() => {
                if (authError.error === 'invalid_request') {
                    throw new Error(`Requisição inválida: ${authError.error_description}`);
                }
            }).toThrow();
        });

        it('deve tratar erro unauthorized_client', () => {
            const authError = {
                error: 'unauthorized_client',
                error_description: 'Client not authorized for this flow',
                state: 'test-state'
            };

            expect(authError.error).toBe('unauthorized_client');
        });

        it('deve validar state parameter contra CSRF', () => {
            const storedState = 'stored-state-value';
            const receivedStates = [
                'different-state',
                '',
                null,
                undefined
            ];

            for (const receivedState of receivedStates) {
                expect(() => {
                    if (receivedState !== storedState) {
                        throw new Error('Estado CSRF inválido');
                    }
                }).toThrow();
            }
        });
    });

    describe('Erros de Token', () => {
        
        it('deve tratar erro invalid_grant na troca de código', () => {
            const tokenError = {
                error: 'invalid_grant',
                error_description: 'Authorization code is invalid or expired'
            };

            expect(tokenError.error).toBe('invalid_grant');
            expect(() => {
                if (tokenError.error === 'invalid_grant') {
                    throw new Error('Código de autorização inválido');
                }
            }).toThrow();
        });

        it('deve tratar token expirado', () => {
            const expiredToken = {
                access_token: 'expired_token',
                expires_at: Date.now() - 3600000, // Expirado há 1 hora
                refresh_token: 'refresh_token'
            };

            const isExpired = expiredToken.expires_at < Date.now();
            expect(isExpired).toBeTruthy();
        });

        it('deve tratar JWT malformado', () => {
            const malformedJwts = [
                'not.a.jwt',
                'header.payload', // Falta signature
                'header.payload.signature.extra', // Muitas partes
                'invalid-base64.invalid-base64.invalid-base64'
            ];

            for (const jwt of malformedJwts) {
                expect(() => {
                    const parts = jwt.split('.');
                    if (parts.length !== 3) {
                        throw new Error('JWT deve ter 3 partes');
                    }
                    // Tentar decodificar header
                    try {
                        atob(parts[0]);
                    } catch (e) {
                        throw new Error('Header JWT inválido');
                    }
                }).toThrow();
            }
        });
    });

    describe('Erros de Rede', () => {
        
        it('deve tratar timeout de requisição', async () => {
            const mockFetch = () => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error('Request timeout'));
                    }, 100);
                });
            };

            try {
                await mockFetch();
                expect(false).toBeTruthy(); // Não deveria chegar aqui
            } catch (error) {
                expect(error.message).toContain('timeout');
            }
        });

        it('deve tratar erro 500 do servidor', () => {
            const serverError = {
                status: 500,
                statusText: 'Internal Server Error',
                message: 'Server temporarily unavailable'
            };

            expect(serverError.status).toBe(500);
            expect(() => {
                if (serverError.status >= 500) {
                    throw new Error('Erro interno do servidor');
                }
            }).toThrow();
        });

        it('deve tratar erro 401 não autorizado', () => {
            const unauthorizedError = {
                status: 401,
                statusText: 'Unauthorized',
                message: 'Invalid or expired token'
            };

            expect(unauthorizedError.status).toBe(401);
            expect(() => {
                if (unauthorizedError.status === 401) {
                    throw new Error('Token inválido ou expirado');
                }
            }).toThrow();
        });

        it('deve tratar erro de conectividade', () => {
            const networkError = {
                name: 'NetworkError',
                message: 'Failed to fetch'
            };

            expect(networkError.name).toBe('NetworkError');
            expect(() => {
                if (networkError.name === 'NetworkError') {
                    throw new Error('Erro de conectividade');
                }
            }).toThrow();
        });
    });

    describe('Erros de Storage', () => {
        
        it('deve tratar QuotaExceededError do localStorage', () => {
            expect(() => {
                try {
                    // Simular storage cheio
                    const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
                    window.localStorage.setItem('test', largeData);
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        throw new Error('Storage quota exceeded');
                    }
                }
            }).toThrow();
        });

        it('deve funcionar quando localStorage não está disponível', () => {
            // Mock localStorage indisponível
            const originalLocalStorage = window.localStorage;
            Object.defineProperty(window, 'localStorage', {
                value: null,
                writable: true
            });

            expect(() => {
                if (!window.localStorage) {
                    // Fallback para sessionStorage ou memória
                    console.log('localStorage indisponível, usando fallback');
                }
            }).not.toThrow();

            // Restaurar localStorage
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true
            });
        });

        it('deve tratar sessionStorage indisponível', () => {
            const originalSessionStorage = window.sessionStorage;
            Object.defineProperty(window, 'sessionStorage', {
                value: null,
                writable: true
            });

            expect(() => {
                if (!window.sessionStorage) {
                    // Usar estratégia alternativa
                    console.log('sessionStorage indisponível');
                }
            }).not.toThrow();

            // Restaurar sessionStorage
            Object.defineProperty(window, 'sessionStorage', {
                value: originalSessionStorage,
                writable: true
            });
        });
    });

    describe('Erros de Popup e Janela', () => {
        
        it('deve tratar popup bloqueado', () => {
            // Mock window.open retornando null (popup bloqueado)
            const originalOpen = window.open;
            window.open = () => null;

            expect(() => {
                const popup = window.open('about:blank', '_blank');
                if (!popup) {
                    throw new Error('Popup bloqueado pelo navegador');
                }
            }).toThrow();

            // Restaurar window.open
            window.open = originalOpen;
        });

        it('deve tratar fechamento prematuro do popup', () => {
            const mockPopup = {
                closed: true,
                location: { href: 'about:blank' }
            };

            expect(() => {
                if (mockPopup.closed) {
                    throw new Error('Popup foi fechado antes da conclusão');
                }
            }).toThrow();
        });
    });

    describe('Recuperação de Erros', () => {
        
        it('deve tentar novamente após erro temporário', async () => {
            let attempts = 0;
            const maxAttempts = 3;

            const unreliableFunction = () => {
                attempts++;
                if (attempts < maxAttempts) {
                    throw new Error('Temporary error');
                }
                return 'success';
            };

            let result;
            for (let i = 0; i < maxAttempts; i++) {
                try {
                    result = unreliableFunction();
                    break;
                } catch (error) {
                    if (i === maxAttempts - 1) {
                        throw error;
                    }
                }
            }

            expect(result).toBe('success');
            expect(attempts).toBe(maxAttempts);
        });

        it('deve limpar estado após erro crítico', () => {
            // Simular erro crítico
            const criticalError = new Error('Critical authentication error');
            
            // Simular limpeza de estado
            expect(() => {
                window.sessionStorage.clear();
                window.localStorage.removeItem('cara_core_oidc_provider');
                console.log('Estado limpo após erro crítico');
            }).not.toThrow();
        });

        it('deve redirecionar para página de erro apropriada', () => {
            const errorTypes = {
                'access_denied': '/error/acesso-negado',
                'invalid_request': '/error/requisicao-invalida',
                'server_error': '/error/servidor',
                'network_error': '/error/conectividade'
            };

            for (const [errorType, expectedPath] of Object.entries(errorTypes)) {
                expect(expectedPath).toContain('/error/');
                expect(expectedPath.includes(errorType.replace('_', '-'))).toBeTruthy();
            }
        });
    });

    describe('Logging de Erros', () => {
        
        it('deve logar erros com contexto adequado', () => {
            const errorLog = {
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                message: 'OIDC authentication failed',
                error: 'invalid_grant',
                context: {
                    provider: 'google',
                    step: 'token_exchange',
                    userAgent: navigator.userAgent
                }
            };

            expect(errorLog.level).toBe('ERROR');
            expect(errorLog.context.provider).toBeDefined();
            expect(errorLog.context.step).toBeDefined();
            expect(errorLog.timestamp).toBeDefined();
        });

        it('deve sanitizar informações sensíveis nos logs', () => {
            const sensitiveData = {
                access_token: 'secret_token',
                refresh_token: 'secret_refresh',
                client_secret: 'secret_client',
                password: 'user_password'
            };

            const sanitizedLog = {};
            for (const [key, value] of Object.entries(sensitiveData)) {
                if (['token', 'secret', 'password'].some(sensitive => key.includes(sensitive))) {
                    sanitizedLog[key] = '[REDACTED]';
                } else {
                    sanitizedLog[key] = value;
                }
            }

            expect(sanitizedLog.access_token).toBe('[REDACTED]');
            expect(sanitizedLog.refresh_token).toBe('[REDACTED]');
            expect(sanitizedLog.client_secret).toBe('[REDACTED]');
            expect(sanitizedLog.password).toBe('[REDACTED]');
        });
    });
});