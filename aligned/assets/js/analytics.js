/**
 * Google Analytics 4 Configuration
 * Tracks page views and events for the internationalized site
 */

(function() {
  'use strict';
  
  // Google Analytics ID shared by the public sites
  const GA_MEASUREMENT_ID = 'G-MKFC9G3CL0';

  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  gtagScript.setAttribute('data-caracore-ga4', 'true');
  document.head.appendChild(gtagScript);
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
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
  
  // Track language selection (via flag menu)
  document.addEventListener('DOMContentLoaded', function() {
    const flagDropdowns = document.querySelectorAll('.flag-dropdown');
    flagDropdowns.forEach(function(dropdown) {
      const menu = dropdown.querySelector('.flag-dropdown-menu');
      if (menu) {
        menu.addEventListener('click', function(e) {
          const flagItem = e.target.closest('.flag-dropdown-item');
          if (flagItem) {
            const lang = flagItem.getAttribute('aria-label') || flagItem.textContent.trim();
            gtag('event', 'language_switch', {
              'language': lang,
              'page_path': window.location.pathname
            });
          }
        });
      }
    });
    
    // Track external links to legacy content
    const legacyLinks = document.querySelectorAll('a[href*="../../"]');
    legacyLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        gtag('event', 'legacy_content_click', {
          'link_url': link.href,
          'link_text': link.textContent.trim()
        });
      });
    });
    
  });
  
})();

