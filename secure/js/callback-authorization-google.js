/**
 * Verificação de autorização após autenticação OAuth Google bem-sucedida
 * Versão específica para Google - otimizada
 */

const PROVIDER = 'google';

// Função para validar email (disponível globalmente)
function isValidEmail(email) {
  if (!email) return false;
  if (email.includes('user@caracore.com.br') || 
      email.includes('example@') || 
      email === 'user@caracore.com.br' ||
      email.includes('placeholder') ||
      email.includes('test@') ||
      !email.includes('@') ||
      !email.includes('.')) {
    return false;
  }
  return email.length > 5;
}

// Função para aguardar OAuth completar e obter dados corretos (Google)
async function waitForOAuthCompletion(maxWaitTime = 30000, checkInterval = 200) {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    // Aguardar OIDCAuth estar disponível
    const waitForOIDCAuth = () => {
      return new Promise((resolveOIDC) => {
        if (window.OIDCAuth) {
          resolveOIDC();
          return;
        }
        const checkOIDC = setInterval(() => {
          if (window.OIDCAuth) {
            clearInterval(checkOIDC);
            resolveOIDC();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkOIDC);
          resolveOIDC();
        }, 5000);
      });
    };
    
    await waitForOIDCAuth();
    
    // Aguardar um tempo inicial para o callback processar (reduzido para 500ms)
    // O callback alternativo salva diretamente no localStorage, então não precisa esperar tanto
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const checkAuth = async () => {
      checkCount++;
      
      let userEmail = null;
      let accessToken = null;
      
      // PRIORIDADE 1: Verificar localStorage primeiro (mais rápido, dados do callback OIDC alternativo)
      // O callback alternativo salva diretamente no localStorage, então verificar primeiro
      const emailFromStorage = localStorage.getItem('user_email') || 
                             localStorage.getItem('auth_user_email');
      if (isValidEmail(emailFromStorage)) {
        userEmail = emailFromStorage;
        accessToken = localStorage.getItem('auth_access_token');
        console.log('✅ Email válido obtido do localStorage (prioridade):', userEmail);
      }
      
      // PRIORIDADE 2: Obter email diretamente do OIDCAuth (se disponível e não encontrou no localStorage)
      if ((!userEmail || !isValidEmail(userEmail)) && window.OIDCAuth) {
        try {
          const isAuthenticated = await window.OIDCAuth.isAuthenticated();
          if (isAuthenticated) {
            const user = await window.OIDCAuth.getUser();
            if (user && user.profile) {
              const oidcEmail = user.profile.email;
              const oidcAccessToken = user.access_token || localStorage.getItem('auth_access_token');
              
              // Validar compatibilidade: Google deve ter email Gmail
              if (oidcEmail) {
                const emailDomain = oidcEmail.toLowerCase().split('@')[1];
                const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
                const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                         emailDomain === 'outlook.com' || 
                                         emailDomain === 'live.com' || 
                                         emailDomain === 'msn.com' ||
                                         emailDomain.startsWith('hotmail.') || 
                                         emailDomain.startsWith('outlook.') || 
                                         emailDomain.startsWith('live.');
                
                if (!isGmailDomain && isMicrosoftDomain) {
                  console.warn('⚠️ Callback Google: Incompatibilidade detectada - email Microsoft:', oidcEmail);
                  localStorage.removeItem('user_email');
                  localStorage.removeItem('auth_user_email');
                  localStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_id_token');
                  sessionStorage.removeItem('cara_core_access_token');
                  setTimeout(checkAuth, checkInterval);
                  return;
                }
                
                // Se email do OIDCAuth é válido e não temos email do localStorage, usar OIDCAuth
                if (isValidEmail(oidcEmail) && !userEmail) {
                  userEmail = oidcEmail;
                  accessToken = oidcAccessToken;
                  console.log('✅ Email válido obtido do OIDCAuth:', userEmail);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Erro ao obter dados do OIDCAuth:', e);
        }
      }
      
      // PRIORIDADE 3: Fallback para localStorage (se ainda não encontrou)
      if (!userEmail || !isValidEmail(userEmail)) {
        if (emailFromStorage && isValidEmail(emailFromStorage)) {
          userEmail = emailFromStorage;
          accessToken = accessToken || localStorage.getItem('auth_access_token');
          console.log('✅ Email válido obtido do localStorage (fallback):', userEmail);
        } else if (emailFromStorage) {
          console.warn('⚠️ Email inválido encontrado no localStorage, limpando e aguardando...', emailFromStorage);
          localStorage.removeItem('user_email');
          localStorage.removeItem('auth_user_email');
          setTimeout(checkAuth, checkInterval);
          return;
        }
      }
      
      // PRIORIDADE 3: Tentar obter do sessionStorage (dados OIDC) - apenas se válido
      if (!userEmail || !isValidEmail(userEmail)) {
        try {
          const profileStr = sessionStorage.getItem('cara_core_user_profile');
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            const emailFromSession = profile.email;
            if (isValidEmail(emailFromSession)) {
              userEmail = emailFromSession;
              console.log('✅ Email válido obtido do sessionStorage:', userEmail);
            }
          }
        } catch (e) {
          // Ignorar erro
        }
      }
      
      // Se ainda não tem email válido, aguardar mais
      if (!userEmail || !isValidEmail(userEmail)) {
        if (Date.now() - startTime < 5000) {
          setTimeout(checkAuth, checkInterval);
          return;
        }
      }
      
      // Log a cada 5 verificações (1 segundo)
      if (checkCount % 5 === 0) {
        let oidcAuthStatus = false;
        if (window.OIDCAuth) {
          window.OIDCAuth.isAuthenticated().then(status => {
            oidcAuthStatus = status;
          }).catch(() => {});
        }
        
        console.log(`⏳ Aguardando OAuth Google... (${Math.floor((Date.now() - startTime) / 1000)}s)`, {
          hasEmail: !!userEmail,
          isValidEmail: userEmail ? isValidEmail(userEmail) : false,
          hasToken: !!accessToken,
          oidcAuthenticated: oidcAuthStatus
        });
      }
      
      // Só resolver se tiver email VÁLIDO e token
      if (userEmail && isValidEmail(userEmail) && accessToken) {
        console.log('✅ OAuth Google completado - dados encontrados:', { 
          userEmail, 
          provider: PROVIDER,
          hasToken: !!accessToken,
          checks: checkCount,
          elapsed: Math.floor((Date.now() - startTime) / 1000) + 's'
        });
        resolve({ userEmail, accessToken, provider: PROVIDER });
        return;
      }
      
      if (Date.now() - startTime > maxWaitTime) {
        console.warn('⏱️ Timeout aguardando OAuth Google completar', {
          maxWaitTime: maxWaitTime / 1000 + 's',
          checks: checkCount
        });
        reject(new Error('Timeout aguardando OAuth Google completar'));
        return;
      }
      
      setTimeout(checkAuth, checkInterval);
    };
    
    checkAuth();
  });
}

// Verificação de autorização após autenticação OAuth Google bem-sucedida
console.log('📋 callback-authorization-google.js carregado');

// Função principal de inicialização
async function initializeCallbackAuthorization() {
  console.log('📋 callback-authorization-google.js: Inicializando...');
  
  // Aguardar um pouco para garantir que outros scripts foram carregados
  // authorization-check.js precisa estar carregado antes de usar requireAuthorization
  await new Promise(resolve => setTimeout(resolve, 500));
  
  (async function() {
    try {
      console.log('🔄 Callback Google: Aguardando OAuth completar...');
      
      // Verificar se requireAuthorization está disponível
      if (typeof requireAuthorization !== 'function') {
        console.warn('⚠️ Callback Google: requireAuthorization não está disponível, aguardando...');
        // Aguardar até requireAuthorization estar disponível
        let waitCount = 0;
        while (typeof requireAuthorization !== 'function' && waitCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
        }
        if (typeof requireAuthorization !== 'function') {
          console.error('❌ Callback Google: requireAuthorization não está disponível após aguardar');
          // Tentar redirecionar mesmo assim se tiver email
          const userEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
          if (userEmail && isValidEmail(userEmail)) {
            console.log('⚠️ Callback Google: Redirecionando diretamente sem verificação de autorização');
            setTimeout(() => {
              window.location.href = '/secure/restrita.html';
            }, 1000);
          }
          return;
        }
      }
      console.log('✅ Callback Google: requireAuthorization disponível');
      
      // Listener para evento de OAuth completado (disparado pelo callback OIDC)
      let oauthCompletedEvent = null;
      const oauthCompletedListener = (event) => {
        oauthCompletedEvent = event.detail;
        console.log('✅ Callback Google: Evento googleOAuthCompleted recebido:', oauthCompletedEvent);
      };
      window.addEventListener('googleOAuthCompleted', oauthCompletedListener);
      
      // Tentar obter dados imediatamente do localStorage (callback alternativo salva diretamente)
      const immediateEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
      const immediateToken = localStorage.getItem('auth_access_token');
      
      if (immediateEmail && immediateToken && isValidEmail(immediateEmail)) {
        console.log('✅ Callback Google: Dados encontrados imediatamente no localStorage:', immediateEmail);
        // Remover listener já que encontramos os dados
        window.removeEventListener('googleOAuthCompleted', oauthCompletedListener);
        
        const isAuthorized = await requireAuthorization({
          email: immediateEmail,
          provider: PROVIDER,
          showLoading: true
        });
        
        if (isAuthorized) {
          console.log('✅ Callback Google: Usuário autorizado, redirecionando para área restrita');
          setTimeout(() => {
            window.location.href = '/secure/restrita.html';
          }, 1000);
          return;
        }
      }
      
      // Se não encontrou imediatamente, aguardar waitForOAuthCompletion
      const { userEmail, provider } = await waitForOAuthCompletion(15000);
      
      // Remover listener
      window.removeEventListener('googleOAuthCompleted', oauthCompletedListener);
      
      console.log('✅ Callback Google: OAuth completado, verificando autorização para', userEmail);
      
      const isAuthorized = await requireAuthorization({
        email: userEmail,
        provider: provider || PROVIDER,
        showLoading: true
      });
      
      if (isAuthorized) {
        console.log('✅ Callback Google: Usuário autorizado, redirecionando para área restrita');
        setTimeout(() => {
          window.location.href = '/secure/restrita.html';
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Callback Google: Erro na verificação de autorização:', error);
      
      const userEmail = localStorage.getItem('user_email') || 
                       localStorage.getItem('auth_user_email');
      
      if (userEmail && !userEmail.includes('user@caracore.com.br')) {
        console.log('⚠️ Callback Google: Timeout, mas email encontrado. Tentando verificar autorização...');
        try {
          await requireAuthorization({
            email: userEmail,
            provider: PROVIDER,
            showLoading: true
          });
        } catch (authError) {
          console.error('❌ Callback Google: Erro ao verificar autorização:', authError);
          window.location.href = `/secure/first-access.html?email=${encodeURIComponent(userEmail)}&provider=${PROVIDER}`;
        }
      } else {
        console.error('❌ Callback Google: Email não encontrado após timeout');
        window.location.href = '/secure/index.html?error=oauth_timeout';
      }
    }
  })();
}

// Executar imediatamente se DOM já estiver pronto, senão aguardar DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCallbackAuthorization);
} else {
  // DOM já está pronto, executar imediatamente
  initializeCallbackAuthorization();
}

// Listener para sucesso de autorização
document.addEventListener('authorizationSuccess', function(event) {
  console.log('Callback Google: Autorização confirmada:', event.detail);
  
  const badge = document.querySelector('.card-badge');
  if (badge) {
    badge.innerHTML = `
      <svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>
      Acesso autorizado
    `;
    badge.style.background = '#dcfce7';
    badge.style.color = '#166534';
  }
  
  const title = document.querySelector('h1');
  if (title) {
    title.textContent = 'Acesso confirmado!';
  }
  
  const description = document.querySelector('p');
  if (description) {
    description.textContent = 'Sua autorização foi verificada. Redirecionando para a Área 51...';
  }
  
  const spinner = document.querySelector('.spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
});

