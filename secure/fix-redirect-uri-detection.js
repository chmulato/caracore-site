/**
 * fix-redirect-uri-detection.js - Correção da detecção de redirect_uri
 */

// Função melhorada para detectar ambiente e gerar redirect_uri correto
function improvedEnvironmentDetection() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    const pathname = window.location.pathname;
    
    console.log('🔍 Detectando ambiente atual:', {
        hostname,
        protocol,
        port,
        pathname,
        fullUrl: window.location.href
    });
    
    let baseUrl;
    let environmentType;
    
    // GitHub Pages
    if (hostname.includes('github.io')) {
        baseUrl = `https://${hostname}`;
        environmentType = 'github-pages';
        
        // Para GitHub Pages, o base pode incluir o nome do repositório
        if (pathname.startsWith('/cara-core')) {
            baseUrl = `https://${hostname}/cara-core`;
        }
    }
    // Localhost com diferentes portas
    else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const portSuffix = port ? `:${port}` : '';
        baseUrl = `${protocol}//${hostname}${portSuffix}`;
        environmentType = 'development';
    }
    // Netlify, Vercel ou outros serviços
    else if (hostname.includes('netlify.app') || hostname.includes('vercel.app')) {
        baseUrl = `https://${hostname}`;
        environmentType = 'staging';
    }
    // Domínio customizado
    else {
        baseUrl = `${protocol}//${hostname}`;
        environmentType = 'production';
    }
    
    const defaultPathConfig = {
        login: '/secure/index.html',
        callback: '/secure/callback.html',
        restrita: '/secure/restrita.html',
        logout: '/secure/logout.html',
        postLogoutLanding: '/index.html'
    };
    const pathConfig = (typeof resolveOidcPaths === 'function') ? resolveOidcPaths() : defaultPathConfig;

    // Gerar redirect_uri baseado no ambiente detectado
    const redirectUri = `${baseUrl}${pathConfig.callback}`;
    const logoutUri = `${baseUrl}${pathConfig.logout}`;
    const restritaUri = `${baseUrl}${pathConfig.restrita}`;
    
    const environmentInfo = {
        type: environmentType,
        baseUrl,
        redirectUri,
    logoutUri,
    restritaUri,
    paths: pathConfig,
        hostname,
        protocol,
        port,
        isSecure: protocol === 'https:',
        detectedAt: new Date().toISOString()
    };
    
    console.log('✅ Ambiente detectado:', environmentInfo);
    
    // Atualizar window.CARA_CORE_ENV se existir
    if (window.CARA_CORE_ENV) {
        window.CARA_CORE_ENV = {
            ...window.CARA_CORE_ENV,
            ...environmentInfo
        };
    } else {
        window.CARA_CORE_ENV = environmentInfo;
    }
    
    return environmentInfo;
}

