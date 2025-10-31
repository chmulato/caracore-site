/**
 * Dashboard de Auditoria - Área 51
 * Visualização de logs OAuth 2.1 + OIDC
 * Fase 3 - Item 6
 */

(function() {
    'use strict';

    const API_BASE_URL = 'https://caracore-backend.azurewebsites.net';
    // const API_BASE_URL = 'http://127.0.0.1:5051';  // Desenvolvimento local
    
    // Estado da aplicação
    const state = {
        logs: [],
        filteredLogs: [],
        currentPage: 0,
        pageSize: 100,
        totalLogs: 0,
        filters: {
            date: new Date().toISOString().split('T')[0],
            eventType: '',
            search: '',
            limit: 100
        }
    };

    // Inicialização
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[AuditDashboard] Inicializando...');
        
        // Configurar data inicial (hoje)
        document.getElementById('dateFilter').value = state.filters.date;
        
        // Event listeners
        setupEventListeners();
        
        // Carregar logs iniciais
        loadLogs();
    });

    /**
     * Configurar event listeners
     */
    function setupEventListeners() {
        // Botões de ação
        document.getElementById('btnRefresh')?.addEventListener('click', () => loadLogs());
        document.getElementById('btnExportJSON')?.addEventListener('click', () => exportLogs('json'));
        document.getElementById('btnExportCSV')?.addEventListener('click', () => exportLogs('csv'));
        
        // Filtros
        document.getElementById('btnApplyFilters')?.addEventListener('click', applyFilters);
        document.getElementById('btnResetFilters')?.addEventListener('click', resetFilters);
        
        // Paginação
        document.getElementById('btnFirstPage')?.addEventListener('click', () => goToPage(0));
        document.getElementById('btnPrevPage')?.addEventListener('click', () => goToPage(state.currentPage - 1));
        document.getElementById('btnNextPage')?.addEventListener('click', () => goToPage(state.currentPage + 1));
        document.getElementById('btnLastPage')?.addEventListener('click', () => {
            const lastPage = Math.ceil(state.totalLogs / state.pageSize) - 1;
            goToPage(lastPage);
        });
        
        console.log('[AuditDashboard] Event listeners configurados');
    }

    /**
     * Carregar logs do backend
     */
    async function loadLogs() {
        showLoading();
        hideEmptyState();
        
        try {
            // Construir URL com parâmetros
            const params = new URLSearchParams({
                date: state.filters.date,
                limit: state.filters.limit,
                offset: state.currentPage * state.pageSize
            });
            
            if (state.filters.eventType) {
                params.append('event_type', state.filters.eventType);
            }
            
            const url = `${API_BASE_URL}/api/admin/logs?${params.toString()}`;
            console.log('[AuditDashboard] Carregando logs:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('[AuditDashboard] Logs recebidos:', data);
            
            state.logs = data.logs || [];
            state.totalLogs = data.total || 0;
            
            // Aplicar filtro de busca local (se houver)
            filterLogsLocally();
            
            // Renderizar
            renderLogs();
            updateStats();
            updatePagination();
            
        } catch (error) {
            console.error('[AuditDashboard] Erro ao carregar logs:', error);
            showError(`Erro ao carregar logs: ${error.message}`);
        } finally {
            hideLoading();
        }
    }

    /**
     * Filtrar logs localmente (busca textual)
     */
    function filterLogsLocally() {
        state.filteredLogs = state.logs;
        
        if (state.filters.search) {
            const searchLower = state.filters.search.toLowerCase();
            state.filteredLogs = state.logs.filter(log => {
                const message = (log.message || '').toLowerCase();
                const userEmail = (log.user_email || '').toLowerCase();
                const ipAddress = (log.ip_address || '').toLowerCase();
                const provider = (log.provider || '').toLowerCase();
                
                return message.includes(searchLower) ||
                       userEmail.includes(searchLower) ||
                       ipAddress.includes(searchLower) ||
                       provider.includes(searchLower);
            });
        }
    }

    /**
     * Renderizar logs na tela
     */
    function renderLogs() {
        const container = document.getElementById('logs-container');
        
        if (!state.filteredLogs || state.filteredLogs.length === 0) {
            showEmptyState();
            return;
        }
        
        container.innerHTML = state.filteredLogs.map(log => createLogEntry(log)).join('');
    }

    /**
     * Criar HTML para uma entrada de log
     */
    function createLogEntry(log) {
        const levelClass = getLogLevelClass(log);
        const eventBadge = getEventBadge(log);
        const timestamp = formatTimestamp(log.timestamp || log.created_at);
        const message = escapeHtml(log.message || 'Sem mensagem');
        
        return `
            <div class="log-entry ${levelClass}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="log-timestamp">
                            <i class="bi bi-clock"></i> ${timestamp}
                        </div>
                        <div class="log-message">
                            ${message}
                        </div>
                        <div class="log-metadata">
                            ${eventBadge}
                            ${log.user_email ? `<span class="badge bg-secondary me-2"><i class="bi bi-person"></i> ${escapeHtml(log.user_email)}</span>` : ''}
                            ${log.provider ? `<span class="badge bg-info me-2"><i class="bi bi-shield"></i> ${escapeHtml(log.provider)}</span>` : ''}
                            ${log.ip_address ? `<span class="badge bg-dark me-2"><i class="bi bi-geo-alt"></i> ${escapeHtml(log.ip_address)}</span>` : ''}
                        </div>
                    </div>
                    ${log.error ? `<div class="ms-3"><span class="badge bg-danger">ERRO</span></div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Determinar classe CSS baseada no nível do log
     */
    function getLogLevelClass(log) {
        const level = (log.level || '').toLowerCase();
        const message = (log.message || '').toLowerCase();
        
        if (level === 'error' || log.error || message.includes('error') || message.includes('falha')) {
            return 'level-error';
        }
        if (level === 'warning' || level === 'warn' || message.includes('warning')) {
            return 'level-warning';
        }
        if (message.includes('sucesso') || message.includes('success') || message.includes('completed')) {
            return 'level-success';
        }
        return 'level-info';
    }

    /**
     * Criar badge para tipo de evento
     */
    function getEventBadge(log) {
        const eventType = log.event_type || inferEventType(log.message || '');
        const badges = {
            'login': '<span class="badge-event bg-success"><i class="bi bi-box-arrow-in-right"></i> Login</span>',
            'logout': '<span class="badge-event bg-warning"><i class="bi bi-box-arrow-right"></i> Logout</span>',
            'token_refresh': '<span class="badge-event bg-info"><i class="bi bi-arrow-repeat"></i> Token Refresh</span>',
            'token_exchange': '<span class="badge-event bg-primary"><i class="bi bi-arrow-left-right"></i> Token Exchange</span>',
            'validation': '<span class="badge-event bg-secondary"><i class="bi bi-shield-check"></i> Validação</span>',
            'error': '<span class="badge-event bg-danger"><i class="bi bi-x-circle"></i> Erro</span>'
        };
        
        return badges[eventType] || '<span class="badge-event bg-secondary"><i class="bi bi-info-circle"></i> Info</span>';
    }

    /**
     * Inferir tipo de evento da mensagem
     */
    function inferEventType(message) {
        const msg = message.toLowerCase();
        if (msg.includes('login') || msg.includes('autenticação')) return 'login';
        if (msg.includes('logout') || msg.includes('revoked')) return 'logout';
        if (msg.includes('refresh')) return 'token_refresh';
        if (msg.includes('token') && msg.includes('exchange')) return 'token_exchange';
        if (msg.includes('validação') || msg.includes('validation')) return 'validation';
        if (msg.includes('error') || msg.includes('falha')) return 'error';
        return 'info';
    }

    /**
     * Formatar timestamp
     */
    function formatTimestamp(timestamp) {
        if (!timestamp) return 'Data desconhecida';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return timestamp;
        }
    }

    /**
     * Atualizar estatísticas
     */
    function updateStats() {
        let successCount = 0;
        let errorCount = 0;
        let warningCount = 0;
        
        state.filteredLogs.forEach(log => {
            const level = getLogLevelClass(log);
            if (level === 'level-success') successCount++;
            else if (level === 'level-error') errorCount++;
            else if (level === 'level-warning') warningCount++;
        });
        
        document.getElementById('success-count').textContent = successCount;
        document.getElementById('error-count').textContent = errorCount;
        document.getElementById('warning-count').textContent = warningCount;
        document.getElementById('total-count').textContent = state.filteredLogs.length;
    }

    /**
     * Atualizar paginação
     */
    function updatePagination() {
        const pagination = document.getElementById('pagination');
        const pageInfo = document.getElementById('pageInfo');
        const totalPages = Math.ceil(state.totalLogs / state.pageSize);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        pageInfo.textContent = `Página ${state.currentPage + 1} de ${totalPages}`;
        
        // Habilitar/desabilitar botões
        document.getElementById('btnFirstPage').disabled = state.currentPage === 0;
        document.getElementById('btnPrevPage').disabled = state.currentPage === 0;
        document.getElementById('btnNextPage').disabled = state.currentPage >= totalPages - 1;
        document.getElementById('btnLastPage').disabled = state.currentPage >= totalPages - 1;
    }

    /**
     * Navegar para página específica
     */
    function goToPage(page) {
        state.currentPage = Math.max(0, page);
        loadLogs();
    }

    /**
     * Aplicar filtros
     */
    function applyFilters() {
        state.filters.date = document.getElementById('dateFilter').value;
        state.filters.eventType = document.getElementById('eventTypeFilter').value;
        state.filters.search = document.getElementById('searchFilter').value;
        state.filters.limit = parseInt(document.getElementById('limitFilter').value);
        state.currentPage = 0;
        
        loadLogs();
    }

    /**
     * Resetar filtros
     */
    function resetFilters() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dateFilter').value = today;
        document.getElementById('eventTypeFilter').value = '';
        document.getElementById('searchFilter').value = '';
        document.getElementById('limitFilter').value = '100';
        
        state.filters = {
            date: today,
            eventType: '',
            search: '',
            limit: 100
        };
        state.currentPage = 0;
        
        loadLogs();
    }

    /**
     * Exportar logs
     */
    function exportLogs(format) {
        if (state.filteredLogs.length === 0) {
            alert('Nenhum log para exportar');
            return;
        }
        
        let content, filename, mimeType;
        
        if (format === 'json') {
            content = JSON.stringify(state.filteredLogs, null, 2);
            filename = `audit-logs-${state.filters.date}.json`;
            mimeType = 'application/json';
        } else if (format === 'csv') {
            content = convertToCSV(state.filteredLogs);
            filename = `audit-logs-${state.filters.date}.csv`;
            mimeType = 'text/csv';
        }
        
        downloadFile(content, filename, mimeType);
    }

    /**
     * Converter logs para CSV
     */
    function convertToCSV(logs) {
        const headers = ['Timestamp', 'Event Type', 'Message', 'User', 'Provider', 'IP Address'];
        const rows = logs.map(log => [
            log.timestamp || log.created_at || '',
            log.event_type || '',
            (log.message || '').replace(/"/g, '""'),
            log.user_email || '',
            log.provider || '',
            log.ip_address || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    /**
     * Download de arquivo
     */
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Mostrar loading
     */
    function showLoading() {
        document.getElementById('loading-spinner').style.display = 'block';
        document.getElementById('logs-container').style.display = 'none';
    }

    /**
     * Esconder loading
     */
    function hideLoading() {
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('logs-container').style.display = 'block';
    }

    /**
     * Mostrar empty state
     */
    function showEmptyState() {
        document.getElementById('logs-container').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }

    /**
     * Esconder empty state
     */
    function hideEmptyState() {
        document.getElementById('empty-state').style.display = 'none';
    }

    /**
     * Mostrar erro
     */
    function showError(message) {
        const container = document.getElementById('logs-container');
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle"></i>
                <strong>Erro:</strong> ${escapeHtml(message)}
            </div>
        `;
    }

    /**
     * Escape HTML para prevenir XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    console.log('[AuditDashboard] Módulo carregado');
})();
