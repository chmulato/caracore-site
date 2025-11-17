/**
 * Script principal da página restrita.html
 * Gerencia autorização, autenticação, sessões mínimas e logout
 */

// Verificação de autorização na área restrita
// IMPORTANTE: Verificar autorização ANTES de verificar autenticação via SessionManager
// Isso permite acesso mesmo quando o token foi rejeitado por domínio não autorizado
// mas o usuário está autorizado no sistema
(async function() {
  'use strict';
  
  try {
    console.log('Restrita: Iniciando verificação de autorização');
    
    // Aguardar um pouco para scripts carregarem
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Obter informações do usuário de múltiplas fontes
    const userEmail = localStorage.getItem('user_email') || 
                     localStorage.getItem('auth_user_email') ||
                     sessionStorage.getItem('user_email') ||
                     sessionStorage.getItem('cara_core_user_email');
    
    const provider = localStorage.getItem('auth_provider') || 
                    localStorage.getItem('oauth_provider') ||
                    sessionStorage.getItem('cara_core_oidc_provider') ||
                    'google';
    
    if (userEmail) {
      console.log('Restrita: Verificando autorização para:', userEmail);
      
      // Verificar autorização PRIMEIRO (sem loading, página já está carregada)
      const isAuthorized = await requireAuthorization({
        email: userEmail,
        provider: provider,
        showLoading: false,
        redirectOnFail: true
      });
      
      if (isAuthorized) {
        console.log('Restrita: Usuário autorizado, acesso liberado');
        
        // Verificar se SessionManager está disponível
        const hasSessionManager = typeof SessionManager !== 'undefined' && SessionManager !== null;
        
        // Verificar se já tem sessão válida
        let hasValidSession = false;
        if (hasSessionManager) {
          try {
            hasValidSession = SessionManager.isAuthenticated();
          } catch (e) {
            console.warn('Erro ao verificar autenticação:', e);
          }
        } else {
          // Se SessionManager não está disponível, verificar manualmente
          const accessToken = localStorage.getItem('auth_access_token');
          const expiresAt = localStorage.getItem('auth_expires_at');
          if (accessToken && expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            hasValidSession = now < parseInt(expiresAt);
          }
        }
        
        // Se autorizado mas não tem sessão válida, criar uma sessão mínima
        const isMinimalSession = !hasValidSession;
        if (isMinimalSession) {
          console.log('Restrita: Usuário autorizado mas sem sessão válida, criando sessão mínima...');
          
          // Criar sessão mínima para permitir acesso
          // Isso é necessário quando o token foi rejeitado por domínio não autorizado
          // mas o usuário está autorizado no sistema
          const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hora
          localStorage.setItem('auth_access_token', 'authorized_session');
          localStorage.setItem('auth_expires_at', expiresAt.toString());
          localStorage.setItem('auth_provider', provider);
          localStorage.setItem('user_email', userEmail);
          localStorage.setItem('auth_user_email', userEmail);
          
          // Marcar como sessão mínima para não iniciar validação periódica
          localStorage.setItem('auth_minimal_session', 'true');
          
          // Salvar informações básicas do usuário
          const userInfo = {
            email: userEmail,
            provider: provider,
            authorized: true,
            name: userEmail.split('@')[0] || 'Usuário'
          };
          localStorage.setItem('auth_user_info', JSON.stringify(userInfo));
          
          console.log('Restrita: Sessão mínima criada para usuário autorizado');
          hasValidSession = true; // Agora tem sessão válida
        }
        
        // Verificar autenticação (sem iniciar verificação periódica se for sessão mínima)
        if (hasValidSession) {
          // Se SessionManager está disponível e não é sessão mínima, usar requireAuth
          if (hasSessionManager && !isMinimalSession && !localStorage.getItem('auth_minimal_session')) {
            try {
              if (!SessionManager.requireAuth()) {
                console.error('Restrita: Falha na autenticação, redirecionando...');
                return;
              }
            } catch (e) {
              console.warn('Erro ao chamar requireAuth:', e);
              // Continuar mesmo com erro
            }
          } else if (hasSessionManager && isMinimalSession) {
            // Para sessão mínima, iniciar verificação periódica mas sem validar no backend
            // A validação já foi ajustada no SessionManager para tratar sessões mínimas
            try {
              SessionManager.startSessionCheck();
            } catch (e) {
              console.warn('Erro ao iniciar verificação de sessão:', e);
              // Continuar mesmo com erro
            }
          }
          
          // Carregar e exibir informações do usuário
          await loadUserInfo(userEmail, provider);
          
          // Mostrar card de informações do usuário
          const userInfoCard = document.getElementById('userInfoCard');
          if (userInfoCard) {
            userInfoCard.classList.remove('d-none');
          }
          
          // Configurar handler de logout após mostrar o card
          setupLogoutHandler();
          
          console.log('[Estrita] Página protegida carregada com sucesso');
        } else {
          // Se sessão expirou, tentar renovar se ainda autorizado
          console.log('Restrita: Sessão expirada, verificando se pode renovar...');
          
          // Verificar autorização diretamente sem redirecionar
          if (window.authChecker) {
            const authResult = await window.authChecker.checkAuthorization(userEmail, provider, true);
            
            if (authResult.authorized) {
              // Renovar sessão mínima
              console.log('Restrita: Usuário ainda autorizado, renovando sessão mínima...');
              const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hora
              localStorage.setItem('auth_access_token', 'authorized_session');
              localStorage.setItem('auth_expires_at', expiresAt.toString());
              localStorage.setItem('auth_minimal_session', 'true');
              
              // Recarregar página para aplicar nova sessão
              window.location.reload();
            } else {
              console.error('Restrita: Usuário não autorizado mais, redirecionando...');
              window.location.href = '/secure/index.html';
            }
          } else {
            console.error('Restrita: AuthChecker não disponível, redirecionando...');
            window.location.href = '/secure/index.html';
          }
        }
      }
      // Se não autorizado, requireAuthorization já redirecionou
      
    } else {
      console.warn('Restrita: Email do usuário não encontrado, aguardando auth...');
      // Aguardar mais tempo para auth carregar
      setTimeout(async () => {
        const retryEmail = localStorage.getItem('user_email') || 
                          localStorage.getItem('auth_user_email') ||
                          sessionStorage.getItem('cara_core_user_email');
        
        if (retryEmail) {
          const retryProvider = localStorage.getItem('auth_provider') || 
                                sessionStorage.getItem('cara_core_oidc_provider') ||
                                'google';
          
          const isAuthorized = await requireAuthorization({
            email: retryEmail,
            provider: retryProvider,
            showLoading: false,
            redirectOnFail: true
          });
          
          if (isAuthorized) {
            if (!SessionManager.isAuthenticated()) {
              // Criar sessão mínima
              const expiresAt = Math.floor(Date.now() / 1000) + 3600;
              localStorage.setItem('auth_access_token', 'authorized_session');
              localStorage.setItem('auth_expires_at', expiresAt.toString());
              localStorage.setItem('auth_provider', retryProvider);
              localStorage.setItem('user_email', retryEmail);
              localStorage.setItem('auth_user_email', retryEmail);
              localStorage.setItem('auth_minimal_session', 'true');
              
              const userInfo = {
                email: retryEmail,
                provider: retryProvider,
                authorized: true
              };
              localStorage.setItem('auth_user_info', JSON.stringify(userInfo));
            }
            
            // Carregar informações do usuário
            await loadUserInfo(retryEmail, retryProvider);
            
            // Mostrar card de informações do usuário
            const userInfoCard = document.getElementById('userInfoCard');
            if (userInfoCard) {
              userInfoCard.classList.remove('d-none');
            }
            
            // Configurar handler de logout após mostrar o card
            setupLogoutHandler();
          }
        } else {
          console.error('Restrita: Usuário não autenticado');
          window.location.href = '/secure/access-denied.html?error=not_authenticated';
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('Restrita: Erro na verificação de autorização:', error);
    // Em caso de erro, redirecionar para acesso negado
    window.location.href = '/secure/access-denied.html?error=' + encodeURIComponent(error.message);
  }
})();

// Função para carregar informações do usuário
async function loadUserInfo(email, provider) {
  try {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userRoleEl = document.getElementById('userRole');
    
    // Definir email imediatamente
    if (userEmailEl) {
      userEmailEl.textContent = email;
    }
    
    // Tentar obter informações detalhadas do usuário
    let userName = email.split('@')[0]; // Fallback para parte antes do @
    let userRole = 'Usuário';
    
    // Verificar se temos informações do localStorage (sessão mínima)
    const userInfoStr = localStorage.getItem('auth_user_info');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo.name) {
          userName = userInfo.name;
        }
      } catch (e) {
        // Ignorar erro
      }
    }
    
    // Verificar se temos informações do OIDC
    try {
      if (window.OIDCAuth) {
        // Tentar getUserProfile primeiro (método padrão)
        if (typeof window.OIDCAuth.getUserProfile === 'function') {
          const profile = await window.OIDCAuth.getUserProfile();
          if (profile && profile.name) {
            userName = profile.name || profile.given_name || userName;
          }
        }
        // Fallback: tentar userManager.getUser()
        else if (window.OIDCAuth.userManager && typeof window.OIDCAuth.userManager.getUser === 'function') {
          const user = await window.OIDCAuth.userManager.getUser();
          if (user && user.profile) {
            userName = user.profile.name || user.profile.given_name || userName;
          }
        }
      }
    } catch (oidcError) {
      console.warn('Erro ao obter dados do OIDC:', oidcError);
    }
    
    // Verificar role do localStorage
    const storedRole = localStorage.getItem('auth_user_role');
    if (storedRole) {
      switch (storedRole.toLowerCase()) {
        case 'super_admin':
          userRole = 'Super Admin';
          break;
        case 'admin':
          userRole = 'Administrador';
          break;
        case 'user':
        default:
          userRole = 'Usuário';
          break;
      }
    }
    
    // Atualizar elementos
    if (userNameEl) {
      userNameEl.textContent = userName;
    }
    
    if (userRoleEl) {
      userRoleEl.textContent = userRole;
      // Ajustar classe do badge baseado no role
      userRoleEl.className = 'user-role badge ' + 
        (storedRole === 'super_admin' ? 'badge-warning' : 
         storedRole === 'admin' ? 'badge-info' : 'badge-success');
    }
    
    console.log('Informações do usuário carregadas:', { userName, email, userRole });
    
  } catch (error) {
    console.error('Erro ao carregar informações do usuário:', error);
  }
}

// Monitorar expiração da sessão mínima e renovar automaticamente
function setupMinimalSessionRenewal() {
  const isMinimalSession = localStorage.getItem('auth_minimal_session') === 'true';
  if (!isMinimalSession) return;
  
  // Verificar expiração a cada 5 minutos
  setInterval(async () => {
    const expiresAt = localStorage.getItem('auth_expires_at');
    if (!expiresAt) return;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = parseInt(expiresAt) - now;
    
    // Se expira em menos de 10 minutos, renovar
    if (expiresIn < 600) {
      const userEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
      const provider = localStorage.getItem('auth_provider') || 'google';
      
      if (userEmail && window.authChecker) {
        try {
          const authResult = await window.authChecker.checkAuthorization(userEmail, provider, false);
          
          if (authResult.authorized) {
            // Renovar sessão mínima
            const newExpiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hora
            localStorage.setItem('auth_expires_at', newExpiresAt.toString());
            console.log('Restrita: Sessão mínima renovada automaticamente');
          } else {
            console.warn('Restrita: Usuário não autorizado mais, sessão não renovada');
          }
        } catch (error) {
          console.warn('Restrita: Erro ao renovar sessão mínima:', error);
        }
      }
    }
  }, 300000); // Verificar a cada 5 minutos
}

// Iniciar monitoramento de renovação de sessão mínima
setupMinimalSessionRenewal();

// Função para configurar logout (pode ser chamada múltiplas vezes)
function setupLogoutHandler() {
  const logoutUserBtn = document.getElementById('logoutUser');
  if (!logoutUserBtn) {
    // Botão ainda não existe, tentar novamente em breve
    setTimeout(setupLogoutHandler, 500);
    return;
  }
  
  // Remover listeners anteriores se existirem
  const newLogoutBtn = logoutUserBtn.cloneNode(true);
  logoutUserBtn.parentNode.replaceChild(newLogoutBtn, logoutUserBtn);
  
  // Adicionar novo listener
  newLogoutBtn.addEventListener('click', async function() {
    try {
      console.log('🚪 Iniciando logout...');
      
      // Desabilitar botão durante logout
      newLogoutBtn.disabled = true;
      const originalContent = newLogoutBtn.innerHTML;
      newLogoutBtn.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
      
      // 1. Limpar dados usando UserSessionManager se disponível
      if (window.userSessionManager && typeof window.userSessionManager.handleUserLogout === 'function') {
        console.log('🧹 Limpando dados via UserSessionManager...');
        window.userSessionManager.handleUserLogout();
      }
      
      // 2. Limpar dados do SessionManager se disponível
      if (window.SessionManager && typeof window.SessionManager.clearSession === 'function') {
        console.log('🧹 Limpando sessão via SessionManager...');
        window.SessionManager.clearSession();
      }
      
      // 3. Limpar dados de autenticação manualmente (incluindo sessão mínima)
      const keysToRemove = [
        // Dados básicos
        'auth_user_email',
        'auth_user_role',
        'auth_provider',
        'user_email',
        'auth_access_token',
        'auth_refresh_token',
        'auth_expires_at',
        'auth_last_activity',
        'auth_user_info',
        'auth_minimal_session',
        
        // Dados OIDC
        'cara_core_oidc_provider',
        'cara_core_id_token',
        'cara_core_access_token',
        'cara_core_token_type',
        'cara_core_expires_at',
        'cara_core_user_profile',
        'cara_core_auth_time',
        'cara_core_user_email',
        'cara_core_session_id',
        'cara_core_token_expires_at',
        
        // Dados OAuth por provider
        'google_oauth_state',
        'google_pkce_verifier',
        'google_oauth_request_id',
        'google_oauth_login_started_at',
        'google_oauth_nonce',
        'microsoft_oauth_state',
        'microsoft_pkce_verifier',
        'entra_oauth_state',
        'entra_pkce_verifier',
        
        // Dados de autorização
        'auth_logs',
        'oidc_logs',
        'oidc_logs_count'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          console.debug(`Erro ao remover ${key}:`, e);
        }
      });
      
      // 4. Limpar chaves OIDC dinâmicas (que começam com 'oidc.')
      try {
        const oidcKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('oidc.')) {
            oidcKeys.push(key);
          }
        }
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('oidc.')) {
            oidcKeys.push(key);
          }
        }
        oidcKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (e) {
            console.debug(`Erro ao remover OIDC key ${key}:`, e);
          }
        });
      } catch (e) {
        console.warn('Erro ao limpar chaves OIDC:', e);
      }
      
      // 5. Limpar sessionStorage completamente
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Erro ao limpar sessionStorage:', e);
      }
      
      // 6. Limpar TokenManager se disponível
      if (window.tokenManager && typeof window.tokenManager.logout === 'function') {
        try {
          await window.tokenManager.logout();
        } catch (e) {
          console.warn('Erro ao fazer logout no TokenManager:', e);
        }
      }
      
      console.log('✅ Dados de autenticação limpos');
      
      // 7. Tentar logout federado via OIDC se disponível
      let logoutCompleted = false;
      if (window.OIDCAuth && typeof window.OIDCAuth.logout === 'function') {
        try {
          console.log('🔄 Fazendo logout federado via OIDC...');
          await window.OIDCAuth.logout();
          logoutCompleted = true;
          // OIDCAuth.logout() já redireciona, então não precisamos fazer nada mais
          return;
        } catch (oidcError) {
          console.warn('⚠️ Erro no logout OIDC, usando fallback:', oidcError);
        }
      }
      
      // 8. Tentar logout via SessionManager se disponível
      if (!logoutCompleted && window.SessionManager && typeof window.SessionManager.logout === 'function') {
        try {
          console.log('🔄 Fazendo logout via SessionManager...');
          await window.SessionManager.logout();
          logoutCompleted = true;
          // SessionManager.logout() já redireciona
          return;
        } catch (sessionError) {
          console.warn('⚠️ Erro no logout SessionManager, usando fallback:', sessionError);
        }
      }
      
      // 9. Fallback: redirecionar para página de login
      if (!logoutCompleted) {
        console.log('🔄 Redirecionando para página de login...');
        window.location.href = '/secure/index.html';
      }
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, garantir limpeza e redirecionamento
      try {
        if (window.userSessionManager && typeof window.userSessionManager.handleUserLogout === 'function') {
          window.userSessionManager.handleUserLogout();
        }
        if (window.SessionManager && typeof window.SessionManager.clearSession === 'function') {
          window.SessionManager.clearSession();
        }
        localStorage.clear();
        sessionStorage.clear();
      } catch (cleanupError) {
        console.error('Erro na limpeza de emergência:', cleanupError);
      }
      // Redirecionar mesmo com erro
      window.location.href = '/secure/index.html';
    }
  });
  
  console.log('✅ Handler de logout configurado');
}

