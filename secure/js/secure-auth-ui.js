/**
 * Utilitários de ícones SVG e controle de sessão para página restrita
 */
const icon = (name, extraClass = '') => `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

document.addEventListener('DOMContentLoaded', async () => {
  const roleBadge = document.getElementById('roleBadge');
  const statusPanel = document.getElementById('statusPanel');
  const providerEl = document.getElementById('currentProvider');
  const statusHint = document.querySelector('.status-hint');

  function applyStatus(kind, message) {
    if (!statusPanel) return;
    statusPanel.classList.remove('d-none', 'status-panel-info', 'status-panel-success');
    statusPanel.classList.add(kind === 'success' ? 'status-panel-success' : 'status-panel-info');
    statusPanel.innerHTML = `${icon(kind === 'success' ? 'check-circle' : 'cloud-check', 'icon-sm')} ${message}`;
  }

  function showNotLogged() {
    document.title = 'Área Restrita — Acesso negado';
    const shell = document.querySelector('.site-shell');
    if (!shell) return;
    shell.innerHTML = `
      <div class="not-auth">
        <div class="not-auth-card">
          ${icon('warning', 'icon-lg')}
          <h1>Você não está autenticado</h1>
          <p>Para acessar os conteúdos reservados da Cara Core é preciso fazer login na Área 51 com sua conta autorizada.</p>
          <a class="btn btn-primary" href="/secure/">
            ${icon('shield-lock', 'icon-sm')}
            Ir para a página de login
          </a>
        </div>
      </div>
    `;
  }

  async function waitForAuth() {
    if (typeof window.OIDCAuth !== 'undefined') return;
    await new Promise(resolve => {
      const poll = () => {
        if (typeof window.OIDCAuth !== 'undefined') { resolve(); return; }
        setTimeout(poll, 100);
      };
      poll();
    });
  }

  try {
    await waitForAuth();
    
    // Verificar se há verificação de autorização em andamento
    // Aguardar um pouco para permitir que a verificação de autorização seja concluída
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se a página já foi substituída pela mensagem de "não autenticado"
    // Se sim, não fazer nada (a verificação de autorização já tratou)
    const isShowingNotAuth = document.body.textContent.includes('Você não está autenticado');
    if (isShowingNotAuth) {
      console.log('⚠️ Página já mostra "não autenticado", aguardando verificação de autorização...');
      return;
    }
    
    // Verificar se há dados de autorização no localStorage/sessionStorage
    const userEmail = localStorage.getItem('user_email') || 
                     localStorage.getItem('auth_user_email') ||
                     sessionStorage.getItem('user_email');
    
    // Se não há email, verificar autenticação OIDC
    if (!userEmail) {
      const isAuthenticated = await window.OIDCAuth.isAuthenticated();
      if (!isAuthenticated) {
        // Aguardar mais um pouco antes de mostrar "não autenticado"
        // para dar tempo da verificação de autorização
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar novamente se a página foi substituída
        const stillShowingNotAuth = document.body.textContent.includes('Você não está autenticado');
        if (!stillShowingNotAuth) {
          showNotLogged();
        }
        return;
      }
    }

    const profile = await window.OIDCAuth.getUserProfile();
    const storedInfo = window.OIDCAuth.getStoredUserInfo && window.OIDCAuth.getStoredUserInfo();

    if (profile || userEmail) {
      if (roleBadge) {
        roleBadge.textContent = (profile?.email || profile?.name || userEmail) || 'Usuário autenticado';
        roleBadge.classList.remove('d-none');
      }
      if (providerEl && storedInfo?.provider) {
        const providerName = storedInfo.provider === 'google' ? 'Google Workspace' : 'Microsoft Entra ID';
        const providerIcon = storedInfo.provider === 'google' ? icon('google', 'icon-sm') : icon('cloud-check', 'icon-sm');
        providerEl.innerHTML = `${providerIcon} Sessão via ${providerName}`;
      }
      applyStatus('success', `Autenticado como ${profile?.email || profile?.name || userEmail || 'Usuário'}`);
      if (statusHint) statusHint.textContent = 'Você está autenticado. Aproveite os conteúdos exclusivos.';
    } else {
      // Só mostrar "não autenticado" se realmente não houver dados
      // Aguardar mais um pouco para verificação de autorização
      await new Promise(resolve => setTimeout(resolve, 1000));
      const stillShowingNotAuth = document.body.textContent.includes('Você não está autenticado');
      if (!stillShowingNotAuth) {
        showNotLogged();
      }
    }
  } catch (error) {
    console.error('Erro ao validar sessão restrita:', error);
    // Não mostrar "não autenticado" imediatamente em caso de erro
    // Aguardar verificação de autorização
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isShowingNotAuth = document.body.textContent.includes('Você não está autenticado');
    if (!isShowingNotAuth) {
      showNotLogged();
    }
  }
});