/**
 * logger.js - Sistema de logging para autenticação OIDC
 * Rastreia eventos, erros e debug info para troubleshooting
 */

class OIDCLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Máximo de logs em memória
        this.sessionId = this.generateSessionId();
        this.startTime = new Date();
        
        // Configurações de log
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3,
            TRACE: 4
        };
        
        this.currentLevel = this.logLevels.INFO;
        
        // Inicializar
        this.init();
    }
    
    init() {
        // Log inicial com contexto ampliado
        try {
            const ctx = this.getClientContext();
            this.info('OIDCLogger inicializado', Object.assign({
                sessionId: this.sessionId,
                timestamp: this.startTime.toISOString()
            }, ctx));
        } catch (e) {
            // degrade gracefully
            this.info('OIDCLogger inicializado', {
                sessionId: this.sessionId,
                timestamp: this.startTime.toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        }
        
        // Capturar erros globais
        this.setupGlobalErrorHandling();
        
        // Salvar logs periodicamente
        this.setupPeriodicSave();
    }
    
    generateSessionId() {
        return 'oidc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Gera um hash simples (não-criptográfico) para reduzir exposição do userAgent
    simpleHash(str) {
        try {
            let h = 5381;
            for (let i = 0; i < str.length; i++) {
                h = ((h << 5) + h) + str.charCodeAt(i); /* h * 33 + c */
            }
            // Convert to hex and return last 8 chars for compactness
            return ('00000000' + (h >>> 0).toString(16)).slice(-8);
        } catch (e) {
            return 'hx00000000';
        }
    }

    // Retorna um objeto com metadados do cliente/contexto para anexar aos logs
    getClientContext() {
        const ctx = {};
        try {
            ctx.userAgent = navigator.userAgent.substring(0, 200);
            ctx.userAgentHash = this.simpleHash(navigator.userAgent || '');
            ctx.url = window.location.href;
            ctx.pageTitle = document.title || '';
            ctx.referrer = document.referrer || '';
            ctx.language = navigator.language || '';
            ctx.languages = navigator.languages ? navigator.languages.slice(0,5) : [];
            try { ctx.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch(e) { ctx.timezone = ''; }
            ctx.platform = navigator.platform || '';
            ctx.vendor = navigator.vendor || '';
            // Device hints
            ctx.screen = {
                width: (window.screen && window.screen.width) || null,
                height: (window.screen && window.screen.height) || null,
                colorDepth: (window.screen && window.screen.colorDepth) || null
            };
            ctx.deviceMemory = navigator.deviceMemory || null;
            ctx.hardwareConcurrency = navigator.hardwareConcurrency || null;
            ctx.cookieEnabled = navigator.cookieEnabled || false;

            // Network information (may be undefined in some browsers)
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
            if (conn) {
                ctx.connection = {
                    effectiveType: conn.effectiveType || null,
                    downlink: conn.downlink || null,
                    rtt: conn.rtt || null
                };
            }

            // app / deployment info (optional overrides)
            ctx.appVersion = (window.CARA_CORE_CONFIG && window.CARA_CORE_CONFIG.appVersion) || window.APP_VERSION || null;
            // environment guess: local, staging, production
            const host = window.location.hostname || '';
            if (host === 'localhost' || host.startsWith('127.0.0.1')) ctx.environment = 'development';
            else if (host.includes('github.io') || host.includes('vercel') || host.includes('netlify')) ctx.environment = 'staging';
            else ctx.environment = 'production';

            // approximate storage usage (number of keys)
            try {
                ctx.localStorageKeys = Object.keys(localStorage || {}).length;
            } catch (e) {
                ctx.localStorageKeys = null;
            }

            // keep a short fingerprint that is not reversible
            ctx.fingerprint = this.simpleHash((navigator.userAgent || '') + '|' + (window.location.hostname || ''));

            return ctx;
        } catch (e) {
            return { _client_context_error: true };
        }
    }
    
    setupGlobalErrorHandling() {
        // Capturar erros JavaScript não tratados
        window.addEventListener('error', (event) => {
            this.error('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        // Capturar promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason,
                stack: event.reason?.stack
            });
        });
    }
    
    setupPeriodicSave() {
        // Salvar logs a cada 30 segundos
        setInterval(() => {
            this.saveToLocalStorage();
        }, 30000);
        
        // Salvar antes de sair da página
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    }
    
    createLogEntry(level, message, data = {}) {
        // sanitize incoming data before attaching to log entry
        const safeData = this.sanitizeData(data);
        // attach client context (non-sensitive and capped)
        const clientCtx = this.getClientContext();

        const logEntry = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            data: safeData,
            client: clientCtx
        };
        
        // Adicionar informações de contexto se disponível
        if (window.OIDCAuth) {
            logEntry.context = {
                currentProvider: window.OIDCAuth.manager?.currentProvider,
                isInitialized: window.OIDCAuth.manager?.isInitialized
            };
        }
        
        return logEntry;
    }

    // Sanitiza objetos de dados removendo campos sensíveis configurados
    sanitizeData(obj) {
        try {
            if (!obj || typeof obj !== 'object') return obj;

            // Deep clone to avoid mutating original
            const clone = JSON.parse(JSON.stringify(obj));
            const redactFields = (window.OIDC_LOG_CONFIG && window.OIDC_LOG_CONFIG.redactFields) || ['access_token','id_token','password','ssn','token'];

            const walk = (o) => {
                if (!o || typeof o !== 'object') return;
                Object.keys(o).forEach(k => {
                    if (redactFields.includes(k)) {
                        o[k] = '<<REDACTED>>';
                    } else if (typeof o[k] === 'object') {
                        walk(o[k]);
                    }
                });
            };

            walk(clone);
            return clone;
        } catch (e) {
            // If anything goes wrong, return a safe placeholder
            return { _sanitization_error: true };
        }
    }
    
    addLog(level, message, data = {}) {
        if (this.logLevels[level] > this.currentLevel) {
            return; // Nível muito baixo, não logar
        }
        
        const logEntry = this.createLogEntry(level, message, data);
        
        // Adicionar ao array em memória
        this.logs.push(logEntry);
        
        // Manter apenas os logs mais recentes
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // Log no console também
        this.logToConsole(logEntry);
        
        // Salvar logs críticos imediatamente
        if (level === 'ERROR' || level === 'WARN') {
            this.saveToLocalStorage();
        }
    }
    
    logToConsole(logEntry) {
        const { level, message, data } = logEntry;
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        const prefix = `[OIDC ${level}] ${timestamp}:`;
        
        switch (level) {
            case 'ERROR':
                console.error(prefix, message, data);
                break;
            case 'WARN':
                console.warn(prefix, message, data);
                break;
            case 'INFO':
                console.info(prefix, message, data);
                break;
            case 'DEBUG':
            case 'TRACE':
                console.log(prefix, message, data);
                break;
            default:
                console.log(prefix, message, data);
        }
    }
    
    // Métodos públicos de logging
    error(message, data = {}) {
        this.addLog('ERROR', message, data);
    }
    
    warn(message, data = {}) {
        this.addLog('WARN', message, data);
    }
    
    info(message, data = {}) {
        this.addLog('INFO', message, data);
    }
    
    debug(message, data = {}) {
        this.addLog('DEBUG', message, data);
    }
    
    trace(message, data = {}) {
        this.addLog('TRACE', message, data);
    }
    
    // Métodos especializados para eventos OIDC
    authEvent(event, data = {}) {
        this.info(`Auth Event: ${event}`, {
            event: event,
            provider: this.getCurrentProvider(),
            ...data
        });
    }
    
    authError(error, context = {}) {
        this.error('Authentication Error', {
            error: error.message || error,
            stack: error.stack,
            provider: this.getCurrentProvider(),
            context: context
        });
    }
    
    tokenEvent(event, data = {}) {
        this.debug(`Token Event: ${event}`, {
            event: event,
            provider: this.getCurrentProvider(),
            ...data
        });
    }
    
    getCurrentProvider() {
        return window.OIDCAuth?.manager?.currentProvider || 'unknown';
    }
    
    // Persistência
    saveToLocalStorage() {
        try {
            const logData = {
                sessionId: this.sessionId,
                startTime: this.startTime.toISOString(),
                logs: this.logs.slice(-100), // Salvar apenas os 100 mais recentes
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('oidc_logs', JSON.stringify(logData));
            localStorage.setItem('oidc_logs_count', this.logs.length.toString());
        } catch (error) {
            console.error('Erro ao salvar logs:', error);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('oidc_logs');
            if (saved) {
                const logData = JSON.parse(saved);
                this.info('Logs anteriores carregados', {
                    previousSession: logData.sessionId,
                    logCount: logData.logs.length,
                    savedAt: logData.savedAt
                });
                
                return logData.logs;
            }
        } catch (error) {
            this.error('Erro ao carregar logs salvos', { error: error.message });
        }
        
        return [];
    }
    
    // Relatórios e análise
    getLogsSummary() {
        const summary = {
            sessionId: this.sessionId,
            totalLogs: this.logs.length,
            startTime: this.startTime.toISOString(),
            duration: Date.now() - this.startTime.getTime(),
            levels: {},
            recentErrors: [],
            provider: this.getCurrentProvider()
        };
        
        // Contar por nível
        this.logs.forEach(log => {
            summary.levels[log.level] = (summary.levels[log.level] || 0) + 1;
        });
        
        // Últimos erros
        summary.recentErrors = this.logs
            .filter(log => log.level === 'ERROR')
            .slice(-5)
            .map(log => ({
                timestamp: log.timestamp,
                message: log.message,
                data: log.data
            }));
        
        return summary;
    }

    // Retorna um snapshot completo (summary + most recent log + client context)
    snapshot() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime.toISOString(),
            timestamp: new Date().toISOString(),
            clientContext: this.getClientContext(),
            summary: this.getLogsSummary(),
            lastLog: this.logs.length ? this.logs[this.logs.length - 1] : null
        };
    }
    
    exportLogs(format = 'json') {
        const summary = this.getLogsSummary();
        const exportData = {
            summary: summary,
            logs: this.logs
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            
            case 'csv':
                return this.logsToCSV(this.logs);
            
            case 'text':
                return this.logsToText(this.logs);
            
            default:
                return JSON.stringify(exportData, null, 2);
        }
    }
    
    logsToCSV(logs) {
        const headers = ['Timestamp', 'Level', 'Message', 'Provider', 'URL', 'Data'];
        const rows = logs.map(log => [
            log.timestamp,
            log.level,
            log.message.replace(/"/g, '""'), // Escape aspas
            log.context?.currentProvider || '',
            log.url,
            JSON.stringify(log.data).replace(/"/g, '""')
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }
    
    logsToText(logs) {
        return logs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            return `[${timestamp}] ${log.level}: ${log.message}\n  Data: ${JSON.stringify(log.data, null, 2)}\n`;
        }).join('\n');
    }
    
    // Download de logs
    downloadLogs(format = 'json') {
        const content = this.exportLogs(format);
        const filename = `oidc_logs_${this.sessionId}.${format}`;
        
        const blob = new Blob([content], { 
            type: format === 'json' ? 'application/json' : 'text/plain' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.info('Logs exportados', { filename, format, logCount: this.logs.length });
    }

    // Envia logs para um endpoint remoto configurado (se presente)
    async flushToServer() {
        try {
            const endpoint = (window.OIDC_LOG_CONFIG && window.OIDC_LOG_CONFIG.remoteEndpoint) || null;
            if (!endpoint) {
                this.info('Nenhum endpoint remoto configurado para envio de logs');
                return { ok: false, reason: 'no_endpoint' };
            }

            const payload = {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                logs: this.logs.slice(-200) // enviar até 200
            };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                this.warn('Falha ao enviar logs para servidor', { status: res.status });
                return { ok: false, status: res.status };
            }

            this.info('Logs enviados com sucesso', { sent: payload.logs.length });
            return { ok: true };
        } catch (e) {
            this.error('Erro ao enviar logs', { error: e.message });
            return { ok: false, error: e.message };
        }
    }

    // Setup opcional para envio periódico remoto
    setupRemoteFlush() {
        const cfg = window.OIDC_LOG_CONFIG || {};
        if (cfg.remoteEndpoint && cfg.remoteInterval && Number(cfg.remoteInterval) > 0) {
            if (this._remoteFlushId) clearInterval(this._remoteFlushId);
            this._remoteFlushId = setInterval(() => this.flushToServer(), Number(cfg.remoteInterval));
            this.info('Remote flush configurado', { endpoint: cfg.remoteEndpoint, interval: cfg.remoteInterval });
        }
    }
    
    // Limpeza
    clearLogs() {
        const clearedCount = this.logs.length;
        this.logs = [];
        localStorage.removeItem('oidc_logs');
        localStorage.removeItem('oidc_logs_count');
        
        this.info('Logs limpos', { clearedCount });
    }
    
    // Configuração de nível de log
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLevel = this.logLevels[level];
            this.info('Nível de log alterado', { newLevel: level });
        } else {
            this.warn('Nível de log inválido', { requestedLevel: level, availableLevels: Object.keys(this.logLevels) });
        }
    }
}

// Merge default runtime config with window override
window.OIDC_LOG_CONFIG = Object.assign({
    redactFields: ['access_token','id_token','password','ssn','token'],
    remoteEndpoint: null,
    remoteInterval: 0
}, (window.OIDC_LOG_CONFIG && typeof window.OIDC_LOG_CONFIG === 'object') ? window.OIDC_LOG_CONFIG : {});

// Instância global
const oidcLogger = new OIDCLogger();

// Setup remote flush if configured
oidcLogger.setupRemoteFlush();

// Expor globalmente
window.OIDCLogger = oidcLogger;

// Interface simplificada para uso comum
window.logOIDC = {
    error: (msg, data) => oidcLogger.error(msg, data),
    warn: (msg, data) => oidcLogger.warn(msg, data),
    info: (msg, data) => oidcLogger.info(msg, data),
    debug: (msg, data) => oidcLogger.debug(msg, data),
    
    // Eventos específicos
    authEvent: (event, data) => oidcLogger.authEvent(event, data),
    authError: (error, context) => oidcLogger.authError(error, context),
    tokenEvent: (event, data) => oidcLogger.tokenEvent(event, data),
    
    // Relatórios
    summary: () => oidcLogger.getLogsSummary(),
    export: (format) => oidcLogger.downloadLogs(format),
    clear: () => oidcLogger.clearLogs(),
    
    // Configuração
    setLevel: (level) => oidcLogger.setLogLevel(level)
    ,
    // Envia logs agora para endpoint remoto (se configurado)
    sendNow: () => oidcLogger.flushToServer()
};

console.log('OIDC Logger carregado. Use window.logOIDC para logging ou window.OIDCLogger para controle avançado.');