/**
 * Stub local de analytics sem chamadas externas.
 * Mantém compatibilidade com chamadas existentes a window.gtag.
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  window.loadCaracoreAnalytics = function () {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('[Analytics] modo local ativo: nenhuma chamada externa foi realizada.');
    }
  };
})();
