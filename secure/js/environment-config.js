/**
 * environment-config.js - Configuração de ambiente e origin
 * Gerencia configurações de base URL e origin para diferentes ambientes (local, produção, file://)
 */

(function() {
  'use strict';
  
  // Inicializar objeto de configuração de ambiente se não existir
  window.CARA_CORE_ENV = window.CARA_CORE_ENV || {};
  
  // Configurar origin padrão se estivermos usando protocolo file://
  // Isso é necessário quando o HTML é aberto diretamente do sistema de arquivos
  if (window.location.protocol === 'file:') {
    // Usar origin de produção como padrão quando acessado via file://
    window.CARA_CORE_ENV.baseUrl = window.CARA_CORE_ENV.baseUrl || 'https://www.caracore.com.br';
    
    console.log('🔧 Protocolo file:// detectado, configurando origin padrão:', window.CARA_CORE_ENV.baseUrl);
  } else {
    // Em ambiente web (http/https), usar o origin atual
    window.CARA_CORE_ENV.baseUrl = window.CARA_CORE_ENV.baseUrl || window.location.origin;
  }
  
  console.log('✅ Environment config carregado - Base URL:', window.CARA_CORE_ENV.baseUrl);
})();