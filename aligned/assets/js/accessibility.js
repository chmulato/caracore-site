/**
 * Accessibility Enhancements
 * Keyboard navigation, focus management, and ARIA improvements
 */

(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    
    // Skip to main content link (for screen readers)
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'visually-hidden-focusable btn btn-primary position-absolute';
    skipLink.style.cssText = 'top: 10px; left: 10px; z-index: 1060;';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      const main = document.getElementById('main-content') || document.querySelector('main') || document.querySelector('.hero-section');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        main.scrollIntoView({ behavior: 'smooth' });
      }
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark if not present
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && !document.getElementById('main-content')) {
      heroSection.id = 'main-content';
      heroSection.setAttribute('role', 'main');
    }
    
    
    // Keyboard navigation for navigation menu
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(function(link, index) {
      link.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextLink = navLinks[index + 1] || navLinks[0];
          nextLink.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
          prevLink.focus();
        }
      });
    });
    
    // Focus management for modals and dropdowns
    const modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
      modal.addEventListener('shown.bs.modal', function() {
        const firstInput = modal.querySelector('input, textarea, select, button');
        if (firstInput) {
          firstInput.focus();
        }
      });
    });
    
    // Announce dynamic content changes to screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'visually-hidden';
    document.body.appendChild(liveRegion);
    
    // Function to announce messages
    window.announceToScreenReader = function(message) {
      liveRegion.textContent = message;
      setTimeout(function() {
        liveRegion.textContent = '';
      }, 1000);
    };
    
    // Add loading="lazy" to all images (if not already present)
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(function(img) {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
    
    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    interactiveElements.forEach(function(element) {
      if (!element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1') {
        // Ensure focusable elements are accessible
        if (element.tagName === 'A' && !element.href) {
          element.setAttribute('tabindex', '0');
        }
      }
    });
    
    // Add focus-visible styles for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
      *:focus-visible {
        outline: 3px solid var(--primary-blue, #1e3a8a);
        outline-offset: 2px;
      }
      .btn:focus-visible,
      .nav-link:focus-visible {
        outline: 3px solid var(--primary-blue, #1e3a8a);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
    
  });
})();

