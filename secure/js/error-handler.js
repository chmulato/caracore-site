/**
 * error-handler.js - Gerenciador de erros para autenticação OIDC
 * Implementa detecção de timeout e mecanismos de recuperação
 */

class AuthErrorHandler {
  constructor(config = {}) {
    // Configurações padrão
    this.config = {
      // Tempo máximo de espera para redirecionamento (em ms)
      redirectTimeout: 30000,
      // Tempo máximo de espera para resposta do servidor (em ms)
      serverResponseTimeout: 15000,
      // Número máximo de tentativas automáticas
      maxAutoRetries: 2,
      // Intervalo entre tentativas (em ms)
      retryInterval: 2000,
      // Logger (opcional)
      logger: console,
      // Função de callback para erros críticos
      onCriticalError: null,
      // Sobrescrever com as configurações fornecidas
      ...config
    };

    this.activeTimeouts = new Map();
    this.retryCount = 0;
    this.lastError = null;
    this.errorCategories = {
      TIMEOUT: 'timeout',
      NETWORK: 'network',
      AUTHENTICATION: 'authentication',
      AUTHORIZATION: 'authorization',
      CONFIGURATION: 'configuration',
      UNKNOWN: 'unknown'
    };
  }

  /**
   * Inicia um timeout para o processo de redirecionamento
   * @param {string} operationId - ID da operação (ex: 'google-login', 'microsoft-login')
   * @param {Function} onTimeout - Função a ser executada em caso de timeout
   * @returns {string} ID do timeout para posterior cancelamento
   */
  startRedirectTimeout(operationId, onTimeout) {
    const timeoutId = setTimeout(() => {
      this.handleTimeout(operationId, onTimeout);
    }, this.config.redirectTimeout);

    const id = `redirect-${operationId}-${Date.now()}`;
    this.activeTimeouts.set(id, timeoutId);
    this.config.logger.debug(`Timeout de redirecionamento iniciado: ${id}`);
    
    return id;
  }

  /**
   * Cancela um timeout ativo
   * @param {string} timeoutId - ID do timeout a ser cancelado
   */
  clearTimeout(timeoutId) {
    if (this.activeTimeouts.has(timeoutId)) {
      clearTimeout(this.activeTimeouts.get(timeoutId));
      this.activeTimeouts.delete(timeoutId);
      this.config.logger.debug(`Timeout cancelado: ${timeoutId}`);
    }
  }

  /**
   * Manipula uma situação de timeout
   * @param {string} operationId - ID da operação que sofreu timeout
   * @param {Function} onTimeout - Função a ser executada em caso de timeout
   */
  handleTimeout(operationId, onTimeout) {
    this.lastError = {
      category: this.errorCategories.TIMEOUT,
      code: 'redirect_timeout',
      operation: operationId,
      message: `A operação ${operationId} excedeu o tempo limite de ${this.config.redirectTimeout/1000}s`,
      timestamp: new Date().toISOString()
    };

    this.config.logger.error('Timeout detectado', this.lastError);

    // Verifica se deve tentar automaticamente
    if (this.retryCount < this.config.maxAutoRetries) {
      this.retryCount++;
      this.config.logger.info(`Tentativa automática ${this.retryCount}/${this.config.maxAutoRetries}`);
      
      if (typeof onTimeout === 'function') {
        setTimeout(() => onTimeout(this.lastError, this.retryCount), this.config.retryInterval);
      }
    } else {
      this.config.logger.error('Número máximo de tentativas excedido');
      
      if (typeof this.config.onCriticalError === 'function') {
        this.config.onCriticalError(this.lastError);
      }
    }
  }

