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
    const isAuthenticated = await window.OIDCAuth.isAuthenticated();
    if (!isAuthenticated) {
      showNotLogged();
      return;
    }

    const profile = await window.OIDCAuth.getUserProfile();
    const storedInfo = window.OIDCAuth.getStoredUserInfo && window.OIDCAuth.getStoredUserInfo();

    if (profile) {
      if (roleBadge) {
        roleBadge.textContent = profile.email || profile.name || 'Usuário autenticado';
        roleBadge.classList.remove('d-none');
      }
      if (providerEl && storedInfo?.provider) {
        const providerName = storedInfo.provider === 'google' ? 'Google Workspace' : 'Microsoft Entra ID';
        const providerIcon = storedInfo.provider === 'google' ? icon('google', 'icon-sm') : icon('cloud-check', 'icon-sm');
        providerEl.innerHTML = `${providerIcon} Sessão via ${providerName}`;
      }
      applyStatus('success', `Autenticado como ${profile.email || profile.name}`);
      if (statusHint) statusHint.textContent = 'Você está autenticado. Aproveite os conteúdos exclusivos.';
    } else {
      showNotLogged();
    }
  } catch (error) {
    console.error('Erro ao validar sessão restrita:', error);
    showNotLogged();
  }
});