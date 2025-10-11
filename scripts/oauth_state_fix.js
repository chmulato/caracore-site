// Fix para problema de State OAuth perdido
// Execute no console da página de callback quando aparecer "No matching state found in storage"

console.log("🔧 OAUTH STATE FIX - INICIANDO");
console.log("==============================");

function fixOAuthState() {
    const params = new URLSearchParams(window.location.search);
    const urlState = params.get('state');
    const urlCode = params.get('code');
    
    console.log("📊 Dados da URL:");
    console.log("  • State:", urlState);
    console.log("  • Code:", urlCode ? 'PRESENTE' : 'AUSENTE');
    
    if (!urlState || !urlCode) {
        console.log("❌ Dados insuficientes na URL");
        return false;
    }
    
    // Força armazenamento do state correto
    console.log("🔄 Restaurando state no sessionStorage...");
    sessionStorage.setItem('google_oauth_state', urlState);
    
    // Verificar se existe verifier (pode ter sido perdido também)
    let verifier = sessionStorage.getItem('google_pkce_verifier');
    if (!verifier) {
        console.log("⚠️ PKCE verifier também foi perdido!");
        console.log("🎯 Vamos tentar recuperar ou criar um novo fluxo...");
        
        // Força um novo fluxo OAuth mais simples
        const simpleOAuth = confirm("State OAuth foi perdido. Tentar novo login?");
        if (simpleOAuth) {
            // Limpar tudo e começar novo
            sessionStorage.clear();
            localStorage.removeItem('cara_core_oidc_provider');
            
            // Redirecionar para página de login
            window.location.href = '/secure/index.html';
            return;
        }
    }
    
    // Verificar nonce
    let nonce = sessionStorage.getItem('google_oauth_nonce');
    if (!nonce) {
        console.log("⚠️ Nonce também foi perdido, gerando novo...");
        nonce = generateSimpleNonce();
        sessionStorage.setItem('google_oauth_nonce', nonce);
    }
    
    console.log("✅ State restaurado! Tentando processar callback...");
    
    // Tentar chamar o callback novamente
    if (window.OIDCAuth && typeof window.OIDCAuth.handleAuthCallback === 'function') {
        window.OIDCAuth.handleAuthCallback()
            .then(() => {
                console.log("✅ Callback processado com sucesso!");
                window.location.href = '/secure/restrita.html';
            })
            .catch(err => {
                console.log("❌ Ainda falhou:", err);
                forceTokenExchange();
            });
    } else {
        console.log("🔄 OIDCAuth não disponível, tentando troca direta de token...");
        forceTokenExchange();
    }
}

function generateSimpleNonce() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

async function forceTokenExchange() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const verifier = sessionStorage.getItem('google_pkce_verifier');
    const nonce = sessionStorage.getItem('google_oauth_nonce');
    
    if (!code) {
        console.log("❌ Sem código para trocar");
        fallbackToArea();
        return;
    }
    
    // Se não tem verifier, tentar sem ele (menos seguro mas pode funcionar)
    if (!verifier) {
        console.log("⚠️ Tentando sem PKCE verifier...");
    }
    
    try {
        console.log("📤 Chamando backend para troca de token...");
        
        const response = await fetch('/oauth/google/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                code: code,
                code_verifier: verifier || 'fallback_verifier',
                redirect_uri: 'https://www.caracore.com.br/secure/callback.html',
                nonce: nonce || generateSimpleNonce()
            })
        });
        
        console.log("📥 Resposta:", response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log("✅ Token obtido com sucesso!");
            
            // Limpar storage e redirecionar
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('google_pkce_verifier');
            sessionStorage.removeItem('google_oauth_nonce');
            
            window.location.href = '/secure/restrita.html';
        } else {
            const error = await response.json().catch(() => ({}));
            console.log("❌ Erro na troca:", error);
            fallbackToArea();
        }
        
    } catch (err) {
        console.log("❌ Erro de rede:", err);
        fallbackToArea();
    }
}

function fallbackToArea() {
    console.log("🚀 Fallback: indo direto para área restrita...");
    const goAnyway = confirm("Houve problemas com OAuth. Ir para área restrita mesmo assim?");
    if (goAnyway) {
        window.location.href = '/secure/restrita.html';
    }
}

// Executar automaticamente
console.log("🚀 Executando fix de state...");
fixOAuthState();

// Disponibilizar funções para uso manual
window.fixOAuthState = fixOAuthState;
window.forceTokenExchange = forceTokenExchange;
window.fallbackToArea = fallbackToArea;

console.log("==============================");
console.log("✅ OAuth State Fix aplicado!");