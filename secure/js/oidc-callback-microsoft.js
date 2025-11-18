// oidc-callback-microsoft.js - Processamento de callbacks OIDC para Microsoft Entra ID
// Implementação completa do fluxo OpenID Connect para autenticação Microsoft
// Versão específica para Microsoft Entra ID - otimizada e sem lógica Google

(function() {
    'use strict';
    
    console.log('🔐 OIDC Callback Microsoft carregado');
    
    const PROVIDER = 'microsoft';
    
    // Detectar se estamos em uma página de callback
    const isCallbackPage = window.location.pathname.includes('callback') || 
                          window.location.search.includes('code=') || 
                          window.location.search.includes('state=');
    
    if (!isCallbackPage) {
        console.log('📄 Não é página de callback, saindo...');
        return;
    }
    
    console.log('🎯 Página de callback Microsoft detectada, iniciando processamento OIDC...');
    
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
            
            // IMPORTANTE: Sempre verificar a resposta, mesmo em caso de erro
            // O backend pode ter criado uma sessão antes de retornar erro
            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                // Se não for JSON, tentar ler como texto
                const text = await response.text().catch(() => '');
                try {
                    responseData = JSON.parse(text);
                } catch {
                    responseData = { error: 'unknown', error_description: text };
                }
            }
            
            // PRIORIDADE 1: Se a resposta for OK e contiver tokens, usar diretamente
            if (response.ok) {
                const data = responseData;
                if (data.id_token && data.access_token) {
                    try {
                        const payload = JSON.parse(atob(data.id_token.split('.')[1]));
                        const email = payload.email || payload.preferred_username || payload.upn;
                        if (email) {
                            console.log('✅ Email real obtido do backend Microsoft:', email);
                            console.log('✅ [Microsoft] Usando tokens diretamente da resposta (status 200)');
                            return {
                                email: email,
                                name: payload.name || email.split('@')[0],
                                access_token: data.access_token,
                                refresh_token: data.refresh_token,
                                id_token: data.id_token,
                                expires_in: data.expires_in || 3600,
                                session_id: data.session_id, // Incluir session_id se disponível
                                profile: payload
                            };
                        }
                    } catch (e) {
                        console.warn('⚠️ Não foi possível decodificar ID token:', e);
                    }
                }
                
                // Se resposta OK mas sem tokens completos, tentar usar session_id se disponível
                if (data.session_id && (!data.id_token || !data.access_token)) {
                    console.log('🔄 [Microsoft] Resposta OK mas tokens incompletos, tentando obter via session_id:', data.session_id);
                    try {
                        // Aguardar um pouco para garantir que a sessão foi persistida
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const tokens = await getTokensFromSession(data.session_id);
                        if (tokens) {
                            console.log('✅ [Microsoft] Tokens obtidos via session_id após resposta OK');
                            return tokens;
                        }
                    } catch (error) {
                        console.warn('⚠️ [Microsoft] Erro ao obter tokens do session_id após resposta OK:', error);
                    }
                }
            } else {
                // responseData já foi obtido acima
                const errorData = responseData;
                
                // Log detalhado do erro
                console.error('❌ Erro do backend Microsoft:', {
                    status: response.status,
                    error: errorData,
                    hasSessionId: !!errorData.session_id,
                    hasCode: !!params.code,
                    hasCodeVerifier: !!codeVerifier,
                    codeVerifierSource: codeVerifierSource || 'NÃO ENCONTRADO',
                    tenant: tenant,
                    redirect_uri: requestBody.redirect_uri
                });
                
                // PRIORIDADE 2: Se houver session_id mesmo com erro, tentar usar (após aguardar persistência)
                if (errorData.session_id) {
                    console.log('🔄 [Microsoft] Session ID encontrado mesmo com erro, tentando obter tokens...');
                    try {
                        // Aguardar um pouco para garantir que a sessão foi persistida no backend
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const tokens = await getTokensFromSession(errorData.session_id);
                        if (tokens) {
                            console.log('✅ [Microsoft] Tokens reais obtidos mesmo com erro inicial');
                            return tokens;
                        }
                    } catch (error) {
                        console.warn('⚠️ [Microsoft] Erro ao obter tokens do session_id após erro:', error);
                    }
                }
                
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
                        
                        // Tentar obter email de outras fontes antes de redirecionar
                        const emailFromStorage = localStorage.getItem('user_email') || 
                                                localStorage.getItem('auth_user_email') ||
                                                sessionStorage.getItem('cara_core_user_email');
                        
                        if (emailFromStorage) {
                            console.log('📧 Email encontrado em storage, redirecionando para primeiro acesso:', emailFromStorage);
                            // Redirecionar para primeiro acesso com o email
                            // IMPORTANTE: Redirecionar imediatamente para evitar conflito com outros redirecionamentos
                            window.location.href = `/secure/first-access.html?email=${encodeURIComponent(emailFromStorage)}&provider=microsoft&error=scope_unauthorized`;
                            return null; // Parar processamento imediatamente
                        } else {
                            // Se não houver email, redirecionar para primeiro acesso sem email
                            console.warn('⚠️ Email não encontrado em storage, redirecionando para primeiro acesso sem email');
                            window.location.href = `/secure/first-access.html?provider=microsoft&error=scope_unauthorized`;
                            return null; // Parar processamento imediatamente
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao obter email do backend Microsoft:', error);
        }
        return null;
    }
    
    /**
     * Obtém tokens reais usando session_id do backend
     * Estratégia: usar o endpoint /auth/session/refresh para obter tokens válidos
     * NOTA: Este método só deve ser usado quando os tokens não estão disponíveis na resposta inicial
     */
    async function getTokensFromSession(sessionId) {
        if (!sessionId) {
            return null;
        }
        
        const backendUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5051'
            : 'https://caracore-backend-docker.azurewebsites.net';
        
        try {
            console.log('🔄 [Microsoft] Obtendo tokens do session_id:', sessionId);
            
            const response = await fetch(`${backendUrl}/auth/session/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    session_id: sessionId
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.access_token && data.id_token) {
                    // Decodificar ID token para obter email
                    try {
                        const payload = JSON.parse(atob(data.id_token.split('.')[1]));
                        const email = payload.email || payload.preferred_username || payload.upn;
                        
                        if (email) {
                            console.log('✅ [Microsoft] Tokens reais obtidos do session_id para:', email);
                            return {
                                email: email,
                                name: payload.name || email.split('@')[0],
                                access_token: data.access_token,
                                id_token: data.id_token,
                                expires_in: data.expires_in || 3600,
                                expires_at: data.expires_at,
                                session_id: sessionId,
                                profile: payload
                            };
                        }
                    } catch (e) {
                        console.warn('⚠️ [Microsoft] Erro ao decodificar ID token do session:', e);
                    }
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || 'Erro desconhecido';
                
                // Se for 401, pode ser que a sessão ainda não foi persistida ou há problema de datetime
                if (response.status === 401) {
                    console.warn('⚠️ [Microsoft] Sessão não encontrada ou ainda não persistida (401):', {
                        sessionId: sessionId,
                        error: errorMessage,
                        suggestion: 'A sessão pode estar sendo criada ou há problema de validação no backend. Aguarde e tente novamente.',
                        details: errorData
                    });
                    
                    // Se o erro mencionar datetime, pode ser o bug corrigido no backend
                    if (errorMessage.includes('datetime') || errorMessage.includes('expiração')) {
                        console.warn('⚠️ [Microsoft] Possível erro de datetime no backend. Aguardando 2s e tentando novamente...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // Retry uma vez
                        try {
                            const retryResponse = await fetch(`${backendUrl}/auth/session/refresh`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    session_id: sessionId
                                })
                            });
                            
                            if (retryResponse.ok) {
                                const retryData = await retryResponse.json();
                                if (retryData.access_token && retryData.id_token) {
                                    console.log('✅ [Microsoft] Tokens obtidos após retry');
                                    const payload = JSON.parse(atob(retryData.id_token.split('.')[1]));
                                    const email = payload.email || payload.preferred_username || payload.upn;
                                    
                                    if (email) {
                                        return {
                                            email: email,
                                            name: payload.name || email.split('@')[0],
                                            access_token: retryData.access_token,
                                            id_token: retryData.id_token,
                                            expires_in: retryData.expires_in || 3600,
                                            expires_at: retryData.expires_at,
                                            session_id: sessionId,
                                            profile: payload
                                        };
                                    }
                                }
                            }
                        } catch (retryError) {
                            console.warn('⚠️ [Microsoft] Erro no retry:', retryError);
                        }
                    }
                } else {
                    console.warn('⚠️ [Microsoft] Erro ao obter tokens do session_id:', {
                        status: response.status,
                        sessionId: sessionId,
                        error: errorData
                    });
                }
            }
        } catch (error) {
            console.warn('⚠️ [Microsoft] Erro ao chamar /auth/session/refresh:', {
                error: error.message,
                sessionId: sessionId
            });
        }
        
        return null;
    }
    
    /**
     * Cria sessão no backend usando tokens reais
     * Isso garante que temos um session_id para renovação de tokens
     */
    async function createSessionWithTokens(tokenData) {
        if (!tokenData || !tokenData.access_token || !tokenData.id_token || !tokenData.email) {
            return null;
        }
        
        const backendUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5051'
            : 'https://caracore-backend-docker.azurewebsites.net';
        
        try {
            // Decodificar ID token para obter dados do usuário
            const payload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
            
            const userData = {
                email: tokenData.email,
                name: tokenData.name || payload.name || tokenData.email.split('@')[0],
                provider: PROVIDER,
                user_id: payload.oid || payload.sub || `microsoft_${tokenData.email}`
            };
            
            const tokens = {
                access_token: tokenData.access_token,
                id_token: tokenData.id_token,
                refresh_token: tokenData.refresh_token, // Pode ser undefined
                expires_in: tokenData.expires_in || 3600
            };
            
            // Só criar sessão se tivermos refresh_token
            if (!tokens.refresh_token) {
                console.warn('⚠️ [Microsoft] Sem refresh_token, não é possível criar sessão persistente');
                return null;
            }
            
            console.log('🔄 [Microsoft] Criando sessão no backend com tokens reais...');
            
            const response = await fetch(`${backendUrl}/auth/session/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_data: userData,
                    tokens: tokens
                })
            });
            
            if (response.ok) {
                const sessionData = await response.json();
                console.log('✅ [Microsoft] Sessão criada com sucesso:', sessionData.session_id);
                return sessionData;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.warn('⚠️ [Microsoft] Erro ao criar sessão:', {
                    status: response.status,
                    error: errorData
                });
            }
        } catch (error) {
            console.warn('⚠️ [Microsoft] Erro ao criar sessão com tokens:', error);
        }
        
        return null;
    }
    
    /**
     * Cria autenticação usando tokens REAIS do backend
     * Esta função salva os tokens reais e session_id para uso pelo SessionManager
     */
    async function createRealAuthentication(realUserData) {
        const now = Math.floor(Date.now() / 1000);
        const email = realUserData.email;
        const accessToken = realUserData.access_token;
        const idToken = realUserData.id_token;
        const sessionId = realUserData.session_id;
        const expiresIn = realUserData.expires_in || 3600;
        const expiresAt = realUserData.expires_at 
            ? Math.floor(new Date(realUserData.expires_at).getTime() / 1000)
            : now + expiresIn;
        
        console.log('🔐 [Microsoft] Criando autenticação REAL com tokens do backend:', {
            email: email,
            sessionId: sessionId,
            expiresAt: new Date(expiresAt * 1000).toISOString()
        });
        
        // VALIDAÇÃO: Garantir que temos tokens reais válidos
        if (!accessToken || !idToken || !email) {
            console.error('❌ [Microsoft] ERRO: Tentando criar autenticação sem tokens reais válidos!', {
                hasAccessToken: !!accessToken,
                hasIdToken: !!idToken,
                hasEmail: !!email
            });
            throw new Error('Tokens reais inválidos - não é possível criar autenticação');
        }
        
        // Salvar tokens REAIS no formato que SessionManager espera
        localStorage.setItem('auth_access_token', accessToken);
        localStorage.setItem('auth_provider', PROVIDER);
        localStorage.setItem('auth_user_info', JSON.stringify({
            email: email,
            name: realUserData.name || email.split('@')[0],
            provider: PROVIDER,
            user_id: realUserData.profile?.oid || realUserData.profile?.sub || `microsoft_${sessionId?.substr(0, 8) || 'unknown'}`
        }));
        localStorage.setItem('auth_expires_at', expiresAt.toString());
        localStorage.setItem('auth_last_activity', now.toString());
        localStorage.setItem('user_email', email);
        localStorage.setItem('auth_user_email', email);
        
        // IMPORTANTE: Salvar session_id para renovação de tokens
        if (sessionId) {
            localStorage.setItem('cara_core_session_id', sessionId);
            console.log('✅ [Microsoft] Session ID salvo para renovação de tokens:', sessionId);
        } else {
            console.warn('⚠️ [Microsoft] Sem session_id - renovação de tokens pode não funcionar');
        }
        
        // IMPORTANTE: Salvar refresh_token se disponível (para fallback)
        if (realUserData.refresh_token) {
            localStorage.setItem('auth_refresh_token', realUserData.refresh_token);
            console.log('✅ [Microsoft] Refresh token salvo para renovação');
        }
        
        // NÃO marcar como sessão mínima - estes são tokens REAIS
        localStorage.removeItem('auth_minimal_session');
        console.log('✅ [Microsoft] Sessão marcada como REAL (tokens válidos do backend)');
        
        // Salvar no formato OIDC para compatibilidade
        sessionStorage.setItem('cara_core_oidc_provider', PROVIDER);
        sessionStorage.setItem('cara_core_id_token', idToken);
        sessionStorage.setItem('cara_core_access_token', accessToken);
        sessionStorage.setItem('cara_core_token_type', 'Bearer');
        sessionStorage.setItem('cara_core_expires_at', (expiresAt * 1000).toString());
        if (realUserData.profile) {
            sessionStorage.setItem('cara_core_user_profile', JSON.stringify(realUserData.profile));
        }
        sessionStorage.setItem('cara_core_auth_time', Date.now().toString());
        
        // Inicializar TokenManager se disponível
        if (window.tokenManager && sessionId) {
            try {
                await window.tokenManager.initSession({
                    session_id: sessionId,
                    access_token: accessToken,
                    id_token: idToken,
                    expires_in: expiresIn,
                    expires_at: new Date(expiresAt * 1000).toISOString()
                });
                console.log('✅ [Microsoft] TokenManager inicializado com session_id real');
            } catch (error) {
                console.warn('⚠️ [Microsoft] Erro ao inicializar TokenManager:', error);
            }
        }
        
        console.log('✅ [Microsoft] Autenticação REAL criada com sucesso para:', email);
        return true;
    }
    
    // Criar autenticação completa no formato esperado pelo SessionManager (Microsoft)
    async function createAuthentication(params) {
        const now = Math.floor(Date.now() / 1000);
        
        // PRIMEIRO: Tentar obter tokens REAIS do backend (incluindo session_id)
        let realUserData = await getRealUserEmail(params);
        
        // VALIDAÇÃO: Verificar se temos tokens REAIS válidos
        const hasRealTokens = realUserData && 
                              realUserData.access_token && 
                              realUserData.id_token &&
                              realUserData.email;
        
        // Se obtivemos tokens reais, usar diretamente (mesmo sem session_id)
        if (hasRealTokens) {
            console.log('✅ [Microsoft] Tokens REAIS obtidos do backend:', {
                email: realUserData.email,
                hasAccessToken: !!realUserData.access_token,
                hasIdToken: !!realUserData.id_token,
                hasSessionId: !!realUserData.session_id,
                expiresIn: realUserData.expires_in
            });
            
            // Se não temos session_id mas temos tokens reais, tentar obter via refresh
            if (!realUserData.session_id && realUserData.refresh_token) {
                console.log('🔄 [Microsoft] Tokens reais sem session_id, tentando criar sessão...');
                // Tentar criar sessão no backend com os tokens reais
                try {
                    const sessionCreated = await createSessionWithTokens(realUserData);
                    if (sessionCreated && sessionCreated.session_id) {
                        realUserData.session_id = sessionCreated.session_id;
                        console.log('✅ [Microsoft] Sessão criada com tokens reais:', sessionCreated.session_id);
                    }
                } catch (error) {
                    console.warn('⚠️ [Microsoft] Erro ao criar sessão com tokens reais:', error);
                    // Continuar mesmo sem session_id - temos tokens reais
                }
            }
            
            return await createRealAuthentication(realUserData);
        }
        
        if (!realUserData) {
            // Verificar se já foi redirecionado para first-access.html (erro AADSTS70000)
            // Se sim, não continuar processando para evitar redirecionamentos conflitantes
            const currentUrl = window.location.href;
            if (currentUrl.includes('first-access.html') || currentUrl.includes('scope_unauthorized')) {
                console.log('✅ Já redirecionado para first-access.html, parando processamento');
                return false;
            }
            
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
                            // Verificar novamente se não foi redirecionado para first-access.html
                            const currentUrlCheck = window.location.href;
                            if (currentUrlCheck.includes('first-access.html') || currentUrlCheck.includes('scope_unauthorized')) {
                                console.log('✅ Já redirecionado para first-access.html, não redirecionando novamente');
                                return false;
                            }
                            
                            console.log('✅ Usuário autorizado, mas não autenticado corretamente.');
                            console.log('🔄 Redirecionando para reautenticação...');
                            
                            // RECOMENDAÇÃO PRINCIPAL: Redirecionar para reautenticação ao invés de criar sessão mínima
                            // Isso garante que o usuário tenha tokens reais validados pelo provider
                            const errorMessage = encodeURIComponent('Por favor, faça login novamente para acessar o sistema com segurança');
                            const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=microsoft&error=auth_failed&message=${errorMessage}&reason=no_real_tokens`;
                            
                            console.log('📤 Redirecionando para:', redirectUrl);
                            setTimeout(() => {
                                window.location.href = redirectUrl;
                            }, 1500);
                            
                            return false; // Parar processamento - redirecionamento em andamento
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
                console.warn('⚠️ Email não encontrado em fontes de storage. Tentando obter do OIDCAuth...');
                
                // ÚLTIMA TENTATIVA: Tentar obter email diretamente do OIDCAuth
                // Isso é importante quando o OIDC reconheceu o usuário mas o backend retornou erro 400
                let emailFromOIDC = null;
                if (window.OIDCAuth) {
                    try {
                        // Aguardar um pouco mais para o OIDCAuth processar completamente
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        const isAuthenticated = await window.OIDCAuth.isAuthenticated();
                        if (isAuthenticated) {
                            const user = await window.OIDCAuth.getUser();
                            if (user && user.profile) {
                                emailFromOIDC = user.profile.email || user.profile.preferred_username;
                                console.log('✅ Email obtido do OIDCAuth:', emailFromOIDC);
                                
                                // Validar que é um email Microsoft
                                if (emailFromOIDC) {
                                    const emailDomain = emailFromOIDC.toLowerCase().split('@')[1];
                                    const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                                             emailDomain === 'outlook.com' || 
                                                             emailDomain === 'live.com' || 
                                                             emailDomain === 'msn.com' ||
                                                             emailDomain.startsWith('hotmail.') || 
                                                             emailDomain.startsWith('outlook.') || 
                                                             emailDomain.startsWith('live.') ||
                                                             emailDomain.endsWith('.microsoft.com') ||
                                                             emailDomain.endsWith('.microsoftonline.com');
                                    
                                    if (isMicrosoftDomain) {
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
                                                    email: emailFromOIDC,
                                                    provider: PROVIDER
                                                }),
                                                credentials: 'include'
                                            });
                                            
                                            if (authResponse.ok) {
                                                const authData = await authResponse.json();
                                                if (authData.authorized === true) {
                                                    // Verificar se OIDCAuth retornou tokens REAIS
                                                    const hasRealTokens = user.id_token && user.access_token && 
                                                                         !user.id_token.includes('microsoft-oidc-') &&
                                                                         !user.access_token.includes('microsoft_oidc_');
                                                    
                                                    if (hasRealTokens) {
                                                        // Tokens reais do OIDCAuth - usar diretamente
                                                        console.log('✅ Tokens REAIS obtidos do OIDCAuth para:', emailFromOIDC);
                                                        
                                                        const expiresIn = user.expires_in || 3600;
                                                        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
                                                        
                                                        // Salvar tokens reais
                                                        localStorage.setItem('auth_access_token', user.access_token);
                                                        if (user.refresh_token) {
                                                            localStorage.setItem('auth_refresh_token', user.refresh_token);
                                                        }
                                                        localStorage.setItem('auth_provider', PROVIDER);
                                                        localStorage.setItem('auth_user_info', JSON.stringify({
                                                            email: emailFromOIDC,
                                                            name: user.profile?.name || emailFromOIDC.split('@')[0],
                                                            provider: PROVIDER,
                                                            user_id: user.profile?.oid || user.profile?.sub || `microsoft_${emailFromOIDC}`
                                                        }));
                                                        localStorage.setItem('auth_expires_at', expiresAt.toString());
                                                        localStorage.setItem('auth_last_activity', Math.floor(Date.now() / 1000).toString());
                                                        localStorage.setItem('user_email', emailFromOIDC);
                                                        localStorage.setItem('auth_user_email', emailFromOIDC);
                                                        
                                                        // NÃO marcar como sessão mínima - estes são tokens REAIS
                                                        localStorage.removeItem('auth_minimal_session');
                                                        
                                                        // Salvar no formato OIDC
                                                        sessionStorage.setItem('cara_core_oidc_provider', PROVIDER);
                                                        sessionStorage.setItem('cara_core_id_token', user.id_token);
                                                        sessionStorage.setItem('cara_core_access_token', user.access_token);
                                                        sessionStorage.setItem('cara_core_token_type', 'Bearer');
                                                        sessionStorage.setItem('cara_core_expires_at', (Date.now() + expiresIn * 1000).toString());
                                                        if (user.profile) {
                                                            sessionStorage.setItem('cara_core_user_profile', JSON.stringify(user.profile));
                                                        }
                                                        sessionStorage.setItem('cara_core_auth_time', Date.now().toString());
                                                        
                                                        console.log('✅ Autenticação REAL criada para usuário autorizado via OIDC:', emailFromOIDC);
                                                        return true;
                                                    } else {
                                                        // Sem tokens reais - redirecionar para reautenticação
                                                        console.log('✅ Usuário autorizado via OIDC, mas sem tokens reais.');
                                                        console.log('🔄 Redirecionando para reautenticação...');
                                                        
                                                        const errorMessage = encodeURIComponent('Por favor, faça login novamente para acessar o sistema com segurança');
                                                        const redirectUrl = `/secure/index.html?email=${encodeURIComponent(emailFromOIDC)}&provider=microsoft&error=auth_failed&message=${errorMessage}&reason=no_real_tokens`;
                                                        
                                                        console.log('📤 Redirecionando para:', redirectUrl);
                                                        setTimeout(() => {
                                                            window.location.href = redirectUrl;
                                                        }, 1500);
                                                        
                                                        return false; // Parar processamento - redirecionamento em andamento
                                                    }
                                                } else {
                                                    console.warn('⚠️ Usuário não autorizado:', emailFromOIDC);
                                                }
                                            }
                                        } catch (authError) {
                                            console.warn('⚠️ Erro ao verificar autorização do OIDC:', authError);
                                        }
                                    } else {
                                        console.warn('⚠️ Email do OIDC não é Microsoft:', emailFromOIDC);
                                    }
                                }
                            }
                        }
                    } catch (oidcError) {
                        console.warn('⚠️ Erro ao obter email do OIDCAuth:', oidcError);
                    }
                }
                
                // Se chegou aqui, não conseguiu obter email nem criar autenticação
                console.warn('⚠️ Email não encontrado em nenhuma fonte. Redirecionando para primeiro contato...');
                
                // Redirecionar para página de primeiro contato (com WhatsApp)
                const redirectUrl = new URL('/secure/first-access.html', window.location.origin);
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
        
        // VALIDAÇÃO CRÍTICA: Garantir que estamos usando tokens REAIS
        // Se não temos tokens reais aqui, algo está errado - não criar tokens fake
        if (!realUserData.access_token || !realUserData.id_token) {
            console.error('❌ [Microsoft] ERRO CRÍTICO: Tentando criar autenticação sem tokens reais!', {
                hasAccessToken: !!realUserData.access_token,
                hasIdToken: !!realUserData.id_token,
                email: realUserData.email
            });
            throw new Error('Tokens reais não disponíveis - não é possível criar autenticação válida');
        }
        
        // Usar APENAS tokens reais - nunca criar tokens fake
        const idToken = realUserData.id_token;
        const accessToken = realUserData.access_token;
        const refreshToken = realUserData.refresh_token; // Pode ser undefined, mas não criar fake
        
        const expiresIn = realUserData.expires_in || 3600;
        const expiresAt = realUserData.expires_at 
            ? Math.floor(new Date(realUserData.expires_at).getTime() / 1000)
            : now + expiresIn;
        
        console.log('✅ [Microsoft] Usando tokens REAIS (não fake):', {
            hasAccessToken: !!accessToken,
            hasIdToken: !!idToken,
            hasRefreshToken: !!refreshToken,
            expiresIn: expiresIn,
            expiresAt: new Date(expiresAt * 1000).toISOString()
        });
        
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
    
    // Processo principal de callback OIDC (Microsoft)
    async function processOidcCallback() {
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
                    console.warn('⚠️ OIDCAuth não conseguiu processar callback Microsoft, usando processamento OIDC alternativo:', oidcError);
                }
            }
            
            // FALLBACK: Se OIDCAuth não funcionou, usar processamento OIDC alternativo
            console.log('🔧 Usando processamento OIDC alternativo para Microsoft...');
            
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
                console.log('🎉 Callback OIDC Microsoft processado com sucesso!');
                cleanCallbackUrl();
                
                // Verificar autorização e redirecionar
                // IMPORTANTE: Priorizar email do localStorage que foi salvo ANTES do login (na página index.html)
                // Isso garante que o email informado pelo usuário seja usado para consultar o backend
                const userEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
                const provider = localStorage.getItem('auth_provider') || 'microsoft';
                
                if (userEmail && !userEmail.includes('user@caracore.com.br')) {
                    console.log('🔄 Verificando autorização para email Microsoft:', {
                        email: userEmail,
                        provider: provider,
                        emailSource: 'localStorage (salvo antes do login)'
                    });
                    
                    // Aguardar um pouco para garantir que authorization-check.js está carregado
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Verificar autorização usando requireAuthorization se disponível
                    // O email do localStorage será usado para consultar o backend
                    if (typeof requireAuthorization === 'function') {
                        try {
                            const isAuthorized = await requireAuthorization({
                                email: userEmail,  // Email informado pelo usuário (salvo antes do login)
                                provider: provider,
                                showLoading: false,
                                redirectOnFail: true
                            });
                            
                            if (isAuthorized) {
                                console.log('✅ Usuário Microsoft autorizado! Redirecionando para área restrita...');
                                setTimeout(() => {
                                    window.location.href = '/secure/restrita.html';
                                }, 500);
                                return true;
                            }
                            // Se não autorizado, requireAuthorization já redirecionou
                        } catch (authError) {
                            console.error('❌ Erro ao verificar autorização:', authError);
                            // Se a autenticação foi criada via OIDC (authResult === true), 
                            // significa que o usuário já foi verificado como autorizado
                            if (authResult === true) {
                                console.log('✅ Autenticação criada via OIDC (usuário já verificado como autorizado), redirecionando...');
                                setTimeout(() => {
                                    window.location.href = '/secure/restrita.html';
                                }, 500);
                                return true;
                            }
                            // Em caso de erro e sem autenticação OIDC, tentar redirecionar mesmo assim
                            setTimeout(() => {
                                window.location.href = '/secure/restrita.html';
                            }, 1000);
                        }
                    } else {
                        // Se requireAuthorization não estiver disponível, mas autenticação foi criada via OIDC,
                        // significa que o usuário já foi verificado como autorizado
                        if (authResult === true) {
                            console.log('✅ Autenticação criada via OIDC (usuário já verificado como autorizado), redirecionando...');
                            setTimeout(() => {
                                window.location.href = '/secure/restrita.html';
                            }, 500);
                            return true;
                        }
                        // Se não há requireAuthorization e não foi criado via OIDC, redirecionar diretamente
                        console.log('⚠️ requireAuthorization não disponível, redirecionando diretamente');
                        setTimeout(() => {
                            window.location.href = '/secure/restrita.html';
                        }, 1000);
                    }
                } else {
                    // Se não há email, redirecionar para primeiro contato (com WhatsApp)
                    console.warn('⚠️ Email não encontrado, redirecionando para primeiro contato');
                    const redirectUrl = new URL('/secure/first-access.html', window.location.origin);
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
                    // Não há email válido - redirecionar para primeiro contato (com WhatsApp)
                    console.log('🔄 Sem email válido detectado, redirecionando para primeiro contato...');
                    const redirectUrl = new URL('/secure/first-access.html', window.location.origin);
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
                                const redirectUrl = new URL('/secure/first-access.html', window.location.origin);
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
                    
                    // Se chegou aqui, redirecionar para primeiro contato (com WhatsApp)
                    console.log('🔄 Redirecionando para primeiro contato...');
                    const redirectUrl = new URL('/secure/first-access.html', window.location.origin);
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
            console.error('❌ Erro no processamento OIDC Microsoft:', error);
            return false;
        }
    }
    
    // Executar processamento OIDC quando DOM estiver pronto
    const executeOidcCallback = () => {
        console.log('🚀 Executando processamento OIDC callback Microsoft...');
        processOidcCallback().catch(error => {
            console.error('❌ Erro fatal no processamento OIDC Microsoft:', error);
        });
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(executeOidcCallback, 500);
        });
    } else {
        setTimeout(executeOidcCallback, 500);
    }
    
    // Expor função globalmente para compatibilidade (se necessário)
    window.processOidcCallback = processOidcCallback;
    
    console.log('🔐 OIDC Callback Microsoft configurado');
    
})();

