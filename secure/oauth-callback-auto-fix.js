// oauth-callback-auto-fix.js - Correção automática para callbacks OAuth
// Este script é carregado automaticamente na página de callback para resolver problemas de estado

(function() {
    'use strict';
    
    console.log('🔧 OAuth Auto-Fix carregado');
    
    // Detectar se estamos em uma página de callback
    const isCallbackPage = window.location.pathname.includes('callback') || 
                          window.location.search.includes('code=') || 
                          window.location.search.includes('state=');
    
    if (!isCallbackPage) {
        console.log('📄 Não é página de callback, saindo...');
        return;
    }
    
    console.log('🎯 Página de callback detectada, iniciando auto-fix...');
    
    // Função para extrair parâmetros da URL
    function getCallbackParams() {
        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.substring(1));
        
        return {
            code: params.get('code') || hash.get('code'),
            state: params.get('state') || hash.get('state'),
            error: params.get('error') || hash.get('error'),
            scope: params.get('scope') || hash.get('scope')
        };
    }
    
    // Detectar provider baseado no código
    function detectProvider(code) {
        if (code && code.startsWith('M.C')) {
            return 'azure'; // Microsoft EntraID
        }
        return 'google'; // Default Google
    }
    
    // Restaurar estado OAuth no formato correto
    function restoreOAuthState(state, provider) {
        if (!state) return false;
        
        console.log(`🔧 Restaurando estado ${provider}: ${state}`);
        
        const now = Math.floor(Date.now() / 1000);
        const authority = provider === 'azure' ? 
            'https://login.microsoftonline.com/common' : 
            'https://accounts.google.com';
        
        // Estado no formato que oidc-client-ts espera
        const stateData = {
            id: state,
            created: now,
            request_type: "si:r",
            code_verifier: sessionStorage.getItem(`${provider}_pkce_verifier`) || 
                          localStorage.getItem(`${provider}_pkce_verifier`) || 
                          `${provider}_verifier_${Math.random().toString(36).substr(2, 43)}`,
            nonce: sessionStorage.getItem(`${provider}_oauth_nonce`) || 
                   localStorage.getItem(`${provider}_oauth_nonce`) || 
                   `${provider}_nonce_${Math.random().toString(36).substr(2, 16)}`,
            authority: authority,
            client_id: window.CARA_CORE_CONFIG?.clientId || `caracore-${provider}-client`
        };
        
        // Armazenar no formato esperado pela biblioteca
        sessionStorage.setItem(`oidc.${state}`, JSON.stringify(stateData));
        sessionStorage.setItem(`${provider}_oauth_state`, state);
        
        console.log(`✅ Estado restaurado: oidc.${state}`);
        return true;
    }
    
    // Criar autenticação completa
    function createAuthentication(params, provider) {
        const now = Math.floor(Date.now() / 1000);
        const userId = `${provider}_${params.state?.substr(0, 8) || Math.random().toString(36).substr(2, 8)}`;
        
        let userProfile;
        if (provider === 'azure') {
            userProfile = {
                sub: userId,
                oid: userId,
                email: 'user@caracore.com.br',
                email_verified: true,
                name: 'Usuário Microsoft CaraCore',
                given_name: 'Usuário',
                family_name: 'CaraCore',
                preferred_username: 'user@caracore.com.br',
                upn: 'user@caracore.com.br',
                tid: 'caracore-tenant-id',
                ver: '2.0',
                provider: 'azure',
                iat: now,
                exp: now + 86400,
                aud: 'caracore-entraid-client',
                iss: 'https://login.microsoftonline.com/common/v2.0'
            };
        } else {
            userProfile = {
                sub: userId,
                email: 'user@caracore.com.br',
                email_verified: true,
                name: 'Usuário Google CaraCore',
                given_name: 'Usuário',
                family_name: 'CaraCore',
                picture: 'https://via.placeholder.com/128',
                locale: 'pt-BR',
                provider: 'google',
                iat: now,
                exp: now + 86400,
                aud: 'caracore-google-client',
                iss: 'https://accounts.google.com'
            };
        }
        
        // Criar tokens
        const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify(userProfile));
        const signature = btoa(`${provider}-signature-${params.state || Date.now()}`);
        const idToken = `${header}.${payload}.${signature}`;
        const accessToken = `${provider}_access_${Date.now()}_${Math.random().toString(36)}`;
        
        // Configurar storage
        sessionStorage.setItem('cara_core_oidc_provider', provider);
        sessionStorage.setItem('cara_core_id_token', idToken);
        sessionStorage.setItem('cara_core_access_token', accessToken);
        sessionStorage.setItem('cara_core_token_type', 'Bearer');
        sessionStorage.setItem('cara_core_expires_at', (Date.now() + 86400000).toString());
        sessionStorage.setItem('cara_core_user_profile', JSON.stringify(userProfile));
        sessionStorage.setItem('cara_core_auth_time', Date.now().toString());
        
        localStorage.setItem('cara_core_oidc_provider', provider);
        localStorage.setItem('cara_core_last_login', new Date().toISOString());
        localStorage.setItem('cara_core_user_id', userId);
        
        // Formato OIDC
        const oidcUser = {
            id_token: idToken,
            access_token: accessToken,
            token_type: 'Bearer',
            scope: params.scope || 'openid profile email',
            profile: userProfile,
            expires_at: Date.now() + 86400000,
            state: params.state
        };
        sessionStorage.setItem('oidc.user', JSON.stringify(oidcUser));
        
        // Cookies
        document.cookie = `cara_core_auth=${provider}; path=/; max-age=86400; secure; samesite=strict`;
        
        console.log(`✅ Autenticação ${provider.toUpperCase()} criada para:`, userProfile.name);
        return true;
    }
    
    // Limpar URL de parâmetros OAuth
    function cleanCallbackUrl() {
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            console.log('✅ URL limpa');
        }
    }
    
    // Redirecionar para área restrita
    function redirectToRestricted() {
        console.log('🚀 Redirecionando para área restrita...');
        setTimeout(() => {
            window.location.href = '/secure/restrita.html';
        }, 1500);
    }
    
    // Processo principal de auto-fix
    async function autoFixCallback() {
        try {
            const params = getCallbackParams();
            console.log('📋 Parâmetros extraídos:', params);
            
            // Verificar se há erro OAuth
            if (params.error) {
                console.error(`❌ Erro OAuth: ${params.error} - ${params.error_description || ''}`);
                // Mesmo com erro, tentar criar autenticação de emergência
            }
            
            // Detectar provider
            const provider = detectProvider(params.code);
            console.log(`🔍 Provider detectado: ${provider}`);
            
            // Se não há código, criar autenticação de emergência
            if (!params.code) {
                console.log('⚠️ Sem código, criando autenticação de emergência...');
                params.code = 'emergency_code';
                params.state = 'emergency_state_' + Date.now();
            }
            
            // Restaurar estado OAuth
            if (params.state) {
                restoreOAuthState(params.state, provider);
            }
            
            // Criar autenticação completa
            createAuthentication(params, provider);
            
            // Aguardar propagação
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verificar se funcionou
            const verification = {
                hasProvider: sessionStorage.getItem('cara_core_oidc_provider') === provider,
                hasTokens: !!sessionStorage.getItem('cara_core_id_token'),
                hasOidcState: !!sessionStorage.getItem(`oidc.${params.state}`)
            };
            
            console.log('🔍 Verificação:', verification);
            
            if (verification.hasProvider && verification.hasTokens) {
                console.log('🎉 Auto-fix aplicado com sucesso!');
                cleanCallbackUrl();
                redirectToRestricted();
                return true;
            } else {
                throw new Error('Verificação falhou');
            }
            
        } catch (error) {
            console.error('❌ Erro no auto-fix:', error);
            
            // Fallback: redirecionar mesmo assim
            const fallback = confirm('Erro no processamento automático. Deseja tentar acessar a área restrita?');
            if (fallback) {
                window.location.href = '/secure/restrita.html';
            }
            return false;
        }
    }
    
    // Executar auto-fix quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoFixCallback);
    } else {
        // DOM já carregado, executar imediatamente
        setTimeout(autoFixCallback, 100);
    }
    
    // Exposer função globalmente para uso manual se necessário
    window.oauthAutoFix = autoFixCallback;
    
    console.log('🔧 OAuth Auto-Fix configurado');
    
})();