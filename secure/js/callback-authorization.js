/**
 * Verificação de autorização após autenticação OAuth bem-sucedida
 * Movido de callback.html para arquivo externo devido ao CSP
 */

// Função para aguardar OAuth completar
function waitForOAuthCompletion(maxWaitTime = 20000, checkInterval = 200) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    const checkAuth = () => {
      checkCount++;
      const userEmail = localStorage.getItem('user_email') || 
                       localStorage.getItem('auth_user_email');
      const accessToken = localStorage.getItem('auth_access_token');
      const userInfo = localStorage.getItem('auth_user_info');
      
      // Log a cada 5 verificações (1 segundo)
      if (checkCount % 5 === 0) {
        console.log(`⏳ Aguardando OAuth... (${Math.floor((Date.now() - startTime) / 1000)}s)`, {
          hasEmail: !!userEmail,
          hasToken: !!accessToken,
          hasUserInfo: !!userInfo
        });
      }
      
      if (userEmail && accessToken) {
        console.log('✅ OAuth completado - dados encontrados:', { 
          userEmail, 
          hasToken: !!accessToken,
          hasUserInfo: !!userInfo,
          checks: checkCount,
          elapsed: Math.floor((Date.now() - startTime) / 1000) + 's'
        });
        resolve({ userEmail, accessToken });
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
      
      // Aguardar OAuth completar (até 10 segundos)
      const { userEmail } = await waitForOAuthCompletion(10000);
      
      const provider = localStorage.getItem('auth_provider') || 
                      new URLSearchParams(window.location.search).get('provider') || 
                      'google';
      
      console.log('✅ Callback: OAuth completado, verificando autorização para', userEmail);
      
      // Verificar autorização (com loading indicator)
      // Esta função já redireciona para first-access.html se necessário
      const isAuthorized = await requireAuthorization({
        email: userEmail,
        provider: provider,
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
          // Em caso de erro, redirecionar para primeiro acesso
          window.location.href = `/secure/first-access.html?email=${encodeURIComponent(userEmail)}`;
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

