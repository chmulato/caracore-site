/**
 * ui-feedback.js - Gerenciador de feedback visual para autenticação OIDC
 * Fornece feedback visual ao usuário durante o processo de autenticação
 */

class AuthUIFeedback {
  constructor() {
    // Estado atual da autenticação
    this.currentState = 'idle';
    this.stateTimestamps = {};
    
    // Elementos UI
    this.elements = {
      body: document.body,
      authScreen: document.getElementById('authScreen'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      authAlerts: document.getElementById('authAlerts'),
      googleButton: document.getElementById('btnLoginGoogle'),
      microsoftButton: document.getElementById('btnLoginMicrosoft'),
      mainContent: document.getElementById('mainContent')
    };
    
    // Classe CSS para cada estado
    this.stateClasses = {
      idle: 'auth-state-idle',
      loading: 'auth-state-loading',
      authenticating: 'auth-state-authenticating',
      redirecting: 'auth-state-redirecting',
      success: 'auth-state-success',
      error: 'auth-state-error',
      timeout: 'auth-state-timeout'
    };
    
    // Mensagens para cada estado
    this.stateMessages = {
      loading: 'Verificando autenticação...',
      authenticating: 'Autenticando...',
      redirecting: 'Redirecionando para o provedor...',
      success: 'Autenticado com sucesso! Redirecionando...',
      error: 'Ocorreu um erro na autenticação.',
      timeout: 'Tempo de espera excedido.'
    };
    
    // Contador de tentativas
    this.retryCount = 0;
  }

  /**
   * Inicializa o gerenciador de feedback
   */
  init() {
    // Adicionar classe padrão ao body
    this.elements.body.classList.add(this.stateClasses.idle);
    
    console.log('✅ UI Feedback inicializado');
  }

  /**
   * Atualiza o estado visual da autenticação
   * @param {string} state - Novo estado ('idle', 'loading', 'authenticating', etc.)
   * @param {Object} options - Opções adicionais (mensagem, provider, etc.)
   */
  updateState(state, options = {}) {
    if (!Object.keys(this.stateClasses).includes(state)) {
      console.error(`Estado inválido: ${state}`);
      return;
    }
    
    const oldState = this.currentState;
    this.currentState = state;
    this.stateTimestamps[state] = new Date().toISOString();
    
    // Remover todas as classes de estado anteriores
    Object.values(this.stateClasses).forEach(cls => {
      this.elements.body.classList.remove(cls);
    });
    
    // Adicionar nova classe de estado
    this.elements.body.classList.add(this.stateClasses[state]);
    
    // Ajustar visibilidade dos elementos com base no estado
    this._updateVisibility(state);
    
    // Atualizar mensagens
    this._updateMessages(state, options);
    
    // Log da mudança de estado
    console.log(`Estado de autenticação alterado: ${oldState} -> ${state}`, options);
    
    return this;
  }

  /**
   * Atualiza a visibilidade dos elementos com base no estado
   * @param {string} state - Estado atual
   * @private
   */
  _updateVisibility(state) {
    switch (state) {
      case 'idle':
        this._showElement('authScreen');
        this._hideElement('loadingOverlay');
        this._hideElement('mainContent');
        this._enableButtons();
        break;
        
      case 'loading':
        this._showElement('loadingOverlay');
        break;
        
      case 'authenticating':
      case 'redirecting':
        this._disableButtons();
        break;
        
      case 'success':
        this._hideElement('authScreen');
        this._showElement('mainContent');
        this._hideElement('loadingOverlay');
        break;
        
      case 'error':
      case 'timeout':
        this._hideElement('loadingOverlay');
        this._showElement('authScreen');
        this._hideElement('mainContent');
        this._enableButtons();
        break;
    }
  }

  /**
   * Atualiza as mensagens exibidas com base no estado
   * @param {string} state - Estado atual
   * @param {Object} options - Opções adicionais
   * @private
   */
  _updateMessages(state, options = {}) {
    const message = options.message || this.stateMessages[state] || '';
    const provider = options.provider || '';
    
    if (state === 'error' || state === 'timeout') {
      this.showError(message);
    } else if (state === 'success') {
      this.showSuccess(message);
    } else {
      this.clearAlerts();
    }
    
    // Atualiza mensagem de loading
    if (this.elements.loadingOverlay) {
      const loadingTitle = this.elements.loadingOverlay.querySelector('h5');
      const loadingText = this.elements.loadingOverlay.querySelector('p');
      
      if (loadingTitle && state === 'loading') {
        loadingTitle.textContent = 'Verificando autenticação...';
      }
      
      if (loadingText) {
        if (state === 'loading') {
          loadingText.textContent = 'Aguarde um momento';
        } else if (state === 'authenticating' || state === 'redirecting') {
          loadingText.textContent = provider 
            ? `Conectando com ${provider === 'google' ? 'Google' : 'Microsoft'}...` 
            : 'Processando autenticação...';
        }
      }
    }
  }

  /**
   * Mostra um elemento pelo ID
   * @param {string} elementId - ID do elemento a mostrar
   * @private
   */
  _showElement(elementId) {
    const element = this.elements[elementId];
    if (!element) return;
    
    if (elementId === 'loadingOverlay') {
      element.classList.add('active');
    } else if (elementId === 'authScreen') {
      element.classList.add('active');
      element.style.display = 'flex';
    } else {
      element.style.display = 'block';
    }
  }

  /**
   * Esconde um elemento pelo ID
   * @param {string} elementId - ID do elemento a esconder
   * @private
   */
  _hideElement(elementId) {
    const element = this.elements[elementId];
    if (!element) return;
    
    if (elementId === 'loadingOverlay') {
      element.classList.remove('active');
    } else if (elementId === 'authScreen') {
      element.classList.remove('active');
    } else {
      element.style.display = 'none';
    }
  }

  /**
   * Habilita os botões de login
   * @private
   */
  _enableButtons() {
    ['googleButton', 'microsoftButton'].forEach(buttonId => {
      const button = this.elements[buttonId];
      if (button) {
        button.disabled = false;
        button.classList.remove('loading');
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
      }
    });
  }

  /**
   * Desabilita os botões de login
   * @param {string} [activeProvider] - Provedor ativo (para desativar apenas o botão correspondente)
   * @private
   */
  _disableButtons(activeProvider = null) {
    const buttonMap = {
      'google': 'googleButton',
      'entra': 'microsoftButton',
      'microsoft': 'microsoftButton'
    };
    
    if (activeProvider && buttonMap[activeProvider]) {
      const button = this.elements[buttonMap[activeProvider]];
      if (button) {
        button.disabled = true;
        button.classList.add('loading');
      }
    } else {
      ['googleButton', 'microsoftButton'].forEach(buttonId => {
        const button = this.elements[buttonId];
        if (button) {
          button.disabled = true;
          button.style.pointerEvents = 'none';
        }
      });
    }
  }

  /**
   * Mostra uma mensagem de erro
   * @param {string} message - Mensagem de erro
   */
  showError(message) {
    if (!this.elements.authAlerts) return;
    
    this.elements.authAlerts.innerHTML = `
      <div class="auth-alert auth-alert-error">
        <svg class="icon icon-sm" aria-hidden="true"><use href="#icon-warning"></use></svg>
        <div>${message}</div>
      </div>
    `;
  }

  /**
   * Mostra uma mensagem de sucesso
   * @param {string} message - Mensagem de sucesso
   */
  showSuccess(message) {
    if (!this.elements.authAlerts) return;
    
    this.elements.authAlerts.innerHTML = `
      <div class="auth-alert auth-alert-success">
        <svg class="icon icon-sm" aria-hidden="true"><use href="#icon-check-circle"></use></svg>
        <div>${message}</div>
      </div>
    `;
  }

  /**
   * Limpa as mensagens de alerta
   */
  clearAlerts() {
    if (this.elements.authAlerts) {
      this.elements.authAlerts.innerHTML = '';
    }
  }

  /**
   * Inicia o fluxo de login para um provedor
   * @param {string} provider - Provedor ('google' ou 'entra')
   */
  startLogin(provider) {
    this.retryCount = 0;
    this.updateState('authenticating', { provider });
    this._disableButtons(provider);
    return this;
  }

  /**
   * Indica tentativa de login com falha
   * @param {string} errorMessage - Mensagem de erro
   * @param {number} retryCount - Número da tentativa atual
   */
  loginFailed(errorMessage, retryCount = 0) {
    this.retryCount = retryCount;
    this.updateState('error', { message: errorMessage });
    return this;
  }

  /**
   * Indica timeout no processo de login
   * @param {string} message - Mensagem de timeout
   */
  loginTimeout(message) {
    this.updateState('timeout', { message });
    return this;
  }

  /**
   * Indica login bem-sucedido
   * @param {string} message - Mensagem de sucesso
   */
  loginSuccess(message) {
    this.updateState('success', { message });
    return this;
  }
}

// Exportar para uso global
window.AuthUIFeedback = new AuthUIFeedback();

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.AuthUIFeedback.init();
});

console.log('✅ UI Feedback registrado e será inicializado quando o DOM estiver pronto');