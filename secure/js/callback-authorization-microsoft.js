/**
 * Verificação de autorização após autenticação OAuth Microsoft bem-sucedida
 * Versão específica para Microsoft Entra ID - otimizada
 */

const PROVIDER = 'microsoft';

// Função para aguardar OAuth completar e obter dados corretos (Microsoft)
async function waitForOAuthCompletion(maxWaitTime = 30000, checkInterval = 200) {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
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
      
      let userEmail = null;
      let accessToken = null;
      
      // PRIORIDADE 1: Verificar localStorage primeiro (mais rápido, dados do auto-fix)
      const emailFromStorage = localStorage.getItem('user_email') || 
                             localStorage.getItem('auth_user_email');
      if (isValidEmail(emailFromStorage)) {
        userEmail = emailFromStorage;
        accessToken = localStorage.getItem('auth_access_token');
        console.log('✅ Email válido obtido do localStorage (prioridade):', userEmail);
      }
      
      // PRIORIDADE 2: Obter email diretamente do OIDCAuth (se disponível)
      if (!userEmail && window.OIDCAuth) {
        try {
          const isAuthenticated = await window.OIDCAuth.isAuthenticated();
          if (isAuthenticated) {
            const user = await window.OIDCAuth.getUser();
            if (user && user.profile) {
              userEmail = user.profile.email || user.profile.preferred_username;
              accessToken = user.access_token || localStorage.getItem('auth_access_token');
              
              // Validar compatibilidade: Microsoft deve ter email Microsoft
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
                
                if (isGmailDomain && !isMicrosoftDomain) {
                  console.warn('⚠️ Callback Microsoft: Incompatibilidade detectada - email Google:', userEmail);
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
          console.debug('OIDCAuth não disponível ou erro:', e);
        }
      }
      
      // PRIORIDADE 3: Tentar obter do sessionStorage (dados OIDC) - apenas se válido
      if (!userEmail || !isValidEmail(userEmail)) {
        try {
          const profileStr = sessionStorage.getItem('cara_core_user_profile');
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            const emailFromSession = profile.email || profile.preferred_username;
            if (isValidEmail(emailFromSession)) {
              userEmail = emailFromSession;
              accessToken = accessToken || sessionStorage.getItem('cara_core_access_token');
              console.log('✅ Email válido obtido do sessionStorage:', userEmail);
            }
          }
        } catch (e) {
          // Ignorar erro
        }
      }
      
      // Se ainda não tem email válido, aguardar mais (mas não muito tempo)
      if (!userEmail || !isValidEmail(userEmail)) {
        if (Date.now() - startTime < 10000) { // Aumentado para 10 segundos
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
        
        console.log(`⏳ Aguardando OAuth Microsoft... (${Math.floor((Date.now() - startTime) / 1000)}s)`, {
          hasEmail: !!userEmail,
          isValidEmail: userEmail ? isValidEmail(userEmail) : false,
          hasToken: !!accessToken,
          oidcAuthenticated: oidcAuthStatus
        });
      }
      
      // Só resolver se tiver email VÁLIDO e token
      if (userEmail && isValidEmail(userEmail) && accessToken) {
        console.log('✅ OAuth Microsoft completado - dados encontrados:', { 
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
        console.warn('⏱️ Timeout aguardando OAuth Microsoft completar', {
          maxWaitTime: maxWaitTime / 1000 + 's',
          checks: checkCount
        });
        reject(new Error('Timeout aguardando OAuth Microsoft completar'));
        return;
      }
      
      setTimeout(checkAuth, checkInterval);
    };
    
    checkAuth();
  });
}

// Verificação de autorização após autenticação OAuth Microsoft bem-sucedida
document.addEventListener('DOMContentLoaded', function() {
  (async function() {
    try {
      console.log('🔄 Callback Microsoft: Aguardando OAuth completar...');
      
      // Aguardar um pouco mais para garantir que o auto-fix processou
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { userEmail, provider } = await waitForOAuthCompletion(20000);
      
      console.log('✅ Callback Microsoft: OAuth completado, verificando autorização para', userEmail);
      
      const isAuthorized = await requireAuthorization({
        email: userEmail,
        provider: provider || PROVIDER,
        showLoading: true
      });
      
      if (isAuthorized) {
        console.log('✅ Callback Microsoft: Usuário autorizado, redirecionando para área restrita');
        setTimeout(() => {
          window.location.href = '/secure/restrita.html';
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ Callback Microsoft: Erro na verificação de autorização:', error);
      
      const userEmail = localStorage.getItem('user_email') || 
                       localStorage.getItem('auth_user_email');
      
      if (userEmail && !userEmail.includes('user@caracore.com.br')) {
        console.log('⚠️ Callback Microsoft: Timeout, mas email encontrado. Tentando verificar autorização...');
        try {
          await requireAuthorization({
            email: userEmail,
            provider: PROVIDER,
            showLoading: true
          });
        } catch (authError) {
          console.error('❌ Callback Microsoft: Erro ao verificar autorização:', authError);
          window.location.href = `/secure/first-access.html?email=${encodeURIComponent(userEmail)}&provider=${PROVIDER}`;
        }
      } else {
        console.error('❌ Callback Microsoft: Email não encontrado após timeout');
        window.location.href = '/secure/index.html?error=oauth_timeout';
      }
    }
  })();
});

// Listener para sucesso de autorização
document.addEventListener('authorizationSuccess', function(event) {
  console.log('Callback Microsoft: Autorização confirmada:', event.detail);
  
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

