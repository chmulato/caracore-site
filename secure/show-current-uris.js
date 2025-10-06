/**
 * show-current-uris.js - Mostra as URIs sendo usadas atualmente
 */

// Função para mostrar URIs atuais de forma clara
async function showCurrentUris() {
    console.log('🔍 Verificando URIs atuais do sistema OIDC...');
    console.log('='.repeat(80));
    
    try {
        // Informações do ambiente atual
        const currentEnv = {
            url: window.location.href,
            origin: window.location.origin,
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            port: window.location.port || 'default',
            pathname: window.location.pathname
        };
        
        console.log('📍 AMBIENTE ATUAL:');
        console.table(currentEnv);
        
        // Configurações dos provedores
        const googleConfig = await window.getProviderConfig('google');
        const microsoftConfig = await window.getProviderConfig('microsoft');
        
        console.log('🔧 CONFIGURAÇÕES OIDC:');
        console.table([
            {
                Provedor: 'Google',
                'Client ID': googleConfig.client_id,
                'Redirect URI': googleConfig.redirect_uri,
                'Logout URI': googleConfig.post_logout_redirect_uri,
                Authority: googleConfig.authority
            },
            {
                Provedor: 'Microsoft',
                'Client ID': microsoftConfig.client_id,
                'Redirect URI': microsoftConfig.redirect_uri,
                'Logout URI': microsoftConfig.post_logout_redirect_uri,
                Authority: microsoftConfig.authority
            }
        ]);
        
        // URIs que precisam estar registradas
        const requiredUris = {
            google: {
                clientId: googleConfig.client_id,
                redirectUris: [
                    'http://localhost:8000/secure/callback.html',
                    'http://127.0.0.1:8000/secure/callback.html',
                    'https://chmulato.github.io/cara-core/secure/callback.html',
                    'https://www.caracore.com.br/secure/callback.html'
                ],
                logoutUris: [
                    'http://localhost:8000/secure/logout.html',
                    'http://127.0.0.1:8000/secure/logout.html',
                    'https://chmulato.github.io/cara-core/secure/logout.html',
                    'https://www.caracore.com.br/secure/logout.html'
                ]
            },
            microsoft: {
                clientId: microsoftConfig.client_id,
                redirectUris: [
                    'http://localhost:8000/secure/callback.html',
                    'http://127.0.0.1:8000/secure/callback.html',
                    'https://chmulato.github.io/cara-core/secure/callback.html',
                    'https://www.caracore.com.br/secure/callback.html'
                ],
                logoutUris: [
                    'http://localhost:8000/secure/logout.html',
                    'http://127.0.0.1:8000/secure/logout.html',
                    'https://chmulato.github.io/cara-core/secure/logout.html',
                    'https://www.caracore.com.br/secure/logout.html'
                ]
            }
        };
        
        console.log('📝 URIs QUE DEVEM ESTAR REGISTRADAS:');
        console.log('');
        console.log('🔵 GOOGLE CLOUD CONSOLE:');
        console.log(`   Client ID: ${requiredUris.google.clientId}`);
        console.log('   Redirect URIs:');
        requiredUris.google.redirectUris.forEach(uri => console.log(`   ✓ ${uri}`));
        console.log('   Logout URIs:');
        requiredUris.google.logoutUris.forEach(uri => console.log(`   ✓ ${uri}`));
        
        console.log('');
        console.log('🔷 MICROSOFT AZURE PORTAL:');
        console.log(`   Client ID: ${requiredUris.microsoft.clientId}`);
        console.log('   Redirect URIs:');
        requiredUris.microsoft.redirectUris.forEach(uri => console.log(`   ✓ ${uri}`));
        console.log('   Logout URIs:');
        requiredUris.microsoft.logoutUris.forEach(uri => console.log(`   ✓ ${uri}`));
        
        // Verificar se URI atual está na lista
        const currentRedirectUri = googleConfig.redirect_uri;
        const isRegistered = requiredUris.google.redirectUris.includes(currentRedirectUri);
        
        console.log('');
        console.log('🎯 VERIFICAÇÃO:');
        console.log(`   URI Atual: ${currentRedirectUri}`);
        console.log(`   Status: ${isRegistered ? '✅ Deve estar registrada' : '❌ Não está na lista padrão'}`);
        
        if (!isRegistered) {
            console.warn('⚠️ ATENÇÃO: A URI atual não está na lista padrão!');
            console.warn('   Verifique se ela está registrada manualmente nos provedores.');
        }
        
        // Gerar comandos para copiar
        console.log('');
        console.log('📋 PARA COPIAR E COLAR NOS PROVEDORES:');
        console.log('');
        console.log('Google (Authorized redirect URIs):');
        requiredUris.google.redirectUris.forEach(uri => console.log(uri));
        console.log('');
        console.log('Microsoft (Redirect URIs):');
        requiredUris.microsoft.redirectUris.forEach(uri => console.log(uri));
        
        // Log estruturado
        if (window.logOIDC) {
            window.logOIDC.authEvent('current_uris_displayed', {
                environment: currentEnv,
                google_config: {
                    client_id: googleConfig.client_id,
                    redirect_uri: googleConfig.redirect_uri,
                    post_logout_redirect_uri: googleConfig.post_logout_redirect_uri
                },
                microsoft_config: {
                    client_id: microsoftConfig.client_id,
                    redirect_uri: microsoftConfig.redirect_uri,
                    post_logout_redirect_uri: microsoftConfig.post_logout_redirect_uri
                },
                required_uris: requiredUris,
                current_uri_registered: isRegistered,
                timestamp: new Date().toISOString()
            });
        }
        
        return {
            environment: currentEnv,
            configurations: { google: googleConfig, microsoft: microsoftConfig },
            requiredUris,
            currentUriRegistered: isRegistered
        };
        
    } catch (error) {
        console.error('❌ Erro ao verificar URIs:', error);
        
        if (window.logOIDC) {
            window.logOIDC.authError(error, {
                context: 'show_current_uris',
                timestamp: new Date().toISOString()
            });
        }
        
        throw error;
    }
}