// Função para validar se redirect_uri está correto
function validateRedirectUri(uri) {
    console.log(`🧪 Validando redirect_uri: ${uri}`);
    
    const validationRules = [
        {
            name: 'URL Format',
            test: () => {
                try {
                    new URL(uri);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'URI deve ter formato válido'
        },
        {
            name: 'HTTPS in Production',
            test: () => {
                const url = new URL(uri);
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    return true; // localhost pode usar HTTP
                }
                return url.protocol === 'https:';
            },
            message: 'Produção deve usar HTTPS'
        },
        {
            name: 'Path Ends with .html',
            test: () => {
                const url = new URL(uri);
                return url.pathname.endsWith('.html');
            },
            message: 'Path deve terminar com .html'
        },
        {
            name: 'Secure Path',
            test: () => {
                const url = new URL(uri);
                return url.pathname.includes('/secure/');
            },
            message: 'Path deve incluir /secure/'
        }
    ];
    
    const results = validationRules.map(rule => ({
        name: rule.name,
        passed: rule.test(),
        message: rule.message
    }));
    
    const allPassed = results.every(r => r.passed);
    
    console.table(results);
    
    if (allPassed) {
        console.log('✅ redirect_uri passou em todas as validações');
    } else {
        console.warn('⚠️ redirect_uri falhou em algumas validações');
    }
    
    return { valid: allPassed, results };
}

// Função para corrigir configuração OIDC com ambiente atualizado
async function fixOidcConfigWithEnvironment() {
    console.log('🔧 Corrigindo configuração OIDC com ambiente atualizado...');
    
    try {
        // Re-detectar ambiente
        const env = improvedEnvironmentDetection();
        
        // Validar redirect_uri gerado
        const validation = validateRedirectUri(env.redirectUri);
        
        if (!validation.valid) {
            console.error('❌ redirect_uri gerado é inválido:', validation.results);
            return { success: false, error: 'Invalid redirect_uri generated' };
        }
        
        // Gerar configurações atualizadas
        const googleConfig = await window.getProviderConfig('google');
        const microsoftConfig = await window.getProviderConfig('microsoft');
        
        console.log('🔄 Configurações OIDC atualizadas:');
        console.table([
            {
                Provider: 'Google',
                'Redirect URI': googleConfig.redirect_uri,
                'Logout URI': googleConfig.post_logout_redirect_uri,
                Valid: validateRedirectUri(googleConfig.redirect_uri).valid
            },
            {
                Provider: 'Microsoft',
                'Redirect URI': microsoftConfig.redirect_uri,
                'Logout URI': microsoftConfig.post_logout_redirect_uri,
                Valid: validateRedirectUri(microsoftConfig.redirect_uri).valid
            }
        ]);
        
        // Log para debugging
        if (window.logOIDC) {
            window.logOIDC.authEvent('redirect_uri_fix_applied', {
                environment: env,
                google_config: {
                    redirect_uri: googleConfig.redirect_uri,
                    post_logout_redirect_uri: googleConfig.post_logout_redirect_uri
                },
                microsoft_config: {
                    redirect_uri: microsoftConfig.redirect_uri,
                    post_logout_redirect_uri: microsoftConfig.post_logout_redirect_uri
                },
                validation_results: validation,
                timestamp: new Date().toISOString()
            });
        }
        
        return {
            success: true,
            environment: env,
            configurations: { google: googleConfig, microsoft: microsoftConfig },
            validation
        };
        
    } catch (error) {
        console.error('❌ Erro ao corrigir configuração OIDC:', error);
        
        if (window.logOIDC) {
            window.logOIDC.authError(error, {
                context: 'fix_oidc_config_with_environment',
                timestamp: new Date().toISOString()
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Função para forçar re-inicialização do auth manager
async function reinitializeAuthManager() {
    console.log('🔄 Re-inicializando Auth Manager...');
    
    try {
        if (window.OIDCAuth && window.OIDCAuth.reinitialize) {
            await window.OIDCAuth.reinitialize();
            console.log('✅ Auth Manager re-inicializado com sucesso');
        } else if (window.OIDCAuth && window.OIDCAuth.initialize) {
            await window.OIDCAuth.initialize();
            console.log('✅ Auth Manager inicializado com sucesso');
        } else {
            console.warn('⚠️ Auth Manager não disponível para re-inicialização');
        }
    } catch (error) {
        console.error('❌ Erro ao re-inicializar Auth Manager:', error);
        throw error;
    }
}

// Expor funções para uso manual
window.redirectUriFix = {
    detectEnvironment: improvedEnvironmentDetection,
    validate: validateRedirectUri,
    fixConfig: fixOidcConfigWithEnvironment,
    reinitialize: reinitializeAuthManager
};

// Auto-executar correção se ambiente não estiver configurado corretamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🚀 Auto-executando correção de redirect_uri...');
            fixOidcConfigWithEnvironment();
        }, 1500);
    });
} else {
    setTimeout(() => {
        console.log('🚀 Auto-executando correção de redirect_uri...');
        fixOidcConfigWithEnvironment();
    }, 1500);
}

console.log('🔧 Correção de redirect_uri carregada. Use window.redirectUriFix.fixConfig() para executar manualmente.');