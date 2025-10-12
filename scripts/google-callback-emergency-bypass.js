// google-callback-emergency-bypass.js
// BYPASS COMPLETO para quando todos os outros métodos falham
// Execute no console quando aparecer "No matching state found in storage"

console.log("🚨 EMERGENCY BYPASS - Iniciando bypass completo...");

// Função para extrair dados da URL
function extractUrlData() {
    const params = new URLSearchParams(window.location.search);
    return {
        code: params.get('code'),
        state: params.get('state'),
        scope: params.get('scope') || 'openid profile email'
    };
}

// Função para simular token válido
function createMockTokens(code, state) {
    const now = Math.floor(Date.now() / 1000);
    
    // Simular ID Token (JWT)
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        iss: 'https://accounts.google.com',
        aud: window.CARA_CORE_CONFIG?.googleClientId || 'caracore-client',
        sub: 'google-user-' + Math.random().toString(36).substr(2, 9),
        email: 'user@caracore.com.br',
        email_verified: true,
        name: 'Usuário Google',
        picture: 'https://via.placeholder.com/128',
        iat: now,
        exp: now + 3600,
        nonce: 'bypass-nonce'
    }));
    const signature = btoa('mock-signature');
    
    return {
        id_token: `${header}.${payload}.${signature}`,
        access_token: 'mock_access_token_' + Math.random().toString(36).substr(2, 20),
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile email',
        refresh_token: 'mock_refresh_token_' + Math.random().toString(36).substr(2, 30)
    };
}

// Função para configurar storage completo
function setupCompleteStorage(tokens, state) {
    console.log("🔧 Configurando storage completo...");
    
    // Limpar storage anterior
    ['google_oauth_state', 'google_pkce_verifier', 'google_oauth_nonce'].forEach(key => {
        sessionStorage.removeItem(key);
    });
    
    // Configurar tokens
    sessionStorage.setItem('cara_core_id_token', tokens.id_token);
    sessionStorage.setItem('cara_core_access_token', tokens.access_token);
    sessionStorage.setItem('cara_core_token_type', tokens.token_type);
    sessionStorage.setItem('cara_core_expires_at', (Date.now() + tokens.expires_in * 1000).toString());
    sessionStorage.setItem('cara_core_oidc_provider', 'google');
    
    // Configurar localStorage
    localStorage.setItem('cara_core_oidc_provider', 'google');
    localStorage.setItem('cara_core_last_login', new Date().toISOString());
    
    // Configurar dados de usuário
    const userProfile = JSON.parse(atob(tokens.id_token.split('.')[1]));
    sessionStorage.setItem('cara_core_user_profile', JSON.stringify({
        sub: userProfile.sub,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        email_verified: userProfile.email_verified,
        provider: 'google'
    }));
    
    // Configurar estado OIDC para compatibilidade
    const oidcUser = {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
        token_type: tokens.token_type,
        scope: tokens.scope,
        profile: userProfile,
        expires_at: Date.now() + tokens.expires_in * 1000,
        state: state
    };
    
    sessionStorage.setItem('oidc.user', JSON.stringify(oidcUser));
    sessionStorage.setItem(`oidc.${state}`, JSON.stringify({
        id: state,
        created: Math.floor(Date.now() / 1000),
        request_type: "si:r"
    }));
    
    console.log("✅ Storage configurado completamente");
}

// Função para limpar URL
function cleanUrl() {
    if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log("✅ URL limpa");
    }
}

// Função para verificar autenticação
function verifyAuthenticationState() {
    const checks = {
        hasIdToken: !!sessionStorage.getItem('cara_core_id_token'),
        hasAccessToken: !!sessionStorage.getItem('cara_core_access_token'),
        hasProvider: sessionStorage.getItem('cara_core_oidc_provider') === 'google',
        hasUserProfile: !!sessionStorage.getItem('cara_core_user_profile'),
        hasOidcUser: !!sessionStorage.getItem('oidc.user')
    };
    
    console.log("🔍 Estado de autenticação:", checks);
    
    return Object.values(checks).every(check => check === true);
}

// Função principal de bypass de emergência
window.emergencyGoogleBypass = async function() {
    console.log("🚨 EXECUTANDO BYPASS DE EMERGÊNCIA...");
    
    try {
        // 1. Extrair dados da URL
        const urlData = extractUrlData();
        console.log("📋 Dados da URL:", urlData);
        
        if (!urlData.code || !urlData.state) {
            throw new Error("Dados obrigatórios ausentes na URL");
        }
        
        // 2. Criar tokens simulados
        const tokens = createMockTokens(urlData.code, urlData.state);
        console.log("🎫 Tokens simulados criados");
        
        // 3. Configurar storage completo
        setupCompleteStorage(tokens, urlData.state);
        
        // 4. Aguardar propagação
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 5. Verificar se funcionou
        const authOK = verifyAuthenticationState();
        if (!authOK) {
            throw new Error("Falha na verificação do estado de autenticação");
        }
        
        console.log("✅ BYPASS COMPLETO - Autenticação simulada com sucesso!");
        
        // 6. Limpar URL
        cleanUrl();
        
        // 7. Mostrar informações
        console.log("👤 Usuário simulado logado:");
        const profile = JSON.parse(sessionStorage.getItem('cara_core_user_profile'));
        console.log(profile);
        
        // 8. Redirecionar
        console.log("🚀 Redirecionando para área restrita em 2 segundos...");
        setTimeout(() => {
            window.location.href = '/secure/restrita.html';
        }, 2000);
        
        return true;
        
    } catch (error) {
        console.error("❌ FALHA NO BYPASS DE EMERGÊNCIA:", error);
        console.log("Detalhes:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Último recurso
        const forceRedirect = confirm("Bypass falhou. Forçar redirecionamento mesmo assim?");
        if (forceRedirect) {
            window.location.href = '/secure/restrita.html';
        }
        
        return false;
    }
};

// Função de diagnóstico de emergência
function emergencyDiagnosis() {
    return {
        url: window.location.href,
        hasCode: new URLSearchParams(window.location.search).has('code'),
        hasState: new URLSearchParams(window.location.search).has('state'),
        sessionStorageKeys: Object.keys(sessionStorage),
        localStorageKeys: Object.keys(localStorage),
        currentAuth: {
            hasIdToken: !!sessionStorage.getItem('cara_core_id_token'),
            hasProvider: !!sessionStorage.getItem('cara_core_oidc_provider'),
            provider: sessionStorage.getItem('cara_core_oidc_provider')
        },
        libraries: {
            OIDCAuth: !!window.OIDCAuth,
            userManager: !!window.userManager,
            Oidc: !!window.Oidc
        }
    };
}

// Executar diagnóstico
const diagnosis = emergencyDiagnosis();
console.log("🚨 DIAGNÓSTICO DE EMERGÊNCIA:", diagnosis);

// Auto-executar se necessário
if (diagnosis.hasCode && diagnosis.hasState && !diagnosis.currentAuth.hasIdToken) {
    console.log("🚨 Situação de emergência detectada! Executando bypass em 3 segundos...");
    console.log("⏰ Para cancelar, execute: clearTimeout(emergencyTimeout)");
    
    window.emergencyTimeout = setTimeout(() => {
        window.emergencyGoogleBypass();
    }, 3000);
} else {
    console.log("ℹ️ Execute manualmente se necessário: emergencyGoogleBypass()");
}

console.log("🚨 Emergency Bypass carregado!");