// Função para copiar URIs para clipboard
async function copyUrisToClipboard(provider = 'both') {
    try {
        const uris = {
            google: [
                'http://localhost:8000/secure/callback.html',
                'http://127.0.0.1:8000/secure/callback.html',
                'https://chmulato.github.io/cara-core/secure/callback.html',
                'https://www.caracore.com.br/secure/callback.html'
            ],
            microsoft: [
                'http://localhost:8000/secure/callback.html',
                'http://127.0.0.1:8000/secure/callback.html',
                'https://chmulato.github.io/cara-core/secure/callback.html',
                'https://www.caracore.com.br/secure/callback.html'
            ]
        };
        
        let textToCopy = '';
        
        if (provider === 'google' || provider === 'both') {
            textToCopy += 'Google Redirect URIs:\n';
            textToCopy += uris.google.join('\n') + '\n\n';
        }
        
        if (provider === 'microsoft' || provider === 'both') {
            textToCopy += 'Microsoft Redirect URIs:\n';
            textToCopy += uris.microsoft.join('\n') + '\n';
        }
        
        await navigator.clipboard.writeText(textToCopy);
        console.log('✅ URIs copiadas para clipboard!');
        
    } catch (error) {
        console.error('❌ Erro ao copiar URIs:', error);
        
        // Fallback: mostrar na tela para cópia manual
        console.log('📋 Copie manualmente:');
        if (provider === 'google' || provider === 'both') {
            console.log('Google:');
            console.log('http://localhost:8000/secure/callback.html');
            console.log('http://127.0.0.1:8000/secure/callback.html');
            console.log('https://chmulato.github.io/cara-core/secure/callback.html');
            console.log('https://www.caracore.com.br/secure/callback.html');
        }
        if (provider === 'microsoft' || provider === 'both') {
            console.log('Microsoft:');
            console.log('http://localhost:8000/secure/callback.html');
            console.log('http://127.0.0.1:8000/secure/callback.html');
            console.log('https://chmulato.github.io/cara-core/secure/callback.html');
            console.log('https://www.caracore.com.br/secure/callback.html');
        }
    }
}

// Expor funções
window.showCurrentUris = showCurrentUris;
window.copyUrisToClipboard = copyUrisToClipboard;

// Auto-executar se página carregada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(showCurrentUris, 2000);
    });
} else {
    setTimeout(showCurrentUris, 2000);
}

console.log('📋 Verificador de URIs carregado. Use window.showCurrentUris() ou window.copyUrisToClipboard() para executar manualmente.');