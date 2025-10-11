// Comando rápido para usar no console quando o login OAuth falhar
// Cole este código no console (F12) da página de callback

// Método 1: Carregar script de diagnóstico automaticamente
fetch('/scripts/diagnostico_oauth_google.js')
  .then(r => r.text())
  .then(code => {
    console.log("🔧 Carregando diagnóstico OAuth Google...");
    eval(code);
  })
  .catch(err => {
    console.error("❌ Erro ao carregar diagnóstico:", err);
    // Fallback direto para área restrita
    console.log("🚀 Redirecionando diretamente...");
    window.location.href = '/secure/restrita.html';
  });

// Método 2: Força acesso direto (se diagnóstico falhar)
// window.location.href = '/secure/restrita.html';