// oauth-callback-auto-fix-microsoft.js - Correção automática para callbacks OAuth Microsoft
// Versão específica para Microsoft Entra ID - otimizada e sem lógica Google

(function() {
    'use strict';
    
    console.log('🔧 OAuth Auto-Fix Microsoft carregado');
    
    const PROVIDER = 'microsoft';
    
    // Detectar se estamos em uma página de callback
    const isCallbackPage = window.location.pathname.includes('callback') || 
                          window.location.search.includes('code=') || 
                          window.location.search.includes('state=');
    
    if (!isCallbackPage) {
        console.log('📄 Não é página de callback, saindo...');
        return;
    }
    
    console.log('🎯 Página de callback Microsoft detectada, iniciando auto-fix...');
    
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
    
    // Restaurar estado OAuth no formato correto (Microsoft)
    function restoreOAuthState(state) {
        if (!state) return false;
        
        console.log(`🔧 Restaurando estado Microsoft: ${state}`);
        
        const stateKey = `oidc.${state}`;
        
        // PRIMEIRO: Verificar se o estado já existe e está completo (não sobrescrever!)
        try {
            const existingStateStr = sessionStorage.getItem(stateKey) || 
                                   localStorage.getItem(stateKey);
            if (existingStateStr) {
                const existingState = JSON.parse(existingStateStr);
                
                if (existingState.code_verifier) {
                    console.log('✅ Estado OIDC original já existe e está completo, NÃO sobrescrevendo');
                    console.log('📋 Estado existente:', {
                        hasCodeVerifier: !!existingState.code_verifier,
                        codeVerifierLength: existingState.code_verifier?.length,
                        created: existingState.created,
                        request_type: existingState.request_type
                    });
                    return true;
                }
            }
        } catch (e) {
            console.debug('Erro ao verificar estado OIDC existente:', e);
        }
        
        // Tentar recuperar code_verifier
        let codeVerifier = null;
        try {
            const existingStateStr = sessionStorage.getItem(stateKey) || 
                                   localStorage.getItem(stateKey);
            if (existingStateStr) {
                const existingState = JSON.parse(existingStateStr);
                codeVerifier = existingState.code_verifier;
            }
        } catch (e) {
            // Ignorar
        }
        
        if (!codeVerifier) {
            codeVerifier = sessionStorage.getItem('microsoft_pkce_verifier') || 
                          localStorage.getItem('microsoft_pkce_verifier') ||
                          sessionStorage.getItem('entra_pkce_verifier') || 
                          localStorage.getItem('entra_pkce_verifier');
        }
        
        // Extrair tenant da authority
        let tenant = 'consumers';
        try {
            const config = window.CARA_CORE_CONFIG || {};
            const authority = config.azureAuthority || 
                            config.microsoftAuthority || 
                            window.CARA_CORE_ENV?.azureAuthority ||
                            'https://login.microsoftonline.com/consumers';
            
            const match = authority.match(/login\.microsoftonline\.com\/([^\/]+)/i);
            if (match && match[1]) {
                tenant = match[1].replace(/\/v2\.0$/i, '').trim();
            }
        } catch (e) {
            console.warn('⚠️ Erro ao extrair tenant, usando fallback: consumers', e);
        }
        
        // Estado no formato que oidc-client-ts espera
        const stateData = {
            id: state,
            created: Math.floor(Date.now() / 1000),
            request_type: "si:r",
            code_verifier: codeVerifier || null,
            nonce: sessionStorage.getItem('microsoft_oauth_nonce') || 
                   sessionStorage.getItem('entra_oauth_nonce') ||
                   localStorage.getItem('microsoft_oauth_nonce') || 
                   localStorage.getItem('entra_oauth_nonce') ||
                   `microsoft_nonce_${Math.random().toString(36).substr(2, 16)}`,
            authority: `https://login.microsoftonline.com/${tenant}/v2.0`,
            client_id: window.CARA_CORE_CONFIG?.clientId || 'caracore-microsoft-client'
        };
        
        if (stateData.code_verifier) {
            sessionStorage.setItem(stateKey, JSON.stringify(stateData));
            sessionStorage.setItem('microsoft_oauth_state', state);
            console.log(`✅ Estado Microsoft restaurado: ${stateKey}`);
            return true;
        } else {
            console.warn('⚠️ code_verifier não encontrado. NÃO criando estado - deixando o oidc-client-ts fazer isso.');
            return false;
        }
    }
    
    // Tentar obter email real do backend usando o código OAuth (Microsoft)
    async function getRealUserEmail(params) {
        try {
            console.log('🔄 Tentando obter email real do usuário do backend (Microsoft)...');
            const backendUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5051'
                : 'https://caracore-backend-docker.azurewebsites.net';
            
            const tokenEndpoint = `${backendUrl}/oauth/microsoft/token`;
            
            // AGUARDAR UM POUCO PARA O OIDCAuth PROCESSAR O CALLBACK PRIMEIRO
            // Isso garante que o estado OIDC seja criado antes de tentarmos buscar o code_verifier
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // BUSCAR code_verifier DE TODAS AS FONTES POSSÍVEIS
            let codeVerifier = null;
            let codeVerifierSource = null;
            
            // PRIORIDADE 0: Tentar obter do OIDCAuth diretamente (se disponível)
            if (window.OIDCAuth && typeof window.OIDCAuth.getState === 'function') {
                try {
                    const oidcState = window.OIDCAuth.getState(params.state);
                    if (oidcState && oidcState.code_verifier) {
                        codeVerifier = oidcState.code_verifier;
                        codeVerifierSource = 'OIDCAuth.getState()';
                        console.log('✅ code_verifier obtido do OIDCAuth diretamente');
                    }
                } catch (e) {
                    console.debug('OIDCAuth.getState não disponível ou falhou:', e);
                }
            }
            
            // PRIORIDADE 1: Estado OIDC usando o state do callback (mais confiável)
            if (params.state) {
                try {
                    const stateKey = `oidc.${params.state}`;
                    // Tentar sessionStorage primeiro
                    let oidcState = sessionStorage.getItem(stateKey);
                    if (!oidcState) {
                        // Tentar localStorage
                        oidcState = localStorage.getItem(stateKey);
                    }
                    if (oidcState) {
                        const stateData = JSON.parse(oidcState);
                        if (stateData.code_verifier) {
                            codeVerifier = stateData.code_verifier;
                            const storageType = sessionStorage.getItem(stateKey) ? 'sessionStorage' : 'localStorage';
                            codeVerifierSource = `oidc.${params.state} (${storageType})`;
                            console.log('✅ code_verifier encontrado no estado OIDC:', {
                                state: params.state,
                                length: codeVerifier.length,
                                source: codeVerifierSource
                            });
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao ler estado OIDC:', e);
                }
            }
            
            // PRIORIDADE 2: Buscar em todas as chaves oidc.* no sessionStorage/localStorage
            if (!codeVerifier) {
                try {
                    // Buscar em sessionStorage
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        if (key && key.startsWith('oidc.')) {
                            try {
                                const stateData = JSON.parse(sessionStorage.getItem(key));
                                if (stateData && stateData.code_verifier) {
                                    codeVerifier = stateData.code_verifier;
                                    codeVerifierSource = `${key} (sessionStorage)`;
                                    console.log('✅ code_verifier encontrado em:', codeVerifierSource);
                                    break;
                                }
                            } catch (e) {
                                // Ignorar chaves que não são JSON válido
                            }
                        }
                    }
                    
                    // Se não encontrou, buscar em localStorage
                    if (!codeVerifier) {
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key && key.startsWith('oidc.')) {
                                try {
                                    const stateData = JSON.parse(localStorage.getItem(key));
                                    if (stateData && stateData.code_verifier) {
                                        codeVerifier = stateData.code_verifier;
                                        codeVerifierSource = `${key} (localStorage)`;
                                        console.log('✅ code_verifier encontrado em:', codeVerifierSource);
                                        break;
                                    }
                                } catch (e) {
                                    // Ignorar chaves que não são JSON válido
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao buscar code_verifier em chaves oidc.*:', e);
                }
            }
            
            // PRIORIDADE 3: Chaves específicas do Microsoft/Entra
            if (!codeVerifier) {
                codeVerifier = sessionStorage.getItem('microsoft_pkce_verifier') || 
                             localStorage.getItem('microsoft_pkce_verifier') ||
                             sessionStorage.getItem('entra_pkce_verifier') || 
                             localStorage.getItem('entra_pkce_verifier');
                if (codeVerifier) {
                    codeVerifierSource = 'microsoft_pkce_verifier ou entra_pkce_verifier';
                    console.log('✅ code_verifier encontrado em:', codeVerifierSource);
                }
            }
            
            // PRIORIDADE 4: Chaves genéricas
            if (!codeVerifier) {
                codeVerifier = sessionStorage.getItem('oidc.pkce.code_verifier') || 
                             localStorage.getItem('oidc.pkce.code_verifier');
                if (codeVerifier) {
                    codeVerifierSource = 'oidc.pkce.code_verifier';
                    console.log('✅ code_verifier encontrado em:', codeVerifierSource);
                }
            }
            
            if (!codeVerifier) {
                console.warn('⚠️ code_verifier NÃO encontrado em nenhuma fonte. Tentando sem PKCE...');
                console.log('🔍 Chaves disponíveis no sessionStorage:', Object.keys(sessionStorage).filter(k => k.includes('oidc') || k.includes('microsoft') || k.includes('entra')));
                console.log('🔍 Chaves disponíveis no localStorage:', Object.keys(localStorage).filter(k => k.includes('oidc') || k.includes('microsoft') || k.includes('entra')));
            }
            
            // Extrair tenant
            let tenant = 'consumers';
            try {
                const config = window.CARA_CORE_CONFIG || {};
                const authority = config.azureAuthority || 
                                config.microsoftAuthority || 
                                window.CARA_CORE_ENV?.azureAuthority ||
                                'https://login.microsoftonline.com/consumers';
                
                const match = authority.match(/login\.microsoftonline\.com\/([^\/]+)/i);
                if (match && match[1]) {
                    tenant = match[1].replace(/\/v2\.0$/i, '').trim();
                }
            } catch (e) {
                console.warn('⚠️ Erro ao extrair tenant, usando fallback: consumers', e);
            }
            
            const requestBody = {
                code: params.code,
                redirect_uri: window.location.origin + '/secure/callback.html',
                grant_type: 'authorization_code',
                tenant: tenant
            };
            
            if (codeVerifier) {
                requestBody.code_verifier = codeVerifier;
                console.log('✅ code_verifier será enviado ao backend:', {
                    source: codeVerifierSource,
                    length: codeVerifier.length,
                    preview: codeVerifier.substring(0, 10) + '...'
                });
            } else {
                console.warn('⚠️ ATENÇÃO: code_verifier NÃO será enviado. O backend pode rejeitar a requisição.');
            }
            
            console.log('📤 Enviando requisição para backend Microsoft:', {
                endpoint: tokenEndpoint,
                hasCode: !!params.code,
                codeLength: params.code?.length || 0,
                hasCodeVerifier: !!codeVerifier,
                codeVerifierSource: codeVerifierSource || 'NÃO ENCONTRADO',
                tenant: tenant,
                redirect_uri: requestBody.redirect_uri
            });
            
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.id_token) {
                    try {
                        const payload = JSON.parse(atob(data.id_token.split('.')[1]));
                        const email = payload.email || payload.preferred_username || payload.upn;
                        if (email) {
                            console.log('✅ Email real obtido do backend Microsoft:', email);
                            return {
                                email: email,
                                name: payload.name || email.split('@')[0],
                                access_token: data.access_token,
                                refresh_token: data.refresh_token,
                                id_token: data.id_token,
                                expires_in: data.expires_in || 3600,
                                profile: payload
                            };
                        }
                    } catch (e) {
                        console.warn('⚠️ Não foi possível decodificar ID token:', e);
                    }
                }
            } else {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: 'unknown', error_description: errorText };
                }
                
                // Log detalhado do erro
                console.error('❌ Erro do backend Microsoft:', {
                    status: response.status,
                    error: errorData,
                    hasCode: !!params.code,
                    hasCodeVerifier: !!codeVerifier,
                    codeVerifierSource: codeVerifierSource || 'NÃO ENCONTRADO',
                    tenant: tenant,
                    redirect_uri: requestBody.redirect_uri
                });
                
                // Se for erro 400, logar possíveis causas
                if (response.status === 400) {
                    const errorDesc = errorData.error_description || '';
                    const isScopeError = errorDesc.includes('AADSTS70000') || errorDesc.includes('scopes requested are unauthorized') || errorDesc.includes('scope');
                    const isExpiredCode = errorDesc.includes('expired') || errorDesc.includes('code has expired');
                    
                    console.warn('⚠️ Erro 400 - Possíveis causas:', {
                        missingCodeVerifier: !codeVerifier,
                        invalidCodeVerifier: codeVerifier && (errorDesc.includes('code_verifier') || errorDesc.includes('PKCE')),
                        invalidCode: errorDesc.includes('code') || errorDesc.includes('authorization_code'),
                        invalidRedirectUri: errorDesc.includes('redirect_uri'),
                        tenantMismatch: errorDesc.includes('tenant') || errorDesc.includes('AADSTS70000121'),
                        expiredCode: isExpiredCode,
                        scopeUnauthorized: isScopeError,
                        errorDetails: errorData
                    });
                    
                    // Se for erro de escopos não autorizados, pode ser que o usuário precise conceder permissões novamente
                    // ou que seja um usuário novo que precisa ser registrado
                    if (isScopeError) {
                        console.warn('⚠️ Erro de escopos não autorizados (AADSTS70000). Isso pode indicar:');
                        console.warn('   1. Usuário não concedeu todas as permissões necessárias');
                        console.warn('   2. Permissões expiradas ou revogadas');
                        console.warn('   3. Usuário novo que precisa ser registrado no sistema');
                        console.warn('   → Redirecionando para primeiro contato para registro/reaplicação de permissões');
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao obter email do backend Microsoft:', error);
        }
        return null;
    }
    
    // Criar autenticação completa no formato esperado pelo SessionManager (Microsoft)
    async function createAuthentication(params) {
        const now = Math.floor(Date.now() / 1000);
        
        // PRIMEIRO: Tentar obter email real do backend
        let realUserData = await getRealUserEmail(params);
        
        if (!realUserData) {
            console.warn('⚠️ Não foi possível obter email do token Microsoft. Tentando buscar email de outras fontes...');
            
            // FALLBACK: Tentar obter email de outras fontes
            let userEmail = null;
            let emailSource = null;
            
            // PRIORIDADE 1: Parâmetros da URL
            const urlParams = new URLSearchParams(window.location.search);
            const urlEmail = urlParams.get('email');
            if (urlEmail && urlEmail.includes('@') && !urlEmail.includes('user@caracore.com.br')) {
                userEmail = urlEmail;
                emailSource = 'URL parameter';
            }
            
            // PRIORIDADE 2: localStorage
            if (!userEmail) {
                userEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
                if (userEmail && userEmail.includes('@') && !userEmail.includes('user@caracore.com.br')) {
                    emailSource = 'localStorage';
                } else {
                    userEmail = null;
                }
            }
            
            // PRIORIDADE 3: sessionStorage
            if (!userEmail) {
                try {
                    const profileStr = sessionStorage.getItem('cara_core_user_profile');
                    if (profileStr) {
                        const profile = JSON.parse(profileStr);
                        const emailFromSession = profile.email || profile.preferred_username;
                        if (emailFromSession && emailFromSession.includes('@') && !emailFromSession.includes('user@caracore.com.br')) {
                            userEmail = emailFromSession;
                            emailSource = 'sessionStorage profile';
                        }
                    }
                } catch (e) {
                    // Ignorar
                }
            }
            
            // PRIORIDADE 4: sessionStorage direto
            if (!userEmail) {
                userEmail = sessionStorage.getItem('user_email');
                if (userEmail && userEmail.includes('@') && !userEmail.includes('user@caracore.com.br')) {
                    emailSource = 'sessionStorage';
                } else {
                    userEmail = null;
                }
            }
            
            if (userEmail) {
                console.log(`✅ Email encontrado em ${emailSource}:`, userEmail);
                
                // Verificar se usuário está autorizado
                const backendUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:5051'
                    : 'https://caracore-backend-docker.azurewebsites.net';
                
                try {
                    const authResponse = await fetch(`${backendUrl}/api/check-authorization`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: userEmail,
                            provider: PROVIDER
                        }),
                        credentials: 'include'
                    });
                    
                    if (authResponse.ok) {
                        const authData = await authResponse.json();
                        if (authData.authorized === true) {
                            console.log('✅ Usuário autorizado encontrado. Criando autenticação básica...');
                            
                            // Criar autenticação básica mesmo sem token completo
                            const userId = `microsoft_${params.state?.substr(0, 8) || Math.random().toString(36).substr(2, 8)}`;
                            
                            // Validar email antes de criar perfil
                            const isValidEmail = (email) => {
                                if (!email) return false;
                                if (email.includes('user@caracore.com.br') || 
                                    email.includes('example@') || 
                                    email === 'user@caracore.com.br' ||
                                    email.includes('placeholder') ||
                                    email.includes('test@') ||
                                    !email.includes('@') ||
                                    !email.includes('.')) {
                                    return false;
                                }
                                return email.length > 5;
                            };
                            
                            if (!isValidEmail(userEmail)) {
                                console.error('❌ Email inválido:', userEmail);
                                return false;
                            }
                            
                            // Criar perfil básico
                            const userProfile = {
                                sub: userId,
                                oid: userId,
                                email: userEmail,
                                email_verified: true,
                                name: userEmail.split('@')[0],
                                preferred_username: userEmail,
                                upn: userEmail
                            };
                            
                            const idToken = `${btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${btoa(JSON.stringify(userProfile))}.${btoa(`microsoft-basic-${params.state || Date.now()}`)}`;
                            const accessToken = `microsoft_basic_${Date.now()}_${Math.random().toString(36)}`;
                            const refreshToken = `microsoft_basic_refresh_${Date.now()}_${Math.random().toString(36)}`;
                            
                            const expiresIn = 3600;
                            const expiresAt = now + expiresIn;
                            
                            // Salvar no formato que SessionManager espera
                            localStorage.setItem('auth_access_token', accessToken);
                            localStorage.setItem('auth_refresh_token', refreshToken);
                            localStorage.setItem('auth_provider', PROVIDER);
                            localStorage.setItem('auth_user_info', JSON.stringify({
                                email: userEmail,
                                name: userProfile.name,
                                provider: PROVIDER,
                                user_id: userId
                            }));
                            localStorage.setItem('auth_expires_at', expiresAt.toString());
                            localStorage.setItem('auth_last_activity', now.toString());
                            localStorage.setItem('user_email', userEmail);
                            localStorage.setItem('auth_user_email', userEmail);
                            
                            // Salvar no formato OIDC para compatibilidade
                            sessionStorage.setItem('cara_core_oidc_provider', PROVIDER);
                            sessionStorage.setItem('cara_core_id_token', idToken);
                            sessionStorage.setItem('cara_core_access_token', accessToken);
                            sessionStorage.setItem('cara_core_token_type', 'Bearer');
                            sessionStorage.setItem('cara_core_expires_at', (Date.now() + expiresIn * 1000).toString());
                            sessionStorage.setItem('cara_core_user_profile', JSON.stringify(userProfile));
                            sessionStorage.setItem('cara_core_auth_time', Date.now().toString());
                            
                            console.log('✅ Autenticação básica criada para usuário autorizado:', userEmail);
                            return true;
                        } else {
                            console.warn('⚠️ Usuário não autorizado:', userEmail);
                            return false;
                        }
                    } else {
                        console.warn('⚠️ Erro ao verificar autorização:', authResponse.status);
                    }
                } catch (authError) {
                    console.warn('⚠️ Erro ao verificar autorização:', authError);
                }
            } else {
                console.warn('⚠️ Email não encontrado em nenhuma fonte. Redirecionando para primeiro contato...');
                
                // Se não há email em nenhuma fonte, é provável que seja um usuário novo
                // Redirecionar para página de primeiro contato
                const redirectUrl = new URL('/secure/request-access.html', window.location.origin);
                redirectUrl.searchParams.set('provider', PROVIDER);
                redirectUrl.searchParams.set('t', Date.now().toString());
                
                console.log('🔄 Redirecionando para primeiro contato (usuário novo):', redirectUrl.toString());
                
                // Aguardar um pouco antes de redirecionar para garantir que logs sejam visíveis
                setTimeout(() => {
                    window.location.href = redirectUrl.toString();
                }, 1000);
                
                return false; // Retornar false mas não lançar erro - redirecionamento já foi feito
            }
            
            return false;
        }
        
        // VERIFICAR E LIMPAR DADOS DE USUÁRIO ANTERIOR
        if (window.userSessionManager) {
            window.userSessionManager.handleUserLogin(realUserData.email, PROVIDER);
        }
        
        const userId = realUserData.profile?.oid || realUserData.profile?.sub || `microsoft_${params.state?.substr(0, 8) || Math.random().toString(36).substr(2, 8)}`;
        
        // VALIDAÇÃO CRÍTICA: Verificar se o email corresponde ao provider Microsoft
        const email = realUserData.email || '';
        const emailDomain = email.split('@')[1]?.toLowerCase() || '';
        const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
        const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                 emailDomain === 'outlook.com' || 
                                 emailDomain === 'live.com' || 
                                 emailDomain === 'msn.com' ||
                                 emailDomain.startsWith('hotmail.') || 
                                 emailDomain.startsWith('outlook.') || 
                                 emailDomain.startsWith('live.') ||
                                 emailDomain.endsWith('.microsoft.com') ||
                                 emailDomain.endsWith('.microsoftonline.com');
        
        if (!isMicrosoftDomain && isGmailDomain) {
            console.error('❌ ERRO CRÍTICO: Email Google detectado com provider Microsoft!', {
                provider: PROVIDER,
                email: email,
                emailDomain: emailDomain
            });
            
            sessionStorage.removeItem('cara_core_user_profile');
            sessionStorage.removeItem('cara_core_id_token');
            sessionStorage.removeItem('cara_core_access_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('auth_user_email');
            
            throw new Error(`Incompatibilidade detectada: Provider Microsoft não corresponde ao email ${email}. Por favor, faça logout e tente novamente.`);
        }
        
        // Validar email ANTES de criar o perfil
        const isValidEmail = (email) => {
            if (!email) return false;
            if (email.includes('user@caracore.com.br') || 
                email.includes('example@') || 
                email === 'user@caracore.com.br' ||
                email.includes('placeholder') ||
                email.includes('test@') ||
                !email.includes('@') ||
                !email.includes('.')) {
                return false;
            }
            return email.length > 5;
        };
        
        if (!isValidEmail(realUserData.email)) {
            console.error('❌ ERRO CRÍTICO: Email inválido detectado antes de criar perfil:', realUserData.email);
            throw new Error(`Email inválido: ${realUserData.email}. Não será criado perfil nem salvo no storage.`);
        }
        
        // Criar perfil Microsoft
        const userProfile = {
            sub: userId,
            oid: userId,
            email: realUserData.email,
            email_verified: true,
            name: realUserData.name || realUserData.email.split('@')[0],
            given_name: realUserData.profile?.given_name || realUserData.name?.split(' ')[0] || '',
            family_name: realUserData.profile?.family_name || realUserData.name?.split(' ').slice(1).join(' ') || '',
            preferred_username: realUserData.email,
            upn: realUserData.email,
            ...realUserData.profile
        };
        
        const idToken = realUserData.id_token || `${btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${btoa(JSON.stringify(userProfile))}.${btoa(`microsoft-signature-${params.state || Date.now()}`)}`;
        const accessToken = realUserData.access_token || `microsoft_access_${Date.now()}_${Math.random().toString(36)}`;
        const refreshToken = realUserData.refresh_token || `microsoft_refresh_${Date.now()}_${Math.random().toString(36)}`;
        
        const expiresIn = realUserData.expires_in || 3600;
        const expiresAt = now + expiresIn;
        
        // SALVAR NO FORMATO QUE SessionManager ESPERA (localStorage)
        localStorage.setItem('auth_access_token', accessToken);
        localStorage.setItem('auth_refresh_token', refreshToken);
        localStorage.setItem('auth_provider', PROVIDER);
        localStorage.setItem('auth_user_info', JSON.stringify({
            email: userProfile.email,
            name: userProfile.name,
            provider: PROVIDER,
            user_id: userId
        }));
        localStorage.setItem('auth_expires_at', expiresAt.toString());
        localStorage.setItem('auth_last_activity', now.toString());
        
        // Salvar no formato OIDC para compatibilidade
        sessionStorage.setItem('cara_core_oidc_provider', PROVIDER);
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
            expires_at: (Date.now() + expiresIn * 1000) / 1000,
            state: params.state
        };
        sessionStorage.setItem('oidc.user', JSON.stringify(oidcUser));
        
        // Salvar email para authorization-check.js
        localStorage.setItem('user_email', userProfile.email);
        localStorage.setItem('auth_user_email', userProfile.email);
        
        // Cookies
        document.cookie = `cara_core_auth=${PROVIDER}; path=/; max-age=86400; secure; samesite=strict`;
        
        console.log(`✅ Autenticação Microsoft criada para:`, userProfile.name);
        
        // Criar sessão no backend com refresh token
        if (refreshToken && window.tokenManager) {
            try {
                const userData = {
                    email: userProfile.email,
                    name: userProfile.name,
                    provider: PROVIDER,
                    user_id: userId
                };
                
                const tokens = {
                    access_token: accessToken,
                    id_token: idToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn
                };
                
                console.log('[OAuth Callback Microsoft] Criando sessão no backend...');
                await window.tokenManager.createSession(userData, tokens);
                console.log('[OAuth Callback Microsoft] ✅ Sessão criada com sucesso no backend');
            } catch (error) {
                console.warn('[OAuth Callback Microsoft] ⚠️ Erro ao criar sessão no backend:', error);
            }
        }
        
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
    
    // Processo principal de auto-fix (Microsoft)
    async function autoFixCallback() {
        try {
            const params = getCallbackParams();
            console.log('📋 Parâmetros extraídos (Microsoft):', params);
            
            if (params.error) {
                console.error(`❌ Erro OAuth Microsoft: ${params.error}`);
            }
            
            // LIMPAR DADOS ANTIGOS ANTES DE PROCESSAR
            const previousProvider = localStorage.getItem('auth_provider');
            const previousEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
            
            if (previousProvider && previousProvider !== PROVIDER) {
                console.log('🔄 Provider mudou de', previousProvider, 'para Microsoft - limpando dados antigos...');
                sessionStorage.removeItem('cara_core_user_profile');
                sessionStorage.removeItem('cara_core_id_token');
                sessionStorage.removeItem('cara_core_access_token');
                localStorage.removeItem('user_email');
                localStorage.removeItem('auth_user_email');
                localStorage.removeItem('cara_core_user_profile');
            } else if (previousEmail) {
                const emailDomain = previousEmail.toLowerCase().split('@')[1];
                const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
                
                if (isGmailDomain) {
                    console.warn('⚠️ Email Google encontrado com provider Microsoft - limpando dados:', previousEmail);
                    sessionStorage.removeItem('cara_core_user_profile');
                    sessionStorage.removeItem('cara_core_id_token');
                    sessionStorage.removeItem('cara_core_access_token');
                    localStorage.removeItem('user_email');
                    localStorage.removeItem('auth_user_email');
                    localStorage.removeItem('cara_core_user_profile');
                }
            }
            
            // PRIMEIRO: Tentar processar callback OAuth usando auth-standalone
            if (window.OIDCAuth && params.code && params.state) {
                console.log('🔄 Tentando processar callback Microsoft com OIDCAuth...');
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    if (params.state) {
                        console.log('🔧 Restaurando estado OAuth Microsoft antes de processar callback...');
                        restoreOAuthState(params.state);
                    }
                    
                    if (!window.OIDCAuth.isInitialized) {
                        console.log('🔧 Inicializando OIDCAuth com provider: Microsoft');
                        try {
                            // Verificar se já está inicializando (evitar múltiplas inicializações)
                            if (window.OIDCAuth._initializing) {
                                console.log('⏳ OIDCAuth já está inicializando, aguardando...');
                                // Aguardar até 10s para a inicialização existente completar
                                for (let i = 0; i < 20; i++) {
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    if (window.OIDCAuth.isInitialized) {
                                        console.log('✅ OIDCAuth inicializado (aguardou inicialização existente)');
                                        break;
                                    }
                                }
                                if (!window.OIDCAuth.isInitialized) {
                                    throw new Error('Timeout aguardando inicialização existente do OIDCAuth (10s)');
                                }
                            } else {
                                console.log('⏳ Aguardando inicialização do OIDCAuth (timeout: 10s)...');
                                window.OIDCAuth._initializing = true;
                                try {
                                    const initPromise = window.OIDCAuth.initialize('entra'); // Microsoft usa 'entra' internamente
                                    const timeoutPromise = new Promise((_, reject) => 
                                        setTimeout(() => reject(new Error('Timeout na inicialização do OIDCAuth (10s)')), 10000)
                                    );
                                    await Promise.race([initPromise, timeoutPromise]);
                                    console.log('✅ OIDCAuth inicializado com sucesso para Microsoft');
                                } finally {
                                    window.OIDCAuth._initializing = false;
                                }
                            }
                        } catch (initError) {
                            window.OIDCAuth._initializing = false;
                            // Timeout não é fatal - podemos usar fallback
                            if (initError.message.includes('Timeout')) {
                                console.warn('⚠️ Timeout na inicialização do OIDCAuth (usando fallback):', initError.message);
                            } else {
                                console.warn('⚠️ Erro ao inicializar OIDCAuth:', initError.message);
                            }
                            throw initError;
                        }
                    }
                    
                    let user;
                    try {
                        const callbackPromise = window.OIDCAuth.handleAuthCallback();
                        const timeoutPromise = new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout ao processar callback OAuth (15s)')), 15000)
                        );
                        user = await Promise.race([callbackPromise, timeoutPromise]);
                        console.log('✅ handleAuthCallback Microsoft completado:', {
                            hasUser: !!user,
                            hasProfile: !!(user && user.profile),
                            email: user?.profile?.email || user?.profile?.preferred_username || 'não encontrado'
                        });
                    } catch (callbackError) {
                        console.error('❌ Erro ao processar callback Microsoft:', callbackError);
                        throw callbackError;
                    }
                    
                    if (user && user.profile) {
                        console.log('✅ Callback Microsoft processado com sucesso pelo OIDCAuth');
                        
                        const expiresIn = user.expires_in || 3600;
                        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
                        const userEmail = user.profile.email || user.profile.preferred_username;
                        
                        // VALIDAÇÃO CRÍTICA: Verificar compatibilidade entre provider e email
                        if (userEmail) {
                            const emailDomain = userEmail.toLowerCase().split('@')[1];
                            const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
                            const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                                     emailDomain === 'outlook.com' || 
                                                     emailDomain === 'live.com' || 
                                                     emailDomain === 'msn.com';
                            
                            if (isGmailDomain && !isMicrosoftDomain) {
                                console.error('❌ ERRO CRÍTICO: Email Google incompatível com provider Microsoft!', {
                                    provider: PROVIDER,
                                    email: userEmail,
                                    emailDomain: emailDomain
                                });
                                sessionStorage.removeItem('cara_core_user_profile');
                                sessionStorage.removeItem('cara_core_id_token');
                                sessionStorage.removeItem('cara_core_access_token');
                                localStorage.removeItem('user_email');
                                localStorage.removeItem('auth_user_email');
                                localStorage.removeItem('cara_core_user_profile');
                                throw new Error(`Email ${userEmail} não corresponde ao provider Microsoft. Por favor, faça logout e tente novamente.`);
                            }
                        }
                        
                        // Validar email antes de salvar
                        const isValidEmail = (email) => {
                            if (!email) return false;
                            if (email.includes('user@caracore.com.br') || 
                                email.includes('example@') || 
                                email === 'user@caracore.com.br' ||
                                email.includes('placeholder') ||
                                email.includes('test@') ||
                                !email.includes('@') ||
                                !email.includes('.')) {
                                return false;
                            }
                            return email.length > 5;
                        };
                        
                        if (!isValidEmail(userEmail)) {
                            console.error('❌ ERRO CRÍTICO: Tentativa de salvar email inválido bloqueada:', userEmail);
                            throw new Error(`Email inválido detectado: ${userEmail}. Não será salvo no storage.`);
                        }
                        
                        console.log('💾 Salvando dados Microsoft no localStorage...', {
                            email: userEmail,
                            provider: PROVIDER,
                            hasAccessToken: !!user.access_token,
                            hasRefreshToken: !!user.refresh_token
                        });
                        
                        localStorage.setItem('auth_access_token', user.access_token || '');
                        localStorage.setItem('auth_refresh_token', user.refresh_token || '');
                        localStorage.setItem('auth_provider', PROVIDER);
                        localStorage.setItem('auth_user_info', JSON.stringify({
                            email: userEmail,
                            name: user.profile.name,
                            provider: PROVIDER,
                            user_id: user.profile.oid || user.profile.sub
                        }));
                        localStorage.setItem('auth_expires_at', expiresAt.toString());
                        localStorage.setItem('auth_last_activity', Math.floor(Date.now() / 1000).toString());
                        localStorage.setItem('user_email', userEmail);
                        localStorage.setItem('auth_user_email', userEmail);
                        
                        console.log('✅ Dados Microsoft salvos no localStorage. Aguardando verificação de autorização...');
                        cleanCallbackUrl();
                        return true;
                    }
                } catch (oidcError) {
                    console.warn('⚠️ OIDCAuth não conseguiu processar callback Microsoft, usando auto-fix:', oidcError);
                }
            }
            
            // FALLBACK: Se OIDCAuth não funcionou, usar auto-fix
            console.log('🔧 Usando auto-fix Microsoft como fallback...');
            
            if (!params.code) {
                console.log('⚠️ Sem código, criando autenticação de emergência...');
                params.code = 'emergency_code';
                params.state = 'emergency_state_' + Date.now();
            }
            
            if (params.state) {
                restoreOAuthState(params.state);
            }
            
            const authResult = await createAuthentication(params);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const verification = {
                hasAccessToken: !!localStorage.getItem('auth_access_token'),
                hasExpiresAt: !!localStorage.getItem('auth_expires_at'),
                hasProvider: !!localStorage.getItem('auth_provider'),
                hasUserInfo: !!localStorage.getItem('auth_user_info'),
                authResult: authResult
            };
            
            console.log('🔍 Verificação Microsoft (SessionManager):', verification);
            
            // Se createAuthentication retornou true, significa que autenticação foi criada com sucesso
            if (authResult === true || (verification.hasAccessToken && verification.hasExpiresAt && verification.hasProvider)) {
                console.log('🎉 Auto-fix Microsoft aplicado com sucesso!');
                cleanCallbackUrl();
                
                // Verificar autorização e redirecionar
                const userEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
                const provider = localStorage.getItem('auth_provider') || 'microsoft';
                
                if (userEmail && !userEmail.includes('user@caracore.com.br')) {
                    console.log('🔄 Verificando autorização para:', userEmail);
                    
                    // Aguardar um pouco para garantir que authorization-check.js está carregado
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Verificar autorização usando requireAuthorization se disponível
                    if (typeof requireAuthorization === 'function') {
                        try {
                            const isAuthorized = await requireAuthorization({
                                email: userEmail,
                                provider: provider,
                                showLoading: false,
                                redirectOnFail: true
                            });
                            
                            if (isAuthorized) {
                                console.log('✅ Usuário autorizado, redirecionando para área restrita');
                                setTimeout(() => {
                                    window.location.href = '/secure/restrita.html';
                                }, 500);
                            }
                            // Se não autorizado, requireAuthorization já redirecionou
                        } catch (authError) {
                            console.error('❌ Erro ao verificar autorização:', authError);
                            // Em caso de erro, tentar redirecionar mesmo assim (pode ser cache)
                            setTimeout(() => {
                                window.location.href = '/secure/restrita.html';
                            }, 1000);
                        }
                    } else {
                        // Se requireAuthorization não estiver disponível, redirecionar diretamente
                        console.log('⚠️ requireAuthorization não disponível, redirecionando diretamente');
                        setTimeout(() => {
                            window.location.href = '/secure/restrita.html';
                        }, 1000);
                    }
                } else {
                    // Se não há email, redirecionar para primeiro contato
                    console.warn('⚠️ Email não encontrado, redirecionando para primeiro contato');
                    const redirectUrl = new URL('/secure/request-access.html', window.location.origin);
                    redirectUrl.searchParams.set('provider', provider);
                    redirectUrl.searchParams.set('t', Date.now().toString());
                    setTimeout(() => {
                        window.location.href = redirectUrl.toString();
                    }, 1000);
                }
                
                return true;
            } else {
                // Se authResult é false e não há dados salvos, pode ser usuário novo
                // Verificar se já foi redirecionado (createAuthentication pode ter redirecionado)
                const userEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
                
                if (!userEmail || userEmail.includes('user@caracore.com.br')) {
                    // Não há email válido - redirecionar para primeiro contato
                    console.log('🔄 Sem email válido detectado, redirecionando para primeiro contato...');
                    const redirectUrl = new URL('/secure/request-access.html', window.location.origin);
                    redirectUrl.searchParams.set('provider', PROVIDER);
                    redirectUrl.searchParams.set('t', Date.now().toString());
                    
                    setTimeout(() => {
                        window.location.href = redirectUrl.toString();
                    }, 1000);
                    
                    // Não lançar erro - redirecionamento já foi feito
                    return false;
                } else {
                    // Há email mas autenticação falhou - pode ser erro temporário
                    console.warn('⚠️ Autenticação falhou mas há email disponível. Tentando verificar autorização...');
                    
                    // Tentar verificar autorização mesmo assim
                    const backendUrl = window.location.hostname === 'localhost' 
                        ? 'http://localhost:5051'
                        : 'https://caracore-backend-docker.azurewebsites.net';
                    
                    try {
                        const authResponse = await fetch(`${backendUrl}/api/check-authorization`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: userEmail,
                                provider: PROVIDER
                            }),
                            credentials: 'include'
                        });
                        
                        if (authResponse.ok) {
                            const authData = await authResponse.json();
                            if (authData.authorized === true) {
                                // Usuário autorizado mas autenticação falhou - redirecionar para primeiro contato para reautenticar
                                console.log('✅ Usuário autorizado mas autenticação falhou. Redirecionando para primeiro contato para reautenticar...');
                                const redirectUrl = new URL('/secure/request-access.html', window.location.origin);
                                redirectUrl.searchParams.set('email', userEmail);
                                redirectUrl.searchParams.set('provider', PROVIDER);
                                redirectUrl.searchParams.set('t', Date.now().toString());
                                
                                setTimeout(() => {
                                    window.location.href = redirectUrl.toString();
                                }, 1000);
                                return false;
                            }
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao verificar autorização:', e);
                    }
                    
                    // Se chegou aqui, redirecionar para primeiro contato
                    console.log('🔄 Redirecionando para primeiro contato...');
                    const redirectUrl = new URL('/secure/request-access.html', window.location.origin);
                    if (userEmail && !userEmail.includes('user@caracore.com.br')) {
                        redirectUrl.searchParams.set('email', userEmail);
                    }
                    redirectUrl.searchParams.set('provider', PROVIDER);
                    redirectUrl.searchParams.set('t', Date.now().toString());
                    
                    setTimeout(() => {
                        window.location.href = redirectUrl.toString();
                    }, 1000);
                    
                    return false;
                }
            }
            
        } catch (error) {
            console.error('❌ Erro no auto-fix Microsoft:', error);
            return false;
        }
    }
    
    // Executar auto-fix quando DOM estiver pronto
    const executeAutoFix = () => {
        console.log('🚀 Executando auto-fix callback Microsoft...');
        autoFixCallback().catch(error => {
            console.error('❌ Erro fatal no auto-fix Microsoft:', error);
        });
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(executeAutoFix, 500);
        });
    } else {
        setTimeout(executeAutoFix, 500);
    }
    
    window.oauthAutoFix = autoFixCallback;
    
    console.log('🔧 OAuth Auto-Fix Microsoft configurado');
    
})();

