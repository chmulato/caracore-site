/**
 * origin-fix.js - Corrige o origin para ambientes local e de produção
 */

(function() {
  // Definir um origin padrão se estivermos usando file://
  if (window.location.protocol === 'file:') {
    // Usar origin de produção se acessado via protocolo file://
    window.CARA_CORE_ENV = window.CARA_CORE_ENV || {};
    window.CARA_CORE_ENV.baseUrl = 'https://www.caracore.com.br';
    
    console.log('🔧 Protocolo file:// detectado, configurando origin padrão:', window.CARA_CORE_ENV.baseUrl);
  }
})();