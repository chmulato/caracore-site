// Approval Manager JavaScript

let currentRequests = [];
let currentUser = null;
let selectedRequestId = null;

// Inicialização
window.addEventListener('DOMContentLoaded', function() {
    initializeApprovalManager();
});

async function initializeApprovalManager() {
    try {
        // Verificar autorização
        await checkAuthorization();
        
        // Carregar solicitações
        await loadRequests();
        
        // Configurar event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        window.location.href = '/secure/access-denied.html';
    }
}

async function checkAuthorization() {
    // Verificar se é super admin autenticado
    const superAdminToken = localStorage.getItem('super_admin_token');
    const superAdminAuth = localStorage.getItem('super_admin_authenticated');
    
    if (superAdminToken && superAdminAuth === 'true') {
        // Super admin tem acesso total
        currentUser = {
            email: localStorage.getItem('super_admin_email') || 'suporte@caracore.com.br',
            role: 'super_admin',
            name: 'Super Administrador'
        };
        return;
    }
    
    // Senão, verificar token OAuth normal
    const response = await fetch('/api/user/info', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Não autorizado');
    }

    currentUser = await response.json();
    
    // Verificar se tem permissão de admin
    if (!currentUser.role || !['admin', 'super_admin'].includes(currentUser.role)) {
        throw new Error('Permissão insuficiente');
    }
}

function setupEventListeners() {
    // Filtros
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    
    // Enter no campo de busca
    document.getElementById('search-filter').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Modal controls
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-rejection').addEventListener('click', closeRejectionModal);
    document.getElementById('confirm-rejection').addEventListener('click', confirmRejection);
    
    // Click fora do modal para fechar
    document.getElementById('details-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    document.getElementById('rejection-modal').addEventListener('click', function(e) {
        if (e.target === this) closeRejectionModal();
    });
}

async function loadRequests() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/admin/access-requests', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.ok) {
            currentRequests = await response.json();
            updateStats();
            renderRequests(currentRequests);
        } else {
            throw new Error('Erro ao carregar solicitações');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

function updateStats() {
    const pending = currentRequests.filter(r => r.status === 'pending').length;
    const today = currentRequests.filter(r => {
        const requestDate = new Date(r.created_at);
        const today = new Date();
        return requestDate.toDateString() === today.toDateString();
    }).length;
    const urgent = currentRequests.filter(r => 
        r.urgency === 'critical' || r.urgency === 'high'
    ).length;

    document.getElementById('pending-count').textContent = pending;
    document.getElementById('today-count').textContent = today;
    document.getElementById('urgent-count').textContent = urgent;
}

function renderRequests(requests) {
    const container = document.getElementById('requests-container');
    
    if (requests.length === 0) {
        showEmptyState();
        return;
    }
    
    container.innerHTML = '';
    container.classList.remove('hidden');
    document.getElementById('empty-state').classList.add('hidden');
    
    requests.forEach(request => {
        const card = createRequestCard(request);
        container.appendChild(card);
    });
}

function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = `request-card ${getPriorityClass(request.urgency)}`;
    
    card.innerHTML = `
        <div class="request-header">
            <div class="request-user">
                <img src="${request.user_info?.picture || '/images/default-avatar.png'}" 
                     alt="Avatar" class="user-avatar">
                <div class="user-info">
                    <div class="user-name">${request.user_info?.name || 'Usuário'}</div>
                    <div class="user-email">${request.user_info?.email || ''}</div>
                </div>
            </div>
            <div class="request-meta">
                <div class="request-date">${formatDate(request.created_at)}</div>
                <span class="urgency-badge urgency-${request.urgency}">
                    ${getUrgencyLabel(request.urgency)}
                </span>
            </div>
        </div>
        
        <div class="request-details">
            <div class="detail-item">
                <span class="detail-label">Nível de Acesso</span>
                <span class="detail-value">
                    <span class="access-level-badge access-${request.access_level}">
                        ${getAccessLevelLabel(request.access_level)}
                    </span>
                </span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Departamento</span>
                <span class="detail-value">${request.department}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Supervisor</span>
                <span class="detail-value">${request.manager_email || 'Não informado'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">${getStatusLabel(request.status)}</span>
            </div>
        </div>
        
        <div class="justification-section">
            <span class="detail-label">Justificativa</span>
            <div class="justification-text">${request.justification}</div>
        </div>
        
        ${request.status === 'pending' ? `
        <div class="actions-section">
            <button class="action-button approve-button" onclick="approveRequest('${request.id}')">
                ✓ Aprovar
            </button>
            <button class="action-button reject-button" onclick="showRejectionModal('${request.id}')">
                ✗ Rejeitar
            </button>
            <button class="action-button details-button" onclick="showRequestDetails('${request.id}')">
                📋 Detalhes
            </button>
        </div>
        ` : ''}
    `;
    
    return card;
}

