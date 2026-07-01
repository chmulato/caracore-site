/**
 * Configuração local de analytics (sem rede externa).
 * Preserva API de tracking para evitar erros em páginas legadas.
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;
})();
