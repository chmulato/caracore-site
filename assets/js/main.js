/**
 * Cara Core Informática - Script Principal
 * Funcionalidades interativas da página principal
 */

(function() {
  'use strict';

  // Inicialização quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
    initPlanosSection();
  });

  /**
   * Inicializa a seção de planos flexíveis
   */
  function initPlanosSection() {
    const btnMostrarPlanos = document.getElementById('mostrar-planos');
    const btnFecharPlanos = document.getElementById('fechar-planos');
    const planosSection = document.getElementById('planos');

    if (!btnMostrarPlanos || !btnFecharPlanos || !planosSection) {
      console.warn('Elementos da seção de planos não encontrados');
      return;
    }

    // Adiciona evento ao botão "Planos Flexíveis"
    btnMostrarPlanos.addEventListener('click', function(e) {
      e.preventDefault();
      planosSection.classList.remove('d-none');
      window.scrollTo({ 
        top: planosSection.offsetTop - 60, 
        behavior: 'smooth' 
      });
    });

    // Adiciona evento ao botão "Fechar"
    btnFecharPlanos.addEventListener('click', function() {
      planosSection.classList.add('d-none');
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    });
  }

})();
