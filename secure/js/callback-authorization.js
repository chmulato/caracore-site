/**
 * Verificação de autorização após autenticação OAuth bem-sucedida
 * Movido de callback.html para arquivo externo devido ao CSP
 */

// Função para aguardar OAuth completar e obter dados corretos
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
          resolveOIDC(); // Continuar mesmo se não encontrar
        }, 5000);
      });
    };
    
    await waitForOIDCAuth();
    
    const checkAuth = async () => {
      checkCount++;
      
      // PRIORIDADE 1: Obter email diretamente do OIDCAuth (mais confiável)
      let userEmail = null;
      let provider = null;
      let accessToken = null;
      
      if (window.OIDCAuth) {
        try {
          const isAuthenticated = await window.OIDCAuth.isAuthenticated();
          if (isAuthenticated) {
            const user = await window.OIDCAuth.getUser();
            if (user && user.profile) {
              userEmail = user.profile.email || user.profile.preferred_username;
              provider = user.provider || localStorage.getItem('auth_provider');
              accessToken = user.access_token || localStorage.getItem('auth_access_token');
              
              // Validar compatibilidade entre provider e email
              if (userEmail && provider) {
                const emailDomain = userEmail.toLowerCase().split('@')[1];
                const isGoogleProvider = provider === 'google';
                const isMicrosoftProvider = provider === 'microsoft' || provider === 'entra';
                
                // Verificar incompatibilidade
                if (isGoogleProvider && (emailDomain === 'hotmail.com' || emailDomain === 'outlook.com' || emailDomain === 'live.com')) {
                  console.warn('⚠️ Callback: Incompatibilidade detectada - provider Google com email Microsoft:', userEmail);
                  // Limpar dados antigos incompatíveis
                  localStorage.removeItem('user_email');
                  localStorage.removeItem('auth_user_email');
                  localStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_id_token');
                  sessionStorage.removeItem('cara_core_access_token');
                  // Aguardar mais para callback processar corretamente
                  setTimeout(checkAuth, checkInterval);
                  return;
                }
                if (isMicrosoftProvider && emailDomain === 'gmail.com') {
                  console.warn('⚠️ Callback: Incompatibilidade detectada - provider Microsoft com email Google:', userEmail);
                  // Limpar dados antigos incompatíveis
                  localStorage.removeItem('user_email');
                  localStorage.removeItem('auth_user_email');
                  localStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_user_profile');
                  sessionStorage.removeItem('cara_core_id_token');
                  sessionStorage.removeItem('cara_core_access_token');
                  // Aguardar mais para callback processar corretamente
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
      
      // PRIORIDADE 2: Fallback para localStorage (apenas se OIDCAuth não retornou)
      if (!userEmail) {
        userEmail = localStorage.getItem('user_email') || 
                   localStorage.getItem('auth_user_email');
        provider = provider || localStorage.getItem('auth_provider');
        accessToken = accessToken || localStorage.getItem('auth_access_token');
      }
      
      // PRIORIDADE 3: Tentar obter do sessionStorage (dados OIDC)
      if (!userEmail) {
        try {
          const profileStr = sessionStorage.getItem('cara_core_user_profile');
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            userEmail = profile.email || profile.preferred_username;
            provider = provider || profile.provider || localStorage.getItem('auth_provider');
          }
        } catch (e) {
          // Ignorar erro
        }
      }
      
      // Log a cada 5 verificações (1 segundo)
      if (checkCount % 5 === 0) {
        console.log(`⏳ Aguardando OAuth... (${Math.floor((Date.now() - startTime) / 1000)}s)`, {
          hasEmail: !!userEmail,
          hasToken: !!accessToken,
          hasProvider: !!provider,
          source: window.OIDCAuth ? 'OIDCAuth' : 'localStorage'
        });
      }
      
      if (userEmail && accessToken) {
        console.log('✅ OAuth completado - dados encontrados:', { 
          userEmail, 
          provider: provider || 'unknown',
          hasToken: !!accessToken,
          checks: checkCount,
          elapsed: Math.floor((Date.now() - startTime) / 1000) + 's',
          source: window.OIDCAuth ? 'OIDCAuth' : 'localStorage'
        });
        resolve({ userEmail, accessToken, provider: provider || 'google' });
        return;
      }
      
      if (Date.now() - startTime > maxWaitTime) {
        console.warn('⏱️ Timeout aguardando OAuth completar', {
          maxWaitTime: maxWaitTime / 1000 + 's',
          checks: checkCount,
          hasEmail: !!userEmail,
          hasToken: !!accessToken
        });
        reject(new Error('Timeout aguardando OAuth completar'));
        return;
      }
      
      setTimeout(checkAuth, checkInterval);
    };
    
    checkAuth();
  });
}

// Verificação de autorização após autenticação OAuth bem-sucedida
document.addEventListener('DOMContentLoaded', function() {
  // Aguardar processamento do OAuth primeiro
  (async function() {
    try {
      console.log('🔄 Callback: Aguardando OAuth completar...');
      
      // Aguardar OAuth completar (até 15 segundos para dar tempo do callback processar)
      const { userEmail, provider } = await waitForOAuthCompletion(15000);
      
      const finalProvider = provider || 
                           localStorage.getItem('auth_provider') || 
                           new URLSearchParams(window.location.search).get('provider') || 
                           'google';
      
      console.log('✅ Callback: OAuth completado, verificando autorização para', userEmail, 'provider:', finalProvider);
      
      // Verificar autorização (com loading indicator)
      // Esta função já redireciona para first-access.html se necessário
      const isAuthorized = await requireAuthorization({
        email: userEmail,
        provider: finalProvider,
        showLoading: true
      });
      
      // Se chegou aqui, está autorizado - continuar para restrita.html
      if (isAuthorized) {
        console.log('✅ Callback: Usuário autorizado, redirecionando para área restrita');
        
        // Pequeno delay para mostrar sucesso
        setTimeout(() => {
          window.location.href = '/secure/restrita.html';
        }, 1500);
      }
      // Se não autorizado, requireAuthorization já redirecionou (access-denied ou first-access)
      
    } catch (error) {
      console.error('❌ Callback: Erro na verificação de autorização:', error);
      
      // Se timeout, tentar usar dados que possam existir
      const userEmail = localStorage.getItem('user_email') || 
                       localStorage.getItem('auth_user_email');
      
      if (userEmail) {
        console.log('⚠️ Callback: Timeout, mas email encontrado. Tentando verificar autorização...');
        try {
          const provider = localStorage.getItem('auth_provider') || 'google';
          await requireAuthorization({
            email: userEmail,
            provider: provider,
            showLoading: true
          });
        } catch (authError) {
          console.error('❌ Callback: Erro ao verificar autorização:', authError);
          // Em caso de erro, verificar se usuário está autorizado antes de redirecionar
          try {
            const backendUrl = window.location.hostname === 'localhost' 
              ? 'http://localhost:5051'
              : 'https://caracore-backend-docker.azurewebsites.net';
            
            const authCheck = await fetch(`${backendUrl}/api/check-authorization`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, provider: provider })
            });
            
            if (authCheck.ok) {
              const authData = await authCheck.json();
              if (authData.authorized && !authData.inactive) {
                console.log('✅ Usuário autorizado encontrado, redirecionando para área restrita');
                window.location.href = '/secure/restrita.html';
                return;
              }
            }
          } catch (checkError) {
            console.warn('⚠️ Não foi possível verificar autorização:', checkError);
          }
          // Se não autorizado ou erro na verificação, redirecionar para solicitação de acesso
          window.location.href = `/secure/request-access.html?email=${encodeURIComponent(userEmail)}`;
        }
      } else {
        // Sem email, redirecionar para login
        console.error('❌ Callback: Email não encontrado após timeout');
        window.location.href = '/secure/index.html?error=oauth_timeout';
      }
    }
  })();
});

// Listener para sucesso de autorização
document.addEventListener('authorizationSuccess', function(event) {
  console.log('Callback: Autorização confirmada:', event.detail);
  
  // Atualizar UI para mostrar sucesso
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
  
  // Esconder spinner
  const spinner = document.querySelector('.spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
});

