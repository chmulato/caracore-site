// Script de Diagnóstico OAuth Google - Execute no Console do Navegador
// Para usar: Abra o console (F12) na página de callback e cole este código

console.log("🔍 DIAGNÓSTICO OAUTH GOOGLE - INICIANDO");
console.log("=====================================");

// 1. Verificar URL atual e parâmetros
const currentUrl = window.location.href;
const params = new URLSearchParams(window.location.search);

console.log("📍 URL ATUAL:", currentUrl);
console.log("📊 PARÂMETROS:");
console.log("  • code:", params.get('code') ? `${params.get('code').substring(0, 20)}...` : 'AUSENTE');
console.log("  • state:", params.get('state') || 'AUSENTE');
console.log("  • error:", params.get('error') || 'AUSENTE');
console.log("  • scope:", params.get('scope') || 'AUSENTE');

// 2. Verificar SessionStorage/LocalStorage
console.log("\n🗂️ STORAGE VERIFICAÇÃO:");
const googleState = sessionStorage.getItem('google_oauth_state');
const googleVerifier = sessionStorage.getItem('google_pkce_verifier');
const googleNonce = sessionStorage.getItem('google_oauth_nonce');
const provider = sessionStorage.getItem('cara_core_oidc_provider') || localStorage.getItem('cara_core_oidc_provider');

console.log("  • google_oauth_state:", googleState ? 'PRESENTE' : 'AUSENTE');
console.log("  • google_pkce_verifier:", googleVerifier ? 'PRESENTE' : 'AUSENTE');
console.log("  • google_oauth_nonce:", googleNonce ? 'PRESENTE' : 'AUSENTE');
console.log("  • provider armazenado:", provider || 'AUSENTE');

// 3. Verificar se state combina
if (params.get('state') && googleState) {
    const stateMatch = params.get('state') === googleState;
    console.log("  • STATE MATCH:", stateMatch ? "✅ OK" : "❌ FALHA");
    if (!stateMatch) {
        console.log("    - URL state:", params.get('state'));
        console.log("    - Stored state:", googleState);
    }
} else {
    console.log("  • STATE CHECK: ⚠️ Impossível verificar (dados faltando)");
}

// 4. Verificar scripts carregados
console.log("\n📦 SCRIPTS CARREGADOS:");
const relevantScripts = [
    'oidc-client-ts.js',
    'auth-standalone.js', 
    'google-callback-debugger.js',
    'dynamic-config.js'
];

relevantScripts.forEach(scriptName => {
    const script = document.querySelector(`script[src*="${scriptName}"]`);
    console.log(`  • ${scriptName}:`, script ? '✅ CARREGADO' : '❌ AUSENTE');
});

// 5. Verificar objetos globais
console.log("\n🌐 OBJETOS GLOBAIS:");
console.log("  • window.OIDCAuth:", typeof window.OIDCAuth);
console.log("  • window.CARA_CORE_CONFIG:", typeof window.CARA_CORE_CONFIG);
console.log("  • window.OIDC_CONFIGS:", typeof window.OIDC_CONFIGS);

// 6. Tentar processar callback manualmente
console.log("\n🔧 TENTATIVA DE PROCESSAMENTO MANUAL:");

async function forceProcessCallback() {
    try {
        if (!params.get('code')) {
            throw new Error('Código de autorização ausente na URL');
        }

        if (!googleVerifier) {
            throw new Error('PKCE verifier ausente no sessionStorage');
        }

        if (!googleNonce) {
            throw new Error('Nonce ausente no sessionStorage');
        }

        // Simular chamada para o backend
        const tokenEndpoint = '/oauth/google/token';
        const redirectUri = 'https://www.caracore.com.br/secure/callback.html';
        
        console.log("📤 Enviando para:", tokenEndpoint);
        
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                code: params.get('code'),
                code_verifier: googleVerifier,
                redirect_uri: redirectUri,
                nonce: googleNonce
            })
        });

        console.log("📥 Resposta do backend:", {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });

        const result = await response.json();
        console.log("📋 Dados retornados:", result);

        if (response.ok && result.access_token) {
            console.log("✅ SUCESSO! Token obtido:", {
                access_token: result.access_token ? 'PRESENTE' : 'AUSENTE',
                id_token: result.id_token ? 'PRESENTE' : 'AUSENTE',
                expires_in: result.expires_in
            });
            
            // Limpar storage
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('google_pkce_verifier');  
            sessionStorage.removeItem('google_oauth_nonce');
            
            console.log("🚀 Redirecionando para área restrita...");
            window.location.href = '/secure/restrita.html';
            
        } else {
            console.log("❌ ERRO:", result);
        }

    } catch (error) {
        console.error("❌ ERRO NO PROCESSAMENTO:", error);
        console.log("Detalhes:", {
            name: error.name,
            message: error.message
        });
    }
}

// 7. Oferecer ações
console.log("\n🎯 AÇÕES DISPONÍVEIS:");
console.log("Execute: forceProcessCallback() - Para tentar processar manualmente");
console.log("Execute: window.location.href = '/secure/restrita.html' - Para ir direto à área restrita");

// Disponibilizar função
window.forceProcessCallback = forceProcessCallback;

// 8. Auto-execução se dados estão OK
const hasRequiredData = params.get('code') && googleVerifier && googleNonce;
if (hasRequiredData) {
    console.log("\n🤖 DADOS NECESSÁRIOS PRESENTES - Executando processamento automático em 3s...");
    setTimeout(() => {
        console.log("🚀 Iniciando processamento automático...");
        forceProcessCallback();
    }, 3000);
} else {
    console.log("\n⚠️ DADOS INCOMPLETOS - Execute forceProcessCallback() manualmente");
}

console.log("\n=====================================");
console.log("🔍 DIAGNÓSTICO CONCLUÍDO");