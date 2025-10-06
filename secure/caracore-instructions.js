/**
 * caracore-instructions.js - Instruções específicas para www.caracore.com.br
 */

// URIs necessárias para os provedores (Google e Microsoft)
const REQUIRED_REDIRECT_URIS = [
  'https://www.caracore.com.br/secure/callback.html',
  'https://chmulato.github.io/cara-core/secure/callback.html',
  'http://localhost:8000/secure/callback.html',
  'http://127.0.0.1:8000/secure/callback.html'
];

const REQUIRED_LOGOUT_URIS = [
  'https://www.caracore.com.br/secure/logout.html',
  'https://chmulato.github.io/cara-core/secure/logout.html',
  'http://localhost:8000/secure/logout.html',
  'http://127.0.0.1:8000/secure/logout.html'
];

const REQUIRED_JS_ORIGINS = [
  'https://www.caracore.com.br',
  'http://localhost:8000'
];

// Exibe instruções de correção diretamente no console
async function showCaracoreInstructions() {
  try {
    console.clear();
  } catch {}

  console.log('%c🌐 DOMÍNIO CARACORE DETECTADO', 'color: #ff6b35; font-size: 20px; font-weight: bold;');
  console.log('='.repeat(80));
  console.log('');

  console.log('🚨 PROBLEMA IDENTIFICADO:');
  console.log('   Erro: callback_failed / redirect_uri is not valid');
  console.log('   Causa: a URI /secure/callback.html não está cadastrada no provedor');
  console.log(`   Domínio: ${window.location.hostname}`);
  console.log('');

  // GOOGLE
  console.log('🎯 SOLUÇÃO (GOOGLE)');
  console.log('   1. Acesse: https://console.cloud.google.com/apis/credentials');
  console.log('   2. Abra o OAuth 2.0 Client ID: 1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu');
  console.log('   3. Em "Authorized JavaScript origins", cadastre:');
  REQUIRED_JS_ORIGINS.forEach((uri) => console.log(`      • ${uri}`));
  console.log('   4. Em "Authorized redirect URIs", cadastre TODAS:');
  REQUIRED_REDIRECT_URIS.forEach((uri) => console.log(`      • ${uri}`));
  console.log('   5. Salve e aguarde 2-5 minutos.');
  console.log('');

  // MICROSOFT ENTRA ID
  console.log('🎯 SOLUÇÃO (MICROSOFT ENTRA ID)');
  console.log('   1. Acesse: https://portal.azure.com/');
  console.log('   2. App Registration (Client ID: ***AZURE_SECRET_REDACTED***)');
  console.log('   3. Em "Authentication > Web", confirme a Redirect URI:');
  REQUIRED_REDIRECT_URIS.forEach((uri) => console.log(`      • ${uri}`));
  console.log('   4. Em "Front-channel logout URL", cadastre:');
  REQUIRED_LOGOUT_URIS.forEach((uri) => console.log(`      • ${uri}`));
  console.log('   5. Salve e aguarde a propagação.');
  console.log('');

  // Lista para copiar
  console.log('📋 LISTA PARA COPIAR (Google + Microsoft)');
  console.log('%cJavaScript Origins:', 'background: #e3f2fd; color: #000; padding: 4px; font-weight: bold;');
  REQUIRED_JS_ORIGINS.forEach((uri) => console.log(`   ${uri}`));
  console.log('%cRedirect URIs:', 'background: #ffeb3b; color: #000; padding: 4px; font-weight: bold;');
  REQUIRED_REDIRECT_URIS.forEach((uri) => console.log(`   ${uri}`));
  console.log('%cLogout URIs:', 'background: #c8e6c9; color: #000; padding: 4px; font-weight: bold;');
  REQUIRED_LOGOUT_URIS.forEach((uri) => console.log(`   ${uri}`));
  console.log('');

  // Copia automática
  const clipboardText = [
    'JavaScript Origins:',
    ...REQUIRED_JS_ORIGINS,
    '',
    'Redirect URIs:',
    ...REQUIRED_REDIRECT_URIS,
    '',
    'Logout URIs:',
    ...REQUIRED_LOGOUT_URIS
  ].join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(clipboardText);
      console.log('✅ URIs copiadas automaticamente para clipboard!');
    } catch (err) {
      console.log('💡 Use window.caracoreInstructions.copyAll() para copiar manualmente');
    }
  }

  // Mostrar configuração atual (se disponível)
  let googleConfig;
  let microsoftConfig;
  try {
    if (typeof window.getProviderConfig === 'function') {
      googleConfig = await window.getProviderConfig('google');
      microsoftConfig = await window.getProviderConfig('microsoft');
    }
  } catch (e) {
    console.warn('⚠️ Não foi possível carregar configurações dinâmicas:', e.message);
  }

  const fallbackRedirect = `${window.location.origin}/secure/callback.html`;

  console.log('📊 CONFIGURAÇÃO ATUAL:');
  console.table({
    'URL Atual': window.location.href,
    Domínio: window.location.hostname,
    Protocolo: window.location.protocol,
    'JavaScript Origin': window.location.origin,
    'Redirect URI (Google)': googleConfig?.redirect_uri || fallbackRedirect,
    'Redirect URI (Microsoft)': microsoftConfig?.redirect_uri || fallbackRedirect,
    'Logout URI (Microsoft)': microsoftConfig?.post_logout_redirect_uri || `${window.location.origin}/secure/logout.html`
  });

  return {
    action: 'Registrar URIs para Google e Microsoft',
    google_client_id: '1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu',
    microsoft_client_id: '***AZURE_SECRET_REDACTED***',
    redirect_uris: REQUIRED_REDIRECT_URIS,
    logout_uris: REQUIRED_LOGOUT_URIS
  };
}

