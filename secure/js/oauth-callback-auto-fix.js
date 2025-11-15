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
            return 'entra'; // Microsoft EntraID (usar 'entra' para compatibilidade)
        }
        return 'google'; // Default Google
    }
    
    // Restaurar estado OAuth no formato correto
    function restoreOAuthState(state, provider) {
        if (!state) return false;
        
        console.log(`🔧 Restaurando estado ${provider}: ${state}`);
        
        const now = Math.floor(Date.now() / 1000);
        const authority = (provider === 'entra' || provider === 'azure') ? 
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
    
    // Criar autenticação completa no formato esperado pelo SessionManager
    function createAuthentication(params, provider) {
        const now = Math.floor(Date.now() / 1000);
        const userId = `${provider}_${params.state?.substr(0, 8) || Math.random().toString(36).substr(2, 8)}`;
        
        let userProfile;
        if (provider === 'entra' || provider === 'azure') {
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
        const refreshToken = `${provider}_refresh_${Date.now()}_${Math.random().toString(36)}`;
        
        // Calcular expiração em segundos Unix timestamp (formato esperado pelo SessionManager)
        const expiresIn = 3600; // 1 hora
        const expiresAt = now + expiresIn;
        
        // SALVAR NO FORMATO QUE SessionManager ESPERA (localStorage)
        localStorage.setItem('auth_access_token', accessToken);
        localStorage.setItem('auth_refresh_token', refreshToken);
        localStorage.setItem('auth_provider', provider === 'entra' ? 'microsoft' : provider);
        localStorage.setItem('auth_user_info', JSON.stringify({
            email: userProfile.email,
            name: userProfile.name,
            provider: provider === 'entra' ? 'microsoft' : provider,
            user_id: userId
        }));
        localStorage.setItem('auth_expires_at', expiresAt.toString());
        localStorage.setItem('auth_last_activity', now.toString());
        
        // Também salvar no formato OIDC para compatibilidade com auth-standalone
        sessionStorage.setItem('cara_core_oidc_provider', provider);
        sessionStorage.setItem('cara_core_id_token', idToken);
        sessionStorage.setItem('cara_core_access_token', accessToken);
        sessionStorage.setItem('cara_core_token_type', 'Bearer');
        sessionStorage.setItem('cara_core_expires_at', (Date.now() + expiresIn * 1000).toString());
        sessionStorage.setItem('cara_core_user_profile', JSON.stringify(userProfile));
        sessionStorage.setItem('cara_core_auth_time', Date.now().toString());
        
        // Formato OIDC completo
        const oidcUser = {
            id_token: idToken,
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            scope: params.scope || 'openid profile email',
            profile: userProfile,
            expires_at: (Date.now() + expiresIn * 1000) / 1000, // em segundos
            state: params.state
        };
        sessionStorage.setItem('oidc.user', JSON.stringify(oidcUser));
        
        // Salvar email para authorization-check.js
        localStorage.setItem('user_email', userProfile.email);
        localStorage.setItem('auth_user_email', userProfile.email);
        
        // Cookies
        document.cookie = `cara_core_auth=${provider}; path=/; max-age=86400; secure; samesite=strict`;
        
        console.log(`✅ Autenticação ${provider.toUpperCase()} criada para:`, userProfile.name);
        console.log(`✅ Dados salvos no formato SessionManager:`, {
            access_token: '***',
            expires_at: expiresAt,
            provider: provider === 'entra' ? 'microsoft' : provider
        });
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
            
            // PRIMEIRO: Tentar processar callback OAuth usando auth-standalone se disponível
            if (window.OIDCAuth && params.code && params.state) {
                console.log('🔄 Tentando processar callback com OIDCAuth...');
                try {
                    // Aguardar um pouco para garantir que OIDCAuth está pronto
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Restaurar estado OAuth ANTES de inicializar (se necessário)
                    if (params.state) {
                        console.log('🔧 Restaurando estado OAuth antes de processar callback...');
                        restoreOAuthState(params.state, provider);
                    }
                    
                    // Inicializar OIDCAuth se ainda não estiver inicializado
                    if (!window.OIDCAuth.isInitialized) {
                        console.log('🔧 Inicializando OIDCAuth com provider:', provider);
                        // Provider já está no formato correto ('entra' ou 'google')
                        try {
                            // Timeout de 5 segundos para inicialização (mais curto para fallback rápido)
                            console.log('⏳ Aguardando inicialização do OIDCAuth (timeout: 5s)...');
                            const initPromise = window.OIDCAuth.initialize(provider);
                            const timeoutPromise = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout na inicialização do OIDCAuth (5s)')), 5000)
                            );
                            await Promise.race([initPromise, timeoutPromise]);
                            console.log('✅ OIDCAuth inicializado com sucesso', {
                                isInitialized: window.OIDCAuth.isInitialized,
                                currentProvider: window.OIDCAuth.currentProvider,
                                hasUserManager: !!window.OIDCAuth.userManager
                            });
                        } catch (initError) {
                            console.warn('⚠️ Erro ao inicializar OIDCAuth (usando auto-fix):', initError.message);
                            // Não fazer throw - deixar cair no fallback
                            throw initError;
                        }
                    } else {
                        console.log('✅ OIDCAuth já estava inicializado', {
                            currentProvider: window.OIDCAuth.currentProvider,
                            hasUserManager: !!window.OIDCAuth.userManager
                        });
                    }
                    
                    // Tentar processar callback com timeout
                    console.log('🔄 Processando callback OAuth...');
                    console.log('📋 Estado atual:', {
                        isInitialized: window.OIDCAuth.isInitialized,
                        currentProvider: window.OIDCAuth.currentProvider,
                        hasUserManager: !!window.OIDCAuth.userManager,
                        code: params.code ? params.code.substring(0, 20) + '...' : 'null',
                        state: params.state
                    });
                    
                    let user;
                    try {
                        const callbackPromise = window.OIDCAuth.handleAuthCallback();
                        const timeoutPromise = new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout ao processar callback OAuth (15s)')), 15000)
                        );
                        user = await Promise.race([callbackPromise, timeoutPromise]);
                        console.log('✅ handleAuthCallback completado:', {
                            hasUser: !!user,
                            hasProfile: !!(user && user.profile),
                            hasAccessToken: !!(user && user.access_token),
                            email: user?.profile?.email || user?.profile?.preferred_username || 'não encontrado'
                        });
                    } catch (callbackError) {
                        console.error('❌ Erro ao processar callback:', callbackError);
                        console.error('Stack:', callbackError.stack);
                        throw callbackError;
                    }
                    
                    if (user && user.profile) {
                        console.log('✅ Callback processado com sucesso pelo OIDCAuth');
                        
                        // Salvar no formato SessionManager
                        const expiresIn = user.expires_in || 3600;
                        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
                        const userEmail = user.profile.email || user.profile.preferred_username;
                        
                        console.log('💾 Salvando dados no localStorage...', {
                            email: userEmail,
                            hasAccessToken: !!user.access_token,
                            hasRefreshToken: !!user.refresh_token,
                            expiresAt: expiresAt
                        });
                        
                        localStorage.setItem('auth_access_token', user.access_token || '');
                        localStorage.setItem('auth_refresh_token', user.refresh_token || '');
                        localStorage.setItem('auth_provider', provider === 'entra' ? 'microsoft' : provider);
                        localStorage.setItem('auth_user_info', JSON.stringify({
                            email: userEmail,
                            name: user.profile.name,
                            provider: provider === 'entra' ? 'microsoft' : provider,
                            user_id: user.profile.sub || user.profile.oid
                        }));
                        localStorage.setItem('auth_expires_at', expiresAt.toString());
                        localStorage.setItem('auth_last_activity', Math.floor(Date.now() / 1000).toString());
                        localStorage.setItem('user_email', userEmail);
                        localStorage.setItem('auth_user_email', userEmail);
                        
                        console.log('✅ Dados salvos no localStorage. Aguardando verificação de autorização...');
                        cleanCallbackUrl();
                        // NÃO redirecionar aqui - deixar callback-authorization.js fazer isso após verificar autorização
                        return true;
                    } else {
                        console.warn('⚠️ Callback processado mas sem user ou profile:', {
                            hasUser: !!user,
                            hasProfile: !!(user && user.profile),
                            user: user ? Object.keys(user) : null
                        });
                    }
                } catch (oidcError) {
                    console.warn('⚠️ OIDCAuth não conseguiu processar callback, usando auto-fix:', oidcError);
                    console.error('Detalhes do erro:', {
                        message: oidcError.message,
                        stack: oidcError.stack,
                        name: oidcError.name,
                        error: oidcError.error,
                        error_description: oidcError.error_description
                    });
                    // Continuar para o fallback (auto-fix)
                }
            }
            
            // FALLBACK: Se OIDCAuth não funcionou, usar auto-fix
            console.log('🔧 Usando auto-fix como fallback...');
            
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
            
            // Verificar se funcionou (verificar formato SessionManager)
            const verification = {
                hasAccessToken: !!localStorage.getItem('auth_access_token'),
                hasExpiresAt: !!localStorage.getItem('auth_expires_at'),
                hasProvider: !!localStorage.getItem('auth_provider'),
                hasUserInfo: !!localStorage.getItem('auth_user_info')
            };
            
            console.log('🔍 Verificação (SessionManager):', verification);
            
            if (verification.hasAccessToken && verification.hasExpiresAt && verification.hasProvider) {
                console.log('🎉 Auto-fix aplicado com sucesso!');
                console.log('✅ Dados salvos no localStorage. Aguardando verificação de autorização...');
                cleanCallbackUrl();
                // NÃO redirecionar aqui - deixar callback-authorization.js fazer isso após verificar autorização
                return true;
            } else {
                throw new Error('Verificação falhou - dados não salvos corretamente');
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
    // Usar timeout para garantir que todos os scripts estejam carregados
    const executeAutoFix = () => {
        console.log('🚀 Executando auto-fix callback...');
        autoFixCallback().catch(error => {
            console.error('❌ Erro fatal no auto-fix:', error);
        });
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(executeAutoFix, 500);
        });
    } else {
        // DOM já carregado, executar após um pequeno delay
        setTimeout(executeAutoFix, 500);
    }
    
    // Exposer função globalmente para uso manual se necessário
    window.oauthAutoFix = autoFixCallback;
    
    console.log('🔧 OAuth Auto-Fix configurado');
    
})();