/**
 * Controle de navegação responsiva
 */
(function () {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  
  if (!toggle || !links) return;
  
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  
  // Atualiza ano em rodapés, quando aplicável
  const yearLabel = document.getElementById('year');
  if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
  }
})();