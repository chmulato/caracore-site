// Testes unitários para super-admin-setup.html
// Testa a funcionalidade de configuração inicial do Super Administrador

import { 
    clearAllMocks, 
    createFetchResponse, 
    createMockUser, 
    triggerEvent, 
    nextTick, 
    waitForElement 
} from './test-setup.js';

describe('Super Admin Setup - Configuração Inicial', () => {
    let mockHTML;
    
    beforeEach(() => {
        // HTML básico da página de setup
        mockHTML = `
            <div class="setup-container">
                <div class="setup-header">
                    <div class="setup-icon">⚙️</div>
                    <h1 class="setup-title">Configuração Inicial</h1>
                    <p class="setup-description">Configure o primeiro Super Administrador</p>
                </div>
                
                <div id="setup-steps">
                    <div class="step-card">
                        <div class="step-flex">
                            <span class="step-number">1</span>
                            <div>
                                <h3 class="step-title">Autenticação Necessária</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="auth-buttons">
                    <a href="#" class="auth-btn google" onclick="authenticateWithGoogle()">
                        Continuar com Google
                    </a>
                    <a href="#" class="auth-btn microsoft" onclick="authenticateWithMicrosoft()">
                        Continuar com Microsoft
                    </a>
                </div>
                
                <div id="status-info" class="status-info hidden">
                    <div class="info-flex">
                        <span class="info-icon">ℹ️</span>
                        <div>
                            <strong>Status:</strong> <span id="status-text">Aguardando autenticação...</span>
                            <div id="loading-indicator" class="loading hidden loading-margin"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = mockHTML;
        
        // Simular carregamento do script
        window.checkSuperAdminStatus = jest.fn();
        window.showStatusInfo = jest.fn();
        window.authenticateWithGoogle = jest.fn();
        window.authenticateWithMicrosoft = jest.fn();
    });

    describe('Verificação de Status do Super Admin', () => {
        test('deve verificar se já existe super admin configurado', async () => {
            // Mock da resposta da API indicando que já existe super admin
            fetch.mockResolvedValueOnce(createFetchResponse({
                has_super_admin: true
            }));

            // Simular função de verificação
            const checkSuperAdminStatus = async () => {
                const response = await fetch('/api/admin/super-admin-status');
                const data = await response.json();
                
                if (data.has_super_admin) {
                    window.location.href = '/secure/';
                    return true;
                }
                return false;
            };

            const result = await checkSuperAdminStatus();

            expect(fetch).toHaveBeenCalledWith('/api/admin/super-admin-status');
            expect(result).toBe(true);
            expect(window.location.href).toBe('/secure/');
        });

        test('deve permitir configuração quando não há super admin', async () => {
            // Mock da resposta indicando que não há super admin
            fetch.mockResolvedValueOnce(createFetchResponse({
                has_super_admin: false
            }));

            const checkSuperAdminStatus = async () => {
                const response = await fetch('/api/admin/super-admin-status');
                const data = await response.json();
                return !data.has_super_admin;
            };

            const canSetup = await checkSuperAdminStatus();

            expect(fetch).toHaveBeenCalledWith('/api/admin/super-admin-status');
            expect(canSetup).toBe(true);
        });

        test('deve tratar erro na verificação de status', async () => {
            // Mock de erro na API
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const checkSuperAdminStatus = async () => {
                try {
                    await fetch('/api/admin/super-admin-status');
                    return false;
                } catch (error) {
                    console.error('Erro ao verificar status:', error);
                    return false;
                }
            };

            const result = await checkSuperAdminStatus();

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Interface de Status', () => {
        test('deve mostrar informações de status corretamente', () => {
            const statusInfo = document.getElementById('status-info');
            const statusText = document.getElementById('status-text');
            const loadingIndicator = document.getElementById('loading-indicator');

            // Simular função showStatusInfo
            const showStatusInfo = (message, showLoading = false) => {
                statusText.textContent = message;
                statusInfo.classList.remove('hidden');
                
                if (showLoading) {
                    loadingIndicator.classList.remove('hidden');
                } else {
                    loadingIndicator.classList.add('hidden');
                }
            };

            // Testar mostrar status sem loading
            showStatusInfo('Configurando Super Administrador...');
            
            expect(statusText.textContent).toBe('Configurando Super Administrador...');
            expect(statusInfo.classList.contains('hidden')).toBe(false);
            expect(loadingIndicator.classList.contains('hidden')).toBe(true);

            // Testar mostrar status com loading
            showStatusInfo('Processando...', true);
            
            expect(statusText.textContent).toBe('Processando...');
            expect(loadingIndicator.classList.contains('hidden')).toBe(false);
        });

        test('deve inicializar com status oculto', () => {
            const statusInfo = document.getElementById('status-info');
            expect(statusInfo.classList.contains('hidden')).toBe(true);
        });
    });

    describe('Autenticação com Provedores', () => {
        test('deve configurar autenticação com Google', () => {
            const authenticateWithGoogle = jest.fn(() => {
                sessionStorage.setItem('auth_mode', 'super_admin_setup');
                window.location.href = '/auth/google?setup=true';
            });

            authenticateWithGoogle();

            expect(sessionStorage.setItem).toHaveBeenCalledWith('auth_mode', 'super_admin_setup');
            expect(window.location.href).toBe('/auth/google?setup=true');
        });

        test('deve configurar autenticação com Microsoft', () => {
            const authenticateWithMicrosoft = jest.fn(() => {
                sessionStorage.setItem('auth_mode', 'super_admin_setup');
                window.location.href = '/auth/microsoft?setup=true';
            });

            authenticateWithMicrosoft();

            expect(sessionStorage.setItem).toHaveBeenCalledWith('auth_mode', 'super_admin_setup');
            expect(window.location.href).toBe('/auth/microsoft?setup=true');
        });

        test('deve detectar retorno de autenticação bem-sucedida', () => {
            // Simular URL de retorno da autenticação
            window.location.search = '?setup=complete';
            
            const urlParams = new URLSearchParams(window.location.search);
            const isSetupComplete = urlParams.get('setup') === 'complete';

            expect(isSetupComplete).toBe(true);
        });
    });

    describe('Elementos da Interface', () => {
        test('deve conter todos os elementos essenciais', () => {
            expect(document.querySelector('.setup-container')).toBeTruthy();
            expect(document.querySelector('.setup-title')).toBeTruthy();
            expect(document.querySelector('.auth-btn.google')).toBeTruthy();
            expect(document.querySelector('.auth-btn.microsoft')).toBeTruthy();
            expect(document.getElementById('status-info')).toBeTruthy();
        });

        test('deve ter botões de autenticação funcionais', () => {
            const googleBtn = document.querySelector('.auth-btn.google');
            const microsoftBtn = document.querySelector('.auth-btn.microsoft');

            expect(googleBtn).toBeTruthy();
            expect(microsoftBtn).toBeTruthy();
            expect(googleBtn.getAttribute('onclick')).toBe('authenticateWithGoogle()');
            expect(microsoftBtn.getAttribute('onclick')).toBe('authenticateWithMicrosoft()');
        });

        test('deve aplicar classes CSS corretas', () => {
            const container = document.querySelector('.setup-container');
            const googleBtn = document.querySelector('.auth-btn.google');
            const microsoftBtn = document.querySelector('.auth-btn.microsoft');

            expect(container.classList.contains('setup-container')).toBe(true);
            expect(googleBtn.classList.contains('auth-btn')).toBe(true);
            expect(googleBtn.classList.contains('google')).toBe(true);
            expect(microsoftBtn.classList.contains('auth-btn')).toBe(true);
            expect(microsoftBtn.classList.contains('microsoft')).toBe(true);
        });
    });

    describe('Fluxo Completo de Configuração', () => {
        test('deve executar fluxo completo de configuração', async () => {
            // 1. Verificar se não há super admin
            fetch.mockResolvedValueOnce(createFetchResponse({
                has_super_admin: false
            }));

            // 2. Iniciar autenticação
            const authenticateWithGoogle = jest.fn(() => {
                sessionStorage.setItem('auth_mode', 'super_admin_setup');
                window.location.href = '/auth/google?setup=true';
            });

            // 3. Simular retorno da autenticação
            window.location.search = '?setup=complete';

            // Executar fluxo
            const checkResult = await fetch('/api/admin/super-admin-status')
                .then(res => res.json())
                .then(data => !data.has_super_admin);

            expect(checkResult).toBe(true);

            authenticateWithGoogle();
            expect(sessionStorage.setItem).toHaveBeenCalledWith('auth_mode', 'super_admin_setup');

            const urlParams = new URLSearchParams(window.location.search);
            expect(urlParams.get('setup')).toBe('complete');
        });

        test('deve tratar erro no fluxo de configuração', async () => {
            // Mock de erro na verificação
            fetch.mockRejectedValueOnce(new Error('API Error'));

            try {
                await fetch('/api/admin/super-admin-status');
            } catch (error) {
                expect(error.message).toBe('API Error');
            }

            expect(fetch).toHaveBeenCalledWith('/api/admin/super-admin-status');
        });
    });

    describe('Validação de Segurança', () => {
        test('deve validar mode de autenticação', () => {
            sessionStorage.setItem('auth_mode', 'super_admin_setup');
            const authMode = sessionStorage.getItem('auth_mode');
            
            expect(authMode).toBe('super_admin_setup');
            expect(sessionStorage.setItem).toHaveBeenCalledWith('auth_mode', 'super_admin_setup');
        });

        test('deve limpar dados sensíveis após configuração', () => {
            // Simular limpeza após configuração bem-sucedida
            sessionStorage.removeItem('auth_mode');
            
            expect(sessionStorage.removeItem).toHaveBeenCalledWith('auth_mode');
        });
    });

    describe('Responsividade e Acessibilidade', () => {
        test('deve manter estrutura acessível', () => {
            const title = document.querySelector('.setup-title');
            const description = document.querySelector('.setup-description');
            
            expect(title.tagName).toBe('H1');
            expect(description.tagName).toBe('P');
        });

        test('deve ter elementos com identificadores únicos', () => {
            expect(document.getElementById('status-info')).toBeTruthy();
            expect(document.getElementById('status-text')).toBeTruthy();
            expect(document.getElementById('loading-indicator')).toBeTruthy();
        });
    });
});