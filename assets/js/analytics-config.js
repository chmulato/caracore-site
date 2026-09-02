/**
 * Configuração compartilhada do Google Analytics 4 para as páginas públicas.
 */
(function () {
  'use strict';

  var measurementId = 'G-MKFC9G3CL0';
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;
  window.CaraCoreAnalytics = window.CaraCoreAnalytics || {};
  window.CaraCoreAnalytics.measurementId = measurementId;
  window.CaraCoreAnalytics.initialize = function () {
    if (window.CaraCoreAnalytics.initialized) {
      return;
    }

    window.CaraCoreAnalytics.initialized = true;
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      cookie_domain: '.caracore.com.br',
      cookie_flags: 'SameSite=None;Secure',
      cookie_update: true,
      anonymize_ip: true,
      send_page_view: true,
      linker: {
        domains: ['caracore.com.br', 'personal.caracore.com.br']
      }
    });
  };
})();