  /**
   * Categoriza um erro com base na mensagem e contexto
   * @param {Error|Object|string} error - Erro a ser categorizado
   * @param {string} context - Contexto em que o erro ocorreu
   * @returns {Object} Objeto de erro categorizado
   */
  categorizeError(error, context = 'unknown') {
    let category = this.errorCategories.UNKNOWN;
    let code = 'unknown_error';
    let message = 'Erro desconhecido';
    
    // Normaliza o erro em uma string para análise
    const errorString = typeof error === 'string' 
      ? error 
      : (error?.message || error?.error_description || JSON.stringify(error));
    
    const normalizedError = errorString.toLowerCase();

    // Detecta problemas de rede
    if (normalizedError.includes('network') || 
        normalizedError.includes('connection') ||
        normalizedError.includes('offline') ||
        normalizedError.includes('unreachable') ||
        normalizedError.includes('timeout')) {
      category = this.errorCategories.NETWORK;
      code = 'network_error';
      message = 'Erro de conexão com o servidor de autenticação';
    } 
    // Detecta problemas de autenticação
    else if (normalizedError.includes('auth') || 
             normalizedError.includes('login') || 
             normalizedError.includes('signin')) {
      category = this.errorCategories.AUTHENTICATION;
      code = 'auth_error';
      message = 'Falha no processo de autenticação';
    }
    // Detecta problemas de autorização
    else if (normalizedError.includes('permission') || 
             normalizedError.includes('denied') ||
             normalizedError.includes('unauthorized') ||
             normalizedError.includes('forbidden')) {
      category = this.errorCategories.AUTHORIZATION;
      code = 'authorization_error';
      message = 'Acesso não autorizado';
    }
    // Detecta problemas de configuração
    else if (normalizedError.includes('config') || 
             normalizedError.includes('settings') ||
             normalizedError.includes('setup')) {
      category = this.errorCategories.CONFIGURATION;
      code = 'configuration_error';
      message = 'Problema na configuração do sistema de autenticação';
    }

    // Erros específicos da Microsoft
    if (normalizedError.includes('aadsts9002346') || normalizedError.includes('/consumers endpoint')) {
      category = this.errorCategories.AUTHORIZATION;
      code = 'microsoft_account_type_error';
      message = 'Conta Microsoft corporativa não permitida. Use apenas contas pessoais (@outlook.com, @hotmail.com)';
    }

    // Retorna o erro categorizado
    return {
      category,
      code,
      originalError: error,
      message,
      context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Processa um erro e decide a ação apropriada
   * @param {Error|Object|string} error - Erro a ser processado
   * @param {string} context - Contexto em que o erro ocorreu
   * @param {Function} onRecoverableError - Callback para erros recuperáveis
   * @returns {Object} Objeto com detalhes do erro e ações recomendadas
   */
  processError(error, context = 'unknown', onRecoverableError = null) {
    const categorizedError = this.categorizeError(error, context);
    this.lastError = categorizedError;
    
    this.config.logger.error('Erro processado:', categorizedError);
    
    // Determina se o erro é recuperável
    let isRecoverable = [
      this.errorCategories.TIMEOUT,
      this.errorCategories.NETWORK
    ].includes(categorizedError.category);
    
    // Aumenta contador de tentativas para erros recuperáveis
    if (isRecoverable) {
      if (this.retryCount < this.config.maxAutoRetries) {
        this.retryCount++;
        this.config.logger.info(`Tentativa automática ${this.retryCount}/${this.config.maxAutoRetries}`);
        
        if (typeof onRecoverableError === 'function') {
          setTimeout(() => onRecoverableError(categorizedError, this.retryCount), this.config.retryInterval);
        }
      } else {
        isRecoverable = false;
        this.config.logger.error('Número máximo de tentativas excedido');
      }
    }

    // Notifica sobre erros críticos
    if (!isRecoverable && typeof this.config.onCriticalError === 'function') {
      this.config.onCriticalError(categorizedError);
    }

    return {
      ...categorizedError,
      isRecoverable,
      retryCount: this.retryCount,
      maxRetries: this.config.maxAutoRetries
    };
  }

  /**
   * Reseta o contador de tentativas
   */
  resetRetryCount() {
    this.retryCount = 0;
  }

  /**
   * Gera uma mensagem amigável para o usuário com base no erro
   * @param {Object} error - Erro categorizado
   * @returns {string} Mensagem amigável
   */
  getFriendlyErrorMessage(error = this.lastError) {
    if (!error) return 'Ocorreu um erro inesperado';
    
    switch (error.category) {
      case this.errorCategories.TIMEOUT:
        return 'O tempo limite de espera foi excedido. Verifique sua conexão com a internet e tente novamente.';
      
      case this.errorCategories.NETWORK:
        return 'Não foi possível conectar ao servidor de autenticação. Verifique sua conexão com a internet.';
      
      case this.errorCategories.AUTHENTICATION:
        return 'Houve um problema no processo de autenticação. Tente novamente ou use outro provedor.';
      
      case this.errorCategories.AUTHORIZATION:
        if (error.code === 'microsoft_account_type_error') {
          return 'Esta área requer contas pessoais Microsoft (@outlook.com, @hotmail.com). Contas corporativas não são permitidas.';
        }
        return 'Você não tem autorização para acessar esta área.';
      
      case this.errorCategories.CONFIGURATION:
        return 'Existe um problema na configuração do sistema de autenticação. Entre em contato com o suporte.';
      
      default:
        return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
  }
}

// Exportar para uso global
window.AuthErrorHandler = new AuthErrorHandler({
  logger: window.logOIDC || console
});

console.log('✅ Error Handler inicializado e disponível em window.AuthErrorHandler');