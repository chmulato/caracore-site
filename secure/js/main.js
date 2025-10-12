/**
 * main.js - Código principal para autenticação Cara Core
 */

// Função para gerar ícones SVG
const icon = (name, extraClass = '') => `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

document.addEventListener('DOMContentLoaded', async function() {
  // Elementos DOM
  const loadingOverlay = document.getElementById('loadingOverlay');
  const authScreen = document.getElementById('authScreen');
  const mainContent = document.getElementById('mainContent');
  const authAlerts = document.getElementById('authAlerts');

  // Mostrar overlay de carregamento
  loadingOverlay.classList.add('active');

  try {
    // Aguardar inicialização do OIDCAuth
    if (typeof window.OIDCAuth === 'undefined') {
      await new Promise(resolve => {
        const checkOIDC = () => {
          if (typeof window.OIDCAuth !== 'undefined') {
            resolve();
          } else {
            setTimeout(checkOIDC, 100);
          }
        };
        checkOIDC();
      });
    }

    // Verificar se o usuário já está autenticado
    const isAuthenticated = await window.OIDCAuth.isAuthenticated();

    if (isAuthenticated) {
      await showUserInfo();
      showMainContent();
      setTimeout(() => {
        window.location.href = '/secure/restrita.html';
      }, 2000);
    } else {
      showAuthScreen();
    }

  } catch (error) {
    console.error('Erro na inicialização:', error);
    showError('Erro ao inicializar sistema de autenticação');
    showAuthScreen();
  } finally {
    loadingOverlay.classList.remove('active');
  }

  // Configurar event listeners para os botões de login
  const btnLoginGoogle = document.getElementById('btnLoginGoogle');
  const btnLoginMicrosoft = document.getElementById('btnLoginMicrosoft');
  
  // Função auxiliar para garantir que os botões estejam em estado utilizável
  function resetButtonState(btn) {
    if (btn) {
      btn.disabled = false;
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
      btn.classList.remove('loading');
    }
  }
  
  // Garantir que os botões estejam em estado utilizável
  resetButtonState(btnLoginGoogle);
  resetButtonState(btnLoginMicrosoft);
  
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

  // Funções auxiliares

  function showAuthScreen() {
    authScreen.classList.add('active');
    mainContent.style.display = 'none';
  }

  function showMainContent() {
    authScreen.classList.remove('active');
    mainContent.style.display = 'block';
  }

  async function loginWithProvider(provider) {
    const button = provider === 'google'
      ? document.getElementById('btnLoginGoogle')
      : document.getElementById('btnLoginMicrosoft');

    try {
      button.classList.add('loading');
      button.disabled = true;
      // Garantir que pointer-events não bloqueie o botão após tentativas anteriores
      button.style.pointerEvents = 'auto';

      clearAlerts();

      // Aguardar OIDCAuth estar disponível
      if (!window.OIDCAuth) {
        console.log('⏳ Aguardando OIDCAuth carregar...');
        await new Promise(resolve => {
          const poll = () => {
            if (window.OIDCAuth) {
              console.log('✅ OIDCAuth carregado');
              resolve();
              return;
            }
            setTimeout(poll, 100);
          };
          poll();
        });
      }

      console.log(`🔐 Iniciando login com ${provider}...`);
      await window.OIDCAuth.switchProvider(provider);
      await window.OIDCAuth.login();
    } catch (error) {
      console.error('Erro no login:', error);
      showError(resolveLoginError(provider, error));
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
      button.style.pointerEvents = 'auto';
      button.style.opacity = '1';
    }
  }

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
    }
  }

  function showError(message) {
    authAlerts.innerHTML = `
      <div class="auth-alert auth-alert-error">
        ${icon('warning', 'icon-sm')}
        ${message}
      </div>
    `;
  }

  function showSuccess(message) {
    authAlerts.innerHTML = `
      <div class="auth-alert auth-alert-success">
        ${icon('check-circle', 'icon-sm')}
        ${message}
      </div>
    `;
  }

  function clearAlerts() {
    authAlerts.innerHTML = '';
  }

  function resolveLoginError(provider, error) {
    const providerName = provider === 'google' ? 'Google' : 'Microsoft';
    const rawDetails = [
      typeof error === 'string' ? error : null,
      error?.message,
      error?.error_description,
      error?.error
    ].filter(Boolean).join(' | ');

    const normalizedDetails = rawDetails.toLowerCase();
    if (provider !== 'google' && (normalizedDetails.includes('aadsts9002346') || normalizedDetails.includes('/consumers endpoint'))) {
      return 'Não foi possível entrar com uma conta Microsoft corporativa ou escolar. Esta área aceita apenas contas pessoais Microsoft (@outlook.com, @hotmail.com, Xbox Live). Troque para uma conta pessoal e tente novamente.';
    }

    const technicalDetail = error?.message ? ` Detalhe técnico: ${error.message}` : '';
    return `Erro ao conectar com ${providerName}. Somente contas pessoais Microsoft e Google são aceitas.${technicalDetail}`;
  }
});