// Utilitário para copiar toda a lista novamente
async function copyAllUris() {
  const text = [
    'JavaScript Origins:',
    ...REQUIRED_JS_ORIGINS,
    '',
    'Redirect URIs:',
    ...REQUIRED_REDIRECT_URIS,
    '',
    'Logout URIs:',
    ...REQUIRED_LOGOUT_URIS
  ].join('\n');

  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    console.warn('⚠️ Clipboard API indisponível. Copie manualmente a lista no console.');
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    console.log('✅ Lista completa copiada para clipboard!');
    return true;
  } catch (error) {
    console.error('❌ Não foi possível copiar a lista:', error);
    return false;
  }
}

// Verifica se o erro aparente foi resolvido
function checkIfFixed() {
  console.log('🔍 Verificando se correção foi aplicada...');
  const hasError = window.location.search.includes('error');
  if (hasError) {
    console.log('❌ Ainda há erro na URL');
    console.log('💡 A URI provavelmente ainda não foi registrada ou não propagou');
    console.log('⏱️ Aguarde mais alguns minutos e recarregue a página');
  } else {
    console.log('✅ Não há erro aparente na URL');
    console.log('🧪 Teste fazendo login para confirmar');
  }
  return { hasError, recommendation: hasError ? 'Wait and reload' : 'Test login' };
}

// Mostra janela de propagação sugerida
function checkPropagationStatus() {
  const now = new Date();
  const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);
  console.log('⏱️ STATUS DE PROPAGAÇÃO:');
  console.log(`   Agora: ${now.toLocaleTimeString()}`);
  console.log(`   Esperado até: ${fiveMinutesLater.toLocaleTimeString()}`);
  console.log('');
  console.log('💡 Se após 5 minutos ainda houver erro:');
  console.log('   - Verifique se a URI foi salva corretamente');
  console.log('   - Limpe o cache do navegador');
  console.log('   - Tente em aba anônima');
  return { current_time: now, expected_ready: fiveMinutesLater, minutes_remaining: 5 };
}

// Auto-executa no domínio de produção
if (window.location.hostname === 'www.caracore.com.br') {
  const run = () => showCaracoreInstructions().catch((e) => console.error('❌ Erro nas instruções:', e));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(run, 2000));
  } else {
    setTimeout(run, 2000);
  }
  setInterval(() => {
    if (!window.location.search.includes('error')) {
      console.log('✅ Erro de redirect_uri parece ter sido resolvido!');
    }
  }, 30000);
}

// API pública
window.caracoreInstructions = {
  show: () => showCaracoreInstructions(),
  copyAll: () => copyAllUris(),
  checkFixed: () => checkIfFixed(),
  checkPropagation: () => checkPropagationStatus()
};