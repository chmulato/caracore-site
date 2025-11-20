/**
 * Proteção de Autorização para Páginas de Apresentação
 * 
 * Este módulo verifica se um usuário autenticado tem autorização para
 * acessar as páginas de apresentação (Hub e Seed) na Área 51.
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-11-18
 */

(function() {
  'use strict';
  
  // Detectar qual página está sendo carregada
  const pageName = document.title.includes('Hub') ? 'Hub' : 'Seed';
  
  async function initAuthorizationCheck() {
    try {
      console.log(`Apresentação ${pageName}: Iniciando verificação de autorização`);
      
      // Aguardar scripts carregarem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obter informações do usuário
      const userEmail = localStorage.getItem('user_email') || 
                       localStorage.getItem('auth_user_email') ||
                       sessionStorage.getItem('user_email') ||
                       sessionStorage.getItem('cara_core_user_email');
      
      const provider = localStorage.getItem('auth_provider') || 
                      localStorage.getItem('oauth_provider') ||
                      sessionStorage.getItem('cara_core_oidc_provider') ||
                      'google';
      
      if (userEmail) {
        console.log(`Apresentação ${pageName}: Verificando autorização para:`, userEmail);
        
        // Verificar autorização
        const isAuthorized = await requireAuthorization({
          email: userEmail,
          provider: provider,
          showLoading: true,
          redirectOnFail: true
        });
        
        if (isAuthorized) {
          console.log(`Apresentação ${pageName}: Usuário autorizado, acesso liberado`);
        } else {
          console.log(`Apresentação ${pageName}: Usuário não autorizado, redirecionamento executado`);
        }
      } else {
        // Se não tem email, aguardar autenticação OIDC
        if (typeof window.OIDCAuth !== 'undefined') {
          try {
            const isAuthenticated = await window.OIDCAuth.isAuthenticated();
            if (isAuthenticated) {
              const user = await window.OIDCAuth.getUser();
              const emailFromOIDC = user?.profile?.email || user?.profile?.preferred_username;
              if (emailFromOIDC) {
                const isAuthorized = await requireAuthorization({
                  email: emailFromOIDC,
                  provider: user.provider || provider,
                  showLoading: true,
                  redirectOnFail: true
                });
                if (isAuthorized) {
                  console.log(`Apresentação ${pageName}: Usuário autorizado via OIDC`);
                }
              }
            } else {
              console.log(`Apresentação ${pageName}: Usuário não autenticado, redirecionando...`);
              window.location.href = '/secure/index.html?error=not_authenticated';
            }
          } catch (error) {
            console.warn(`Apresentação ${pageName}: Erro ao verificar autenticação OIDC:`, error);
            window.location.href = '/secure/index.html?error=auth_error';
          }
        } else {
          // Aguardar OIDCAuth carregar
          await new Promise(resolve => {
            const checkOIDC = setInterval(() => {
              if (typeof window.OIDCAuth !== 'undefined') {
                clearInterval(checkOIDC);
                resolve();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(checkOIDC);
              if (typeof window.OIDCAuth === 'undefined') {
                console.warn(`Apresentação ${pageName}: OIDCAuth não carregou, redirecionando...`);
                window.location.href = '/secure/index.html?error=oidc_not_loaded';
              }
            }, 5000);
          });
        }
      }
    } catch (error) {
      console.error(`Apresentação ${pageName}: Erro crítico na verificação de autorização:`, error);
      window.location.href = '/secure/index.html?error=authorization_error';
    }
  }
  
  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthorizationCheck);
  } else {
    // DOM já está pronto
    initAuthorizationCheck();
  }
})();

