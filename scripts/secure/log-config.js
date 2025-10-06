// Configuração de logging para development
window.OIDC_LOG_CONFIG = {
  logLevel: 'DEBUG',
  consoleLogging: true,
  debugPanel: true,
  autoSave: true,
  maxLogs: 1000,
  saveInterval: 30000, // 30 segundos
  environment: 'development',
  baseUrl: 'http://localhost:8000'
};

// Configuração para desenvolvimento
window.OIDC_CDN_FALLBACK = false;
