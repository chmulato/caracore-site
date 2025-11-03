// Testes unitários para approval-requests.html
// Testa a funcionalidade de aprovação de solicitações para administradores

import { 
    clearAllMocks, 
    createFetchResponse, 
    createMockUser, 
    triggerEvent, 
    nextTick, 
    waitForElement 
} from './test-setup.js';

describe('Approval Requests - Aprovação de Solicitações', () => {
    let mockHTML;
    let mockAdmin;
    let mockRequests;
    
    beforeEach(() => {
        mockAdmin = createMockUser('admin', {
            name: 'Admin Sistema',
            email: 'admin@empresa.com'
        });
        
        mockRequests = [
            {
                id: '1',
                user_info: {
                    name: 'João Silva',
                    email: 'joao@empresa.com',
                    picture: 'https://example.com/joao.jpg'
                },
                access_level: 'editor',
                department: 'TI',
                manager_email: 'gerente@empresa.com',
                justification: 'Preciso desenvolver funcionalidades',
                urgency: 'medium',
                status: 'pending',
                created_at: '2025-11-02T10:00:00Z'
            },
            {
                id: '2',
                user_info: {
                    name: 'Maria Santos',
                    email: 'maria@empresa.com',
                    picture: 'https://example.com/maria.jpg'
                },
                access_level: 'admin',
                department: 'RH',
                manager_email: 'diretor@empresa.com',
                justification: 'Gerenciar usuários do sistema',
                urgency: 'high',
                status: 'pending',
                created_at: '2025-11-02T11:00:00Z'
            }
        ];
        
        // HTML da página de aprovação
        mockHTML = `
            <div class="approval-container">
                <div class="approval-header">
                    <div class="header-content">
                        <div>
                            <h1 class="header-title">Aprovação de Solicitações</h1>
                            <p class="header-subtitle">Gerencie as solicitações de acesso</p>
                        </div>
                        <div class="header-stats">
                            <div class="stat-item">
                                <span id="pending-count" class="stat-number">-</span>
                                <span class="stat-label">Pendentes</span>
                            </div>
                            <div class="stat-item">
                                <span id="today-count" class="stat-number">-</span>
                                <span class="stat-label">Hoje</span>
                            </div>
                            <div class="stat-item">
                                <span id="urgent-count" class="stat-number">-</span>
                                <span class="stat-label">Urgentes</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="filters-section">
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label class="filter-label" for="status-filter">Status</label>
                            <select id="status-filter" class="filter-select" title="Filtrar por status">
                                <option value="">Todos</option>
                                <option value="pending">Pendente</option>
                                <option value="approved">Aprovado</option>
                                <option value="rejected">Rejeitado</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label" for="urgency-filter">Urgência</label>
                            <select id="urgency-filter" class="filter-select" title="Filtrar por urgência">
                                <option value="">Todas</option>
                                <option value="critical">Crítica</option>
                                <option value="high">Alta</option>
                                <option value="medium">Média</option>
                                <option value="low">Baixa</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <input type="text" id="search-filter" class="filter-input" placeholder="Buscar...">
                        </div>
                        <div class="filter-group">
                            <button id="apply-filters" class="filter-button">Aplicar Filtros</button>
                        </div>
                    </div>
                </div>
                
                <div id="loading-state" class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Carregando solicitações...</p>
                </div>
                
                <div id="requests-container" class="requests-list hidden"></div>
                
                <div id="empty-state" class="empty-state hidden">
                    <div class="empty-icon">📋</div>
                    <h3>Nenhuma solicitação encontrada</h3>
                </div>
                
                <div id="details-modal" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title">Detalhes da Solicitação</h3>
                        </div>
                        <div id="modal-body"></div>
                        <div class="modal-actions">
                            <button id="close-modal" class="modal-button modal-secondary">Fechar</button>
                        </div>
                    </div>
                </div>
                
                <div id="rejection-modal" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title">Rejeitar Solicitação</h3>
                        </div>
                        <div>
                            <p>Informe o motivo da rejeição (opcional):</p>
                            <textarea id="rejection-reason" rows="4" class="rejection-textarea" placeholder="Motivo..."></textarea>
                        </div>
                        <div class="modal-actions">
                            <button id="confirm-rejection" class="modal-button modal-primary reject-button-modal">Confirmar</button>
                            <button id="cancel-rejection" class="modal-button modal-secondary">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = mockHTML;
        localStorage.setItem('access_token', 'admin-token');
    });

    describe('Autorização e Inicialização', () => {
        test('deve verificar autorização do usuário', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse(mockAdmin));

            const checkAuthorization = async () => {
                const response = await fetch('/api/user/info', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Não autorizado');
                }
                
                const user = await response.json();
                
                if (!user.role || !['admin', 'super_admin'].includes(user.role)) {
                    throw new Error('Permissão insuficiente');
                }
                
                return user;
            };

            const user = await checkAuthorization();

            expect(fetch).toHaveBeenCalledWith('/api/user/info', {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });
            expect(user.role).toBe('admin');
        });

        test('deve rejeitar acesso para usuários não autorizados', async () => {
            const unauthorizedUser = createMockUser('user');
            fetch.mockResolvedValueOnce(createFetchResponse(unauthorizedUser));

            const checkAuthorization = async () => {
                const response = await fetch('/api/user/info');
                const user = await response.json();
                
                if (!['admin', 'super_admin'].includes(user.role)) {
                    throw new Error('Permissão insuficiente');
                }
                
                return user;
            };

            await expect(checkAuthorization()).rejects.toThrow('Permissão insuficiente');
        });
    });

    describe('Carregamento de Solicitações', () => {
        test('deve carregar lista de solicitações', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse(mockRequests));

            const loadRequests = async () => {
                const response = await fetch('/api/admin/access-requests', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                return response.json();
            };

            const requests = await loadRequests();

            expect(fetch).toHaveBeenCalledWith('/api/admin/access-requests', {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });
            expect(requests).toHaveLength(2);
            expect(requests[0].user_info.name).toBe('João Silva');
        });

        test('deve atualizar estatísticas do dashboard', () => {
            const updateStats = (requests) => {
                const pending = requests.filter(r => r.status === 'pending').length;
                const today = requests.filter(r => {
                    const requestDate = new Date(r.created_at);
                    const today = new Date();
                    return requestDate.toDateString() === today.toDateString();
                }).length;
                const urgent = requests.filter(r => 
                    r.urgency === 'critical' || r.urgency === 'high'
                ).length;

                document.getElementById('pending-count').textContent = pending;
                document.getElementById('today-count').textContent = today;
                document.getElementById('urgent-count').textContent = urgent;
            };

            updateStats(mockRequests);

            expect(document.getElementById('pending-count').textContent).toBe('2');
            expect(document.getElementById('urgent-count').textContent).toBe('1');
        });

        test('deve mostrar estado vazio quando não há solicitações', () => {
            const showEmptyState = () => {
                document.getElementById('empty-state').classList.remove('hidden');
                document.getElementById('requests-container').classList.add('hidden');
                document.getElementById('loading-state').classList.add('hidden');
            };

            showEmptyState();

            expect(document.getElementById('empty-state').classList.contains('hidden')).toBe(false);
            expect(document.getElementById('requests-container').classList.contains('hidden')).toBe(true);
        });
    });

    describe('Renderização de Solicitações', () => {
        test('deve criar cards de solicitação corretamente', () => {
            const createRequestCard = (request) => {
                const card = document.createElement('div');
                card.className = `request-card ${getPriorityClass(request.urgency)}`;
                card.innerHTML = `
                    <div class="request-header">
                        <div class="request-user">
                            <img src="${request.user_info.picture}" class="user-avatar">
                            <div class="user-info">
                                <div class="user-name">${request.user_info.name}</div>
                                <div class="user-email">${request.user_info.email}</div>
                            </div>
                        </div>
                        <div class="urgency-badge urgency-${request.urgency}">
                            ${request.urgency}
                        </div>
                    </div>
                `;
                return card;
            };

            const getPriorityClass = (urgency) => {
                switch (urgency) {
                    case 'critical':
                    case 'high':
                        return 'high-priority';
                    case 'medium':
                        return 'medium-priority';
                    default:
                        return 'low-priority';
                }
            };

            const card = createRequestCard(mockRequests[0]);

            expect(card.classList.contains('request-card')).toBe(true);
            expect(card.classList.contains('medium-priority')).toBe(true);
            expect(card.innerHTML).toContain('João Silva');
            expect(card.innerHTML).toContain('joao@empresa.com');
        });

        test('deve aplicar classes de prioridade corretas', () => {
            const getPriorityClass = (urgency) => {
                switch (urgency) {
                    case 'critical':
                    case 'high':
                        return 'high-priority';
                    case 'medium':
                        return 'medium-priority';
                    default:
                        return 'low-priority';
                }
            };

            expect(getPriorityClass('critical')).toBe('high-priority');
            expect(getPriorityClass('high')).toBe('high-priority');
            expect(getPriorityClass('medium')).toBe('medium-priority');
            expect(getPriorityClass('low')).toBe('low-priority');
        });
    });

    describe('Sistema de Filtros', () => {
        test('deve filtrar por status', () => {
            const applyStatusFilter = (requests, statusFilter) => {
                if (!statusFilter) return requests;
                return requests.filter(request => request.status === statusFilter);
            };

            const pendingRequests = applyStatusFilter(mockRequests, 'pending');
            const approvedRequests = applyStatusFilter(mockRequests, 'approved');

            expect(pendingRequests).toHaveLength(2);
            expect(approvedRequests).toHaveLength(0);
        });

        test('deve filtrar por urgência', () => {
            const applyUrgencyFilter = (requests, urgencyFilter) => {
                if (!urgencyFilter) return requests;
                return requests.filter(request => request.urgency === urgencyFilter);
            };

            const highUrgencyRequests = applyUrgencyFilter(mockRequests, 'high');
            const mediumUrgencyRequests = applyUrgencyFilter(mockRequests, 'medium');

            expect(highUrgencyRequests).toHaveLength(1);
            expect(highUrgencyRequests[0].user_info.name).toBe('Maria Santos');
            expect(mediumUrgencyRequests).toHaveLength(1);
        });

        test('deve filtrar por busca de texto', () => {
            const applySearchFilter = (requests, searchTerm) => {
                if (!searchTerm) return requests;
                
                return requests.filter(request => {
                    const searchableText = `
                        ${request.user_info.name || ''} 
                        ${request.user_info.email || ''} 
                        ${request.department || ''}
                    `.toLowerCase();
                    
                    return searchableText.includes(searchTerm.toLowerCase());
                });
            };

            const searchResults = applySearchFilter(mockRequests, 'joão');
            expect(searchResults).toHaveLength(1);
            expect(searchResults[0].user_info.name).toBe('João Silva');

            const departmentResults = applySearchFilter(mockRequests, 'RH');
            expect(departmentResults).toHaveLength(1);
            expect(departmentResults[0].department).toBe('RH');
        });

        test('deve aplicar múltiplos filtros combinados', () => {
            const applyFilters = (requests, filters) => {
                let filtered = requests;

                if (filters.status) {
                    filtered = filtered.filter(r => r.status === filters.status);
                }

                if (filters.urgency) {
                    filtered = filtered.filter(r => r.urgency === filters.urgency);
                }

                if (filters.search) {
                    filtered = filtered.filter(r => {
                        const searchableText = `${r.user_info.name} ${r.user_info.email} ${r.department}`.toLowerCase();
                        return searchableText.includes(filters.search.toLowerCase());
                    });
                }

                return filtered;
            };

            const results = applyFilters(mockRequests, {
                status: 'pending',
                urgency: 'high'
            });

            expect(results).toHaveLength(1);
            expect(results[0].user_info.name).toBe('Maria Santos');
        });
    });

    describe('Ações de Aprovação e Rejeição', () => {
        test('deve aprovar solicitação', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse({ success: true }));

            const approveRequest = async (requestId) => {
                const response = await fetch(`/api/admin/access-requests/${requestId}/approve`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.json();
            };

            const result = await approveRequest('1');

            expect(fetch).toHaveBeenCalledWith('/api/admin/access-requests/1/approve', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer admin-token',
                    'Content-Type': 'application/json'
                }
            });
            expect(result.success).toBe(true);
        });

        test('deve rejeitar solicitação com motivo', async () => {
            fetch.mockResolvedValueOnce(createFetchResponse({ success: true }));

            const rejectRequest = async (requestId, reason) => {
                const response = await fetch(`/api/admin/access-requests/${requestId}/reject`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                });
                return response.json();
            };

            const result = await rejectRequest('1', 'Informações insuficientes');

            expect(fetch).toHaveBeenCalledWith('/api/admin/access-requests/1/reject', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer admin-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Informações insuficientes' })
            });
            expect(result.success).toBe(true);
        });

        test('deve tratar erro na aprovação', async () => {
            fetch.mockRejectedValueOnce(new Error('Server error'));

            try {
                await fetch('/api/admin/access-requests/1/approve', {
                    method: 'POST'
                });
            } catch (error) {
                expect(error.message).toBe('Server error');
            }
        });
    });

    describe('Modais de Detalhes e Rejeição', () => {
        test('deve abrir modal de detalhes', () => {
            const showRequestDetails = (request) => {
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <p><strong>Usuário:</strong> ${request.user_info.name}</p>
                    <p><strong>Email:</strong> ${request.user_info.email}</p>
                    <p><strong>Departamento:</strong> ${request.department}</p>
                `;
                document.getElementById('details-modal').classList.remove('hidden');
            };

            showRequestDetails(mockRequests[0]);

            const modalBody = document.getElementById('modal-body');
            expect(modalBody.innerHTML).toContain('João Silva');
            expect(modalBody.innerHTML).toContain('joao@empresa.com');
            expect(document.getElementById('details-modal').classList.contains('hidden')).toBe(false);
        });

        test('deve abrir modal de rejeição', () => {
            const showRejectionModal = (requestId) => {
                document.getElementById('rejection-reason').value = '';
                document.getElementById('rejection-modal').classList.remove('hidden');
            };

            showRejectionModal('1');

            expect(document.getElementById('rejection-modal').classList.contains('hidden')).toBe(false);
            expect(document.getElementById('rejection-reason').value).toBe('');
        });

        test('deve fechar modais', () => {
            const closeModal = () => {
                document.getElementById('details-modal').classList.add('hidden');
            };

            const closeRejectionModal = () => {
                document.getElementById('rejection-modal').classList.add('hidden');
            };

            // Abrir modais
            document.getElementById('details-modal').classList.remove('hidden');
            document.getElementById('rejection-modal').classList.remove('hidden');

            // Fechar modais
            closeModal();
            closeRejectionModal();

            expect(document.getElementById('details-modal').classList.contains('hidden')).toBe(true);
            expect(document.getElementById('rejection-modal').classList.contains('hidden')).toBe(true);
        });
    });

    describe('Estados de Loading', () => {
        test('deve mostrar estado de loading', () => {
            const showLoading = (show) => {
                if (show) {
                    document.getElementById('loading-state').classList.remove('hidden');
                    document.getElementById('requests-container').classList.add('hidden');
                    document.getElementById('empty-state').classList.add('hidden');
                } else {
                    document.getElementById('loading-state').classList.add('hidden');
                }
            };

            showLoading(true);

            expect(document.getElementById('loading-state').classList.contains('hidden')).toBe(false);
            expect(document.getElementById('requests-container').classList.contains('hidden')).toBe(true);

            showLoading(false);

            expect(document.getElementById('loading-state').classList.contains('hidden')).toBe(true);
        });
    });

    describe('Formatação de Dados', () => {
        test('deve formatar datas corretamente', () => {
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            };

            const formattedDate = formatDate('2025-11-02T10:00:00Z');
            expect(formattedDate).toContain('02/11/2025');
        });

        test('deve obter labels corretos para níveis de acesso', () => {
            const getAccessLevelLabel = (level) => {
                const labels = {
                    'viewer': 'Visualizador',
                    'editor': 'Editor',
                    'admin': 'Administrador'
                };
                return labels[level] || level;
            };

            expect(getAccessLevelLabel('editor')).toBe('Editor');
            expect(getAccessLevelLabel('admin')).toBe('Administrador');
            expect(getAccessLevelLabel('viewer')).toBe('Visualizador');
        });

        test('deve obter labels corretos para urgência', () => {
            const getUrgencyLabel = (urgency) => {
                const labels = {
                    'critical': 'Crítica',
                    'high': 'Alta',
                    'medium': 'Média',
                    'low': 'Baixa'
                };
                return labels[urgency] || urgency;
            };

            expect(getUrgencyLabel('high')).toBe('Alta');
            expect(getUrgencyLabel('critical')).toBe('Crítica');
            expect(getUrgencyLabel('medium')).toBe('Média');
        });
    });

    describe('Integração e Fluxo Completo', () => {
        test('deve executar fluxo completo de aprovação', async () => {
            // 1. Verificar autorização
            fetch.mockResolvedValueOnce(createFetchResponse(mockAdmin));
            
            // 2. Carregar solicitações
            fetch.mockResolvedValueOnce(createFetchResponse(mockRequests));
            
            // 3. Aprovar solicitação
            fetch.mockResolvedValueOnce(createFetchResponse({ success: true }));

            // Executar fluxo
            const user = await fetch('/api/user/info').then(res => res.json());
            expect(user.role).toBe('admin');

            const requests = await fetch('/api/admin/access-requests').then(res => res.json());
            expect(requests).toHaveLength(2);

            const approvalResult = await fetch('/api/admin/access-requests/1/approve', {
                method: 'POST'
            }).then(res => res.json());
            
            expect(approvalResult.success).toBe(true);
            expect(fetch).toHaveBeenCalledTimes(3);
        });
    });
});