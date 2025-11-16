/**
 * Verificação de autorização após autenticação OAuth Google bem-sucedida
 * Versão específica para Google - otimizada
 */

const PROVIDER = 'google';

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
    
    // Aguardar um tempo inicial para o callback processar (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Função para validar email
    const isValidEmail = (email) => {
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
    };
    
    const checkAuth = async () => {
      checkCount++;
      
      // PRIORIDADE 1: Obter email diretamente do OIDCAuth (mais confiável)
      let userEmail = null;
      let accessToken = null;
      
      if (window.OIDCAuth) {
        try {
          const isAuthenticated = await window.OIDCAuth.isAuthenticated();
          if (isAuthenticated) {
            const user = await window.OIDCAuth.getUser();
            if (user && user.profile) {
              userEmail = user.profile.email;
              accessToken = user.access_token || localStorage.getItem('auth_access_token');
              
              // Validar compatibilidade: Google deve ter email Gmail
              if (userEmail) {
                const emailDomain = userEmail.toLowerCase().split('@')[1];
                const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
                const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                         emailDomain === 'outlook.com' || 
                                         emailDomain === 'live.com' || 
                                         emailDomain === 'msn.com' ||
                                         emailDomain.startsWith('hotmail.') || 
                                         emailDomain.startsWith('outlook.') || 
                                         emailDomain.startsWith('live.');
                
                if (!isGmailDomain && isMicrosoftDomain) {
                  console.warn('⚠️ Callback Google: Incompatibilidade detectada - email Microsoft:', userEmail);
                  localStorage.removeItem('user_email');
                  localStorage.removeItem('auth_user_email');
                  localStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_id_token');
                  sessionStorage.removeItem('cara_core_access_token');
                  setTimeout(checkAuth, checkInterval);
                  return;
                }
              }
            }
          }
        } catch (e) {
          console.warn('Erro ao obter dados do OIDCAuth:', e);
        }
      }
      
      // PRIORIDADE 2: Fallback para localStorage (apenas se OIDCAuth não retornou E email for válido)
      if (!userEmail || !isValidEmail(userEmail)) {
        const emailFromStorage = localStorage.getItem('user_email') || 
                               localStorage.getItem('auth_user_email');
        if (isValidEmail(emailFromStorage)) {
          userEmail = emailFromStorage;
          accessToken = accessToken || localStorage.getItem('auth_access_token');
          console.log('✅ Email válido obtido do localStorage:', userEmail);
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
document.addEventListener('DOMContentLoaded', function() {
  (async function() {
    try {
      console.log('🔄 Callback Google: Aguardando OAuth completar...');
      
      const { userEmail, provider } = await waitForOAuthCompletion(15000);
      
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
        }, 1500);
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
});

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

