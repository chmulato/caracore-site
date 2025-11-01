/**
 * main.js - Código principal para autenticação Cara Core
 * Versão com gerenciamento de erros e timeouts
 */

// Função para gerar ícones SVG
const icon = (name, extraClass = '') => `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

document.addEventListener('DOMContentLoaded', async function() {
  // Elementos DOM
  const loadingOverlay = document.getElementById('loadingOverlay');
  const authScreen = document.getElementById('authScreen');
  const mainContent = document.getElementById('mainContent');
  const authAlerts = document.getElementById('authAlerts');
  
  // Aguardar inicialização dos componentes
  await waitForComponents(['OIDCAuth', 'AuthErrorHandler', 'AuthUIFeedback']);
  
  // Mostrar feedback de carregamento
  window.AuthUIFeedback.updateState('loading');
  
  // Configurar error handler
  window.AuthErrorHandler.config.onCriticalError = (error) => {
    const friendlyMessage = window.AuthErrorHandler.getFriendlyErrorMessage(error);
    window.AuthUIFeedback.loginFailed(friendlyMessage);
  };

  try {
    // Verificar se o usuário já está autenticado
    const isAuthenticated = await window.OIDCAuth.isAuthenticated();

    if (isAuthenticated) {
      window.AuthUIFeedback.loginSuccess('Autenticado com sucesso!');
      await showUserInfo();
      window.AuthUIFeedback.updateState('success');
      setTimeout(() => {
        window.location.href = '/secure/estrita.html';
      }, 2000);
    } else {
      window.AuthUIFeedback.updateState('idle');
    }

  } catch (error) {
    console.error('Erro na inicialização:', error);
    const processedError = window.AuthErrorHandler.processError(
      error, 
      'initialization'
    );
    window.AuthUIFeedback.loginFailed(
      window.AuthErrorHandler.getFriendlyErrorMessage(processedError)
    );
  }

  // Configurar event listeners para os botões de login
  const btnLoginGoogle = document.getElementById('btnLoginGoogle');
  const btnLoginMicrosoft = document.getElementById('btnLoginMicrosoft');
  
  if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('🔵 Clique no botão Google detectado');
      loginWithProvider('google');
    });
    console.log('✅ Event listener Google configurado');
  } else {
    console.error('❌ Botão Google não encontrado');
  }
  
  if (btnLoginMicrosoft) {
    btnLoginMicrosoft.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('🔵 Clique no botão Microsoft detectado');
      loginWithProvider('entra');
    });
    console.log('✅ Event listener Microsoft configurado');
  } else {
    console.error('❌ Botão Microsoft não encontrado');
  }
  
    // Verificar se há parâmetros de erro na URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error')) {
    const errorReason = urlParams.get('reason') || 'unknown';
    console.error('🔴 Erro detectado na URL:', errorReason);
    
    // Verificar se podemos usar force recognition para recuperação
    if (typeof window.forceAuthRecognition === 'function' && 
        (errorReason.includes('auth') || errorReason.includes('timeout') || errorReason.includes('recognition'))) {
      console.log('🔄 Tentando recuperar com Force Recognition...');
      window.AuthUIFeedback.forceAuthRecognition(false);
    } else {
      window.AuthUIFeedback.loginFailed(`Ocorreu um erro na autenticação: ${errorReason}`);
    }
  }
  
  // Adicionar botão de recuperação para páginas restritas
  if (window.location.pathname.includes('/secure/') && typeof window.forceAuthRecognition === 'function') {
    const authAlerts = document.getElementById('authAlerts');
    if (authAlerts) {
      const recoverButton = document.createElement('button');
      recoverButton.type = 'button';
      recoverButton.className = 'retry-button';
      recoverButton.innerHTML = '<svg class="icon icon-sm" aria-hidden="true"><use href="#icon-shield-lock"></use></svg> Forçar reconhecimento de autenticação';
      recoverButton.addEventListener('click', () => {
        window.AuthUIFeedback.forceAuthRecognition(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
      
      // Adicionar o botão em uma div separada
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'auth-recovery-actions';
      buttonContainer.appendChild(recoverButton);
      authAlerts.appendChild(buttonContainer);
    }
  }  // Funções auxiliares
  
  /**
   * Aguarda que componentes específicos estejam disponíveis no window
   */
  async function waitForComponents(componentNames, maxWaitTime = 10000) {
    const startTime = Date.now();
    const components = new Map();
    
    componentNames.forEach(name => components.set(name, false));
    
    return new Promise((resolve, reject) => {
      const checkComponents = () => {
        let allAvailable = true;
        
        components.forEach((available, name) => {
          if (!available) {
            if (typeof window[name] !== 'undefined') {
              components.set(name, true);
              console.log(`✅ ${name} disponível`);
            } else {
              allAvailable = false;
            }
          }
        });
        
        if (allAvailable) {
          resolve();
          return;
        }
        
        if (Date.now() - startTime > maxWaitTime) {
          const missing = [];
          components.forEach((available, name) => {
            if (!available) missing.push(name);
          });
          reject(new Error(`Tempo limite excedido aguardando: ${missing.join(', ')}`));
          return;
        }
        
        setTimeout(checkComponents, 100);
      };
      
      checkComponents();
    });
  }

  /**
   * Processo de login com um provedor específico
   */
  async function loginWithProvider(provider) {
    try {
      // Atualizar estado da UI
      window.AuthUIFeedback.startLogin(provider);
      
      // Limpar qualquer tentativa anterior
      window.AuthErrorHandler.resetRetryCount();
      
      // Iniciar timeout para o redirecionamento
      const timeoutId = window.AuthErrorHandler.startRedirectTimeout(
        `${provider}-login`,
        (timeoutError, retryCount) => {
          console.log(`🕒 Timeout detectado no login com ${provider}, tentativa ${retryCount}`);
          // Se ainda temos tentativas, tentar novamente
          if (retryCount <= window.AuthErrorHandler.config.maxAutoRetries) {
            window.AuthUIFeedback.loginTimeout(
              `Tempo limite excedido ao tentar conectar com ${provider === 'google' ? 'Google' : 'Microsoft'}. ` +
              `Tentando novamente (${retryCount}/${window.AuthErrorHandler.config.maxAutoRetries})...`
            );
            // Tentar novamente após o intervalo
            setTimeout(() => loginWithProvider(provider), 1000);
          } else {
            // Sem mais tentativas, mostrar erro
            window.AuthUIFeedback.loginTimeout(
              `Não foi possível conectar com ${provider === 'google' ? 'Google' : 'Microsoft'} após várias tentativas. ` +
              `Verifique sua conexão e tente novamente mais tarde.`
            );
          }
        }
      );
      
      console.log(`🔐 Iniciando login com ${provider}...`);
      
      // Trocar o provedor
      await window.OIDCAuth.switchProvider(provider);
      
      // Atualizar UI para estado de redirecionamento
      window.AuthUIFeedback.updateState('redirecting', { provider });
      
      // Iniciar login (será redirecionado para o provedor)
      await window.OIDCAuth.login();
      
      // Se chegamos aqui, o redirecionamento não ocorreu como esperado
      throw new Error('Redirecionamento para o provedor de autenticação falhou');
      
    } catch (error) {
      console.error('Erro no login:', error);
      // Processar erro e obter mensagem amigável
      const processedError = window.AuthErrorHandler.processError(
        error, 
        `${provider}-login`,
        (recoveredError, retryCount) => {
          console.log(`🔄 Tentando recuperar de erro (${retryCount}/${window.AuthErrorHandler.config.maxAutoRetries})`, recoveredError);
          setTimeout(() => loginWithProvider(provider), 2000);
        }
      );
      
      // Atualizar UI apenas se o erro não for recuperável
      if (!processedError.isRecoverable) {
        window.AuthUIFeedback.loginFailed(
          window.AuthErrorHandler.getFriendlyErrorMessage(processedError)
        );
      }
    }
  }

  /**
   * Exibe informações do usuário logado
   */
  async function showUserInfo() {
    try {
      const userProfile = await window.OIDCAuth.getUserProfile();
      const storedInfo = window.OIDCAuth.getStoredUserInfo && window.OIDCAuth.getStoredUserInfo();

      if (userProfile) {
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userProvider = document.getElementById('userProvider');

        if (userProfile.picture) {
          userAvatar.src = userProfile.picture;
          userAvatar.style.display = 'block';
        } else {
          userAvatar.style.display = 'none';
        }

        userName.textContent = userProfile.name || 'Usuário';
        userEmail.textContent = userProfile.email || '';

        if (storedInfo?.provider) {
          const providerName = storedInfo.provider === 'google' ? 'Google' : 'Microsoft';
          const providerIcon = storedInfo.provider === 'google' ? icon('google', 'icon-sm') : icon('microsoft', 'icon-sm');
          userProvider.innerHTML = `${providerIcon} ${providerName}`;
        }

        userInfo.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Erro ao exibir informações do usuário:', error);
      
      // Usar error handler para processar o erro
      const processedError = window.AuthErrorHandler.processError(
        error, 
        'user-profile'
      );
      
      window.AuthUIFeedback.showError(
        'Não foi possível carregar informações do usuário. ' +
        window.AuthErrorHandler.getFriendlyErrorMessage(processedError)
      );
    }
  }
});