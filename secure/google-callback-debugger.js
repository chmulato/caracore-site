// google-callback-debugger.js - Debug específico para Google OAuth
(function() {
    'use strict';
    
    console.log("🐛 GOOGLE CALLBACK DEBUGGER ATIVADO");
    console.log("==================================");
    
    // Função para debug detalhado
    function debugGoogleCallback() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        console.log("📊 ANÁLISE DETALHADA:");
        console.log("Code presente:", !!code);
        console.log("Code length:", code ? code.length : 0);
        console.log("State presente:", !!state);
        console.log("State value:", state);
        
        // Verifica providers armazenados
        const sessionProvider = sessionStorage.getItem('cara_core_oidc_provider');
        const localProvider = localStorage.getItem('cara_core_oidc_provider');
        
        console.log("Provider session:", sessionProvider);
        console.log("Provider local:", localProvider);
        
        // Verifica OIDC Auth
        console.log("\n🔧 VERIFICAÇÃO OIDC AUTH:");
        console.log("window.OIDCAuth:", typeof window.OIDCAuth);
        
        if (window.OIDCAuth) {
            console.log("OIDCAuth.initialize:", typeof window.OIDCAuth.initialize);
            console.log("OIDCAuth.handleAuthCallback:", typeof window.OIDCAuth.handleAuthCallback);
            console.log("OIDCAuth.userManager:", typeof window.OIDCAuth.userManager);
            
            // Tenta obter estado atual
            try {
                const lastProvider = window.OIDCAuth.getLastUsedProvider();
                console.log("Last used provider:", lastProvider);
            } catch (e) {
                console.log("Erro obtendo provider:", e);
            }
        }
        
        // Verifica scripts carregados
        console.log("\n📦 SCRIPTS CARREGADOS:");
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
            const src = script.src;
            if (src.includes('oidc') || src.includes('auth')) {
                console.log("Script:", src.split('/').pop(), "- Loaded:", script.readyState !== 'loading');
            }
        });
        
        return {
            hasCode: !!code,
            hasState: !!state,
            codeLength: code ? code.length : 0,
            oidcAuthAvailable: typeof window.OIDCAuth !== 'undefined',
            sessionProvider,
            localProvider
        };
    }
    
    // Função para forçar reprocessamento
    window.forceGoogleCallbackProcessing = async function() {
        console.log("🔄 FORÇANDO REPROCESSAMENTO...");
        
        try {
            // Garante que provider está definido
            sessionStorage.setItem('cara_core_oidc_provider', 'google');
            localStorage.setItem('cara_core_oidc_provider', 'google');
            
            // Aguarda OIDCAuth estar disponível
            let attempts = 0;
            while (typeof window.OIDCAuth === 'undefined' && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (typeof window.OIDCAuth === 'undefined') {
                throw new Error('OIDCAuth não carregou após 5 segundos');
            }
            
            console.log("✅ OIDCAuth disponível, inicializando...");
            
            // Inicializa
            await window.OIDCAuth.initialize();
            console.log("✅ OIDCAuth inicializado");
            
            // Processa callback
            await window.OIDCAuth.handleAuthCallback();
            console.log("✅ Callback processado com sucesso!");
            
            // Redireciona
            console.log("🚀 Redirecionando para área restrita...");
            window.location.href = '/secure/restrita.html';
            
        } catch (error) {
            console.error("❌ Erro no reprocessamento:", error);
            console.log("Detalhes:", {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Oferece fallback
            const fallback = confirm("Erro no login automático. Deseja ir manualmente para a área restrita?");
            if (fallback) {
                window.location.href = '/secure/restrita.html';
            }
        }
    };
    
    // Debug inicial
    const analysis = debugGoogleCallback();
    console.log("🎯 RESUMO ANÁLISE:", analysis);
    
    // Auto-força reprocessamento se tudo parecer OK
    if (analysis.hasCode && analysis.hasState) {
        console.log("📋 Dados parecem OK, tentando reprocessamento automático em 2s...");
        setTimeout(() => {
            window.forceGoogleCallbackProcessing();
        }, 2000);
    } else {
        console.log("⚠️ Dados incompletos, reprocessamento manual necessário");
        console.log("Execute: window.forceGoogleCallbackProcessing()");
    }
    
    // Disponibiliza função global para debug manual
    window.debugGoogleCallback = debugGoogleCallback;
    
})();