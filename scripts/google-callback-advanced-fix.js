// google-callback-advanced-fix.js
// Versão avançada que força restauração de estado antes do processamento
// Execute no console da página callback.html quando aparecer erro "No matching state found"

console.log("🔧 Google Callback Advanced Fix - Iniciando...");

// Função para extrair parâmetros da URL
function getCallbackParams() {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.substring(1));
    
    return {
        code: params.get('code') || hash.get('code'),
        state: params.get('state') || hash.get('state'),
        error: params.get('error') || hash.get('error'),
        error_description: params.get('error_description') || hash.get('error_description')
    };
}

// Função para restaurar estado no formato que oidc-client-ts espera
function forceRestoreOIDCState(state) {
    if (!state) {
        console.log("❌ Sem state para restaurar");
        return false;
    }
    
    console.log(`🔧 Restaurando estado OIDC: ${state}`);
    
    // Formato que oidc-client-ts espera
    const stateData = {
        id: state,
        created: Math.floor(Date.now() / 1000),
        request_type: "si:r", // signin request
        code_verifier: localStorage.getItem('google_pkce_verifier') || 'fallback_code_verifier',
        nonce: localStorage.getItem('google_oauth_nonce') || 'fallback_nonce',
        client_id: window.CARA_CORE_CONFIG?.googleClientId || '[GOOGLE_CLIENT_ID_PLACEHOLDER]',
        authority: 'https://accounts.google.com',
        redirect_uri: window.location.origin + '/secure/callback.html'
    };
    
    // Armazenar no formato que a biblioteca espera
    const stateKey = `oidc.${state}`;
    sessionStorage.setItem(stateKey, JSON.stringify(stateData));
    
    // Também armazenar nos formatos alternativos
    sessionStorage.setItem('google_oauth_state', state);
    sessionStorage.setItem('oidc.user', JSON.stringify({ profile: { sub: 'temp' } }));
    
    console.log(`✅ Estado restaurado com chave: ${stateKey}`);
    console.log("📋 Dados armazenados:", stateData);
    
    return true;
}

// Função para verificar e corrigir UserManager
function ensureUserManager() {
    console.log("🔍 Verificando UserManager...");
    
    if (!window.userManager) {
        console.log("⚠️ UserManager não encontrado, tentando recriar...");
        
        // Tentar recriar baseado na configuração
        if (window.Oidc && window.Oidc.UserManager) {
            const config = {
                authority: 'https://accounts.google.com',
                client_id: window.CARA_CORE_CONFIG?.googleClientId || '[GOOGLE_CLIENT_ID_PLACEHOLDER]',
                redirect_uri: window.location.origin + '/secure/callback.html',
                response_type: 'code',
                scope: 'openid profile email',
                stateStore: new window.Oidc.WebStorageStateStore({ store: window.sessionStorage })
            };
            
            window.userManager = new window.Oidc.UserManager(config);
            console.log("✅ UserManager recriado");
        } else {
            console.log("❌ Biblioteca Oidc não disponível");
            return false;
        }
    }
    
    return true;
}

// Função principal de correção avançada
window.advancedGoogleCallbackFix = async function() {
    console.log("🚀 Iniciando correção avançada do callback Google...");
    
    try {
        // 1. Extrair parâmetros
        const params = getCallbackParams();
        console.log("📋 Parâmetros do callback:", params);
        
        if (params.error) {
            console.log(`❌ Erro OAuth: ${params.error} - ${params.error_description}`);
            return false;
        }
        
        if (!params.code || !params.state) {
            console.log("❌ Parâmetros obrigatórios ausentes");
            return false;
        }
        
        // 2. Restaurar estado forçadamente
        const stateRestored = forceRestoreOIDCState(params.state);
        if (!stateRestored) {
            console.log("❌ Falha ao restaurar estado");
            return false;
        }
        
        // 3. Aguardar um pouco para o storage se atualizar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 4. Garantir UserManager
        const userManagerOK = ensureUserManager();
        if (!userManagerOK) {
            console.log("❌ Falha ao configurar UserManager");
            return false;
        }
        
        // 5. Verificar se OIDCAuth está disponível
        if (!window.OIDCAuth) {
            console.log("❌ OIDCAuth não disponível, carregando...");
            
            // Tentar carregar via script
            const script = document.createElement('script');
            script.src = '/secure/auth-standalone.js';
            document.head.appendChild(script);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 6. Inicializar OIDCAuth se disponível
        if (window.OIDCAuth) {
            console.log("✅ OIDCAuth disponível, inicializando...");
            
            await window.OIDCAuth.initialize();
            console.log("✅ OIDCAuth inicializado");
            
            // 7. Processar callback
            await window.OIDCAuth.handleAuthCallback();
            console.log("✅ Callback processado com sucesso!");
            
            // 8. Redirecionar
            console.log("🚀 Redirecionando para área restrita...");
            setTimeout(() => {
                window.location.href = '/secure/restrita.html';
            }, 1000);
            
            return true;
            
        } else {
            console.log("❌ OIDCAuth não disponível após tentativa de carregamento");
            
            // Fallback: redirecionar diretamente
            console.log("🔄 Usando fallback: redirecionamento direto");
            window.location.href = '/secure/restrita.html';
            return false;
        }
        
    } catch (error) {
        console.error("❌ Erro na correção avançada:", error);
        console.log("Detalhes do erro:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Último recurso: redirecionar
        const fallback = confirm("Erro no processamento. Deseja tentar acessar a área restrita mesmo assim?");
        if (fallback) {
            window.location.href = '/secure/restrita.html';
        }
        
        return false;
    }
};

// Função de diagnóstico melhorada
function advancedDiagnosis() {
    const params = getCallbackParams();
    const diagnosis = {
        url: window.location.href,
        params: params,
        sessionStorage: {},
        localStorage: {},
        oidcKeys: [],
        libraries: {
            OIDCAuth: !!window.OIDCAuth,
            userManager: !!window.userManager,
            Oidc: !!window.Oidc,
            msal: !!window.msal
        }
    };
    
    // Coletar dados de storage
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.includes('oidc') || key.includes('google') || key.includes('oauth')) {
            diagnosis.sessionStorage[key] = sessionStorage.getItem(key);
        }
    }
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('oidc') || key.includes('google') || key.includes('oauth')) {
            diagnosis.localStorage[key] = localStorage.getItem(key);
        }
    }
    
    // Procurar chaves OIDC específicas
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith('oidc.')) {
            diagnosis.oidcKeys.push(key);
        }
    }
    
    return diagnosis;
}

// Executar diagnóstico
const diagnosis = advancedDiagnosis();
console.log("🎯 DIAGNÓSTICO AVANÇADO:", diagnosis);

// Auto-executar se parecer ser um callback válido
const params = getCallbackParams();
if (params.code && params.state) {
    console.log("📋 Callback válido detectado, executando correção em 2 segundos...");
    setTimeout(() => {
        window.advancedGoogleCallbackFix();
    }, 2000);
} else {
    console.log("⚠️ Não parece ser um callback válido. Execute manualmente: advancedGoogleCallbackFix()");
}

console.log("🔧 Google Callback Advanced Fix carregado. Use: advancedGoogleCallbackFix()");