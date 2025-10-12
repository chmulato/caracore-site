/**
 * Verificação inicial de callback e exibição de fallback
 */
(function(){
  const params = new URLSearchParams(window.location.search);
  if (!params.has('code')) {
    const link = document.getElementById('fallbackLink');
    if (link) link.hidden = false;
  }

  // Caso o script standalone já tenha processado e redirecionado, exibimos um fallback após timeout
  setTimeout(() => {
    const link = document.getElementById('fallbackLink');
    if (link && link.hidden) {
      link.hidden = false;
    }
  }, 15000);
})();