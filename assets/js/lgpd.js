/**
 * Banner de consentimento LGPD — camada de interface.
 *
 * A decisão em si (Consent Mode v2, cookies de medição) vive em
 * assets/js/analytics.js; aqui só se mostra e se esconde o banner.
 */
(function () {
  'use strict';

  var BANNER_ID = 'lgpd-banner';
  var CONSENT_KEY = 'cc-ga-consent';

  function api() {
    return window.CaraCoreAnalytics || null;
  }

  function currentConsent() {
    return api() && typeof api().consent === 'function' ? api().consent() : null;
  }

  function banner() {
    return document.getElementById(BANNER_ID);
  }

  function showBanner() {
    var element = banner();
    if (!element) {
      return;
    }
    element.style.display = 'block';
    element.style.animation = 'slideUp 0.5s ease-out';
  }

  function hideBanner() {
    var element = banner();
    if (!element) {
      return;
    }
    element.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(function () {
      element.style.display = 'none';
    }, 300);
  }

  window.acceptLGPD = function () {
    if (api()) {
      api().grant();
    }
    hideBanner();
  };

  window.declineLGPD = function () {
    if (api()) {
      api().deny();
    }
    hideBanner();
  };

  window.showLGPDPreferences = function () {
    var consent = currentConsent();
    if (!consent) {
      showBanner();
      return;
    }

    var status = consent === 'granted' ? 'Aceito' : 'Recusado';
    if (window.confirm('Preferência de medição atual: ' + status + '.\n\nDeseja escolher de novo?')) {
      try {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(CONSENT_KEY + '-date');
      } catch (error) {
        /* sem localStorage o banner aparece de qualquer forma */
      }
      showBanner();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (currentConsent() === null && banner()) {
      setTimeout(showBanner, 1000);
    }
  });
})();
