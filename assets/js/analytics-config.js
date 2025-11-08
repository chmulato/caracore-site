/**
 * Cara Core Informática - Google Analytics
 * Configuração do Google Analytics GA4 com tracking de eventos personalizados
 * @version 2.0
 * @date 2025-11-08
 */

(function() {
  'use strict';

  // Inicializa o dataLayer
  window.dataLayer = window.dataLayer || [];
  
  function gtag() {
    dataLayer.push(arguments);
  }
  
  // Expõe gtag globalmente
  window.gtag = gtag;
  
  gtag('js', new Date());
  
  // Configuração principal do GA4
  gtag('config', 'G-MKFC9G3CL0', {
    'cookie_domain': 'caracore.com.br',
    'cookie_flags': 'SameSite=None;Secure',
    'cookie_update': true,
    'anonymize_ip': true,
    'send_page_view': true
  });

  // Tracking de eventos personalizados quando a página carregar
  window.addEventListener('load', function() {
    // Identifica qual página está sendo visualizada
    var pagePath = window.location.pathname;
    var pageTitle = document.title;
    
    // Evento de visualização de página específica
    gtag('event', 'page_view', {
      'page_title': pageTitle,
      'page_location': window.location.href,
      'page_path': pagePath
    });

    // Tracking de cliques em links externos
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var url = this.href;
        if (!url.includes('caracore.com.br')) {
          gtag('event', 'click', {
            'event_category': 'outbound',
            'event_label': url,
            'transport_type': 'beacon'
          });
        }
      });
    });

    // Tracking de cliques em botões de contato
    var contactButtons = document.querySelectorAll('[href*="whatsapp"], [href*="telegram"], [href*="mailto"]');
    contactButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var contactType = this.href.includes('whatsapp') ? 'WhatsApp' : 
                         this.href.includes('telegram') ? 'Telegram' : 'Email';
        gtag('event', 'contact_click', {
          'event_category': 'engagement',
          'event_label': contactType,
          'value': 1
        });
      });
    });

    // Tracking de navegação no menu
    document.querySelectorAll('.navbar-nav .nav-link').forEach(function(navLink) {
      navLink.addEventListener('click', function() {
        var menuItem = this.textContent.trim();
        gtag('event', 'navigation', {
          'event_category': 'menu',
          'event_label': menuItem
        });
      });
    });

    // Tracking de visualização de projetos no portfolio
    if (pagePath.includes('portfolio')) {
      var projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach(function(card) {
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var projectName = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Unknown';
              gtag('event', 'view_item', {
                'event_category': 'portfolio',
                'event_label': projectName,
                'value': 1
              });
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        observer.observe(card);
      });

      // Tracking de cliques em GitHub/Demo links
      document.querySelectorAll('.project-card a').forEach(function(link) {
        link.addEventListener('click', function() {
          var projectCard = this.closest('.project-card');
          var projectName = projectCard.querySelector('h3') ? projectCard.querySelector('h3').textContent : 'Unknown';
          var linkType = this.textContent.includes('GitHub') ? 'GitHub' : 
                        this.textContent.includes('Demo') ? 'Demo' : 'Other';
          gtag('event', 'project_link_click', {
            'event_category': 'portfolio',
            'event_label': projectName + ' - ' + linkType,
            'value': 1
          });
        });
      });
    }

    // Tracking de scroll depth
    var scrollDepths = [25, 50, 75, 90];
    var trackedDepths = {};
    
    window.addEventListener('scroll', function() {
      var scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
      
      scrollDepths.forEach(function(depth) {
        if (scrollPercent >= depth && !trackedDepths[depth]) {
          trackedDepths[depth] = true;
          gtag('event', 'scroll', {
            'event_category': 'engagement',
            'event_label': depth + '% scrolled',
            'value': depth
          });
        }
      });
    });

    // Tracking de tempo na página (a cada 30 segundos)
    var timeIntervals = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min
    timeIntervals.forEach(function(interval) {
      setTimeout(function() {
        gtag('event', 'timing_complete', {
          'event_category': 'engagement',
          'event_label': interval + ' seconds on page',
          'value': interval
        });
      }, interval * 1000);
    });
  });

})();
