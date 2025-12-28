/**
 * Flag Menu Dropdown - Improved interaction with delay
 * Prevents menu from closing too quickly
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    let closeTimeout = null;
    const closeDelay = 300; // 300ms de delay antes de fechar
    
    const flagDropdowns = document.querySelectorAll('.flag-dropdown');
    
    flagDropdowns.forEach(function(dropdown) {
      const toggle = dropdown.querySelector('.flag-dropdown-toggle');
      const menu = dropdown.querySelector('.flag-dropdown-menu');
      
      if (!toggle || !menu) return;
      
      // Abre o menu ao clicar no botão
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('show');
        // Fecha todos os outros dropdowns
        flagDropdowns.forEach(function(otherDropdown) {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('show');
          }
        });
        // Toggle do dropdown atual
        dropdown.classList.toggle('show');
        clearTimeout(closeTimeout);
        // Atualiza aria-expanded
        toggle.setAttribute('aria-expanded', !isOpen);
      });
      
      // Mantém aberto quando o mouse está sobre o dropdown
      dropdown.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
        dropdown.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
      });
      
      // Delay antes de fechar ao sair do dropdown
      dropdown.addEventListener('mouseleave', function() {
        clearTimeout(closeTimeout);
        closeTimeout = setTimeout(function() {
          dropdown.classList.remove('show');
          toggle.setAttribute('aria-expanded', 'false');
        }, closeDelay);
      });
      
      // Previne fechamento ao clicar dentro do menu
      menu.addEventListener('click', function(event) {
        event.stopPropagation();
        clearTimeout(closeTimeout);
      });
    });
    
    // Fecha o menu ao clicar fora (sem delay)
    document.addEventListener('click', function(event) {
      const flagDropdown = event.target.closest('.flag-dropdown');
      if (!flagDropdown) {
        clearTimeout(closeTimeout);
        flagDropdowns.forEach(function(dropdown) {
          dropdown.classList.remove('show');
          const toggle = dropdown.querySelector('.flag-dropdown-toggle');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  });
})();

