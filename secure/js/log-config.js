// Configuração de logging para produção
window.OIDC_LOG_CONFIG = {
  logLevel: 'INFO',
  consoleLogging: true,
  debugPanel: false,
  autoSave: true,
  maxLogs: 1000,
  saveInterval: 30000, // 30 segundos
  environment: 'production',
  baseUrl: window.location.origin || 'https://www.caracore.com.br'
};

// Configuração para desenvolvimento
window.OIDC_CDN_FALLBACK = false;
