/**
 * diagnose-redirect-uri.js - Diagnóstico do erro de redirect_uri inválido
 */

// Função para diagnosticar problemas de redirect_uri
async function diagnoseRedirectUri() {
    console.log('🔍 Iniciando diagnóstico de redirect_uri...');
    
    try {
        // 1. Detectar ambiente atual
        const currentUrl = window.location.href;
        const origin = window.location.origin;
        const hostname = window.location.hostname;
        
        console.log('📍 Ambiente detectado:', {
            currentUrl,
            origin,
            hostname,
            protocol: window.location.protocol,
            port: window.location.port || 'default'
        });
        
        // 2. Verificar configuração do CARA_CORE_ENV
        const envConfig = window.CARA_CORE_ENV;
        console.log('⚙️ Configuração de ambiente:', envConfig);
        
        // 3. Gerar configurações para ambos os provedores
        const googleConfig = await window.getProviderConfig('google');
        const microsoftConfig = await window.getProviderConfig('microsoft');
        
        console.log('🔧 Configurações geradas:');
        console.table([
            {
                Provider: 'Google',
                'Redirect URI': googleConfig.redirect_uri,
                'Client ID': googleConfig.client_id,
                Authority: googleConfig.authority
            },
            {
                Provider: 'Microsoft',
                'Redirect URI': microsoftConfig.redirect_uri,
                'Client ID': microsoftConfig.client_id,
                Authority: microsoftConfig.authority
            }
        ]);
        
        // 4. Verificar URIs esperadas vs configuradas
        const expectedUris = {
            localhost: [
                'http://localhost:8000/secure/callback.html',
                'http://127.0.0.1:8000/secure/callback.html'
            ],
            github: [
                'https://chmulato.github.io/cara-core/secure/callback.html'
            ],
            custom: [
                // Adicionar outros domínios se necessário
            ]
        };
        
        console.log('📋 URIs esperadas por ambiente:', expectedUris);
        
        // 5. Identificar possíveis problemas
        const problems = [];
        
        // Verificar se está usando HTTPS em produção
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && window.location.protocol !== 'https:') {
            problems.push({
                type: 'Protocol Mismatch',
                description: 'Produção deve usar HTTPS',
                current: window.location.protocol,
                expected: 'https:'
            });
        }
        
        // Verificar se a URI está na lista esperada
        const currentRedirectUri = googleConfig.redirect_uri;
        const allExpectedUris = [...expectedUris.localhost, ...expectedUris.github, ...expectedUris.custom];
        
        if (!allExpectedUris.includes(currentRedirectUri)) {
            problems.push({
                type: 'URI Not Registered',
                description: 'URI pode não estar registrada no provedor',
                current: currentRedirectUri,
                expected: allExpectedUris
            });
        }
        
        // 6. Verificar se há diferenças entre Google e Microsoft
        if (googleConfig.redirect_uri !== microsoftConfig.redirect_uri) {
            problems.push({
                type: 'Provider Mismatch',
                description: 'URIs diferentes entre provedores',
                google: googleConfig.redirect_uri,
                microsoft: microsoftConfig.redirect_uri
            });
        }
        
        // 7. Relatório de problemas
        if (problems.length > 0) {
            console.warn('⚠️ Problemas identificados:');
            console.table(problems);
        } else {
            console.log('✅ Nenhum problema óbvio detectado na configuração');
        }
        
        // 8. Sugestões de correção
        const suggestions = [
            'Verifique se a URI está registrada no Google Cloud Console',
            'Verifique se a URI está registrada no Azure Portal (Microsoft)',
            'Confirme se está usando HTTPS em produção',
            'Teste com localhost:8000 em desenvolvimento',
            'Verifique se não há caracteres especiais na URI'
        ];
        
        console.log('💡 Sugestões para resolver:');
        suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion}`);
        });
        
        // 9. Log estruturado para debugging
        if (window.logOIDC) {
            window.logOIDC.authError('redirect_uri_diagnosis', {
                current_environment: {
                    url: currentUrl,
                    origin,
                    hostname,
                    protocol: window.location.protocol
                },
                generated_uris: {
                    google: googleConfig.redirect_uri,
                    microsoft: microsoftConfig.redirect_uri
                },
                problems_found: problems,
                timestamp: new Date().toISOString()
            });
        }
        
        return {
            environment: { currentUrl, origin, hostname },
            configurations: { google: googleConfig, microsoft: microsoftConfig },
            problems,
            suggestions
        };
        
    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error);
        
        if (window.logOIDC) {
            window.logOIDC.authError(error, {
                context: 'redirect_uri_diagnosis',
                timestamp: new Date().toISOString()
            });
        }
        
        return { error: error.message };
    }
}

// Função para testar URI específica
function testSpecificUri(uri) {
    console.log(`🧪 Testando URI específica: ${uri}`);
    
    // Simular configuração com URI customizada
    const testConfig = {
        redirect_uri: uri,
        client_id: "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com"
    };
    
    console.log('🔧 Configuração de teste:', testConfig);
    
    // Verificar formato da URI
    try {
        const url = new URL(uri);
        console.log('✅ URI tem formato válido:', {
            protocol: url.protocol,
            hostname: url.hostname,
            pathname: url.pathname,
            port: url.port
        });
        
        return { valid: true, parsed: url };
    } catch (error) {
        console.error('❌ URI tem formato inválido:', error.message);
        return { valid: false, error: error.message };
    }
}

// Função para listar URIs que devem estar registradas
function listRequiredUris() {
    const requiredUris = [
        // Desenvolvimento
        'http://localhost:8000/secure/callback.html',
        'http://127.0.0.1:8000/secure/callback.html',
        
        // Produção GitHub Pages
        'https://chmulato.github.io/cara-core/secure/callback.html',
        
        // Logout URIs
        'http://localhost:8000/secure/logout.html',
        'http://127.0.0.1:8000/secure/logout.html',
        'https://chmulato.github.io/cara-core/secure/logout.html'
    ];
    
    console.log('📝 URIs que devem estar registradas nos provedores:');
    console.table(requiredUris.map((uri, index) => ({
        Index: index + 1,
        URI: uri,
        Type: uri.includes('logout') ? 'Logout' : 'Redirect',
        Environment: uri.includes('localhost') ? 'Development' : 'Production'
    })));
    
    return requiredUris;
}

// Expor funções para uso manual
window.redirectUriDiagnostic = {
    diagnose: diagnoseRedirectUri,
    test: testSpecificUri,
    listRequired: listRequiredUris
};

// Auto-executar diagnóstico se houver erro conhecido
if (window.location.search.includes('error') || 
    document.referrer.includes('accounts.google.com') ||
    document.referrer.includes('login.microsoftonline.com')) {
    
    console.log('🚨 Possível erro de redirect detectado - executando diagnóstico...');
    setTimeout(diagnoseRedirectUri, 2000);
}

console.log('🔍 Diagnóstico de redirect_uri carregado. Use window.redirectUriDiagnostic.diagnose() para executar manualmente.');