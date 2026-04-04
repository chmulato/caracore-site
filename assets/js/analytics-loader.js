/**
 * Carrega GA4 (gtag + analytics-config) apenas após consentimento LGPD.
 * Evita pedido a googletagmanager.com antes do utilizador aceitar.
 * Se um bloqueador de anúncios bloquear o gtag.js, o analytics-config ainda é
 * carregado (comportamento alinhado ao carregamento em paralelo anterior).
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  var GA_ID = 'G-MKFC9G3CL0';
  var started = false;
  var configAppended = false;

  function appendAnalyticsConfig() {
    if (configAppended) return;
    configAppended = true;
    if (document.querySelector('script[data-caracore-analytics-config]')) return;
    var a = document.createElement('script');
    a.src = '/assets/js/analytics-config.js';
    a.async = true;
    a.setAttribute('data-caracore-analytics-config', '1');
    document.head.appendChild(a);
  }

  function loadCaracoreAnalytics() {
    if (started) return;
    started = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    s.onload = appendAnalyticsConfig;
    s.onerror = function () {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[Analytics] gtag.js não carregado (bloqueador de anúncios, extensão ou rede).');
      }
      appendAnalyticsConfig();
    };
    document.head.appendChild(s);
  }

  window.loadCaracoreAnalytics = loadCaracoreAnalytics;

  document.addEventListener('DOMContentLoaded', function () {
    try {
      if (localStorage.getItem('lgpd-consent') === 'accepted') {
        loadCaracoreAnalytics();
      }
    } catch (e) {
      /* localStorage indisponível */
    }
  });
})();
