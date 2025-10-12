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
    
    // Verificar se temos o auth-force-recognition disponível como fallback
    const hasForceRecognition = typeof window.forceAuthRecognition === 'function';
    
    // Normaliza o erro em uma string para análise
    const errorString = typeof error === 'string' 
      ? error 
      : (error?.message || error?.error_description || JSON.stringify(error));
    
    const normalizedError = errorString.toLowerCase();
    
    // Detecta popups bloqueados ou fechados
    if (normalizedError.includes('popup') && (normalizedError.includes('block') || normalizedError.includes('denied'))) {
      category = this.errorCategories.AUTHENTICATION;
      code = 'popup_blocked';
      message = 'Popup de autenticação bloqueado pelo navegador';
    }
    else if (normalizedError.includes('popup') && normalizedError.includes('closed')) {
      category = this.errorCategories.AUTHENTICATION;
      code = 'popup_closed';
      message = 'Popup de autenticação fechado antes da conclusão';
    }
    // Detecta timeout de redirecionamento
    else if ((normalizedError.includes('timeout') || normalizedError.includes('timed out')) && 
             normalizedError.includes('redirect')) {
      category = this.errorCategories.TIMEOUT;
      code = 'redirect_timeout';
      message = 'Timeout no redirecionamento para o provedor de identidade';
    }
    // Detecta timeout de resposta
    else if ((normalizedError.includes('timeout') || normalizedError.includes('timed out')) && 
             (normalizedError.includes('response') || normalizedError.includes('server'))) {
      category = this.errorCategories.TIMEOUT;
      code = 'response_timeout';
      message = 'Timeout na resposta do servidor de autenticação';
    }
    // Detecta problemas de cookies
    else if (normalizedError.includes('cookie') || normalizedError.includes('third party') || 
             normalizedError.includes('3rd party') || normalizedError.includes('storage access')) {
      category = this.errorCategories.AUTHENTICATION;
      code = 'cookie_blocked';
      message = 'Cookies necessários para autenticação estão bloqueados';
    }
    // Detecta problemas CORS
    else if (normalizedError.includes('cors') || normalizedError.includes('cross-origin')) {
      category = this.errorCategories.NETWORK;
      code = 'cors_error';
      message = 'Erro de política de segurança do navegador (CORS)';
    }
    // Detecta problemas de rede
    else if (normalizedError.includes('network') || 
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
    
    // Erros específicos do Google
    if (normalizedError.includes('idpiframe') || normalizedError.includes('gsi')) {
      category = this.errorCategories.AUTHENTICATION;
      code = 'google_auth_error';
      message = 'Erro na biblioteca de autenticação do Google';
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
    
    // Verificar se temos o auth-force-recognition disponível como fallback
    const hasForceRecognition = typeof window.forceAuthRecognition === 'function';
    
    // Determina se o erro é recuperável
    let isRecoverable = [
      this.errorCategories.TIMEOUT,
      this.errorCategories.NETWORK
    ].includes(categorizedError.category);
    
    // Para erros de autenticação e autorização, verificar se podemos usar o force-recognition
    if ([this.errorCategories.AUTHENTICATION, this.errorCategories.AUTHORIZATION].includes(categorizedError.category)) {
      if (hasForceRecognition) {
        isRecoverable = true;
        this.config.logger.info('Force Recognition disponível para recuperação de autenticação');
        
        // Tentar recuperar com Force Recognition
        try {
          window.forceAuthRecognition();
          this.config.logger.info('Force Recognition aplicado');
        } catch (forceError) {
          this.config.logger.error('Erro ao aplicar Force Recognition:', forceError);
        }
      }
    }
    
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
        
        // Última tentativa com Force Recognition se disponível
        if (hasForceRecognition && !context.includes('force_recognition')) {
          this.config.logger.info('Tentando recuperação final com Force Recognition');
          try {
            window.forceAuthRecognition();
            setTimeout(() => window.location.reload(), 1500);
          } catch (forceError) {
            this.config.logger.error('Erro na recuperação final com Force Recognition:', forceError);
          }
        }
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
    
    // Obter o código e a mensagem original para análise mais detalhada
    const code = error.code || '';
    const originalMessage = typeof error.originalError === 'string' 
      ? error.originalError.toLowerCase() 
      : (error.originalError?.message || '').toLowerCase();
    
    switch (error.category) {
      case this.errorCategories.TIMEOUT:
        if (originalMessage.includes('redirect')) {
          return 'O redirecionamento para o provedor está demorando muito. Isso pode ocorrer devido à sua conexão ou cookies bloqueados. Tente verificar suas configurações de privacidade.';
        } else if (originalMessage.includes('server')) {
          return 'O servidor de autenticação está demorando para responder. Tente novamente em alguns instantes.';
        }
        return 'O tempo limite de espera foi excedido. Verifique sua conexão com a internet e tente novamente.';
      
      case this.errorCategories.NETWORK:
        if (originalMessage.includes('cors')) {
          return 'Bloqueio de segurança de navegador detectado. Verifique se você está usando HTTPS ou se está em um ambiente permitido.';
        } else if (originalMessage.includes('ssl') || originalMessage.includes('certificate')) {
          return 'Problema de segurança na conexão. Verifique se seu navegador está atualizado ou tente outro navegador.';
        } else if (originalMessage.includes('offline') || originalMessage.includes('disconnected')) {
          return 'Você parece estar offline. Verifique sua conexão com a internet e tente novamente.';
        }
        return 'Não foi possível conectar ao servidor de autenticação. Verifique sua conexão com a internet.';
      
      case this.errorCategories.AUTHENTICATION:
        if (code === 'popup_closed') {
          return 'A janela de autenticação foi fechada antes da conclusão. Por favor, mantenha a janela aberta até o final do processo.';
        } else if (code === 'popup_blocked') {
          return 'O bloqueador de pop-ups impediu a abertura da janela de autenticação. Por favor, permita pop-ups para este site e tente novamente.';
        } else if (originalMessage.includes('token') && originalMessage.includes('expired')) {
          return 'Sua sessão expirou. Por favor, faça login novamente.';
        } else if (originalMessage.includes('invalid_grant')) {
          return 'O código de autorização expirou ou é inválido. Isso geralmente ocorre quando o processo de login demora muito. Tente novamente.';
        } else if (originalMessage.includes('cookies') || originalMessage.includes('third party')) {
          return 'Seu navegador pode estar bloqueando cookies necessários para autenticação. Verifique suas configurações de privacidade.';
        }
        return 'Houve um problema no processo de autenticação. Tente novamente ou use outro provedor.';
      
      case this.errorCategories.AUTHORIZATION:
        if (code === 'microsoft_account_type_error') {
          return 'Esta área requer contas pessoais Microsoft (@outlook.com, @hotmail.com). Contas corporativas não são permitidas.';
        } else if (code === 'google_account_type_error') {
          return 'Esta conta do Google não tem permissão para acessar este recurso. Tente outra conta ou método de autenticação.';
        } else if (originalMessage.includes('access_denied')) {
          return 'Acesso negado pelo provedor de identidade. Você pode ter recusado permissão ou sua conta não tem acesso.';
        } else if (originalMessage.includes('scope')) {
          return 'Permissões insuficientes para acessar este recurso. Tente fazer login novamente aceitando todas as permissões.';
        }
        return 'Você não tem autorização para acessar esta área.';
      
      case this.errorCategories.CONFIGURATION:
        if (originalMessage.includes('client_id')) {
          return 'Configuração incorreta do sistema de autenticação. Por favor, informe ao administrador sobre um problema com o Client ID.';
        } else if (originalMessage.includes('redirect_uri')) {
          return 'Configuração incorreta do sistema de autenticação. Por favor, informe ao administrador sobre um problema com a URL de redirecionamento.';
        }
        return 'Existe um problema na configuração do sistema de autenticação. Entre em contato com o suporte técnico.';
      
      default:
        return 'Ocorreu um erro inesperado. Tente novamente mais tarde ou contate o suporte se o problema persistir.';
    }
  }
}

// Exportar para uso global
window.AuthErrorHandler = new AuthErrorHandler({
  logger: window.logOIDC || console
});

console.log('✅ Error Handler inicializado e disponível em window.AuthErrorHandler');