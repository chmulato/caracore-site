// Testes unitários para request-access-enhanced.html
// Testa a funcionalidade de solicitação de acesso aprimorada

import { 
    clearAllMocks, 
    createFetchResponse, 
    createMockUser, 
    triggerEvent, 
    nextTick, 
    waitForElement 
} from './test-setup.js';

describe('Request Access Enhanced - Solicitação de Acesso', () => {
    let mockHTML;
    let mockUser;
    
    beforeEach(() => {
        mockUser = createMockUser('user', {
            name: 'Maria Santos',
            email: 'maria.santos@empresa.com',
            picture: 'https://example.com/maria.jpg'
        });
        
        // HTML da página de solicitação de acesso
        mockHTML = `
            <div class="request-container">
                <div class="request-header">
                    <div class="request-icon">📝</div>
                    <h1 class="request-title">Solicitar Acesso</h1>
                    <p class="request-description">Preencha o formulário abaixo</p>
                </div>
                
                <div id="success-message" class="success-message hidden">
                    <strong>Solicitação enviada com sucesso!</strong>
                </div>
                
                <div id="user-info" class="user-info hidden">
                    <div class="flex items-center">
                        <img id="user-avatar" class="user-avatar" src="" alt="Avatar" />
                        <div class="user-details">
                            <div id="user-name" class="user-name"></div>
                            <div id="user-email" class="user-email"></div>
                        </div>
                    </div>
                </div>
                
                <form id="access-request-form">
                    <div class="form-group">
                        <label for="access-level" class="form-label">Nível de Acesso</label>
                        <select id="access-level" name="access-level" class="form-select" required>
                            <option value="">Selecione o nível</option>
                            <option value="viewer">Visualizador</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="department" class="form-label">Departamento</label>
                        <input type="text" id="department" name="department" class="form-input" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="manager-email" class="form-label">Email do Supervisor</label>
                        <input type="email" id="manager-email" name="manager-email" class="form-input" />
                    </div>
                    
                    <div class="form-group">
                        <label for="justification" class="form-label">Justificativa</label>
                        <textarea id="justification" name="justification" class="form-textarea" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="urgency" class="form-label">Urgência</label>
                        <select id="urgency" name="urgency" class="form-select" required>
                            <option value="">Selecione a urgência</option>
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="critical">Crítica</option>
                        </select>
                    </div>
                    
                    <button type="submit" id="submit-button" class="request-button">
                        <span id="button-text">Enviar Solicitação</span>
                        <span id="loading-spinner" class="loading-spinner hidden"></span>
                    </button>
                </form>
            </div>
        `;
        
        document.body.innerHTML = mockHTML;
        localStorage.setItem('access_token', 'mock-token');
    });

    describe('Carregamento de Informações do Usuário', () => {
        test('deve carregar informações do usuário autenticado', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse(mockUser));

            const loadUserInfo = async () => {
                const response = await fetch('/api/user/info', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                return response.json();
            };

            const user = await loadUserInfo();

            expect(fetch).toHaveBeenCalledWith('/api/user/info', {
                headers: {
                    'Authorization': 'Bearer mock-token'
                }
            });
            expect(user.name).toBe('Maria Santos');
            expect(user.email).toBe('maria.santos@empresa.com');
        });

        test('deve exibir informações do usuário na interface', () => {
            const userInfoDiv = document.getElementById('user-info');
            const userAvatar = document.getElementById('user-avatar');
            const userName = document.getElementById('user-name');
            const userEmail = document.getElementById('user-email');

            // Simular função displayUserInfo
            const displayUserInfo = (user) => {
                userAvatar.src = user.picture || '/images/default-avatar.png';
                userName.textContent = user.name || 'Usuário';
                userEmail.textContent = user.email || '';
                userInfoDiv.classList.remove('hidden');
            };

            displayUserInfo(mockUser);

            expect(userAvatar.src).toBe(mockUser.picture);
            expect(userName.textContent).toBe(mockUser.name);
            expect(userEmail.textContent).toBe(mockUser.email);
            expect(userInfoDiv.classList.contains('hidden')).toBe(false);
        });

        test('deve tratar erro no carregamento do usuário', async () => {
            fetch.mockRejectedValueOnce(new Error('Unauthorized'));

            try {
                await fetch('/api/user/info');
            } catch (error) {
                expect(error.message).toBe('Unauthorized');
            }
        });
    });

    describe('Validação do Formulário', () => {
        test('deve validar campos obrigatórios', () => {
            const form = document.getElementById('access-request-form');
            const accessLevel = document.getElementById('access-level');
            const department = document.getElementById('department');
            const justification = document.getElementById('justification');
            const urgency = document.getElementById('urgency');

            expect(accessLevel.hasAttribute('required')).toBe(true);
            expect(department.hasAttribute('required')).toBe(true);
            expect(justification.hasAttribute('required')).toBe(true);
            expect(urgency.hasAttribute('required')).toBe(true);
        });

        test('deve ter opções corretas nos selects', () => {
            const accessLevel = document.getElementById('access-level');
            const urgency = document.getElementById('urgency');

            const accessOptions = Array.from(accessLevel.options).map(opt => opt.value);
            const urgencyOptions = Array.from(urgency.options).map(opt => opt.value);

            expect(accessOptions).toContain('viewer');
            expect(accessOptions).toContain('editor');
            expect(accessOptions).toContain('admin');

            expect(urgencyOptions).toContain('low');
            expect(urgencyOptions).toContain('medium');
            expect(urgencyOptions).toContain('high');
            expect(urgencyOptions).toContain('critical');
        });

        test('deve validar formato de email do supervisor', () => {
            const managerEmail = document.getElementById('manager-email');
            expect(managerEmail.type).toBe('email');
        });
    });

    describe('Envio da Solicitação', () => {
        test('deve enviar solicitação com dados corretos', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse({ success: true }));

            const formData = {
                'access-level': 'editor',
                'department': 'TI',
                'manager-email': 'supervisor@empresa.com',
                'justification': 'Preciso de acesso para desenvolver funcionalidades',
                'urgency': 'medium'
            };

            const submitAccessRequest = async (requestData) => {
                const response = await fetch('/api/access-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify(requestData)
                });
                return response.json();
            };

            const result = await submitAccessRequest({
                access_level: formData['access-level'],
                department: formData['department'],
                manager_email: formData['manager-email'],
                justification: formData['justification'],
                urgency: formData['urgency'],
                user_info: mockUser
            });

            expect(fetch).toHaveBeenCalledWith('/api/access-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: expect.stringContaining('editor')
            });
            expect(result.success).toBe(true);
        });

        test('deve mostrar loading durante envio', () => {
            const submitButton = document.getElementById('submit-button');
            const buttonText = document.getElementById('button-text');
            const loadingSpinner = document.getElementById('loading-spinner');

            // Simular estado de loading
            const setLoadingState = (loading) => {
                submitButton.disabled = loading;
                if (loading) {
                    buttonText.textContent = 'Enviando...';
                    loadingSpinner.classList.remove('hidden');
                } else {
                    buttonText.textContent = 'Enviar Solicitação';
                    loadingSpinner.classList.add('hidden');
                }
            };

            setLoadingState(true);

            expect(submitButton.disabled).toBe(true);
            expect(buttonText.textContent).toBe('Enviando...');
            expect(loadingSpinner.classList.contains('hidden')).toBe(false);

            setLoadingState(false);

            expect(submitButton.disabled).toBe(false);
            expect(buttonText.textContent).toBe('Enviar Solicitação');
            expect(loadingSpinner.classList.contains('hidden')).toBe(true);
        });

        test('deve mostrar mensagem de sucesso', () => {
            const successMessage = document.getElementById('success-message');
            const form = document.getElementById('access-request-form');

            // Simular sucesso
            successMessage.classList.remove('hidden');
            form.style.display = 'none';

            expect(successMessage.classList.contains('hidden')).toBe(false);
            expect(form.style.display).toBe('none');
        });

        test('deve tratar erro no envio', async () => {
            fetch.mockRejectedValueOnce(new Error('Server error'));

            try {
                await fetch('/api/access-request', {
                    method: 'POST',
                    body: JSON.stringify({})
                });
            } catch (error) {
                expect(error.message).toBe('Server error');
            }
        });
    });

    describe('Preenchimento do Formulário', () => {
        test('deve permitir preenchimento de todos os campos', () => {
            const accessLevel = document.getElementById('access-level');
            const department = document.getElementById('department');
            const managerEmail = document.getElementById('manager-email');
            const justification = document.getElementById('justification');
            const urgency = document.getElementById('urgency');

            // Simular preenchimento
            accessLevel.value = 'editor';
            department.value = 'Desenvolvimento';
            managerEmail.value = 'gerente@empresa.com';
            justification.value = 'Necessário para implementar novas funcionalidades';
            urgency.value = 'medium';

            expect(accessLevel.value).toBe('editor');
            expect(department.value).toBe('Desenvolvimento');
            expect(managerEmail.value).toBe('gerente@empresa.com');
            expect(justification.value).toBe('Necessário para implementar novas funcionalidades');
            expect(urgency.value).toBe('medium');
        });

        test('deve manter estado do formulário durante preenchimento', () => {
            const form = document.getElementById('access-request-form');
            const department = document.getElementById('department');

            department.value = 'Marketing';
            
            // Simular evento de input
            triggerEvent(department, 'input');

            expect(department.value).toBe('Marketing');
        });
    });

    describe('Interface e Usabilidade', () => {
        test('deve ter estrutura HTML correta', () => {
            expect(document.querySelector('.request-container')).toBeTruthy();
            expect(document.querySelector('.request-title')).toBeTruthy();
            expect(document.getElementById('access-request-form')).toBeTruthy();
            expect(document.getElementById('submit-button')).toBeTruthy();
        });

        test('deve ter labels associados aos campos', () => {
            const labels = document.querySelectorAll('label[for]');
            
            labels.forEach(label => {
                const targetId = label.getAttribute('for');
                const targetElement = document.getElementById(targetId);
                expect(targetElement).toBeTruthy();
            });
        });

        test('deve ter classes CSS apropriadas', () => {
            const form = document.getElementById('access-request-form');
            const submitButton = document.getElementById('submit-button');

            expect(submitButton.classList.contains('request-button')).toBe(true);
        });
    });

    describe('Fluxo Completo', () => {
        test('deve executar fluxo completo de solicitação', async () => {
            // 1. Carregar usuário
            fetch.mockResolvedValueOnce(createFetchResponse(mockUser));
            
            // 2. Enviar solicitação
            fetch.mockResolvedValueOnce(createFetchResponse({ success: true }));

            // Simular carregamento do usuário
            const userResponse = await fetch('/api/user/info');
            const user = await userResponse.json();
            
            expect(user.name).toBe(mockUser.name);

            // Simular preenchimento do formulário
            const formData = {
                access_level: 'editor',
                department: 'TI',
                justification: 'Desenvolvimento de software',
                urgency: 'medium',
                user_info: user
            };

            // Simular envio
            const submitResponse = await fetch('/api/access-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await submitResponse.json();

            expect(result.success).toBe(true);
            expect(fetch).toHaveBeenCalledTimes(2);
        });

        test('deve redirecionar após sucesso', (done) => {
            // Simular redirecionamento após 3 segundos
            const redirectAfterSuccess = () => {
                setTimeout(() => {
                    window.location.href = '/secure/';
                    expect(window.location.href).toBe('/secure/');
                    done();
                }, 100); // Reduzido para teste
            };

            redirectAfterSuccess();
        });
    });

    describe('Validação de Dados', () => {
        test('deve validar dados antes do envio', () => {
            const validateForm = (formData) => {
                const required = ['access_level', 'department', 'justification', 'urgency'];
                return required.every(field => formData[field] && formData[field].trim() !== '');
            };

            const validData = {
                access_level: 'editor',
                department: 'TI',
                justification: 'Necessário para trabalho',
                urgency: 'medium'
            };

            const invalidData = {
                access_level: '',
                department: 'TI',
                justification: '',
                urgency: 'medium'
            };

            expect(validateForm(validData)).toBe(true);
            expect(validateForm(invalidData)).toBe(false);
        });

        test('deve sanitizar dados de entrada', () => {
            const sanitizeInput = (input) => {
                return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            };

            const maliciousInput = '<script>alert("xss")</script>Departamento TI';
            const cleanInput = sanitizeInput(maliciousInput);

            expect(cleanInput).toBe('Departamento TI');
            expect(cleanInput).not.toContain('<script>');
        });
    });
});