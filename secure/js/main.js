/**
 * main.js - Código principal para autenticação Cara Core
 * Versão com gerenciamento de erros e timeouts
 */

// Função para gerar ícones SVG
const icon = (name, extraClass = '') => `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

/**
 * Limpa todos os dados de autenticação OAuth/OIDC do cache
 * Necessário quando há erro de escopos para garantir redirecionamento correto
 */
function clearAuthCache() {
    console.log('🧹 Limpando cache de autenticação OAuth/OIDC...');
    
    // Prefixos de chaves a serem removidas
    const prefixesToRemove = [
        // OIDC padrão
        'oidc.',
        'oidc.user',
        'oidc.storage',
        'oidc.metadata',
        'oidc.authority',
        'oidc.client',
        'oidc.states',
        'oidc.signin',
        // Tokens de autenticação
        'auth_',
        'cara_core_',
        // Estados OAuth
        'microsoft_oauth_',
        'google_oauth_',
        'entra_oauth_',
        // PKCE
        'oidc.pkce.',
        // Provider
        'cara_core_oidc_provider',
        // Session IDs
        'cara_core_session_id',
        'cara_core_token_expires_at',
        // User data (mas manter email e provider para pré-preenchimento)
        'auth_user_info',
        'auth_expires_at',
        'auth_last_activity'
    ];
    
    const clearStorage = (storage) => {
        if (!storage || typeof storage.length !== 'number') return;
        
        // Chaves a serem preservadas (para pré-preenchimento)
        const keysToPreserve = [
            'user_email',
            'auth_user_email',
            'auth_provider'
        ];
        
        try {
            const keysToRemove = [];
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (!key) continue;
                
                // Pular chaves que devem ser preservadas
                if (keysToPreserve.includes(key)) {
                    continue;
                }
                
                // Verificar se a chave corresponde a algum prefixo
                if (prefixesToRemove.some(prefix => key.startsWith(prefix))) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                try {
                    storage.removeItem(key);
                    console.log(`  ✅ Removido: ${key}`);
                } catch (err) {
                    console.warn(`  ⚠️ Erro ao remover ${key}:`, err);
                }
            });
        } catch (err) {
            console.warn('⚠️ Erro ao iterar storage:', err);
        }
    };
    
    // Limpar localStorage
    try {
        clearStorage(localStorage);
    } catch (err) {
        console.warn('⚠️ Erro ao limpar localStorage:', err);
    }
    
    // Limpar sessionStorage
    try {
        clearStorage(sessionStorage);
    } catch (err) {
        console.warn('⚠️ Erro ao limpar sessionStorage:', err);
    }
    
    // Limpar dados do OIDCAuth se disponível
    if (window.OIDCAuth && typeof window.OIDCAuth.clearStaleState === 'function') {
        try {
            window.OIDCAuth.clearStaleState();
            console.log('  ✅ Estado OIDCAuth limpo');
        } catch (err) {
            console.warn('  ⚠️ Erro ao limpar estado OIDCAuth:', err);
        }
    }
    
    // Limpar dados do SessionManager se disponível
    if (window.SessionManager && typeof window.SessionManager.clear === 'function') {
        try {
            window.SessionManager.clear();
            console.log('  ✅ SessionManager limpo');
        } catch (err) {
            console.warn('  ⚠️ Erro ao limpar SessionManager:', err);
        }
    }
    
    console.log('✅ Cache de autenticação limpo com sucesso');
}

document.addEventListener('DOMContentLoaded', async function() {
  // Verificar se precisa limpar cache (parâmetro na URL)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('clear_cache') === 'true') {
    clearAuthCache();
    // Remover parâmetro da URL para não limpar novamente
    urlParams.delete('clear_cache');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }
  
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
      // Usuário autenticado - verificar autorização
      const user = await window.OIDCAuth.getUser();
      
      // Obter provider do localStorage ou do perfil OIDC
      let provider = localStorage.getItem('auth_provider') || user?.provider;
      
      // Normalizar provider: 'entra' -> 'microsoft' para consistência
      if (provider === 'entra') {
        provider = 'microsoft';
      }
      
      // Processar autenticação usando módulo específico
      // Os módulos específicos fazem toda a validação de segurança
      let authData = null;
      if (provider === 'google' && window.AuthGoogle && window.AuthGoogle.processAuthentication) {
        authData = await window.AuthGoogle.processAuthentication(user);
      } else if (provider === 'microsoft' && window.AuthMicrosoft && window.AuthMicrosoft.processAuthentication) {
        authData = await window.AuthMicrosoft.processAuthentication(user);
      }
      
      // Se módulo específico processou, usar dados processados
      let userEmail = null;
      let emailMismatch = false;
      let emailIntegrityValid = false;
      let tokenEmail = user?.profile?.email || user?.profile?.preferred_username;
      
      if (authData) {
        userEmail = authData.email;
        provider = authData.provider;
        emailMismatch = authData.emailMismatch || false;
        emailIntegrityValid = authData.emailIntegrityValid || false;
      } else {
        // Fallback: usar dados do token se módulo específico não processou
        userEmail = tokenEmail;
      }

      if (!userEmail) {
        console.warn('⚠️ Email não encontrado no perfil OIDC, tentando obter do localStorage...');
        // Última tentativa: buscar do localStorage
        userEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
        
        if (!userEmail) {
          throw new Error('Email do usuário não encontrado. Por favor, faça login novamente.');
      }
      }
      
      // SEGURANÇA: Validar correspondência entre provider e email usando módulos específicos
      if (userEmail && provider) {
        const detectedProvider = detectProviderFromEmail(userEmail);
        
        if (detectedProvider && provider !== detectedProvider) {
          console.warn('⚠️ SEGURANÇA: Provider não corresponde ao email!', {
            email: userEmail,
            provider: provider,
            detectedProvider: detectedProvider,
            action: 'Corrigindo provider'
          });
          
          // Corrigir provider baseado no email
          provider = detectedProvider;
          localStorage.setItem('auth_provider', provider);
        }
      }
      
      console.log('✅ Verificando autorização para:', {
        email: userEmail,
        provider: provider,
        emailSource: authData ? authData.emailSource : (tokenEmail ? 'OIDC token' : 'localStorage'),
        emailMismatch: emailMismatch,
        emailIntegrityValid: emailIntegrityValid,
        securityCheck: emailMismatch ? 'FALHOU - Email corrigido' : (emailIntegrityValid ? 'PASSOU' : 'AVISO - Integridade não validada')
      });

      window.AuthUIFeedback.loginSuccess('Verificando permissões...');
      
      // Verificar se tem autorização para acessar o sistema
      // IMPORTANTE: Para emails Microsoft, o email do localStorage é usado para consultar o backend
      if (window.authChecker) {
        const isAuthorized = await window.authChecker.checkAndRedirect(userEmail, provider, false);
        
        if (isAuthorized) {
          // Autorizado - prosseguir para área restrita
          console.log('✅ Usuário autorizado! Redirecionando para área restrita...');
          await showUserInfo();
          window.AuthUIFeedback.updateState('success');
          setTimeout(() => {
            window.location.href = '/secure/restrita.html';
          }, 2000);
        } else {
          console.log('❌ Usuário não autorizado. Redirecionamento já foi feito pelo authChecker.');
        }
        // Se não autorizado, checkAndRedirect já fez o redirecionamento
      } else {
        // Fallback se authChecker não estiver disponível
        console.warn('⚠️ AuthChecker não disponível, verificando autorização diretamente...');
        
        // Verificar autorização diretamente com o backend
        const backendUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5051'
          : 'https://caracore-backend-docker.azurewebsites.net';
        
        try {
          const response = await fetch(`${backendUrl}/api/check-authorization`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: userEmail,
              provider: provider
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.authorized === true) {
              console.log('✅ Usuário autorizado (verificação direta)!');
        await showUserInfo();
        window.AuthUIFeedback.updateState('success');
        setTimeout(() => {
          window.location.href = '/secure/restrita.html';
        }, 2000);
            } else {
              console.log('❌ Usuário não autorizado. Redirecionando para primeiro acesso...');
              window.location.href = `/secure/first-access.html?email=${encodeURIComponent(userEmail)}&provider=${provider || 'microsoft'}`;
            }
          } else {
            throw new Error('Erro ao verificar autorização');
          }
        } catch (error) {
          console.error('Erro ao verificar autorização:', error);
          window.AuthUIFeedback.loginFailed('Erro ao verificar permissões. Tente novamente.');
        }
      }
    } else {
      // Usuário não autenticado - mostrar opções de acesso
      window.AuthUIFeedback.updateState('idle');
      
      // Adicionar link para primeiro acesso se não existir
      addFirstAccessLink();
      
      // Configurar sistema de email obrigatório apenas quando não autenticado
      setupEmailValidation();
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
    
    // Mesmo com erro, configurar email se não autenticado
    setupEmailValidation();
  }

  // Configurar event listeners para os botões de login
  const btnLoginGoogle = document.getElementById('btnLoginGoogle');
  const btnLoginMicrosoft = document.getElementById('btnLoginMicrosoft');
  
  if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleProviderLogin('google');
    });
    console.log('✅ Event listener Google configurado');
  } else {
    console.error('❌ Botão Google não encontrado');
  }
  
  if (btnLoginMicrosoft) {
    btnLoginMicrosoft.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleProviderLogin('microsoft');
    });
    console.log('✅ Event listener Microsoft configurado');
  } else {
    console.error('❌ Botão Microsoft não encontrado');
  }
  
    // Verificar se há parâmetros de erro na URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error')) {
    const errorReason = urlParams.get('reason') || 'unknown';
    const errorMessage = urlParams.get('message') || null;
    console.error('🔴 Erro detectado na URL:', errorReason);
    
    // Mensagem amigável para o usuário
    let userMessage = errorMessage || `Ocorreu um erro na autenticação: ${errorReason}`;
    
    // Mensagens específicas por tipo de erro
    if (errorReason === 'no_real_tokens') {
      userMessage = errorMessage || 'Não foi possível obter tokens de autenticação válidos. Por favor, faça login novamente.';
    } else if (errorReason === 'scope_unauthorized') {
      userMessage = errorMessage || 'É necessário conceder as permissões solicitadas para acessar o sistema. Ao fazer login novamente, você será solicitado a conceder essas permissões.';
    } else if (errorReason === 'unauthorized_domain') {
      userMessage = errorMessage || 'Seu domínio de email não está autorizado para login. Por favor, use uma conta autorizada ou faça login novamente.';
    } else if (errorReason === 'no_valid_session' || errorReason === 'session_expired') {
      userMessage = errorMessage || 'Sua sessão expirou ou não foi possível criar uma sessão válida. Por favor, faça login novamente para obter uma nova sessão.';
    }
    
    // Para erros de escopos ou sessão inválida, limpar cache e mostrar mensagem mais detalhada
    if (errorReason === 'scope_unauthorized' || errorReason === 'no_valid_session') {
      // Limpar cache quando há erro de escopos para garantir redirecionamento correto
      if (errorReason === 'scope_unauthorized') {
        clearAuthCache();
      }
      
      // Criar alerta mais detalhado
      const alertContainer = document.getElementById('authAlerts');
      if (alertContainer) {
        alertContainer.innerHTML = `
          <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <div class="d-flex align-items-start">
              <svg class="icon icon-sm me-2 flex-shrink-0" aria-hidden="true"><use href="#icon-warning"></use></svg>
              <div class="flex-grow-1">
                <h6 class="alert-heading mb-2">${errorReason === 'scope_unauthorized' ? 'Permissões Necessárias' : 'Sessão Expirada'}</h6>
                <p class="mb-2">${userMessage}</p>
                ${errorReason === 'scope_unauthorized' ? `
                  <p class="mb-0 small">
                    <strong>O que fazer:</strong> Faça login novamente e, quando solicitado, <strong>conceda todas as permissões</strong> que o provedor (Google ou Microsoft) solicitar. 
                    Isso é necessário para que o sistema possa autenticá-lo corretamente.
                  </p>
                ` : `
                  <p class="mb-0 small">
                    <strong>O que fazer:</strong> Faça login novamente para criar uma nova sessão válida. 
                    Se o problema persistir, tente limpar os cookies do navegador ou usar uma janela anônima.
                  </p>
                `}
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
          </div>
        `;
        
        // Scroll até o alerta
        setTimeout(() => {
          alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      
      // Também usar o sistema de feedback padrão
      window.AuthUIFeedback.updateState('error', { message: userMessage });
    } else {
      // Verificar se podemos usar force recognition para recuperação
      if (typeof window.forceAuthRecognition === 'function' && 
          (errorReason.includes('auth') || errorReason.includes('timeout') || errorReason.includes('recognition'))) {
        console.log('🔄 Tentando recuperar com Force Recognition...');
        window.AuthUIFeedback.forceAuthRecognition(false);
      } else {
        window.AuthUIFeedback.loginFailed(userMessage);
      }
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
   * Detecta o provider baseado no domínio do email
   * Delega para os módulos específicos
   */
  function detectProviderFromEmail(email) {
    if (!email || !email.includes('@')) {
      return null;
    }
    
    // Usar módulos específicos para detectar provider
    if (window.AuthGoogle && window.AuthGoogle.isGoogleEmail(email)) {
      return 'google';
    }
    
    if (window.AuthMicrosoft && window.AuthMicrosoft.isMicrosoftEmail(email)) {
      return 'microsoft';
    }
    
    return null;
  }
  
  /**
   * Configura validação de email e controle dos botões
   * Coordena os módulos específicos (Google e Microsoft) de forma unificada
   */
  function setupEmailValidation() {
    const emailInput = document.getElementById('userEmailInput');
    const emailError = document.getElementById('emailError');
    const emailHint = document.getElementById('emailHint');
    const btnLoginGoogle = document.getElementById('btnLoginGoogle');
    const btnLoginMicrosoft = document.getElementById('btnLoginMicrosoft');
    
    if (!emailInput) {
      console.warn('⚠️ Campo de email não encontrado');
      return;
    }
    
    // Inicialmente desabilitar botões e aplicar estilos visuais
    if (btnLoginGoogle) {
      btnLoginGoogle.disabled = true;
      btnLoginGoogle.style.opacity = '0.5';
      btnLoginGoogle.style.cursor = 'not-allowed';
    }
    if (btnLoginMicrosoft) {
      btnLoginMicrosoft.disabled = true;
      btnLoginMicrosoft.style.opacity = '0.5';
      btnLoginMicrosoft.style.cursor = 'not-allowed';
    }
    
    // Limpar email ao carregar a página
    emailInput.value = '';
    
    // Validar email em tempo real - função unificada que coordena ambos os módulos
    let validationTimeout = null;
    emailInput.addEventListener('input', () => {
      // Limpar erro anterior
      if (emailError) {
        emailError.textContent = '';
        emailError.style.display = 'none';
      }
      
      // Debounce: aguardar 300ms após parar de digitar
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      
      validationTimeout = setTimeout(() => {
        const email = emailInput.value.trim();
        
        if (!email) {
          // Email vazio - desabilitar botões
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = true;
            btnLoginGoogle.style.opacity = '0.5';
            btnLoginGoogle.style.cursor = 'not-allowed';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = true;
            btnLoginMicrosoft.style.opacity = '0.5';
            btnLoginMicrosoft.style.cursor = 'not-allowed';
          }
          if (emailHint) {
            emailHint.style.display = 'block';
            emailHint.querySelector('.hint-text').textContent = 'Informe o email que você usa para autenticação';
          }
          return;
        }
        
        // Validar formato usando módulo Google (ambos têm a mesma função)
        const isValid = window.AuthGoogle && window.AuthGoogle.isValidEmail 
          ? window.AuthGoogle.isValidEmail(email)
          : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (!isValid) {
          // Email inválido - mostrar erro e desabilitar botões
          if (emailError) {
            emailError.textContent = 'Por favor, informe um email válido';
            emailError.style.display = 'block';
          }
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = true;
            btnLoginGoogle.style.opacity = '0.5';
            btnLoginGoogle.style.cursor = 'not-allowed';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = true;
            btnLoginMicrosoft.style.opacity = '0.5';
            btnLoginMicrosoft.style.cursor = 'not-allowed';
          }
          return;
        }
        
        // Email válido - detectar provider usando módulos específicos
        const detectedProvider = detectProviderFromEmail(email);
        
        if (detectedProvider === 'google') {
          // Email Google: habilitar apenas botão Google, desabilitar Microsoft
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = false;
            btnLoginGoogle.style.opacity = '1';
            btnLoginGoogle.style.cursor = 'pointer';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = true;
            btnLoginMicrosoft.style.opacity = '0.5';
            btnLoginMicrosoft.style.cursor = 'not-allowed';
          }
          if (emailHint) {
            emailHint.style.display = 'block';
            emailHint.querySelector('.hint-text').textContent = 'Email do Google detectado. Use o botão "Continuar com Google"';
          }
          console.log('✅ Email Google detectado - Botão Google habilitado, Microsoft desabilitado');
        } else if (detectedProvider === 'microsoft') {
          // Email Microsoft: habilitar apenas botão Microsoft, desabilitar Google
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = true;
            btnLoginGoogle.style.opacity = '0.5';
            btnLoginGoogle.style.cursor = 'not-allowed';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = false;
            btnLoginMicrosoft.style.opacity = '1';
            btnLoginMicrosoft.style.cursor = 'pointer';
          }
          if (emailHint) {
            emailHint.style.display = 'block';
            emailHint.querySelector('.hint-text').textContent = 'Email da Microsoft detectado. Use o botão "Continuar com Microsoft"';
          }
          console.log('✅ Email Microsoft detectado - Botão Microsoft habilitado, Google desabilitado');
        } else {
          // Email válido mas provider não detectado - habilitar ambos
          if (btnLoginGoogle) {
            btnLoginGoogle.disabled = false;
            btnLoginGoogle.style.opacity = '1';
            btnLoginGoogle.style.cursor = 'pointer';
          }
          if (btnLoginMicrosoft) {
            btnLoginMicrosoft.disabled = false;
            btnLoginMicrosoft.style.opacity = '1';
            btnLoginMicrosoft.style.cursor = 'pointer';
          }
          if (emailHint) {
            emailHint.style.display = 'block';
            emailHint.querySelector('.hint-text').textContent = 'Escolha o provedor de autenticação correspondente ao seu email';
          }
        }
        
        // Limpar erro se email for válido
        if (emailError) {
          emailError.textContent = '';
          emailError.style.display = 'none';
        }
      }, 300);
    });
    
    // Validar ao perder foco
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value.trim();
      const isValid = window.AuthGoogle && window.AuthGoogle.isValidEmail 
        ? window.AuthGoogle.isValidEmail(email)
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
      if (email && !isValid) {
        if (emailError) {
          emailError.textContent = 'Por favor, informe um email válido';
          emailError.style.display = 'block';
        }
        if (btnLoginGoogle) {
          btnLoginGoogle.disabled = true;
          btnLoginGoogle.style.opacity = '0.5';
          btnLoginGoogle.style.cursor = 'not-allowed';
        }
        if (btnLoginMicrosoft) {
          btnLoginMicrosoft.disabled = true;
          btnLoginMicrosoft.style.opacity = '0.5';
          btnLoginMicrosoft.style.cursor = 'not-allowed';
        }
      }
    });
  }
  
  /**
   * Manipula o clique no botão de provider com validação
   * Delega para os módulos específicos (Google ou Microsoft)
   */
  async function handleProviderLogin(provider) {
    // Delegar para o módulo específico
    if (provider === 'google' && window.AuthGoogle && window.AuthGoogle.handleLogin) {
      await window.AuthGoogle.handleLogin();
    } else if (provider === 'microsoft' && window.AuthMicrosoft && window.AuthMicrosoft.handleLogin) {
      await window.AuthMicrosoft.handleLogin();
    } else {
      console.error(`❌ Módulo de autenticação não encontrado para provider: ${provider}`);
      if (window.AuthUIFeedback) {
        window.AuthUIFeedback.loginFailed(`Erro: Módulo de autenticação não disponível para ${provider}`);
      }
    }
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
   * Adicionar link para primeiro acesso na página
   */
  function addFirstAccessLink() {
    // Verificar se já existe o link
    const existingLink = document.getElementById('firstAccessLink');
    if (existingLink) return;
    
    // Procurar onde adicionar o link (após os botões de provedor ou no footer)
    const providerButtons = document.querySelector('.provider-buttons');
    const authFooter = document.querySelector('.auth-footer');
    
    if (providerButtons || authFooter) {
      // Criar container para o link de primeiro acesso
      const firstAccessContainer = document.createElement('div');
      firstAccessContainer.className = 'first-access-link-container';
      firstAccessContainer.style.cssText = 'margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.1); text-align: center;';
      
      const firstAccessLink = document.createElement('a');
      firstAccessLink.id = 'firstAccessLink';
      firstAccessLink.href = '/secure/first-access.html';
      firstAccessLink.className = 'first-access-link';
      firstAccessLink.style.cssText = 'color: #3b82f6; text-decoration: none; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 0.5rem; transition: all 0.2s; font-weight: 500;';
      firstAccessLink.innerHTML = `
        <svg class="icon icon-sm" aria-hidden="true" style="width: 1rem; height: 1rem; transform: rotate(-90deg);"><use href="#icon-arrow-right"></use></svg>
        <span>Primeiro acesso? Solicite autorização para a Área 51</span>
      `;
      
      // Adicionar hover effect
      firstAccessLink.addEventListener('mouseenter', () => {
        firstAccessLink.style.background = 'rgba(59, 130, 246, 0.1)';
        firstAccessLink.style.textDecoration = 'underline';
      });
      firstAccessLink.addEventListener('mouseleave', () => {
        firstAccessLink.style.background = 'transparent';
        firstAccessLink.style.textDecoration = 'none';
      });
      
      firstAccessContainer.appendChild(firstAccessLink);
      
      // Adicionar após os botões de provedor ou antes do footer
      if (providerButtons && providerButtons.parentNode) {
        providerButtons.parentNode.insertBefore(firstAccessContainer, providerButtons.nextSibling);
      } else if (authFooter && authFooter.parentNode) {
        authFooter.parentNode.insertBefore(firstAccessContainer, authFooter);
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