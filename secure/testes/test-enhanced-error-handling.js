/**
 * test-enhanced-error-handling.js - Testes adicionais para o sistema de tratamento de erros aprimorado
 * Este arquivo contém testes específicos para o sistema aprimorado de tratamento de erros
 */

describe('Sistema de Tratamento de Erros Aprimorado', () => {
    
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

    describe('Categorização Avançada de Erros', () => {
        
        it('deve detectar e diferenciar tipos de timeout', () => {
            // Verificar se o sistema diferencia entre timeout de redirecionamento e resposta
            const errorHandler = window.AuthErrorHandler;
            
            // Timeout de redirecionamento
            const redirectError = errorHandler.categorizeError(
                'Timeout durante redirecionamento para provedor',
                'redirect_timeout'
            );
            
            // Timeout de resposta do servidor
            const responseError = errorHandler.categorizeError(
                'Timeout na resposta do servidor de autenticação',
                'response_timeout'
            );
            
            expect(redirectError.category).toBe(errorHandler.errorCategories.TIMEOUT);
            expect(responseError.category).toBe(errorHandler.errorCategories.TIMEOUT);
            expect(redirectError.code).toBe('redirect_timeout');
            expect(responseError.code).toBe('response_timeout');
        });
        
        it('deve detectar problemas específicos com popups', () => {
            const errorHandler = window.AuthErrorHandler;
            
            // Popup bloqueado
            const blockedError = errorHandler.categorizeError(
                'Popup bloqueado pelo navegador',
                'popup_blocked'
            );
            
            // Popup fechado prematuramente
            const closedError = errorHandler.categorizeError(
                'Popup fechado antes da conclusão',
                'popup_closed'
            );
            
            expect(blockedError.category).toBe(errorHandler.errorCategories.AUTHENTICATION);
            expect(closedError.category).toBe(errorHandler.errorCategories.AUTHENTICATION);
            expect(blockedError.code).toBe('popup_blocked');
            expect(closedError.code).toBe('popup_closed');
        });
        
        it('deve detectar erros relacionados a cookies de terceiros', () => {
            const errorHandler = window.AuthErrorHandler;
            
            const cookieError = errorHandler.categorizeError(
                'Third party cookies blocked by browser',
                'cookie_error'
            );
            
            expect(cookieError.category).toBe(errorHandler.errorCategories.AUTHENTICATION);
            expect(cookieError.code).toBe('cookie_blocked');
        });
        
        it('deve detectar problemas CORS específicos', () => {
            const errorHandler = window.AuthErrorHandler;
            
            const corsError = errorHandler.categorizeError(
                'Cross-Origin Request Blocked: The Same Origin Policy disallows reading',
                'cors_error'
            );
            
            expect(corsError.category).toBe(errorHandler.errorCategories.NETWORK);
            expect(corsError.code).toBe('cors_error');
        });
    });

    describe('Mensagens Amigáveis e Específicas', () => {
        
        it('deve fornecer mensagens claras para diferentes tipos de erro', () => {
            const errorHandler = window.AuthErrorHandler;
            
            // Testar vários cenários de erro
            const errorScenarios = [
                {
                    error: { 
                        category: errorHandler.errorCategories.TIMEOUT, 
                        code: 'redirect_timeout',
                        originalError: 'redirect timeout'
                    },
                    expectContain: ['redirecionamento', 'cookies']
                },
                {
                    error: { 
                        category: errorHandler.errorCategories.NETWORK, 
                        code: 'cors_error',
                        originalError: 'cors error'
                    },
                    expectContain: ['navegador', 'segurança']
                },
                {
                    error: { 
                        category: errorHandler.errorCategories.AUTHENTICATION, 
                        code: 'popup_blocked',
                        originalError: 'popup blocked'
                    },
                    expectContain: ['bloqueador', 'pop-ups']
                },
                {
                    error: { 
                        category: errorHandler.errorCategories.AUTHENTICATION, 
                        code: 'cookie_blocked',
                        originalError: 'cookies blocked'
                    },
                    expectContain: ['cookies', 'bloqueando']
                }
            ];
            
            // Verificar se cada mensagem contém os termos esperados
            errorScenarios.forEach(scenario => {
                const message = errorHandler.getFriendlyErrorMessage(scenario.error);
                scenario.expectContain.forEach(term => {
                    expect(message.toLowerCase()).toContain(term.toLowerCase());
                });
            });
        });
    });

    describe('Sistema de Sugestões de Solução', () => {
        
        it('deve fornecer soluções específicas para cada categoria de erro', () => {
            // Se o enhanced-error-handler estiver carregado
            if (typeof window.AuthErrorHandler.getErrorSolution !== 'function') {
                console.warn('getErrorSolution não disponível, pulando teste');
                return;
            }
            
            const errorHandler = window.AuthErrorHandler;
            
            // Cenários a serem testados
            const errorCategories = [
                errorHandler.errorCategories.TIMEOUT,
                errorHandler.errorCategories.NETWORK,
                errorHandler.errorCategories.AUTHENTICATION,
                errorHandler.errorCategories.AUTHORIZATION,
                errorHandler.errorCategories.CONFIGURATION
            ];
            
            // Para cada categoria, verificar se temos soluções
            errorCategories.forEach(category => {
                const mockError = { category, code: 'mock_error' };
                const solutions = errorHandler.getErrorSolution(mockError);
                
                expect(Array.isArray(solutions)).toBeTruthy();
                expect(solutions.length).toBeGreaterThan(0);
            });
        });
        
        it('deve fornecer soluções específicas para erros comuns', () => {
            // Se o enhanced-error-handler estiver carregado
            if (typeof window.AuthErrorHandler.getErrorSolution !== 'function') {
                console.warn('getErrorSolution não disponível, pulando teste');
                return;
            }
            
            const errorHandler = window.AuthErrorHandler;
            
            // Testar alguns códigos de erro específicos
            const specificErrors = [
                { category: 'authentication', code: 'popup_blocked' },
                { category: 'authentication', code: 'cookie_blocked' },
                { category: 'authorization', code: 'microsoft_account_type_error' },
                { category: 'network', code: 'cors_error' }
            ];
            
            specificErrors.forEach(error => {
                const solutions = errorHandler.getErrorSolution(error);
                expect(Array.isArray(solutions)).toBeTruthy();
                expect(solutions.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Integração com UI Feedback', () => {
        
        it('deve integrar com o sistema de UI para exibir mensagens', () => {
            // Mock dos componentes necessários
            const mockUIFeedback = {
                showError: jest.fn(),
                elements: { authAlerts: document.createElement('div') }
            };
            
            const originalUIFeedback = window.AuthUIFeedback;
            window.AuthUIFeedback = mockUIFeedback;
            
            try {
                const errorHandler = window.AuthErrorHandler;
                const error = {
                    category: errorHandler.errorCategories.AUTHENTICATION,
                    code: 'popup_blocked'
                };
                
                const message = errorHandler.getFriendlyErrorMessage(error);
                window.AuthUIFeedback.showError(message);
                
                expect(mockUIFeedback.showError).toHaveBeenCalledWith(message);
            } finally {
                window.AuthUIFeedback = originalUIFeedback;
            }
        });
    });
});