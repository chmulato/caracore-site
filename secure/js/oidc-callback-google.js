// oidc-callback-google.js - Processamento de callbacks OIDC para Google
// Implementação completa do fluxo OpenID Connect para autenticação Google
// Versão específica para Google - otimizada e sem lógica Microsoft

(function() {
    'use strict';
    
    console.log('🔐 OIDC Callback Google carregado');
    
    const PROVIDER = 'google';
    
    // Detectar se estamos em uma página de callback
    const isCallbackPage = window.location.pathname.includes('callback') || 
                          window.location.search.includes('code=') || 
                          window.location.search.includes('state=');
    
    if (!isCallbackPage) {
        console.log('📄 Não é página de callback, saindo...');
        return;
    }
    
    console.log('🎯 Página de callback Google detectada, iniciando processamento OIDC...');
    
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
    
    // Restaurar estado OAuth no formato correto (Google)
    function restoreOAuthState(state) {
        if (!state) return false;
        
        console.log(`🔧 Restaurando estado Google: ${state}`);
        
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
            codeVerifier = sessionStorage.getItem('google_pkce_verifier') || 
                          localStorage.getItem('google_pkce_verifier');
        }
        
        // Estado no formato que oidc-client-ts espera
        const stateData = {
            id: state,
            created: Math.floor(Date.now() / 1000),
            request_type: "si:r",
            code_verifier: codeVerifier || null,
            nonce: sessionStorage.getItem('google_oauth_nonce') || 
                   localStorage.getItem('google_oauth_nonce') || 
                   `google_nonce_${Math.random().toString(36).substr(2, 16)}`,
            authority: 'https://accounts.google.com',
            client_id: window.CARA_CORE_CONFIG?.clientId || 'caracore-google-client'
        };
        
        if (stateData.code_verifier) {
            sessionStorage.setItem(stateKey, JSON.stringify(stateData));
            sessionStorage.setItem('google_oauth_state', state);
            console.log(`✅ Estado Google restaurado: ${stateKey}`);
            return true;
        } else {
            console.warn('⚠️ code_verifier não encontrado. NÃO criando estado - deixando o oidc-client-ts fazer isso.');
            return false;
        }
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
            console.log('🔄 [Google] Obtendo tokens do session_id:', sessionId);
            
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
                            console.log('✅ [Google] Tokens reais obtidos do session_id para:', email);
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
                        console.warn('⚠️ [Google] Erro ao decodificar ID token do session:', e);
                    }
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || 'Erro desconhecido';
                
                // Se for 401, pode ser que a sessão ainda não foi persistida
                if (response.status === 401) {
                    console.warn('⚠️ [Google] Sessão não encontrada ou ainda não persistida (401):', {
                        sessionId: sessionId,
                        error: errorMessage,
                        suggestion: 'A sessão pode estar sendo criada. Aguarde e tente novamente.'
                    });
                } else {
                    console.warn('⚠️ [Google] Erro ao obter tokens do session_id:', {
                        status: response.status,
                        sessionId: sessionId,
                        error: errorData
                    });
                }
            }
        } catch (error) {
            console.warn('⚠️ [Google] Erro ao chamar /auth/session/refresh:', {
                error: error.message,
                sessionId: sessionId
            });
        }
        
        return null;
    }
    
    // Tentar obter email real do backend usando o código OAuth (Google)
    async function getRealUserEmail(params) {
        try {
            console.log('🔄 Tentando obter email real do usuário do backend (Google)...');
            const backendUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5051'
                : 'https://caracore-backend-docker.azurewebsites.net';
            
            const tokenEndpoint = `${backendUrl}/oauth/google/token`;
            
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
            
            // PRIORIDADE 3: Chaves específicas do Google
            if (!codeVerifier) {
                codeVerifier = sessionStorage.getItem('google_pkce_verifier') || 
                             localStorage.getItem('google_pkce_verifier');
                if (codeVerifier) {
                    codeVerifierSource = 'google_pkce_verifier';
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
                console.log('🔍 Chaves disponíveis no sessionStorage:', Object.keys(sessionStorage).filter(k => k.includes('oidc') || k.includes('google')));
                console.log('🔍 Chaves disponíveis no localStorage:', Object.keys(localStorage).filter(k => k.includes('oidc') || k.includes('google')));
            }
            
            const requestBody = {
                code: params.code,
                redirect_uri: window.location.origin + '/secure/callback.html',
                grant_type: 'authorization_code'
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
            
            console.log('📤 Enviando requisição para backend Google:', {
                endpoint: tokenEndpoint,
                hasCode: !!params.code,
                codeLength: params.code?.length || 0,
                hasCodeVerifier: !!codeVerifier,
                codeVerifierSource: codeVerifierSource || 'NÃO ENCONTRADO',
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
                const errorText = await response.text().catch(() => '');
                try {
                    responseData = JSON.parse(errorText);
                } catch {
                    responseData = { error: 'unknown', error_description: errorText };
                }
            }
            
            // PRIORIDADE 1: Se a resposta for OK e contiver tokens, usar diretamente
            if (response.ok) {
                const data = responseData;
                if (data.id_token && data.access_token) {
                    try {
                        const payload = JSON.parse(atob(data.id_token.split('.')[1]));
                        const email = payload.email;
                        if (email) {
                            console.log('✅ Email real obtido do backend Google:', email);
                            console.log('✅ [Google] Usando tokens diretamente da resposta (status 200)');
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
                    console.log('🔄 [Google] Resposta OK mas tokens incompletos, tentando obter via session_id:', data.session_id);
                    try {
                        // Aguardar um pouco para garantir que a sessão foi persistida
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const tokens = await getTokensFromSession(data.session_id);
                        if (tokens) {
                            console.log('✅ [Google] Tokens obtidos via session_id após resposta OK');
                            return tokens;
                        }
                    } catch (error) {
                        console.warn('⚠️ [Google] Erro ao obter tokens do session_id após resposta OK:', error);
                    }
                }
            } else {
                // responseData já foi obtido acima
                const errorData = responseData;
                
                // Log detalhado do erro
                console.error('❌ Erro do backend Google:', {
                    status: response.status,
                    error: errorData,
                    hasSessionId: !!errorData.session_id,
                    hasCode: !!params.code,
                    hasCodeVerifier: !!codeVerifier,
                    codeVerifierSource: codeVerifierSource || 'NÃO ENCONTRADO',
                    redirect_uri: requestBody.redirect_uri
                });
                
                // PRIORIDADE 2: Se houver session_id mesmo com erro, tentar usar (após aguardar persistência)
                if (errorData.session_id) {
                    console.log('🔄 [Google] Session ID encontrado mesmo com erro, tentando obter tokens...');
                    try {
                        // Aguardar um pouco para garantir que a sessão foi persistida no backend
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const tokens = await getTokensFromSession(errorData.session_id);
                        if (tokens) {
                            console.log('✅ [Google] Tokens reais obtidos mesmo com erro inicial');
                            return tokens;
                        }
                    } catch (error) {
                        console.warn('⚠️ [Google] Erro ao obter tokens do session_id após erro:', error);
                    }
                }
                
                // Se for erro 403 de domínio não autorizado, é esperado e será tratado
                if (response.status === 403 && errorData.error === 'unauthorized_domain') {
                    console.log('🔄 Domínio não autorizado detectado (esperado). Tentando obter email para redirecionar...');
                } else if (response.status === 400) {
                    // Tratamento avançado de erro 400
                    const errorDesc = errorData.error_description || '';
                    const isExpiredCode = errorDesc.includes('expired') || errorDesc.includes('code has expired');
                    const isInvalidCode = errorDesc.includes('invalid_grant') || errorDesc.includes('code');
                    
                    console.warn('⚠️ Erro 400 - Possíveis causas:', {
                        missingCodeVerifier: !codeVerifier,
                        invalidCodeVerifier: codeVerifier && (errorDesc.includes('code_verifier') || errorDesc.includes('PKCE')),
                        invalidCode: isInvalidCode,
                        invalidRedirectUri: errorDesc.includes('redirect_uri'),
                        expiredCode: isExpiredCode,
                        errorDetails: errorData
                    });
                }
                
                // Se for erro 403 de domínio não autorizado, tentar obter email e redirecionar para primeiro acesso
                if (response.status === 403 && errorData.error === 'unauthorized_domain') {
                    
                    let userEmail = null;
                    
                    // PRIORIDADE 0: Email pode vir na resposta de erro do backend
                    if (errorData.email && errorData.email.includes('@')) {
                        userEmail = errorData.email;
                        console.log('✅ Email obtido da resposta de erro do backend:', userEmail);
                    }
                    
                    // PRIORIDADE 1: Tentar obter do OIDCAuth
                    try {
                        if (window.OIDCAuth && typeof window.OIDCAuth.getUser === 'function') {
                            const user = await window.OIDCAuth.getUser();
                            if (user && user.profile && user.profile.email) {
                                userEmail = user.profile.email;
                                console.log('✅ Email obtido do OIDCAuth:', userEmail);
                            }
                        }
                    } catch (e) {
                        console.debug('OIDCAuth.getUser não disponível ou falhou:', e);
                    }
                    
                    // PRIORIDADE 2: Tentar decodificar ID token do storage
                    if (!userEmail) {
                        try {
                            const storedIdToken = sessionStorage.getItem('cara_core_id_token') || 
                                                localStorage.getItem('cara_core_id_token');
                            if (storedIdToken) {
                                const payload = JSON.parse(atob(storedIdToken.split('.')[1]));
                                if (payload.email && payload.email.includes('@')) {
                                    userEmail = payload.email;
                                    console.log('✅ Email obtido do ID token em storage:', userEmail);
                                }
                            }
                        } catch (e) {
                            console.debug('Não foi possível decodificar ID token do storage:', e);
                        }
                    }
                    
                    // PRIORIDADE 3: Tentar obter de outros storages
                    if (!userEmail) {
                        userEmail = localStorage.getItem('user_email') || 
                                   localStorage.getItem('auth_user_email') ||
                                   sessionStorage.getItem('user_email');
                        if (userEmail && userEmail.includes('@')) {
                            console.log('✅ Email obtido de storage:', userEmail);
                        } else {
                            userEmail = null;
                        }
                    }
                    
                    // Validar email antes de usar
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
                    
                    // ANTES de redirecionar para first-access, verificar se o usuário já está autorizado
                    if (userEmail && isValidEmail(userEmail)) {
                        console.log('🔄 Verificando autorização antes de redirecionar...', userEmail);
                        
                        // Verificar se AuthorizationChecker está disponível
                        if (window.authChecker && typeof window.authChecker.checkAuthorization === 'function') {
                            try {
                                const authResult = await window.authChecker.checkAuthorization(userEmail, 'google', false);
                                
                                if (authResult && authResult.authorized) {
                                    console.log('✅ Usuário já autorizado, redirecionando diretamente para área restrita');
                                    // Salvar dados do usuário antes de redirecionar
                                    localStorage.setItem('user_email', userEmail);
                                    localStorage.setItem('auth_user_email', userEmail);
                                    localStorage.setItem('auth_provider', 'google');
                                    
                                    // Redirecionar para área restrita
                                    setTimeout(() => {
                                        window.location.href = '/secure/restrita.html';
                                    }, 500);
                                    return null;
                                } else {
                                    console.log('⚠️ Usuário não autorizado, redirecionando para primeiro acesso');
                                }
                            } catch (authError) {
                                console.warn('⚠️ Erro ao verificar autorização, redirecionando para primeiro acesso:', authError);
                            }
                        } else if (typeof requireAuthorization === 'function') {
                            // Tentar usar requireAuthorization se disponível
                            try {
                                const isAuthorized = await requireAuthorization({
                                    email: userEmail,
                                    provider: 'google',
                                    showLoading: false,
                                    redirectOnFail: false // Não redirecionar automaticamente
                                });
                                
                                if (isAuthorized) {
                                    console.log('✅ Usuário já autorizado, redirecionando diretamente para área restrita');
                                    // Salvar dados do usuário antes de redirecionar
                                    localStorage.setItem('user_email', userEmail);
                                    localStorage.setItem('auth_user_email', userEmail);
                                    localStorage.setItem('auth_provider', 'google');
                                    
                                    // Redirecionar para área restrita
                                    setTimeout(() => {
                                        window.location.href = '/secure/restrita.html';
                                    }, 500);
                                    return null;
                                } else {
                                    console.log('⚠️ Usuário não autorizado, redirecionando para primeiro acesso');
                                }
                            } catch (authError) {
                                console.warn('⚠️ Erro ao verificar autorização, redirecionando para primeiro acesso:', authError);
                            }
                        } else {
                            console.log('⚠️ AuthorizationChecker não disponível, redirecionando para primeiro acesso');
                        }
                    }
                    
                    // Redirecionar para primeiro acesso apenas se não estiver autorizado
                    let firstAccessUrl = `/secure/first-access.html?provider=google&t=${Date.now()}`;
                    if (userEmail && isValidEmail(userEmail)) {
                        firstAccessUrl = `/secure/first-access.html?email=${encodeURIComponent(userEmail)}&provider=google&t=${Date.now()}`;
                        console.log('🔄 Redirecionando para primeiro acesso com email:', userEmail);
                    } else {
                        console.log('🔄 Redirecionando para primeiro acesso (sem email específico)...');
                    }
                    
                    window.location.href = firstAccessUrl;
                    return null; // Não retornar dados, pois estamos redirecionando
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao obter email do backend Google:', error);
        }
        return null;
    }
    
    // Criar autenticação completa no formato esperado pelo SessionManager (Google)
    async function createAuthentication(params) {
        const now = Math.floor(Date.now() / 1000);
        
        // PRIMEIRO: Tentar obter email real do backend
        let realUserData = await getRealUserEmail(params);
        
        if (!realUserData) {
            // Verificar se foi erro 403 de domínio não autorizado (esperado)
            const errorFromUrl = new URLSearchParams(window.location.search).get('error');
            if (errorFromUrl === 'unauthorized_domain' || errorFromUrl === '403') {
                console.debug('ℹ️ Domínio não autorizado - email será obtido da resposta de erro');
            } else {
                console.debug('⚠️ Não foi possível obter email do token Google. Sistema buscará de outras fontes.');
            }
            // Lógica de fallback similar ao original, mas simplificada para Google
            return;
        }
        
        // VERIFICAR E LIMPAR DADOS DE USUÁRIO ANTERIOR
        if (window.userSessionManager) {
            window.userSessionManager.handleUserLogin(realUserData.email, PROVIDER);
        }
        
        const userId = realUserData.profile?.sub || `google_${params.state?.substr(0, 8) || Math.random().toString(36).substr(2, 8)}`;
        
        // VALIDAÇÃO CRÍTICA: Verificar se o email corresponde ao provider Google
        const email = realUserData.email || '';
        const emailDomain = email.split('@')[1]?.toLowerCase() || '';
        const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
        const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                 emailDomain === 'outlook.com' || 
                                 emailDomain === 'live.com' || 
                                 emailDomain === 'msn.com' ||
                                 emailDomain.startsWith('hotmail.') || 
                                 emailDomain.startsWith('outlook.') || 
                                 emailDomain.startsWith('live.');
        
        if (!isGmailDomain && isMicrosoftDomain) {
            console.error('❌ ERRO CRÍTICO: Email Microsoft detectado com provider Google!', {
                provider: PROVIDER,
                email: email,
                emailDomain: emailDomain
            });
            
            sessionStorage.removeItem('cara_core_user_profile');
            sessionStorage.removeItem('cara_core_id_token');
            sessionStorage.removeItem('cara_core_access_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('auth_user_email');
            
            throw new Error(`Incompatibilidade detectada: Provider Google não corresponde ao email ${email}. Por favor, faça logout e tente novamente.`);
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
        
        // Criar perfil Google
        const userProfile = {
            sub: userId,
            email: realUserData.email,
            email_verified: true,
            name: realUserData.name || realUserData.email.split('@')[0],
            given_name: realUserData.profile?.given_name || realUserData.name?.split(' ')[0] || '',
            family_name: realUserData.profile?.family_name || realUserData.name?.split(' ').slice(1).join(' ') || '',
            picture: realUserData.profile?.picture || 'https://via.placeholder.com/128',
            locale: realUserData.profile?.locale || 'pt-BR',
            ...realUserData.profile
        };
        
        // VALIDAÇÃO CRÍTICA: Verificar se temos tokens reais
        if (!realUserData.access_token || !realUserData.id_token) {
            console.error('❌ [Google] ERRO CRÍTICO: Tentando criar autenticação sem tokens reais!', {
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
        
        console.log('✅ [Google] Usando tokens REAIS (não fake):', {
            hasAccessToken: !!accessToken,
            hasIdToken: !!idToken,
            hasRefreshToken: !!refreshToken,
            expiresIn: realUserData.expires_in || 3600
        });
        
        // Se não houver refresh_token, avisar mas não criar fake
        if (!refreshToken) {
            console.warn('⚠️ [Google] Sem refresh_token, não é possível criar sessão persistente');
        }
        
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
        
        console.log(`✅ Autenticação Google criada para:`, userProfile.name);
        
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
                
                console.log('[OAuth Callback Google] Criando sessão no backend...');
                await window.tokenManager.createSession(userData, tokens);
                console.log('[OAuth Callback Google] ✅ Sessão criada com sucesso no backend');
            } catch (error) {
                console.warn('[OAuth Callback Google] ⚠️ Erro ao criar sessão no backend:', error);
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
    
    // Processo principal de callback OIDC (Google)
    async function processOidcCallback() {
        try {
            const params = getCallbackParams();
            console.log('📋 Parâmetros extraídos (Google):', params);
            
            if (params.error) {
                console.error(`❌ Erro OAuth Google: ${params.error}`);
            }
            
            // LIMPAR DADOS ANTIGOS ANTES DE PROCESSAR
            const previousProvider = localStorage.getItem('auth_provider');
            const previousEmail = localStorage.getItem('user_email') || localStorage.getItem('auth_user_email');
            
            if (previousProvider && previousProvider !== PROVIDER) {
                console.log('🔄 Provider mudou de', previousProvider, 'para Google - limpando dados antigos...');
                sessionStorage.removeItem('cara_core_user_profile');
                sessionStorage.removeItem('cara_core_id_token');
                sessionStorage.removeItem('cara_core_access_token');
                localStorage.removeItem('user_email');
                localStorage.removeItem('auth_user_email');
                localStorage.removeItem('cara_core_user_profile');
            } else if (previousEmail) {
                const emailDomain = previousEmail.toLowerCase().split('@')[1];
                const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                       emailDomain === 'outlook.com' || 
                                       emailDomain === 'live.com' || 
                                       emailDomain === 'msn.com';
                
                if (isMicrosoftDomain) {
                    console.warn('⚠️ Email Microsoft encontrado com provider Google - limpando dados:', previousEmail);
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
                console.log('🔄 Tentando processar callback Google com OIDCAuth...');
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    if (params.state) {
                        console.log('🔧 Restaurando estado OAuth Google antes de processar callback...');
                        restoreOAuthState(params.state);
                    }
                    
                    if (!window.OIDCAuth.isInitialized) {
                        console.log('🔧 Inicializando OIDCAuth com provider: Google');
                        try {
                            console.log('⏳ Aguardando inicialização do OIDCAuth (timeout: 5s)...');
                            const initPromise = window.OIDCAuth.initialize(PROVIDER);
                            const timeoutPromise = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout na inicialização do OIDCAuth (5s)')), 5000)
                            );
                            await Promise.race([initPromise, timeoutPromise]);
                            console.log('✅ OIDCAuth inicializado com sucesso para Google');
                        } catch (initError) {
                            // Timeout é esperado em alguns casos (ex: quando OIDCAuth já está inicializando)
                            if (initError.message.includes('Timeout')) {
                                console.debug('⏳ Timeout na inicialização do OIDCAuth (pode ser esperado, usando fallback)');
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
                        console.log('✅ handleAuthCallback Google completado:', {
                            hasUser: !!user,
                            hasProfile: !!(user && user.profile),
                            email: user?.profile?.email || 'não encontrado'
                        });
                    } catch (callbackError) {
                        console.error('❌ Erro ao processar callback Google:', callbackError);
                        throw callbackError;
                    }
                    
                    if (user && user.profile) {
                        console.log('✅ Callback Google processado com sucesso pelo OIDCAuth');
                        
                        const expiresIn = user.expires_in || 3600;
                        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
                        const userEmail = user.profile.email;
                        
                        // VALIDAÇÃO CRÍTICA: Verificar compatibilidade entre provider e email
                        if (userEmail) {
                            const emailDomain = userEmail.toLowerCase().split('@')[1];
                            const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
                            const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                                     emailDomain === 'outlook.com' || 
                                                     emailDomain === 'live.com' || 
                                                     emailDomain === 'msn.com';
                            
                            if (!isGmailDomain && isMicrosoftDomain) {
                                console.error('❌ ERRO CRÍTICO: Email Microsoft incompatível com provider Google!', {
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
                                throw new Error(`Email ${userEmail} não corresponde ao provider Google. Por favor, faça logout e tente novamente.`);
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
                        
                        console.log('💾 Salvando dados Google no localStorage...', {
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
                            user_id: user.profile.sub
                        }));
                        localStorage.setItem('auth_expires_at', expiresAt.toString());
                        localStorage.setItem('auth_last_activity', Math.floor(Date.now() / 1000).toString());
                        localStorage.setItem('user_email', userEmail);
                        localStorage.setItem('auth_user_email', userEmail);
                        
                        console.log('✅ Dados Google salvos no localStorage. Aguardando verificação de autorização...');
                        cleanCallbackUrl();
                        return true;
                    }
                } catch (oidcError) {
                    // Timeout é esperado em alguns casos
                    if (oidcError.message && oidcError.message.includes('Timeout')) {
                        console.debug('⏳ OIDCAuth timeout (esperado), usando processamento OIDC alternativo como fallback');
                    } else {
                        console.warn('⚠️ OIDCAuth não conseguiu processar callback Google, usando processamento OIDC alternativo:', oidcError.message || oidcError);
                    }
                }
            }
            
            // FALLBACK: Se OIDCAuth não funcionou, usar processamento OIDC alternativo
            console.log('🔧 Usando processamento OIDC alternativo para Google...');
            
            if (!params.code) {
                console.log('⚠️ Sem código, criando autenticação de emergência...');
                params.code = 'emergency_code';
                params.state = 'emergency_state_' + Date.now();
            }
            
            if (params.state) {
                restoreOAuthState(params.state);
            }
            
            await createAuthentication(params);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const verification = {
                hasAccessToken: !!localStorage.getItem('auth_access_token'),
                hasExpiresAt: !!localStorage.getItem('auth_expires_at'),
                hasProvider: !!localStorage.getItem('auth_provider'),
                hasUserInfo: !!localStorage.getItem('auth_user_info')
            };
            
            console.log('🔍 Verificação Google (SessionManager):', verification);
            
            if (verification.hasAccessToken && verification.hasExpiresAt && verification.hasProvider) {
                console.log('🎉 Callback OIDC Google processado com sucesso!');
                cleanCallbackUrl();
                return true;
            } else {
                throw new Error('Verificação falhou - dados não salvos corretamente');
            }
            
        } catch (error) {
            console.error('❌ Erro no processamento OIDC Google:', error);
            return false;
        }
    }
    
    // Executar processamento OIDC quando DOM estiver pronto
    const executeOidcCallback = () => {
        console.log('🚀 Executando processamento OIDC callback Google...');
        processOidcCallback().catch(error => {
            console.error('❌ Erro fatal no processamento OIDC Google:', error);
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
    
    console.log('🔐 OIDC Callback Google configurado');
    
})();