function getPriorityClass(urgency) {
    switch (urgency) {
        case 'critical':
        case 'high':
            return 'high-priority';
        case 'medium':
            return 'medium-priority';
        default:
            return 'low-priority';
    }
}

function getUrgencyLabel(urgency) {
    const labels = {
        'critical': 'Crítica',
        'high': 'Alta',
        'medium': 'Média',
        'low': 'Baixa'
    };
    return labels[urgency] || urgency;
}

function getAccessLevelLabel(level) {
    const labels = {
        'viewer': 'Visualizador',
        'editor': 'Editor',
        'admin': 'Administrador'
    };
    return labels[level] || level;
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'rejected': 'Rejeitado'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

async function approveRequest(requestId) {
    if (!confirm('Confirma a aprovação desta solicitação?')) return;
    
    try {
        const response = await fetch(`/api/admin/access-requests/${requestId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            await loadRequests(); // Recarregar lista
            alert('Solicitação aprovada com sucesso!');
        } else {
            throw new Error('Erro ao aprovar solicitação');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao aprovar solicitação. Tente novamente.');
    }
}

function showRejectionModal(requestId) {
    selectedRequestId = requestId;
    document.getElementById('rejection-reason').value = '';
    document.getElementById('rejection-modal').classList.remove('hidden');
}

function closeRejectionModal() {
    selectedRequestId = null;
    document.getElementById('rejection-modal').classList.add('hidden');
}

async function confirmRejection() {
    if (!selectedRequestId) return;
    
    const reason = document.getElementById('rejection-reason').value;
    
    try {
        const response = await fetch(`/api/admin/access-requests/${selectedRequestId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        if (response.ok) {
            closeRejectionModal();
            await loadRequests(); // Recarregar lista
            alert('Solicitação rejeitada com sucesso!');
        } else {
            throw new Error('Erro ao rejeitar solicitação');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao rejeitar solicitação. Tente novamente.');
    }
}

function showRequestDetails(requestId) {
    const request = currentRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>Usuário:</strong> ${request.user_info?.name || 'N/A'}<br>
            <strong>Email:</strong> ${request.user_info?.email || 'N/A'}<br>
            <strong>Data da Solicitação:</strong> ${formatDate(request.created_at)}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Nível de Acesso:</strong> ${getAccessLevelLabel(request.access_level)}<br>
            <strong>Departamento:</strong> ${request.department}<br>
            <strong>Supervisor:</strong> ${request.manager_email || 'Não informado'}<br>
            <strong>Urgência:</strong> ${getUrgencyLabel(request.urgency)}
        </div>
        <div>
            <strong>Justificativa:</strong><br>
            <div style="background: #f9fafb; padding: 1rem; border-radius: 6px; margin-top: 0.5rem;">
                ${request.justification}
            </div>
        </div>
    `;
    
    document.getElementById('details-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('details-modal').classList.add('hidden');
}

function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const urgencyFilter = document.getElementById('urgency-filter').value;
    const accessFilter = document.getElementById('access-filter').value;
    const searchTerm = document.getElementById('search-filter').value.toLowerCase();
    
    let filtered = currentRequests.filter(request => {
        // Filtro de status
        if (statusFilter && request.status !== statusFilter) return false;
        
        // Filtro de urgência
        if (urgencyFilter && request.urgency !== urgencyFilter) return false;
        
        // Filtro de nível de acesso
        if (accessFilter && request.access_level !== accessFilter) return false;
        
        // Filtro de busca
        if (searchTerm) {
            const searchableText = `
                ${request.user_info?.name || ''} 
                ${request.user_info?.email || ''} 
                ${request.department || ''}
            `.toLowerCase();
            
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        return true;
    });
    
    renderRequests(filtered);
}

function showLoading(show) {
    if (show) {
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('requests-container').classList.add('hidden');
        document.getElementById('empty-state').classList.add('hidden');
    } else {
        document.getElementById('loading-state').classList.add('hidden');
    }
}

function showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('requests-container').classList.add('hidden');
    document.getElementById('loading-state').classList.add('hidden');
}