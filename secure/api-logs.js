/**
 * api-logs.js - API simples para acessar logs OIDC remotamente
 */

// Função para criar endpoint de logs
function createLogsAPI() {
    // Verificar se o logger existe
    if (!window.OIDCLogger) {
        console.warn('OIDCLogger não encontrado');
        return;
    }

    // Criar namespace para API
    window.OIDCLogsAPI = {
        // Obter resumo dos logs
        getSummary() {
            return window.OIDCLogger.getLogsSummary();
        },

        // Obter logs com filtros
        getLogs(filters = {}) {
            let logs = window.OIDCLogger.logs || [];
            
            // Aplicar filtros
            if (filters.level) {
                const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
                const minIndex = levels.indexOf(filters.level);
                logs = logs.filter(log => levels.indexOf(log.level) <= minIndex);
            }
            
            if (filters.provider) {
                logs = logs.filter(log => {
                    const provider = log.context?.currentProvider || log.data?.provider;
                    return provider === filters.provider;
                });
            }
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                logs = logs.filter(log => {
                    const searchText = `${log.message} ${JSON.stringify(log.data)}`.toLowerCase();
                    return searchText.includes(searchLower);
                });
            }
            
            if (filters.since) {
                const sinceDate = new Date(filters.since);
                logs = logs.filter(log => new Date(log.timestamp) >= sinceDate);
            }
            
            if (filters.limit) {
                logs = logs.slice(-filters.limit);
            }
            
            return logs;
        },

        // Obter apenas erros recentes
        getErrors(limit = 10) {
            return this.getLogs({ level: 'ERROR', limit });
        },

        // Obter logs por período
        getLogsByPeriod(hours = 1) {
            const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
            return this.getLogs({ since: since.toISOString() });
        },

        // Exportar logs
        exportLogs(format = 'json') {
            return window.OIDCLogger.exportLogs(format);
        },

        // Verificar saúde do sistema
        getHealthCheck() {
            const summary = this.getSummary();
            const recentErrors = this.getLogsByPeriod(1).filter(log => log.level === 'ERROR');
            
            return {
                status: recentErrors.length === 0 ? 'healthy' : 'warning',
                timestamp: new Date().toISOString(),
                totalLogs: summary.totalLogs,
                recentErrors: recentErrors.length,
                sessionDuration: summary.duration,
                currentProvider: summary.provider
            };
        }
    };

    console.log('OIDC Logs API carregada. Use window.OIDCLogsAPI para acesso programático.');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createLogsAPI);
} else {
    createLogsAPI();
}

// Para uso em bookmarklet ou console
window.getOIDCLogs = function(options = {}) {
    if (!window.OIDCLogsAPI) {
        return { error: 'API não carregada' };
    }
    
    return {
        summary: window.OIDCLogsAPI.getSummary(),
        logs: window.OIDCLogsAPI.getLogs(options),
        health: window.OIDCLogsAPI.getHealthCheck()
    };
};

export default window.OIDCLogsAPI;