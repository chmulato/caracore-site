/**
 * Google Analytics 4 Configuration
 * Tracks page views and events for the internationalized site
 */

(function() {
  'use strict';
  
  // Google Analytics ID (same as legacy site)
  const GA_MEASUREMENT_ID = 'G-MKFC9G3CL0';
  
  // Initialize gtag if not already loaded
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    'page_path': window.location.pathname,
    'page_title': document.title,
    'page_location': window.location.href
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
    
    // Track service page views
    if (window.location.pathname.includes('services.html')) {
      gtag('event', 'page_view', {
        'page_title': 'Services Page',
        'page_location': window.location.href
      });
    }
    
    // Track articles page views
    if (window.location.pathname.includes('articles.html')) {
      gtag('event', 'page_view', {
        'page_title': 'Articles Page',
        'page_location': window.location.href
      });
    }
  });
  
  // Make gtag available globally
  window.gtag = gtag;
})();

