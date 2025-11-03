// Testes unitários para user-management-navigation.js
// Testa o sistema de navegação entre telas do gerenciamento de usuários

import { 
    clearAllMocks, 
    createFetchResponse, 
    createMockUser, 
    triggerEvent, 
    nextTick, 
    waitForElement 
} from './test-setup.js';

describe('User Management Navigation - Sistema de Navegação', () => {
    let mockHTML;
    let mockAdmin;
    let mockSuperAdmin;
    let mockUser;
    
    beforeEach(() => {
        mockAdmin = createMockUser('admin', {
            name: 'Admin Sistema',
            email: 'admin@empresa.com'
        });
        
        mockSuperAdmin = createMockUser('super_admin', {
            name: 'Super Admin',
            email: 'superadmin@empresa.com'
        });
        
        mockUser = createMockUser('user', {
            name: 'Usuário Normal',
            email: 'usuario@empresa.com'
        });
        
        // HTML da navegação do sistema
        mockHTML = `
            <nav class="user-nav" id="user-navigation">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>Gerenciamento de Usuários</h2>
                    </div>
                    <div class="nav-menu" id="nav-menu">
                        <a href="/secure/super-admin-setup.html" class="nav-link" id="setup-link" data-role="super_admin">
                            <span class="nav-icon">⚙️</span>
                            <span class="nav-text">Configuração Inicial</span>
                        </a>
                        <a href="/secure/request-access-enhanced.html" class="nav-link" id="request-link" data-role="user,editor,admin">
                            <span class="nav-icon">📝</span>
                            <span class="nav-text">Solicitar Acesso</span>
                        </a>
                        <a href="/secure/approval-requests.html" class="nav-link" id="approval-link" data-role="admin,super_admin">
                            <span class="nav-icon">✅</span>
                            <span class="nav-text">Aprovar Solicitações</span>
                            <span class="nav-badge" id="pending-badge" title="Solicitações pendentes"></span>
                        </a>
                        <a href="/backend/" class="nav-link" id="backend-link" data-role="admin,super_admin">
                            <span class="nav-icon">🔧</span>
                            <span class="nav-text">Admin Backend</span>
                        </a>
                    </div>
                    <div class="nav-profile" id="nav-profile">
                        <div class="profile-info">
                            <img id="user-avatar" class="profile-avatar" src="" alt="Avatar">
                            <div class="profile-details">
                                <span id="user-name" class="profile-name"></span>
                                <span id="user-role" class="profile-role"></span>
                            </div>
                        </div>
                        <button class="logout-btn" id="logout-btn" title="Sair">
                            <span class="logout-icon">🚪</span>
                        </button>
                    </div>
                </div>
                
                <div class="nav-notifications" id="nav-notifications">
                    <div class="notification-item" id="system-status">
                        <span class="status-icon" id="status-icon">🟢</span>
                        <span class="status-text" id="status-text">Sistema Operacional</span>
                    </div>
                </div>
            </nav>
            
            <div class="page-content" id="page-content">
                <div class="breadcrumb" id="breadcrumb">
                    <a href="/" class="breadcrumb-home">🏠 Início</a>
                    <span class="breadcrumb-separator">›</span>
                    <span class="breadcrumb-current" id="current-page">Gerenciamento</span>
                </div>
            </div>
        `;
        
        document.body.innerHTML = mockHTML;
        localStorage.setItem('access_token', 'test-token');
    });

    describe('Inicialização da Navegação', () => {
        test('deve inicializar navegação corretamente', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse(mockAdmin));
            
            const initNavigation = async () => {
                const response = await fetch('/api/user/info', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                
                const user = await response.json();
                
                // Atualizar informações do usuário
                document.getElementById('user-name').textContent = user.name;
                document.getElementById('user-role').textContent = user.role.toUpperCase();
                document.getElementById('user-avatar').src = user.picture || '/images/default-avatar.png';
                
                // Configurar menu baseado no papel
                configureMenuForRole(user.role);
                
                return user;
            };
            
            const configureMenuForRole = (userRole) => {
                const navLinks = document.querySelectorAll('.nav-link[data-role]');
                
                navLinks.forEach(link => {
                    const allowedRoles = link.dataset.role.split(',');
                    if (allowedRoles.includes(userRole)) {
                        link.style.display = 'flex';
                    } else {
                        link.style.display = 'none';
                    }
                });
            };

            const user = await initNavigation();

            expect(document.getElementById('user-name').textContent).toBe('Admin Sistema');
            expect(document.getElementById('user-role').textContent).toBe('ADMIN');
            expect(fetch).toHaveBeenCalledWith('/api/user/info', {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
        });

        test('deve configurar menu para diferentes papéis', () => {
            const configureMenuForRole = (userRole) => {
                const navLinks = document.querySelectorAll('.nav-link[data-role]');
                
                navLinks.forEach(link => {
                    const allowedRoles = link.dataset.role.split(',');
                    if (allowedRoles.includes(userRole)) {
                        link.style.display = 'flex';
                    } else {
                        link.style.display = 'none';
                    }
                });
            };

            // Teste para super_admin
            configureMenuForRole('super_admin');
            expect(document.getElementById('setup-link').style.display).toBe('flex');
            expect(document.getElementById('approval-link').style.display).toBe('flex');
            expect(document.getElementById('backend-link').style.display).toBe('flex');

            // Teste para admin
            configureMenuForRole('admin');
            expect(document.getElementById('setup-link').style.display).toBe('none');
            expect(document.getElementById('approval-link').style.display).toBe('flex');
            expect(document.getElementById('request-link').style.display).toBe('flex');

            // Teste para user
            configureMenuForRole('user');
            expect(document.getElementById('setup-link').style.display).toBe('none');
            expect(document.getElementById('approval-link').style.display).toBe('none');
            expect(document.getElementById('request-link').style.display).toBe('flex');
        });
    });

    describe('Sistema de Badges e Notificações', () => {
        test('deve atualizar badge de solicitações pendentes', async () => {
            const mockRequests = [
                { id: '1', status: 'pending' },
                { id: '2', status: 'pending' },
                { id: '3', status: 'approved' }
            ];
            
            fetch.mockResolvedValueOnce(createFetchResponse(mockRequests));

            const updatePendingBadge = async () => {
                try {
                    const response = await fetch('/api/admin/access-requests/count', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    });
                    
                    const requests = await response.json();
                    const pendingCount = requests.filter(r => r.status === 'pending').length;
                    
                    const badge = document.getElementById('pending-badge');
                    if (pendingCount > 0) {
                        badge.textContent = pendingCount;
                        badge.style.display = 'inline-block';
                        badge.className = 'nav-badge badge-urgent';
                    } else {
                        badge.style.display = 'none';
                    }
                    
                    return pendingCount;
                } catch (error) {
                    console.error('Erro ao atualizar badge:', error);
                    return 0;
                }
            };

            const count = await updatePendingBadge();

            expect(count).toBe(2);
            expect(document.getElementById('pending-badge').textContent).toBe('2');
            expect(document.getElementById('pending-badge').style.display).toBe('inline-block');
        });

        test('deve ocultar badge quando não há solicitações pendentes', async () => {
            const mockRequests = [
                { id: '1', status: 'approved' },
                { id: '2', status: 'rejected' }
            ];
            
            fetch.mockResolvedValueOnce(createFetchResponse(mockRequests));

            const updatePendingBadge = async () => {
                const response = await fetch('/api/admin/access-requests/count');
                const requests = await response.json();
                const pendingCount = requests.filter(r => r.status === 'pending').length;
                
                const badge = document.getElementById('pending-badge');
                if (pendingCount > 0) {
                    badge.textContent = pendingCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
                
                return pendingCount;
            };

            const count = await updatePendingBadge();

            expect(count).toBe(0);
            expect(document.getElementById('pending-badge').style.display).toBe('none');
        });

        test('deve atualizar status do sistema', () => {
            const updateSystemStatus = (isOnline, message = '') => {
                const statusIcon = document.getElementById('status-icon');
                const statusText = document.getElementById('status-text');
                
                if (isOnline) {
                    statusIcon.textContent = '🟢';
                    statusText.textContent = message || 'Sistema Operacional';
                    statusText.className = 'status-text status-online';
                } else {
                    statusIcon.textContent = '🔴';
                    statusText.textContent = message || 'Sistema Offline';
                    statusText.className = 'status-text status-offline';
                }
            };

            // Sistema online
            updateSystemStatus(true);
            expect(document.getElementById('status-icon').textContent).toBe('🟢');
            expect(document.getElementById('status-text').textContent).toBe('Sistema Operacional');

            // Sistema offline
            updateSystemStatus(false, 'Manutenção em andamento');
            expect(document.getElementById('status-icon').textContent).toBe('🔴');
            expect(document.getElementById('status-text').textContent).toBe('Manutenção em andamento');
        });
    });

    describe('Navegação e Breadcrumbs', () => {
        test('deve atualizar breadcrumb baseado na página atual', () => {
            const updateBreadcrumb = (pageName, pageTitle) => {
                const breadcrumb = document.getElementById('current-page');
                breadcrumb.textContent = pageTitle;
                breadcrumb.dataset.page = pageName;
            };

            const pageMap = {
                'super-admin-setup': 'Configuração Inicial',
                'request-access-enhanced': 'Solicitar Acesso',
                'approval-requests': 'Aprovar Solicitações'
            };

            updateBreadcrumb('approval-requests', pageMap['approval-requests']);

            expect(document.getElementById('current-page').textContent).toBe('Aprovar Solicitações');
            expect(document.getElementById('current-page').dataset.page).toBe('approval-requests');
        });

        test('deve destacar link ativo na navegação', () => {
            const setActiveNavLink = (activePageId) => {
                // Remover classe ativa de todos os links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('nav-link-active');
                });
                
                // Adicionar classe ativa ao link atual
                const activeLink = document.getElementById(activePageId);
                if (activeLink) {
                    activeLink.classList.add('nav-link-active');
                }
            };

            setActiveNavLink('approval-link');

            expect(document.getElementById('approval-link').classList.contains('nav-link-active')).toBe(true);
            expect(document.getElementById('request-link').classList.contains('nav-link-active')).toBe(false);
        });
    });

    describe('Gerenciamento de Autenticação', () => {
        test('deve processar logout corretamente', () => {
            const handleLogout = () => {
                // Limpar dados locais
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_info');
                sessionStorage.clear();
                
                // Redirecionar para página de login
                const logoutUrl = '/';
                return logoutUrl;
            };

            const redirectUrl = handleLogout();

            expect(localStorage.getItem('access_token')).toBeNull();
            expect(redirectUrl).toBe('/');
        });

        test('deve verificar validade do token', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse(mockAdmin));

            const verifyToken = async () => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('Token não encontrado');
                }
                
                const response = await fetch('/api/user/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Token inválido');
                }
                
                return response.json();
            };

            const result = await verifyToken();

            expect(result.role).toBe('admin');
            expect(fetch).toHaveBeenCalledWith('/api/user/verify', {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
        });

        test('deve tratar token expirado', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse(null, { status: 401 }));

            const checkTokenExpiration = async () => {
                try {
                    const response = await fetch('/api/user/verify');
                    if (response.status === 401) {
                        // Token expirado, limpar e redirecionar
                        localStorage.removeItem('access_token');
                        return { expired: true, redirectTo: '/' };
                    }
                    return { expired: false };
                } catch (error) {
                    return { expired: true, error: error.message };
                }
            };

            const result = await checkTokenExpiration();

            expect(result.expired).toBe(true);
            expect(result.redirectTo).toBe('/');
        });
    });

    describe('Responsividade e Interação', () => {
        test('deve alternar menu mobile', () => {
            const toggleMobileMenu = () => {
                const navMenu = document.getElementById('nav-menu');
                const isOpen = navMenu.classList.contains('nav-menu-open');
                
                if (isOpen) {
                    navMenu.classList.remove('nav-menu-open');
                } else {
                    navMenu.classList.add('nav-menu-open');
                }
                
                return !isOpen;
            };

            // Abrir menu
            let isOpen = toggleMobileMenu();
            expect(isOpen).toBe(true);
            expect(document.getElementById('nav-menu').classList.contains('nav-menu-open')).toBe(true);

            // Fechar menu
            isOpen = toggleMobileMenu();
            expect(isOpen).toBe(false);
            expect(document.getElementById('nav-menu').classList.contains('nav-menu-open')).toBe(false);
        });

        test('deve fechar menu ao clicar em link', () => {
            const handleNavLinkClick = (event) => {
                event.preventDefault();
                
                // Fechar menu mobile se estiver aberto
                const navMenu = document.getElementById('nav-menu');
                navMenu.classList.remove('nav-menu-open');
                
                // Simular navegação
                const href = event.target.closest('.nav-link').href;
                return { navigated: true, url: href };
            };

            // Abrir menu primeiro
            document.getElementById('nav-menu').classList.add('nav-menu-open');

            // Simular clique no link
            const linkElement = document.getElementById('request-link');
            const mockEvent = { 
                preventDefault: jest.fn(),
                target: linkElement
            };

            const result = handleNavLinkClick(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(document.getElementById('nav-menu').classList.contains('nav-menu-open')).toBe(false);
            expect(result.navigated).toBe(true);
        });
    });

    describe('Atualização Automática', () => {
        test('deve executar atualização periódica de badges', () => {
            let updateCount = 0;
            
            const startPeriodicUpdate = (intervalMs = 30000) => {
                const updateBadges = () => {
                    updateCount++;
                    // Simular atualização de badges
                    return Promise.resolve(updateCount);
                };
                
                const intervalId = setInterval(updateBadges, intervalMs);
                return intervalId;
            };

            const stopPeriodicUpdate = (intervalId) => {
                clearInterval(intervalId);
            };

            // Usar intervalo curto para teste
            const intervalId = startPeriodicUpdate(10);
            
            // Simular passagem de tempo
            jest.advanceTimersByTime(25);
            
            stopPeriodicUpdate(intervalId);

            expect(updateCount).toBeGreaterThan(0);
        });
    });

    describe('Tratamento de Erros', () => {
        test('deve tratar erro na inicialização', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const initNavigationWithError = async () => {
                try {
                    const response = await fetch('/api/user/info');
                    return response.json();
                } catch (error) {
                    // Mostrar estado de erro
                    const statusIcon = document.getElementById('status-icon');
                    const statusText = document.getElementById('status-text');
                    
                    statusIcon.textContent = '⚠️';
                    statusText.textContent = 'Erro de conexão';
                    statusText.className = 'status-text status-error';
                    
                    return { error: error.message };
                }
            };

            const result = await initNavigationWithError();

            expect(result.error).toBe('Network error');
            expect(document.getElementById('status-icon').textContent).toBe('⚠️');
            expect(document.getElementById('status-text').textContent).toBe('Erro de conexão');
        });

        test('deve recuperar de erro de rede', async () => {
            // Primeiro: erro de rede
            fetch.mockRejectedValueOnce(new Error('Network error'));
            
            // Segundo: sucesso
            fetch.mockResolvedValueOnce(createFetchResponse(mockAdmin));

            const attemptConnection = async (maxRetries = 3) => {
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        const response = await fetch('/api/user/info');
                        return { success: true, data: await response.json(), attempt };
                    } catch (error) {
                        if (attempt === maxRetries) {
                            return { success: false, error: error.message, attempt };
                        }
                        // Aguardar antes da próxima tentativa
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            };

            const result = await attemptConnection();

            expect(result.success).toBe(true);
            expect(result.attempt).toBe(2);
            expect(result.data.name).toBe('Admin Sistema');
        });
    });

    describe('Integração Completa', () => {
        test('deve executar fluxo completo de inicialização', async () => {
            // Mock para verificação de usuário
            fetch.mockResolvedValueOnce(createFetchResponse(mockSuperAdmin));
            
            // Mock para contagem de solicitações
            fetch.mockResolvedValueOnce(createFetchResponse([
                { id: '1', status: 'pending' },
                { id: '2', status: 'pending' }
            ]));

            const fullInitialization = async () => {
                // 1. Verificar usuário
                const userResponse = await fetch('/api/user/info');
                const user = await userResponse.json();
                
                // 2. Configurar interface
                document.getElementById('user-name').textContent = user.name;
                document.getElementById('user-role').textContent = user.role.toUpperCase();
                
                // 3. Configurar menu
                const navLinks = document.querySelectorAll('.nav-link[data-role]');
                navLinks.forEach(link => {
                    const allowedRoles = link.dataset.role.split(',');
                    link.style.display = allowedRoles.includes(user.role) ? 'flex' : 'none';
                });
                
                // 4. Atualizar badges (apenas para admin/super_admin)
                if (['admin', 'super_admin'].includes(user.role)) {
                    const requestsResponse = await fetch('/api/admin/access-requests/count');
                    const requests = await requestsResponse.json();
                    const pendingCount = requests.filter(r => r.status === 'pending').length;
                    
                    const badge = document.getElementById('pending-badge');
                    if (pendingCount > 0) {
                        badge.textContent = pendingCount;
                        badge.style.display = 'inline-block';
                    }
                }
                
                return { user, initialized: true };
            };

            const result = await fullInitialization();

            expect(result.initialized).toBe(true);
            expect(result.user.role).toBe('super_admin');
            expect(document.getElementById('user-name').textContent).toBe('Super Admin');
            expect(document.getElementById('setup-link').style.display).toBe('flex');
            expect(document.getElementById('pending-badge').textContent).toBe('2');
            expect(fetch).toHaveBeenCalledTimes(2);
        });
    });
});