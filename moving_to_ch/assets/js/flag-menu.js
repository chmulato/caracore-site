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
      
      // Função para ajustar posição do menu em mobile
      function adjustMenuPosition() {
        if (window.innerWidth <= 768 && dropdown.classList.contains('show')) {
          setTimeout(function() {
            // Força o menu a ser exibido para calcular dimensões
            const wasHidden = menu.style.display === 'none';
            if (wasHidden) {
              menu.style.display = 'block';
            }
            
            const menuRect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            // Remove ajustes anteriores
            menu.classList.remove('menu-adjusted');
            menu.style.right = '';
            menu.style.left = '';
            
            // Se o menu está saindo da tela à direita
            if (menuRect.right > viewportWidth - 1) {
              const overflow = menuRect.right - (viewportWidth - 1);
              const currentRight = parseFloat(window.getComputedStyle(menu).right) || 0.5;
              menu.style.right = Math.max(0.5, currentRight - overflow) + 'px';
              menu.classList.add('menu-adjusted');
            }
            
            // Se o menu está saindo da tela à esquerda
            if (menuRect.left < 1) {
              menu.style.left = '0.5rem';
              menu.style.right = 'auto';
              menu.classList.add('menu-adjusted');
            }
            
            if (wasHidden && !dropdown.classList.contains('show')) {
              menu.style.display = '';
            }
          }, 50);
        }
      }
      
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
        
        // Ajusta posição do menu em mobile após abrir
        if (!isOpen) {
          setTimeout(adjustMenuPosition, 10);
        }
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
          const menu = dropdown.querySelector('.flag-dropdown-menu');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
          // Reseta posição do menu
          if (menu) {
            menu.style.right = '';
            menu.style.left = '';
          }
        });
      }
    });
    
    // Ajusta posição do menu ao redimensionar a janela
    window.addEventListener('resize', function() {
      flagDropdowns.forEach(function(dropdown) {
        if (dropdown.classList.contains('show')) {
          const toggle = dropdown.querySelector('.flag-dropdown-toggle');
          const menu = dropdown.querySelector('.flag-dropdown-menu');
          if (toggle && menu) {
            setTimeout(function() {
              const toggleRect = toggle.getBoundingClientRect();
              const menuRect = menu.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              
              if (window.innerWidth <= 768) {
                if (menuRect.right > viewportWidth) {
                  const overflow = menuRect.right - viewportWidth;
                  menu.style.right = (parseFloat(menu.style.right) || 0.5) + overflow + 'px';
                }
                if (menuRect.left < 0) {
                  menu.style.left = '0.5rem';
                  menu.style.right = 'auto';
                }
              } else {
                // Reseta em desktop
                menu.style.right = '';
                menu.style.left = '';
              }
            }, 10);
          }
        }
      });
    });
  });
})();

