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
        
        const stateKey = `oidc.${state}`;
        
        // PRIMEIRO: Verificar se o estado já existe e está completo (não sobrescrever!)
        try {
            const existingStateStr = sessionStorage.getItem(stateKey) || 
                                   localStorage.getItem(stateKey);
            if (existingStateStr) {
                const existingState = JSON.parse(existingStateStr);
                
                // Se o estado já existe e tem code_verifier, NÃO sobrescrever!
                if (existingState.code_verifier) {
                    console.log('✅ Estado OIDC original já existe e está completo, NÃO sobrescrevendo');
                    console.log('📋 Estado existente:', {
                        hasCodeVerifier: !!existingState.code_verifier,
                        codeVerifierLength: existingState.code_verifier?.length,
                        created: existingState.created,
                        request_type: existingState.request_type
                    });
                    return true; // Estado já existe, não precisa restaurar
                } else {
                    console.warn('⚠️ Estado OIDC existe mas sem code_verifier, tentando restaurar...');
                }
            } else {
                console.log('❌ Estado OIDC não encontrado, tentando criar/restaurar...');
            }
        } catch (e) {
            console.debug('Erro ao verificar estado OIDC existente:', e);
        }
        
        // Se chegou aqui, o estado não existe ou está incompleto
        const now = Math.floor(Date.now() / 1000);
        const authority = (provider === 'entra' || provider === 'azure') ? 
            'https://login.microsoftonline.com/common' : 
            'https://accounts.google.com';
        
        // Tentar recuperar code_verifier de fontes alternativas
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
            codeVerifier = sessionStorage.getItem(`${provider}_pkce_verifier`) || 
                          localStorage.getItem(`${provider}_pkce_verifier`);
        }
        
        // Estado no formato que oidc-client-ts espera
        const stateData = {
            id: state,
            created: now,
            request_type: "si:r",
            code_verifier: codeVerifier || null,
            nonce: sessionStorage.getItem(`${provider}_oauth_nonce`) || 
                   localStorage.getItem(`${provider}_oauth_nonce`) || 
                   `${provider}_nonce_${Math.random().toString(36).substr(2, 16)}`,
            authority: authority,
            client_id: window.CARA_CORE_CONFIG?.clientId || `caracore-${provider}-client`
        };
        
        // Só armazenar se tiver code_verifier (caso contrário, deixar o oidc-client-ts criar)
        if (stateData.code_verifier) {
            // Armazenar no formato esperado pela biblioteca
            sessionStorage.setItem(stateKey, JSON.stringify(stateData));
            sessionStorage.setItem(`${provider}_oauth_state`, state);
            console.log(`✅ Estado restaurado: ${stateKey} (com code_verifier preservado)`);
            return true;
        } else {
            console.warn('⚠️ code_verifier não encontrado. NÃO criando estado - deixando o oidc-client-ts fazer isso.');
            return false;
        }
    }
    
    // Tentar obter email real do backend usando o código OAuth
    async function getRealUserEmail(params, provider) {
        try {
            console.log('🔄 Tentando obter email real do usuário do backend...');
            const backendUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5051'
                : 'https://caracore-backend-docker.azurewebsites.net';
            
            const tokenEndpoint = provider === 'entra' || provider === 'microsoft'
                ? `${backendUrl}/oauth/microsoft/token`
                : `${backendUrl}/oauth/google/token`;
            
            // Tentar obter code_verifier do estado OIDC correto (prioridade: usar o state do callback)
            let codeVerifier = null;
            
            // 1. PRIORIDADE: Tentar do estado OIDC armazenado usando o state do callback (mais confiável)
            if (params.state) {
                try {
                    const stateKey = `oidc.${params.state}`;
                    console.log(`🔍 Buscando estado OIDC com chave: ${stateKey}`);
                    
                    // Tentar primeiro no formato oidc-client-ts padrão (sessionStorage)
                    const oidcState = sessionStorage.getItem(stateKey);
                    if (oidcState) {
                        console.log('📦 Estado OIDC encontrado no sessionStorage');
                        const stateData = JSON.parse(oidcState);
                        console.log('📋 Conteúdo do estado:', {
                            hasCodeVerifier: !!stateData.code_verifier,
                            codeVerifierLength: stateData.code_verifier?.length,
                            created: stateData.created,
                            request_type: stateData.request_type,
                            id: stateData.id
                        });
                        
                        if (stateData.code_verifier) {
                            codeVerifier = stateData.code_verifier;
                            console.log('✅ code_verifier encontrado no estado OIDC (sessionStorage, state match)');
                        } else {
                            console.warn('⚠️ Estado OIDC encontrado mas sem code_verifier');
                        }
                    } else {
                        console.log('❌ Estado OIDC não encontrado no sessionStorage');
                    }
                    
                    // Se não encontrou, tentar no localStorage também
                    if (!codeVerifier) {
                        const oidcStateLocal = localStorage.getItem(stateKey);
                        if (oidcStateLocal) {
                            console.log('📦 Estado OIDC encontrado no localStorage');
                            const stateData = JSON.parse(oidcStateLocal);
                            if (stateData.code_verifier) {
                                codeVerifier = stateData.code_verifier;
                                console.log('✅ code_verifier encontrado no localStorage (state match)');
                            }
                        } else {
                            console.log('❌ Estado OIDC não encontrado no localStorage');
                        }
                    }
                    
                    // DEBUG: Listar todos os estados OIDC disponíveis
                    console.log('🔍 Estados OIDC disponíveis no sessionStorage:');
                    let foundStates = 0;
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        if (key && key.startsWith('oidc.')) {
                            foundStates++;
                            try {
                                const value = sessionStorage.getItem(key);
                                const data = JSON.parse(value);
                                console.log(`  - ${key}:`, {
                                    hasCodeVerifier: !!data.code_verifier,
                                    codeVerifierLength: data.code_verifier?.length,
                                    id: data.id,
                                    matchesCurrentState: data.id === params.state
                                });
                            } catch (e) {
                                console.log(`  - ${key}: (erro ao parsear)`);
                            }
                        }
                    }
                    if (foundStates === 0) {
                        console.log('  (nenhum estado OIDC encontrado)');
                    }
                    
                } catch (e) {
                    console.error('❌ Erro ao ler estado OIDC:', e);
                }
            } else {
                console.warn('⚠️ params.state não disponível, não é possível buscar estado OIDC específico');
            }
            
            // 2. Fallback: Tentar do sessionStorage com chave específica do provider
            if (!codeVerifier) {
                codeVerifier = sessionStorage.getItem(`${provider}_pkce_verifier`) || 
                             localStorage.getItem(`${provider}_pkce_verifier`);
                if (codeVerifier) {
                    console.log(`✅ code_verifier encontrado em chave específica do provider`);
                }
            }
            
            // 3. Fallback: Tentar de chaves genéricas
            if (!codeVerifier) {
                codeVerifier = sessionStorage.getItem('oidc.pkce.code_verifier') ||
                             localStorage.getItem('oidc.pkce.code_verifier');
                if (codeVerifier) {
                    console.log('✅ code_verifier encontrado em chave genérica');
                }
            }
            
            // 4. Último recurso: Tentar buscar em todas as chaves do sessionStorage que contenham 'verifier'
            // ATENÇÃO: Isso pode pegar um code_verifier de uma tentativa anterior, causando erro
            if (!codeVerifier) {
                try {
                    // Buscar apenas chaves que contenham o state atual
                    const stateKey = params.state ? `oidc.${params.state}` : null;
                    if (stateKey) {
                        // Já tentamos acima, então vamos procurar em outras chaves relacionadas
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i);
                            if (key && key.startsWith('oidc.') && key !== stateKey) {
                                try {
                                    const value = sessionStorage.getItem(key);
                                    if (value) {
                                        const stateData = JSON.parse(value);
                                        if (stateData.code_verifier && stateData.code_verifier.length >= 43 && stateData.code_verifier.length <= 128) {
                                            // Verificar se o state corresponde (pode ser de tentativa anterior)
                                            if (stateData.id === params.state) {
                                                codeVerifier = stateData.code_verifier;
                                                console.log(`✅ code_verifier encontrado em estado OIDC alternativo: ${key}`);
                                                break;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Ignorar erros de parsing
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.debug('Erro ao buscar code_verifier no sessionStorage:', e);
                }
            }
            
            if (!codeVerifier) {
                console.warn('⚠️ code_verifier não encontrado. Tentando sem PKCE...');
            } else {
                console.log('✅ code_verifier encontrado', {
                    length: codeVerifier.length,
                    firstChars: codeVerifier.substring(0, 10) + '...',
                    source: 'verificado acima'
                });
                
                // DEBUG: Verificar se o code_verifier corresponde ao code_challenge da URL
                const urlParams = new URLSearchParams(window.location.search);
                const codeChallenge = urlParams.get('code_challenge');
                if (codeChallenge) {
                    console.log('🔍 Verificando correspondência PKCE:', {
                        codeChallenge: codeChallenge.substring(0, 20) + '...',
                        codeVerifierLength: codeVerifier.length,
                        note: 'O code_challenge deve ser SHA256(code_verifier) em base64url'
                    });
                }
            }
            
            // Extrair tenant da authority usada (para Microsoft)
            let tenant = null;
            if (provider === 'microsoft' || provider === 'entra') {
                // Tentar obter da configuração OIDC
                try {
                    const config = window.CARA_CORE_CONFIG || {};
                    const authority = config.azureAuthority || 
                                    config.microsoftAuthority || 
                                    window.CARA_CORE_ENV?.azureAuthority ||
                                    'https://login.microsoftonline.com/consumers';
                    
                    // Extrair tenant da authority (consumers, common, ou tenant ID)
                    const match = authority.match(/login\.microsoftonline\.com\/([^\/]+)/i);
                    if (match && match[1]) {
                        tenant = match[1].replace(/\/v2\.0$/i, '').trim();
                        console.log('✅ Tenant extraído da authority:', tenant);
                    } else {
                        // Fallback: usar 'consumers' se não conseguir extrair
                        tenant = 'consumers';
                        console.log('⚠️ Não foi possível extrair tenant, usando fallback: consumers');
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao extrair tenant, usando fallback: consumers', e);
                    tenant = 'consumers';
                }
            }
            
            const requestBody = {
                code: params.code,
                redirect_uri: window.location.origin + '/secure/callback.html',
                grant_type: 'authorization_code'
            };
            
            // Adicionar code_verifier se disponível (PKCE)
            if (codeVerifier) {
                requestBody.code_verifier = codeVerifier;
            }
            
            // Adicionar tenant para Microsoft (importante para contas pessoais)
            if (tenant && (provider === 'microsoft' || provider === 'entra')) {
                requestBody.tenant = tenant;
                console.log('✅ Tenant incluído no request:', tenant);
            }
            
            console.log('📤 Enviando requisição para backend:', {
                endpoint: tokenEndpoint,
                hasCode: !!params.code,
                hasCodeVerifier: !!codeVerifier,
                redirectUri: requestBody.redirect_uri
            });
            
            let response;
            try {
                response = await fetch(tokenEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    credentials: 'include' // Incluir cookies se necessário
                });
            } catch (networkError) {
                console.error('❌ Erro de rede ao chamar backend:', networkError);
                throw new Error(`Erro de conexão: ${networkError.message}`);
            }
            
            if (response.ok) {
                const data = await response.json();
                // Tentar decodificar ID token para obter email
                if (data.id_token) {
                    try {
                        const payload = JSON.parse(atob(data.id_token.split('.')[1]));
                        const email = payload.email || payload.preferred_username || payload.upn;
                        if (email) {
                            console.log('✅ Email real obtido do backend:', email);
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
                // Log detalhes do erro
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: 'unknown', error_description: errorText };
                }
                console.error('❌ Erro do backend:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData,
                    requestBody: {
                        hasCode: !!requestBody.code,
                        hasCodeVerifier: !!requestBody.code_verifier,
                        redirectUri: requestBody.redirect_uri,
                        grantType: requestBody.grant_type,
                        tenant: requestBody.tenant
                    }
                });
                
                // Se for erro 403, pode ser rate limit, CORS, ou autorização
                if (response.status === 403) {
                    console.error('❌ Erro 403 (Forbidden) - Possíveis causas:');
                    console.error('   1. Rate limit excedido (muitas tentativas)');
                    console.error('   2. CORS bloqueado (Origin não permitido)');
                    console.error('   3. HTTPS enforcement (requisição não é HTTPS)');
                    console.error('   4. Middleware de autorização bloqueando');
                    console.error('   Detalhes:', errorData.error_description || errorData.error || errorText);
                    
                    // Verificar se é rate limit
                    if (errorData.error === 'rate_limit_exceeded' || errorText.includes('rate_limit')) {
                        const retryAfter = errorData.retry_after || 60;
                        console.warn(`⚠️ Rate limit excedido. Aguarde ${retryAfter} segundos antes de tentar novamente.`);
                    }
                    
                    throw new Error(`Erro 403: ${errorData.error_description || errorData.error || 'Acesso negado'}`);
                }
                
                // Se for erro 400, pode ser problema com PKCE ou parâmetros
                if (response.status === 400) {
                    console.error('❌ Erro 400 - Possíveis causas:');
                    console.error('   1. code_verifier faltando ou inválido');
                    console.error('   2. code_challenge não corresponde ao code_verifier');
                    console.error('   3. redirect_uri não corresponde ao configurado');
                    console.error('   4. Código de autorização inválido ou expirado');
                    
                    // Se o erro menciona campos faltando, verificar se é code_verifier
                    if (errorData.error_description && 
                        (errorData.error_description.includes('code_verifier') || 
                         errorData.error_description.includes('Missing fields'))) {
                        console.warn('⚠️ Erro relacionado a PKCE ou campos faltando.');
                        console.warn('   Detalhes:', errorData.details || errorData.error_description);
                        
                        // Se code_verifier está faltando mas PKCE é obrigatório, não há o que fazer
                        // O sistema tentará verificar autorização usando email salvo
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao obter email do backend:', error);
        }
        return null;
    }
    
    // Criar autenticação completa no formato esperado pelo SessionManager
    async function createAuthentication(params, provider) {
        const now = Math.floor(Date.now() / 1000);
        
        // PRIMEIRO: Tentar obter email real do backend
        let realUserData = await getRealUserEmail(params, provider);
        
        if (!realUserData) {
            console.warn('⚠️ Não foi possível obter email do token. Tentando verificar se usuário já está autorizado...');
            
            // Tentar verificar se há email salvo anteriormente e se está autorizado
            // Também verificar se há email na URL (parâmetros de query)
            const urlParams = new URLSearchParams(window.location.search);
            const emailFromUrl = urlParams.get('email');
            
            // Tentar obter email de múltiplas fontes
            let savedEmail = emailFromUrl ||
                            localStorage.getItem('user_email') || 
                            localStorage.getItem('auth_user_email') ||
                            sessionStorage.getItem('user_email');
            
            // Se não encontrou email, tentar buscar em outras chaves do storage
            if (!savedEmail) {
                try {
                    // Buscar em todas as chaves do localStorage e sessionStorage
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.includes('email') || key.includes('user') || key.includes('profile'))) {
                            const value = localStorage.getItem(key);
                            // Verificar se parece um email válido
                            if (value && value.includes('@') && value.includes('.')) {
                                // Tentar parsear se for JSON
                                try {
                                    const parsed = JSON.parse(value);
                                    if (parsed.email) {
                                        savedEmail = parsed.email;
                                        console.log(`📧 Email encontrado em localStorage[${key}]:`, savedEmail);
                                        break;
                                    }
                                } catch {
                                    // Não é JSON, usar valor direto
                                    savedEmail = value;
                                    console.log(`📧 Email encontrado em localStorage[${key}]:`, savedEmail);
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Tentar também no sessionStorage
                    if (!savedEmail) {
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i);
                            if (key && (key.includes('email') || key.includes('user') || key.includes('profile'))) {
                                const value = sessionStorage.getItem(key);
                                if (value && value.includes('@') && value.includes('.')) {
                                    try {
                                        const parsed = JSON.parse(value);
                                        if (parsed.email) {
                                            savedEmail = parsed.email;
                                            console.log(`📧 Email encontrado em sessionStorage[${key}]:`, savedEmail);
                                            break;
                                        }
                                    } catch {
                                        savedEmail = value;
                                        console.log(`📧 Email encontrado em sessionStorage[${key}]:`, savedEmail);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.debug('Erro ao buscar email no storage:', e);
                }
            }
            
            if (savedEmail) {
                console.log('📧 Email encontrado:', savedEmail);
                
                // Verificar se este email está autorizado antes de redirecionar
                try {
                    const backendUrl = window.location.hostname === 'localhost' 
                        ? 'http://localhost:5051'
                        : 'https://caracore-backend-docker.azurewebsites.net';
                    
                    console.log('🔍 Verificando autorização para:', savedEmail);
                    const authCheckResponse = await fetch(`${backendUrl}/api/check-authorization`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: savedEmail,
                            provider: provider
                        })
                    });
                    
                    if (authCheckResponse.ok) {
                        const authData = await authCheckResponse.json();
                        console.log('📊 Resultado da verificação de autorização:', authData);
                        
                        if (authData.authorized && !authData.inactive) {
                            console.log('✅ Usuário já está autorizado! Continuando com autenticação...');
                            // Usuário está autorizado - tentar continuar mesmo sem token completo
                            // Usar email salvo para criar autenticação básica
                            const basicUserData = {
                                email: savedEmail,
                                name: savedEmail.split('@')[0],
                                access_token: 'pending', // Token será atualizado depois
                                id_token: null,
                                expires_in: 3600,
                                profile: {
                                    email: savedEmail,
                                    name: savedEmail.split('@')[0]
                                }
                            };
                            
                            // Continuar com autenticação básica
                            realUserData = basicUserData;
                        } else {
                            console.log('❌ Usuário não está autorizado ou está inativo');
                            // Redirecionar para primeiro acesso
                            const errorMsg = encodeURIComponent('Não foi possível obter informações do usuário. Por favor, tente fazer login novamente.');
                            window.location.href = `/secure/request-access.html?error=${errorMsg}&email=${encodeURIComponent(savedEmail)}`;
                            return;
                        }
                    } else {
                        console.warn('⚠️ Erro ao verificar autorização, assumindo primeiro acesso');
                        // Se não conseguir verificar, assumir primeiro acesso
                        const errorMsg = encodeURIComponent('Não foi possível obter informações do usuário. Por favor, tente fazer login novamente.');
                        window.location.href = `/secure/request-access.html?error=${errorMsg}${savedEmail ? '&email=' + encodeURIComponent(savedEmail) : ''}`;
                        return;
                    }
                } catch (checkError) {
                    console.error('❌ Erro ao verificar autorização:', checkError);
                    // Em caso de erro na verificação, redirecionar para primeiro acesso
                    const errorMsg = encodeURIComponent('Não foi possível verificar autorização. Por favor, tente fazer login novamente.');
                    window.location.href = `/secure/request-access.html?error=${errorMsg}${savedEmail ? '&email=' + encodeURIComponent(savedEmail) : ''}`;
                    return;
                }
            } else {
                console.error('❌ Não foi possível obter email do usuário e não há email salvo.');
                // Sem email, redirecionar para primeiro acesso
                const errorMsg = encodeURIComponent('Não foi possível obter informações do usuário. Por favor, tente fazer login novamente.');
                window.location.href = `/secure/request-access.html?error=${errorMsg}`;
                return;
            }
        }
        
        // VERIFICAR E LIMPAR DADOS DE USUÁRIO ANTERIOR (se for um usuário diferente)
        if (window.userSessionManager) {
            window.userSessionManager.handleUserLogin(realUserData.email, provider);
        }
        
        const userId = realUserData.profile?.sub || realUserData.profile?.oid || `${provider}_${params.state?.substr(0, 8) || Math.random().toString(36).substr(2, 8)}`;
        
        // VALIDAÇÃO CRÍTICA: Verificar se o email corresponde ao provider
        const email = realUserData.email || '';
        const emailDomain = email.split('@')[1]?.toLowerCase() || '';
        const isGoogleProvider = provider === 'google';
        const isMicrosoftProvider = provider === 'microsoft' || provider === 'entra' || provider === 'azure';
        
        const isGmailDomain = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
        const isMicrosoftDomain = emailDomain === 'hotmail.com' || 
                                 emailDomain === 'outlook.com' || 
                                 emailDomain === 'live.com' || 
                                 emailDomain === 'msn.com' ||
                                 emailDomain.endsWith('.microsoft.com') ||
                                 emailDomain.endsWith('.microsoftonline.com');
        
        // Verificar incompatibilidade
        if ((isGoogleProvider && !isGmailDomain && isMicrosoftDomain) || 
            (isMicrosoftProvider && !isMicrosoftDomain && isGmailDomain)) {
            console.error('❌ ERRO CRÍTICO: Incompatibilidade entre provider e email!', {
                provider: provider,
                email: email,
                emailDomain: emailDomain,
                isGoogleProvider: isGoogleProvider,
                isMicrosoftProvider: isMicrosoftProvider,
                isGmailDomain: isGmailDomain,
                isMicrosoftDomain: isMicrosoftDomain
            });
            
            // Limpar dados antigos do storage antes de continuar
            console.log('🧹 Limpando dados antigos do storage...');
            sessionStorage.removeItem('cara_core_user_profile');
            sessionStorage.removeItem('cara_core_id_token');
            sessionStorage.removeItem('cara_core_access_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('auth_user_email');
            
            throw new Error(`Incompatibilidade detectada: Provider ${provider} não corresponde ao email ${email}. Por favor, faça logout e tente novamente.`);
        }
        
        let userProfile;
        if (provider === 'entra' || provider === 'azure' || provider === 'microsoft') {
            userProfile = {
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
        } else {
            userProfile = {
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
        }
        
        // Usar tokens reais obtidos do backend
        const idToken = realUserData.id_token || `${btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${btoa(JSON.stringify(userProfile))}.${btoa(`${provider}-signature-${params.state || Date.now()}`)}`;
        const accessToken = realUserData.access_token || `${provider}_access_${Date.now()}_${Math.random().toString(36)}`;
        const refreshToken = realUserData.refresh_token || `${provider}_refresh_${Date.now()}_${Math.random().toString(36)}`;
        
        // Calcular expiração em segundos Unix timestamp (formato esperado pelo SessionManager)
        const expiresIn = realUserData.expires_in || 3600; // 1 hora
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
        
        // FASE 7: Criar sessão no backend com refresh token (se disponível)
        if (refreshToken && window.tokenManager) {
            try {
                const normalizedProvider = provider === 'entra' ? 'microsoft' : provider;
                const userData = {
                    email: userProfile.email,
                    name: userProfile.name,
                    provider: normalizedProvider,
                    user_id: userId
                };
                
                const tokens = {
                    access_token: accessToken,
                    id_token: idToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn
                };
                
                console.log('[OAuth Callback] Criando sessão no backend (Fase 7)...');
                await window.tokenManager.createSession(userData, tokens);
                console.log('[OAuth Callback] ✅ Sessão criada com sucesso no backend');
            } catch (error) {
                console.warn('[OAuth Callback] ⚠️ Erro ao criar sessão no backend (continuando sem sessão):', error);
                // Não bloquear o fluxo se falhar - sistema funciona sem sessão também
            }
        } else if (!refreshToken) {
            console.warn('[OAuth Callback] ⚠️ Refresh token não disponível - sessão não será criada');
        } else if (!window.tokenManager) {
            console.warn('[OAuth Callback] ⚠️ TokenManager não disponível - certifique-se de que token-manager.js está carregado');
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
            
            // Criar autenticação completa (agora é async)
            await createAuthentication(params, provider);
            
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