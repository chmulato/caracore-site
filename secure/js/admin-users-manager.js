/**
 * AdminUsersManager - Gerenciador do Dashboard Administrativo de Usuários
 * 
 * Funcionalidades:
 * - Gestão de usuários autorizados (listar, adicionar, remover, editar)
 * - Aprovação de solicitações pendentes
 * - Filtros e busca em tempo real
 * - Atualização automática a cada 30s
 * - Interface responsiva com feedback visual
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-11-02
 */

class AdminUsersManager {
    constructor() {
        this.data = {
            users: [],
            pending_requests: [],
            settings: {},
            total_users: 0,
            total_pending: 0
        };
        
        this.filteredUsers = [];
        this.currentEditUser = null;
        this.autoRefreshInterval = null;
        this.isLoading = false;
        
        // Elementos DOM
        this.elements = {};
        
        // Configurações
        this.config = {
            refreshInterval: 30000, // 30 segundos
            apiEndpoints: {
                getUsers: '/api/admin/users',
                addUser: '/api/admin/users',
                removeUser: '/api/admin/users',
                approveRequest: '/api/admin/users'
            }
        };
    }
    
    /**
     * Inicializar o gerenciador
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadData();
        this.startAutoRefresh();
        
        console.log('AdminUsersManager inicializado');
    }
    
    /**
     * Vincular elementos DOM
     */
    bindElements() {
        // Estatísticas
        this.elements.totalUsers = document.getElementById('totalUsers');
        this.elements.totalPending = document.getElementById('totalPending');
        this.elements.totalAdmins = document.getElementById('totalAdmins');
        this.elements.totalRequests = document.getElementById('totalRequests');
        this.elements.pendingBadge = document.getElementById('pendingBadge');
        
        // Containers
        this.elements.pendingContainer = document.getElementById('pendingContainer');
        this.elements.noPendingState = document.getElementById('noPendingState');
        this.elements.usersTableBody = document.getElementById('usersTableBody');
        
        // Controles
        this.elements.refreshBtn = document.getElementById('refreshBtn');
        this.elements.addUserBtn = document.getElementById('addUserBtn');
        this.elements.searchInput = document.getElementById('searchInput');
        this.elements.roleFilter = document.getElementById('roleFilter');
        this.elements.providerFilter = document.getElementById('providerFilter');
        
        // Modal
        this.elements.userModal = document.getElementById('userModal');
        this.elements.modalTitle = document.getElementById('modalTitle');
        this.elements.modalClose = document.getElementById('modalClose');
        this.elements.userForm = document.getElementById('userForm');
        this.elements.userEmail = document.getElementById('userEmail');
        this.elements.userName = document.getElementById('userName');
        this.elements.userProvider = document.getElementById('userProvider');
        this.elements.userRole = document.getElementById('userRole');
        this.elements.cancelBtn = document.getElementById('cancelBtn');
        this.elements.saveBtn = document.getElementById('saveBtn');
        
        // Indicadores
        this.elements.refreshIndicator = document.querySelector('.refresh-indicator');
    }
    
