/**
 * test-redirect-fix.js - Script para testar e diagnosticar o problema de redirect_uri
 */

async function testRedirectConfig() {
    console.log('Testando configuração de redirect_uri...\n');
    
    // 1. Verificar ambiente detectado
    console.log('Ambiente atual:');
    console.log('   URL atual:', window.location.href);
    console.log('   Origin:', window.location.origin);
    console.log('   Hostname:', window.location.hostname);
    console.log('   Environment:', window.CARA_CORE_ENV);
    console.log('');
    
    // 2. Testar configuração dinâmica do Google
    try {
        console.log('Configuração Google (dinâmica):');
        const googleConfig = await window.getProviderConfig('google');
        console.log('   Client ID:', googleConfig.client_id);
        console.log('   Redirect URI:', googleConfig.redirect_uri);
        console.log('   Post Logout URI:', googleConfig.post_logout_redirect_uri);
        console.log('   Authority:', googleConfig.authority);
        console.log('');
        
        // 3. Comparar com configuração estática
        console.log('Comparando com configuração estática:');
        try {
            const staticResponse = await fetch('/secure/config/google.json');
            const staticConfig = await staticResponse.json();
            console.log('   Estática - Redirect URI:', staticConfig.redirect_uri);
            console.log('   Dinâmica - Redirect URI:', googleConfig.redirect_uri);
            console.log('   Match:', staticConfig.redirect_uri === googleConfig.redirect_uri ? 'SIM' : 'NÃO');
        } catch (error) {
            console.log('   Não foi possível carregar config estática:', error.message);
        }
        console.log('');
        
        // 4. URLs que devem estar autorizadas no Google Console
        console.log('URLs que devem estar no Google Cloud Console:');
        const possibleUrls = [
            'http://localhost:8000/secure/callback.html',
            'http://localhost:3000/secure/callback.html',
            'https://chmulato.github.io/cara-core/secure/callback.html',
            googleConfig.redirect_uri
        ];
        
        possibleUrls.forEach(url => {
            console.log(`   ${url === googleConfig.redirect_uri ? '✅' : '  '} ${url}`);
        });
        console.log('');
        
        // 5. Teste do OIDC Auth Manager
        console.log('Testando OIDCAuth Manager:');
        if (window.OIDCAuth) {
            console.log('   OIDCAuth disponível');
            console.log('   Provider atual:', window.OIDCAuth.currentProvider);
            console.log('   Inicializado:', window.OIDCAuth.isInitialized);
        } else {
            console.log('  OIDCAuth não disponível');
        }
        
    } catch (error) {
        console.error('Erro ao testar configuração:', error);
    }
}

// Função para corrigir URLs no Google Cloud Console
function showGoogleConsoleInstructions() {
    const currentUrl = window.location.origin + '/secure/callback.html';
    const logoutUrl = window.location.origin + '/secure/logout.html';
    
    console.log('\n INSTRUÇÕES PARA GOOGLE CLOUD CONSOLE:');
    console.log('');
    console.log('1. Acesse: https://console.cloud.google.com/apis/credentials');
    console.log('2. Encontre o OAuth 2.0 Client ID: 1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu');
    console.log('3. Na seção "Authorized redirect URIs", adicione:');
    console.log(`   ${currentUrl}`);
    console.log('');
    console.log('4. URLs recomendadas para adicionar (todos os ambientes):');
    console.log('   http://localhost:8000/secure/callback.html');
    console.log('   http://localhost:3000/secure/callback.html'); 
    console.log('   https://chmulato.github.io/cara-core/secure/callback.html');
    console.log(`   ${currentUrl} ← ATUAL`);
    console.log('');
    console.log('5. Salve as alterações e aguarde alguns minutos para propagar');
}

// Executar teste automaticamente
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para todos os scripts carregarem
    setTimeout(() => {
        testRedirectConfig();
        showGoogleConsoleInstructions();
    }, 2000);
});

// Expor funções para uso manual
window.testRedirectConfig = testRedirectConfig;
window.showGoogleConsoleInstructions = showGoogleConsoleInstructions;

console.log('Test Redirect Fix carregado. Execute testRedirectConfig() para diagnosticar.');