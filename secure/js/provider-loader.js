/**
 * Provider Loader - Carrega scripts específicos por provider
 * Detecta o provider (Google ou Microsoft) e carrega os scripts apropriados
 */

(function() {
    'use strict';
    
    console.log('🔧 Provider Loader carregado');
    
    /**
     * Detectar provider baseado na URL ou código OAuth
     */
    function detectProvider() {
        // 1. Tentar obter da URL (parâmetro explícito)
        const urlParams = new URLSearchParams(window.location.search);
        const providerFromUrl = urlParams.get('provider');
        if (providerFromUrl === 'google' || providerFromUrl === 'microsoft' || providerFromUrl === 'entra') {
            console.log('✅ Provider detectado da URL:', providerFromUrl === 'entra' ? 'microsoft' : providerFromUrl);
            return providerFromUrl === 'entra' ? 'microsoft' : providerFromUrl;
        }
        
        // 2. Tentar detectar pelo código OAuth (mais confiável)
        const code = urlParams.get('code');
        if (code) {
            // Microsoft codes começam com "M.C" ou têm formato específico
            if (code.startsWith('M.C') || code.startsWith('0.') || code.length > 200) {
                console.log('✅ Provider detectado pelo código OAuth: microsoft');
                return 'microsoft';
            }
            // Google codes geralmente começam com números ou letras e são menores
            console.log('✅ Provider detectado pelo código OAuth: google');
            return 'google';
        }
        
        // 3. Tentar obter do sessionStorage (dados OIDC atuais)
        try {
            const oidcProvider = sessionStorage.getItem('cara_core_oidc_provider');
            if (oidcProvider === 'google' || oidcProvider === 'microsoft' || oidcProvider === 'entra') {
                console.log('✅ Provider detectado do sessionStorage:', oidcProvider === 'entra' ? 'microsoft' : oidcProvider);
                return oidcProvider === 'entra' ? 'microsoft' : oidcProvider;
            }
        } catch (e) {
            // Ignorar erro
        }
        
        // 4. Tentar obter do localStorage (último provider usado)
        const storedProvider = localStorage.getItem('auth_provider');
        if (storedProvider === 'google' || storedProvider === 'microsoft') {
            console.log('✅ Provider detectado do localStorage:', storedProvider);
            return storedProvider;
        }
        
        // 5. Tentar inferir do email salvo (se houver)
        const savedEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
        if (savedEmail && !savedEmail.includes('user@caracore.com.br')) {
            const emailDomain = savedEmail.toLowerCase().split('@')[1];
            if (emailDomain === 'gmail.com' || emailDomain === 'googlemail.com') {
                console.log('✅ Provider inferido do email salvo: google');
                return 'google';
            } else if (emailDomain === 'hotmail.com' || emailDomain === 'outlook.com' || 
                      emailDomain === 'live.com' || emailDomain === 'msn.com' ||
                      emailDomain.startsWith('hotmail.') || emailDomain.startsWith('outlook.') || 
                      emailDomain.startsWith('live.')) {
                console.log('✅ Provider inferido do email salvo: microsoft');
                return 'microsoft';
            }
        }
        
        // 6. Default: Google (mais comum)
        console.log('⚠️ Provider não detectado, usando default: google');
        return 'google';
    }
    
    /**
     * Carregar script dinamicamente
     */
    function loadScript(src, onLoad, onError) {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        
        script.onload = () => {
            console.log('✅ Script carregado:', src);
            if (onLoad) onLoad();
        };
        
        script.onerror = () => {
            console.error('❌ Erro ao carregar script:', src);
            if (onError) onError();
        };
        
        document.head.appendChild(script);
    }
    
    /**
     * Carregar scripts específicos do provider na ordem correta
     */
    function loadProviderScripts(provider) {
        console.log(`📦 Carregando scripts para provider: ${provider}`);
        
        const basePath = '/secure/js';
        const version = '?v=20251116';
        
        if (provider === 'google') {
            // PRIMEIRO: Carregar oauth-callback-auto-fix-google.js
            loadScript(`${basePath}/oauth-callback-auto-fix-google.js${version}`, () => {
                console.log('✅ Google callback script carregado');
                
                // DEPOIS: Carregar callback-authorization-google.js (deve ser após o auto-fix)
                setTimeout(() => {
                    loadScript(`${basePath}/callback-authorization-google.js${version}`, () => {
                        console.log('✅ Google authorization script carregado');
                    });
                }, 500); // Pequeno delay para garantir que o auto-fix processou
            });
        } else if (provider === 'microsoft') {
            // PRIMEIRO: Carregar oauth-callback-auto-fix-microsoft.js
            loadScript(`${basePath}/oauth-callback-auto-fix-microsoft.js${version}`, () => {
                console.log('✅ Microsoft callback script carregado');
                
                // DEPOIS: Carregar callback-authorization-microsoft.js (deve ser após o auto-fix)
                setTimeout(() => {
                    loadScript(`${basePath}/callback-authorization-microsoft.js${version}`, () => {
                        console.log('✅ Microsoft authorization script carregado');
                    });
                }, 500); // Pequeno delay para garantir que o auto-fix processou
            });
        }
    }
    
    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const provider = detectProvider();
            console.log(`🎯 Provider detectado: ${provider}`);
            window.detectedProvider = provider;
            loadProviderScripts(provider);
        });
    } else {
        const provider = detectProvider();
        console.log(`🎯 Provider detectado: ${provider}`);
        window.detectedProvider = provider;
        loadProviderScripts(provider);
    }
    
    // Expor função globalmente
    window.detectProvider = detectProvider;
    window.loadProviderScripts = loadProviderScripts;
})();

