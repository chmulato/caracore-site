/**
 * button-debug.js - Script para diagnóstico de problemas com botões de login
 */

(function() {
  // Adicionar depuração após o carregamento da página
  window.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Iniciando diagnóstico de botões...');
    
    // Aguardar um momento para garantir que todos os scripts carregaram
    setTimeout(function() {
      // Verificar botões
      const btnGoogle = document.getElementById('btnLoginGoogle');
      const btnMicrosoft = document.getElementById('btnLoginMicrosoft');
      
      if (!btnGoogle) {
        console.error('❌ Botão Google não encontrado no DOM');
      }
      
      if (!btnMicrosoft) {
        console.error('❌ Botão Microsoft não encontrado no DOM');
      }
      
      // Verificar módulo de autenticação
      if (!window.OIDCAuth) {
        console.error('❌ Módulo OIDCAuth não encontrado');
      } else {
        console.log('✅ Módulo OIDCAuth carregado');
      }
      
      // Verificar biblioteca oidc-client-ts
      if (!window.oidc) {
        console.error('❌ Biblioteca oidc-client-ts não encontrada');
      } else {
        console.log('✅ Biblioteca oidc-client-ts carregada');
      }

      // Verificar configuração de ambiente
      console.log('📊 Configuração ambiente:', {
        protocol: window.location.protocol,
        origin: window.location.origin,
        baseUrl: window.CARA_CORE_ENV?.baseUrl || 'não definido',
        environment: window.OIDC_LOG_CONFIG?.environment || 'não definido'
      });

      // Relatar configuração
      if (window.CARA_CORE_ENV && window.CARA_CORE_ENV.baseUrl) {
        console.log('✅ baseUrl configurado:', window.CARA_CORE_ENV.baseUrl);
      } else {
        console.error('❌ baseUrl não configurado!');
      }
    }, 1000);
  });
})();