/**
 * Carregador do Google Analytics 4 para as páginas públicas.
 */
(function () {
  'use strict';

  if (window.location.protocol === 'file:' ||
      ['www.caracore.com.br', 'caracore.com.br', 'personal.caracore.com.br'].indexOf(window.location.hostname) === -1) {
    return;
  }

  var config = window.CaraCoreAnalytics;
  if (!config || !config.measurementId) {
    return;
  }

  if (!document.querySelector('script[data-caracore-ga4]')) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.measurementId);
    script.setAttribute('data-caracore-ga4', 'true');
    document.head.appendChild(script);
  }

  config.initialize();
})();