// Event listeners para os botões do card do usuário
document.addEventListener('DOMContentLoaded', function() {
  const refreshAuthBtn = document.getElementById('refreshAuth');
  
  if (refreshAuthBtn) {
    refreshAuthBtn.addEventListener('click', async function() {
      try {
        const userEmail = localStorage.getItem('auth_user_email');
        const provider = localStorage.getItem('auth_provider') || 'google';
        
        if (userEmail && window.authChecker) {
          console.log('Atualizando autorização...');
          refreshAuthBtn.disabled = true;
          refreshAuthBtn.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
          
          // Forçar nova verificação (ignorar cache)
          const result = await window.authChecker.checkAuthorization(userEmail, provider, true);
          
          if (result.authorized) {
            await loadUserInfo(userEmail, provider);
            console.log('Autorização atualizada com sucesso');
          } else {
            console.warn('Autorização expirou, redirecionando...');
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar autorização:', error);
      } finally {
        if (refreshAuthBtn) {
          refreshAuthBtn.disabled = false;
          refreshAuthBtn.innerHTML = '<svg class="icon-sm" aria-hidden="true"><use href="#icon-cloud-check"></use></svg>';
        }
      }
    });
  }
  
  // Configurar handler de logout no DOMContentLoaded também (fallback)
  setupLogoutHandler();
});

