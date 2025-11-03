/**
 * dynamic-config.js - Geração dinâmica de configuração OIDC baseada no ambiente
 */

function resolveOidcPaths() {
    const normalizePath = (value, fallback) => {
        if (typeof value !== 'string' || !value.trim()) {
            return fallback;
        }
        return value.startsWith('/') ? value : `/${value}`;
    };

    const defaults = {
        login: '/secure/index.html',
        callback: '/secure/callback.html',
        restrita: '/secure/restrita.html',
        logout: '/secure/logout.html',
        postLogoutLanding: '/index.html'
    };

    const envPaths = window.CARA_CORE_ENV?.paths || {};
    const overridePaths = window.CARA_CORE_CONFIG?.oidcPaths || {};

    const raw = { ...defaults, ...overridePaths, ...envPaths };

    const paths = {
        login: normalizePath(raw.login, defaults.login),
        callback: normalizePath(raw.callback, defaults.callback),
        restrita: normalizePath(raw.restrita, defaults.restrita),
        logout: normalizePath(raw.logout, defaults.logout),
        postLogoutLanding: normalizePath(raw.postLogoutLanding, defaults.postLogoutLanding)
    };

    if (typeof window !== 'undefined') {
        if (!window.CARA_CORE_ENV) {
            window.CARA_CORE_ENV = { paths: { ...paths } };
        } else {
            window.CARA_CORE_ENV.paths = { ...paths };
        }
    }

    return paths;
}

// Função para gerar configuração do Google baseada na URL atual
function generateGoogleConfig() {
    const baseUrl = window.CARA_CORE_ENV?.baseUrl || window.location.origin;
    const paths = resolveOidcPaths();
    // Usar o endpoint direto no backend, já que estamos no domínio personalizado com CORS configurado
    const serverTokenEndpoint = (window.CARA_CORE_CONFIG && window.CARA_CORE_CONFIG.googleTokenEndpoint) || "https://caracore-backend-docker.azurewebsites.net/oauth/google/token";
    
    return {
        authority: "https://accounts.google.com",
        client_id: "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
        redirect_uri: `${baseUrl}${paths.callback}`,
        response_type: "code",
        // Scopes determinam quais dados do usuário sua aplicação solicita.
        // Por padrão pedimos os básicos: openid, profile e email. Se você precisar
        // de scopes adicionais (por exemplo, acesso a Google Drive ou Gmail), adicione
        // em tempo de execução usando a variável global `window.CARA_CORE_CONFIG.googleScopes`.
        // Exemplo em js/config.js: window.CARA_CORE_CONFIG = { googleScopes: ['https://www.googleapis.com/auth/drive.readonly'] }
        // Atenção: para scopes que acessam dados sensíveis, é necessário habilitar a API correspondente
        // no Google Cloud Console e, possivelmente, passar por revisão do Google.
        scope: (function(){
            const base = ['openid','profile','email'];
            try {
                const extra = (window.CARA_CORE_CONFIG && Array.isArray(window.CARA_CORE_CONFIG.googleScopes)) ? window.CARA_CORE_CONFIG.googleScopes : [];
                return base.concat(extra).join(' ');
            } catch (e) {
                return base.join(' ');
            }
        })(),
        post_logout_redirect_uri: `${baseUrl}${paths.logout}`,
        automaticSilentRenew: true,
        loadUserInfo: true,
        includeIdTokenInSilentRenew: true,
        metadata: {
            issuer: "https://accounts.google.com",
            authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
            // Note: For security, we exchange the token via backend to avoid exposing client_secret in the browser
            // Keep the public endpoint for reference, but oidc-client-ts may call the configured token endpoint.
            // When using this dynamic config with oidc-client-ts, set token_endpoint to our backend proxy.
            token_endpoint: serverTokenEndpoint,
            userinfo_endpoint: "https://openidconnect.googleapis.com/v1/userinfo",
            jwks_uri: "https://www.googleapis.com/oauth2/v3/certs"
        }
    };
}

