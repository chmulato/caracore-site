/**
 * Verificação de autorização após autenticação OAuth bem-sucedida
 * Movido de callback.html para arquivo externo devido ao CSP
 */

// Verificação de autorização após autenticação OAuth bem-sucedida
document.addEventListener('DOMContentLoaded', function() {
  // Aguardar processamento do OAuth primeiro
  setTimeout(async function() {
    try {
      // Obter informações do usuário do OAuth
      const userEmail = localStorage.getItem('user_email') || 
                       localStorage.getItem('auth_user_email') ||
                       new URLSearchParams(window.location.search).get('email');
      
      const provider = localStorage.getItem('auth_provider') || 
                      new URLSearchParams(window.location.search).get('provider') || 
                      'google';
      
      if (userEmail) {
        console.log('Callback: Verificando autorização para', userEmail);
        
        // Verificar autorização (com loading indicator)
        const isAuthorized = await requireAuthorization({
          email: userEmail,
          provider: provider,
          showLoading: true
        });
        
        // Se chegou aqui, está autorizado - continuar para restrita.html
        if (isAuthorized) {
          console.log('Callback: Usuário autorizado, redirecionando para área restrita');
          
          // Pequeno delay para mostrar sucesso
          setTimeout(() => {
            window.location.href = '/secure/restrita.html';
          }, 1500);
        }
        // Se não autorizado, requireAuthorization já redirecionou para access-denied
        
      } else {
        console.warn('Callback: Email do usuário não encontrado');
        // Fallback para OAuth completar primeiro
        setTimeout(() => {
          window.location.href = '/secure/restrita.html';
        }, 3000);
      }
      
    } catch (error) {
      console.error('Callback: Erro na verificação de autorização:', error);
      // Em caso de erro, redirecionar para acesso negado
      window.location.href = '/secure/access-denied.html?error=' + encodeURIComponent(error.message);
    }
  }, 2000); // Aguardar 2 segundos para OAuth completar
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