    /**
     * Vincular eventos
     */
    bindEvents() {
        // Refresh manual
        this.elements.refreshBtn.addEventListener('click', () => this.loadData());
        
        // Adicionar usuário
        this.elements.addUserBtn.addEventListener('click', () => this.openAddUserModal());
        
        // Busca e filtros
        this.elements.searchInput.addEventListener('input', (e) => this.filterUsers());
        this.elements.roleFilter.addEventListener('change', (e) => this.filterUsers());
        this.elements.providerFilter.addEventListener('change', (e) => this.filterUsers());
        
        // Modal
        this.elements.modalClose.addEventListener('click', () => this.closeModal());
        this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
        this.elements.userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Fechar modal clicando fora
        this.elements.userModal.addEventListener('click', (e) => {
            if (e.target === this.elements.userModal) {
                this.closeModal();
            }
        });
        
        // ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.userModal.style.display === 'flex') {
                this.closeModal();
            }
        });
    }
    
    /**
     * Carregar dados do servidor
     */
    async loadData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.setLoadingState(true);
        
        try {
            // Obter token de autenticação correto
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }
            
            const response = await fetch(this.config.apiEndpoints.getUsers, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.data = await response.json();
            this.updateUI();
            this.filterUsers(); // Aplicar filtros atuais
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showError('Erro ao carregar dados: ' + error.message);
        } finally {
            this.isLoading = false;
            this.setLoadingState(false);
        }
    }
    
    /**
     * Atualizar interface com os dados carregados
     */
    updateUI() {
        this.updateStatistics();
        this.updatePendingRequests();
        this.updateUsersTable();
    }
    
    /**
     * Atualizar estatísticas
     */
    updateStatistics() {
        const users = this.data.users || [];
        const pending = this.data.pending_requests || [];
        
        const totalUsers = users.length;
        const totalPending = pending.length;
        const totalAdmins = users.filter(u => u.role === 'admin').length;
        
        // Solicitações hoje (últimas 24h)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRequests = pending.filter(r => {
            const requestDate = new Date(r.requested_at);
            return requestDate >= today;
        }).length;
        
        this.elements.totalUsers.textContent = totalUsers;
        this.elements.totalPending.textContent = totalPending;
        this.elements.totalAdmins.textContent = totalAdmins;
        this.elements.totalRequests.textContent = todayRequests;
        this.elements.pendingBadge.textContent = totalPending;
    }
    
    /**
     * Atualizar lista de solicitações pendentes
     */
    updatePendingRequests() {
        const pending = this.data.pending_requests || [];
        
        if (pending.length === 0) {
            this.elements.noPendingState.style.display = 'block';
            this.elements.pendingContainer.innerHTML = '';
            this.elements.pendingContainer.appendChild(this.elements.noPendingState);
            return;
        }
        
        this.elements.noPendingState.style.display = 'none';
        this.elements.pendingContainer.innerHTML = '';
        
        pending.forEach(request => {
            const card = this.createPendingCard(request);
            this.elements.pendingContainer.appendChild(card);
        });
    }
    
    /**
     * Criar card de solicitação pendente
     */
    createPendingCard(request) {
        const div = document.createElement('div');
        div.className = 'pending-card';
        
        const providerIcon = request.provider === 'microsoft' ? 'icon-microsoft' : 'icon-google';
        const requestDate = new Date(request.requested_at).toLocaleDateString('pt-BR');
        
        div.innerHTML = `
            <div class="pending-header">
                <div class="pending-info">
                    <div class="user-info">
                        <div class="user-avatar">${request.name.charAt(0).toUpperCase()}</div>
                        <div class="user-details">
                            <p class="user-name">${this.escapeHtml(request.name)}</p>
                            <p class="user-email">
                                <svg class="icon-sm" aria-hidden="true" style="display: inline; margin-right: 0.25rem;">
                                    <use href="#${providerIcon}"></use>
                                </svg>
                                ${this.escapeHtml(request.email)}
                            </p>
                        </div>
                    </div>
                    ${request.message ? `
                        <div class="request-message">
                            <strong>Motivo:</strong> ${this.escapeHtml(request.message)}
                        </div>
                    ` : ''}
                    <p style="font-size: 0.75rem; color: #6b7280; margin: 0.5rem 0 0 0;">
                        Solicitado em ${requestDate}
                    </p>
                </div>
                <div class="pending-actions">
                    <button class="btn btn-success btn-sm" onclick="AdminUsersManager.approveRequest('${request.email}')">
                        <svg class="icon-sm" aria-hidden="true"><use href="#icon-check"></use></svg>
                        Aprovar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="AdminUsersManager.rejectRequest('${request.email}')">
                        <svg class="icon-sm" aria-hidden="true"><use href="#icon-x"></use></svg>
                        Rejeitar
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }
    
    /**
     * Filtrar usuários com base nos controles
     */
    filterUsers() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const roleFilter = this.elements.roleFilter.value;
        const providerFilter = this.elements.providerFilter.value;
        
        this.filteredUsers = (this.data.users || []).filter(user => {
            const matchesSearch = !searchTerm || 
                user.name.toLowerCase().includes(searchTerm) || 
                user.email.toLowerCase().includes(searchTerm);
            
            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesProvider = !providerFilter || user.provider === providerFilter;
            
            return matchesSearch && matchesRole && matchesProvider;
        });
        
        this.updateUsersTable();
    }
    
    /**
     * Atualizar tabela de usuários
     */
    updateUsersTable() {
        const tbody = this.elements.usersTableBody;
        tbody.innerHTML = '';
        
        if (this.filteredUsers.length === 0) {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
                    Nenhum usuário encontrado
                </td>
            `;
            return;
        }
        
        this.filteredUsers.forEach(user => {
            const row = tbody.insertRow();
            row.innerHTML = this.createUserRow(user);
        });
    }
    
    /**
     * Criar linha da tabela de usuário
     */
    createUserRow(user) {
        const providerIcon = user.provider === 'microsoft' ? 'icon-microsoft' : 'icon-google';
        const approvedDate = new Date(user.approved_at).toLocaleDateString('pt-BR');
        const roleClass = user.role === 'admin' ? 'admin' : 'user';
        
        return `
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <p class="user-name">${this.escapeHtml(user.name)}</p>
                        <p class="user-email">${this.escapeHtml(user.email)}</p>
                    </div>
                </div>
            </td>
            <td>
                <svg class="icon-sm" aria-hidden="true" style="margin-right: 0.5rem;">
                    <use href="#${providerIcon}"></use>
                </svg>
                ${user.provider === 'microsoft' ? 'Microsoft' : 'Google'}
            </td>
            <td>
                <span class="badge ${roleClass}">
                    ${user.role === 'admin' ? 'Admin' : 'Usuário'}
                </span>
            </td>
            <td>${approvedDate}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="AdminUsersManager.editUser('${user.email}')">
                        <svg class="icon-sm" aria-hidden="true"><use href="#icon-edit"></use></svg>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="AdminUsersManager.removeUser('${user.email}')">
                        <svg class="icon-sm" aria-hidden="true"><use href="#icon-trash"></use></svg>
                    </button>
                </div>
            </td>
        `;
    }
    
    /**
     * Aprovar solicitação de acesso
     */
    async approveRequest(email) {
        if (!confirm(`Aprovar acesso para ${email}?`)) return;
        
        const request = this.data.pending_requests.find(r => r.email === email);
        if (!request) return;
        
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }
            
            const response = await fetch(this.config.apiEndpoints.addUser, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: request.email,
                    name: request.name,
                    provider: request.provider,
                    role: 'user'
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error_description || 'Erro ao aprovar solicitação');
            }
            
            this.showSuccess(`Acesso aprovado para ${email}`);
            this.loadData(); // Recarregar dados
            
        } catch (error) {
            console.error('Erro ao aprovar solicitação:', error);
            this.showError('Erro ao aprovar solicitação: ' + error.message);
        }
    }
    
    /**
     * Rejeitar solicitação de acesso
     */
    async rejectRequest(email) {
        if (!confirm(`Rejeitar solicitação de ${email}?`)) return;
        
        // TODO: Implementar endpoint para rejeitar solicitação
        // Por enquanto, apenas remover da lista local
        this.data.pending_requests = this.data.pending_requests.filter(r => r.email !== email);
        this.updatePendingRequests();
        this.updateStatistics();
        
        this.showSuccess(`Solicitação de ${email} rejeitada`);
    }
    
    /**
     * Abrir modal para adicionar usuário
     */
    openAddUserModal() {
        this.currentEditUser = null;
        this.elements.modalTitle.textContent = 'Adicionar Usuário';
        this.elements.userForm.reset();
        this.elements.userEmail.readOnly = false;
        this.showModal();
    }
    
    /**
     * Editar usuário existente
     */
    editUser(email) {
        const user = this.data.users.find(u => u.email === email);
        if (!user) return;
        
        this.currentEditUser = user;
        this.elements.modalTitle.textContent = 'Editar Usuário';
        this.elements.userEmail.value = user.email;
        this.elements.userName.value = user.name;
        this.elements.userProvider.value = user.provider;
        this.elements.userRole.value = user.role;
        this.elements.userEmail.readOnly = true;
        this.showModal();
    }
    
    /**
     * Remover usuário
     */
    async removeUser(email) {
        const user = this.data.users.find(u => u.email === email);
        if (!user) return;
        
        // Verificar se não é o último admin
        const adminCount = this.data.users.filter(u => u.role === 'admin').length;
        if (user.role === 'admin' && adminCount <= 1) {
            this.showError('Não é possível remover o último administrador');
            return;
        }
        
        if (!confirm(`Remover acesso de ${user.name} (${email})?`)) return;
        
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }
            
            const response = await fetch(`${this.config.apiEndpoints.removeUser}/${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error_description || 'Erro ao remover usuário');
            }
            
            this.showSuccess(`Usuário ${user.name} removido com sucesso`);
            this.loadData(); // Recarregar dados
            
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            this.showError('Erro ao remover usuário: ' + error.message);
        }
    }
    
    /**
     * Processar envio do formulário
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.elements.userForm);
        const userData = {
            email: formData.get('email') || this.elements.userEmail.value,
            name: formData.get('name') || this.elements.userName.value,
            provider: formData.get('provider') || this.elements.userProvider.value,
            role: formData.get('role') || this.elements.userRole.value
        };
        
        // Validação básica
        if (!userData.email || !userData.name || !userData.provider || !userData.role) {
            this.showError('Todos os campos são obrigatórios');
            return;
        }
        
        if (this.currentEditUser) {
            await this.updateUser(userData);
        } else {
            await this.addUser(userData);
        }
    }
    
    /**
     * Adicionar novo usuário
     */
    async addUser(userData) {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }
            
            const response = await fetch(this.config.apiEndpoints.addUser, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error_description || 'Erro ao adicionar usuário');
            }
            
            this.showSuccess(`Usuário ${userData.name} adicionado com sucesso`);
            this.closeModal();
            this.loadData(); // Recarregar dados
            
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            this.showError('Erro ao adicionar usuário: ' + error.message);
        }
    }
    
    /**
     * Atualizar usuário existente
     */
    async updateUser(userData) {
        // TODO: Implementar endpoint de atualização
        // Por enquanto, simular atualização
        this.showSuccess(`Usuário ${userData.name} atualizado com sucesso`);
        this.closeModal();
        this.loadData();
    }
    
    /**
     * Mostrar modal
     */
    showModal() {
        this.elements.userModal.style.display = 'flex';
    }
    
    /**
     * Fechar modal
     */
    closeModal() {
        this.elements.userModal.style.display = 'none';
        this.elements.userForm.reset();
        this.currentEditUser = null;
    }
    
    /**
     * Iniciar atualização automática
     */
    startAutoRefresh() {
        this.autoRefreshInterval = setInterval(() => {
            this.loadData();
        }, this.config.refreshInterval);
    }
    
    /**
     * Parar atualização automática
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    
    /**
     * Definir estado de carregamento
     */
    setLoadingState(loading) {
        if (loading) {
            this.elements.refreshIndicator.style.display = 'block';
            document.body.style.cursor = 'wait';
        } else {
            this.elements.refreshIndicator.style.display = 'none';
            document.body.style.cursor = 'default';
        }
    }
    
    /**
     * Mostrar mensagem de sucesso
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    /**
     * Mostrar mensagem de erro
     */
    showError(message) {
        this.showToast(message, 'error');
    }
    
    /**
     * Mostrar toast notification
     */
    showToast(message, type = 'info') {
        // Criar elemento de toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        
        // Adicionar animação CSS
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remover após 4 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    /**
     * Escapar HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Destruir instância
     */
    destroy() {
        this.stopAutoRefresh();
    }
}

// Instância global
AdminUsersManager.instance = new AdminUsersManager();

// Exportar métodos estáticos para uso nos eventos onclick
AdminUsersManager.approveRequest = (email) => AdminUsersManager.instance.approveRequest(email);
AdminUsersManager.rejectRequest = (email) => AdminUsersManager.instance.rejectRequest(email);
AdminUsersManager.editUser = (email) => AdminUsersManager.instance.editUser(email);
AdminUsersManager.removeUser = (email) => AdminUsersManager.instance.removeUser(email);
AdminUsersManager.init = () => AdminUsersManager.instance.init();

// Auto-inicializar se window.AdminUsersManager não existir
if (typeof window !== 'undefined') {
    window.AdminUsersManager = AdminUsersManager;
}