function resolveMicrosoftAuthorityBase() {
    const fallback = 'https://login.microsoftonline.com/consumers';
    const candidates = [
        window.CARA_CORE_CONFIG?.azureAuthority,
        window.CARA_CORE_CONFIG?.azureTenantId,
        window.CARA_CORE_ENV?.azureTenantId,
        window.CARA_CORE_CONFIG?.microsoftTenant,
        window.CARA_CORE_ENV?.microsoftTenant
    ];

    for (const value of candidates) {
        if (typeof value !== 'string') {
            continue;
        }
        const trimmed = value.trim();
        if (!trimmed) {
            continue;
        }

        if (/consumers/i.test(trimmed)) {
            if (/^https?:\/\//i.test(trimmed)) {
                const withoutV2 = trimmed.replace(/\/v2\.0$/i, '');
                return withoutV2.replace(/\/+$/g, '');
            }
            return fallback;
        }

        const warningPayload = {
            requestedTenant: trimmed,
            enforcedTenant: 'consumers'
        };

        if (window?.logOIDC?.warn) {
            window.logOIDC.warn('Somente contas pessoais Microsoft são suportadas. Substituindo tenant informado.', warningPayload);
        } else {
            console.warn('Somente contas pessoais Microsoft são suportadas. Substituindo tenant informado.', warningPayload);
        }
        break;
    }

    if (typeof window === 'object') {
        if (!window.CARA_CORE_ENV) {
            window.CARA_CORE_ENV = {};
        }
        window.CARA_CORE_ENV.azureTenantId = 'consumers';
        if (!window.CARA_CORE_CONFIG || typeof window.CARA_CORE_CONFIG !== 'object') {
            window.CARA_CORE_CONFIG = {};
        }
        window.CARA_CORE_CONFIG.azureTenantId = 'consumers';
        window.CARA_CORE_CONFIG.microsoftTenant = 'consumers';
    }

    return fallback;
}

// Função para gerar configuração do Microsoft baseada na URL atual
function generateMicrosoftConfig() {
    const baseUrl = window.CARA_CORE_ENV?.baseUrl || window.location.origin;
    const paths = resolveOidcPaths();

    const authorityRoot = resolveMicrosoftAuthorityBase();

    const clientId = window.CARA_CORE_CONFIG?.azureClientId
        || window.CARA_CORE_ENV?.azureClientId
        || '***AZURE_SECRET_REDACTED***';

    const resolveScope = () => {
        const baseScopes = ['openid', 'profile', 'email'];
        if (typeof window.CARA_CORE_CONFIG?.microsoftScope === 'string') {
            const explicit = window.CARA_CORE_CONFIG.microsoftScope.trim();
            if (explicit) {
                return explicit;
            }
        }
        if (Array.isArray(window.CARA_CORE_CONFIG?.microsoftScopes)) {
            try {
                return baseScopes.concat(window.CARA_CORE_CONFIG.microsoftScopes).join(' ');
            } catch (err) {
                return baseScopes.join(' ');
            }
        }
        return baseScopes.join(' ');
    };

    const scope = resolveScope();

    let authorityBase = authorityRoot;
    if (!/^https?:\/\//i.test(authorityBase)) {
        authorityBase = `https://login.microsoftonline.com/${authorityBase}`;
    }
    authorityBase = authorityBase.replace(/\/+$/g, '');
    const authority = authorityBase.endsWith('/v2.0') ? authorityBase : `${authorityBase}/v2.0`;
    const tenantBase = authority.replace(/\/v2\.0$/, '');

    // Usar o endpoint local através do proxy configurado no web.config
    const microsoftTokenEndpoint = window.CARA_CORE_CONFIG?.microsoftTokenEndpoint || "https://caracore-backend-docker.azurewebsites.net/oauth/microsoft/token";
    let resolvedMicrosoftTokenEndpoint;
    try {
        resolvedMicrosoftTokenEndpoint = new URL(microsoftTokenEndpoint, baseUrl).toString();
    } catch (err) {
        resolvedMicrosoftTokenEndpoint = microsoftTokenEndpoint;
    }

    return {
        authority,
        client_id: clientId,
        redirect_uri: `${baseUrl}${paths.callback}`,
        response_type: 'code',
        scope,
        post_logout_redirect_uri: `${baseUrl}${paths.logout}`,
        automaticSilentRenew: true,
        loadUserInfo: true,
        includeIdTokenInSilentRenew: true,
        metadata: {
            issuer: authority,
            authorization_endpoint: `${tenantBase}/oauth2/v2.0/authorize`,
            token_endpoint: resolvedMicrosoftTokenEndpoint,
            userinfo_endpoint: 'https://graph.microsoft.com/oidc/userinfo',
            jwks_uri: `${tenantBase}/discovery/v2.0/keys`
        }
    };
}


// Função para obter configuração de provider dinamicamente
async function getProviderConfig(provider) {
    const configs = {
        google: generateGoogleConfig(),
        entra: generateMicrosoftConfig(),
        microsoft: generateMicrosoftConfig() // Alias
    };
    
    const config = configs[provider];
    if (!config) {
        throw new Error(`Provider '${provider}' não suportado`);
    }
    
    // Log da configuração gerada
    if (window.logOIDC) {
        window.logOIDC.debug('Configuração gerada dinamicamente', {
            provider,
            baseUrl: window.CARA_CORE_ENV?.baseUrl,
            redirect_uri: config.redirect_uri,
            environment: window.CARA_CORE_ENV?.type
        });
    }
    
    return config;
}

// Expor função globalmente
window.getProviderConfig = getProviderConfig;

// Log de inicialização
console.log('Dynamic Config carregado. URLs serão geradas automaticamente baseadas em:', window.location.origin);