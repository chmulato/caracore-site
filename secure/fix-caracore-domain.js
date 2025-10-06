/**
 * fix-caracore-domain.js - Correção específica para domínio www.caracore.com.br
 */

// Função para corrigir configuração para o domínio caracore.com.br
function fixCaracoreDomain() {
    console.log('🔧 Corrigindo configuração para domínio www.caracore.com.br...');
    
    const currentUrl = window.location.href;
    const currentOrigin = window.location.origin;
    
    console.log('📍 Domínio atual detectado:', {
        url: currentUrl,
        origin: currentOrigin,
        hostname: window.location.hostname
    });
    
    // Verificar se está no domínio caracore
    if (window.location.hostname === 'www.caracore.com.br') {
        console.log('✅ Domínio www.caracore.com.br confirmado');
        
        // Atualizar configuração de ambiente
        window.CARA_CORE_ENV = {
            type: 'production-caracore',
            baseUrl: 'https://www.caracore.com.br',
            isCaracoreDomain: true,
            redirectUri: 'https://www.caracore.com.br/secure/callback.html',
            logoutUri: 'https://www.caracore.com.br/secure/logout.html',
            restritaUri: 'https://www.caracore.com.br/secure/restrita.html',
            azureTenantId: 'consumers',
            microsoftTenant: 'consumers',
            azureClientId: '8ef17663-438f-4777-99ca-c5ad5b2a2993',
            azureUserAudience: 'PersonalMicrosoftAccount',
            paths: {
                login: '/secure/index.html',
                callback: '/secure/callback.html',
                restrita: '/secure/restrita.html',
                logout: '/secure/logout.html',
                postLogoutLanding: '/index.html'
            },
            detectedAt: new Date().toISOString()
        };

        // Garantir que as informações estejam disponíveis imediatamente
        if (typeof window.CARA_CORE_CONFIG !== 'object' || window.CARA_CORE_CONFIG === null) {
            window.CARA_CORE_CONFIG = {};
        }

    window.CARA_CORE_CONFIG.azureTenantId = 'consumers';
    window.CARA_CORE_CONFIG.microsoftTenant = 'consumers';
        window.CARA_CORE_CONFIG.azureClientId = '8ef17663-438f-4777-99ca-c5ad5b2a2993';
    window.CARA_CORE_CONFIG.azureUserAudience = 'PersonalMicrosoftAccount';
        
        console.log('🔄 Ambiente atualizado para domínio Caracore:', window.CARA_CORE_ENV);
        console.log('🆔 Configuração Azure aplicada:', {
            tenant: window.CARA_CORE_CONFIG.azureTenantId,
            clientId: window.CARA_CORE_CONFIG.azureClientId,
            audience: window.CARA_CORE_CONFIG.azureUserAudience
        });
        
        // URIs que devem estar registradas no Google Cloud Console
        const requiredGoogleUris = [
            'http://localhost:8000/secure/callback.html',
            'http://localhost:3000/secure/callback.html',
            'https://chmulato.github.io/cara-core/secure/callback.html',
            'https://www.caracore.com.br/secure/callback.html'  // ← NOVA URI NECESSÁRIA
        ];
        
        console.log('📝 URIs que DEVEM estar no Google Cloud Console:');
        requiredGoogleUris.forEach((uri, index) => {
            const isCurrent = uri === window.CARA_CORE_ENV.redirectUri;
            console.log(`   ${index + 1}. ${uri} ${isCurrent ? '← ATUAL' : ''}`);
        });
        
        // Instruções específicas para o domínio caracore
        console.log('');
        console.log('🎯 AÇÃO NECESSÁRIA PARA www.caracore.com.br:');
        console.log('');
        console.log('1. Acesse: https://console.cloud.google.com/apis/credentials');
        console.log('2. Encontre o OAuth 2.0 Client ID: 1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu');
        console.log('3. Na seção "Authorized redirect URIs", ADICIONE:');
        console.log('   https://www.caracore.com.br/secure/callback.html');
        console.log('');
    console.log('4. NECESSÁRIO - Atualizar também no Microsoft Entra ID:');
    console.log('   App: Cara Core Área 51 (8ef17663-438f-4777-99ca-c5ad5b2a2993)');
    console.log('   Authentication > Supported account types: selecione "Contas Microsoft pessoais"');
    console.log('   Authentication > Redirect URIs: incluir https://www.caracore.com.br/secure/callback.html');
    console.log('   Logout URL: https://www.caracore.com.br/secure/logout.html');
        console.log('');
        console.log('5. Aguarde 2-5 minutos para propagação das mudanças');
        console.log('6. Recarregue a página e teste o login novamente');
        
        return {
            success: true,
            domain: 'www.caracore.com.br',
            environment: window.CARA_CORE_ENV,
            requiredUris: requiredGoogleUris,
            actionRequired: 'Adicionar https://www.caracore.com.br/secure/callback.html no Google Cloud Console'
        };
        
    } else {
        console.log('ℹ️ Não está no domínio www.caracore.com.br, configuração padrão mantida');
        return {
            success: false,
            domain: window.location.hostname,
            message: 'Correção específica apenas para www.caracore.com.br'
        };
    }
}

// Função para copiar URI do caracore para clipboard
async function copyCaracoreUri() {
    const uri = 'https://www.caracore.com.br/secure/callback.html';
    
    try {
        await navigator.clipboard.writeText(uri);
        console.log('✅ URI copiada para clipboard:', uri);
        alert('URI copiada para clipboard!\n' + uri);
    } catch (error) {
        console.log('📋 Copie manualmente esta URI:', uri);
        prompt('Copie esta URI para o Google Cloud Console:', uri);
    }
}

// Função para gerar todas as URIs necessárias
function generateAllRequiredUris() {
    const allUris = {
        google: {
            redirect: [
                'http://localhost:8000/secure/callback.html',
                'http://localhost:3000/secure/callback.html', 
                'https://chmulato.github.io/cara-core/secure/callback.html',
                'https://www.caracore.com.br/secure/callback.html'
            ],
            logout: [
                'http://localhost:8000/secure/logout.html',
                'http://localhost:3000/secure/logout.html',
                'https://chmulato.github.io/cara-core/secure/logout.html', 
                'https://www.caracore.com.br/secure/logout.html'
            ]
        },
        microsoft: {
            redirect: [
                'http://localhost:8000/secure/callback.html',
                'http://localhost:3000/secure/callback.html',
                'https://chmulato.github.io/cara-core/secure/callback.html',
                'https://www.caracore.com.br/secure/callback.html'
            ],
            logout: [
                'http://localhost:8000/secure/logout.html',
                'http://localhost:3000/secure/logout.html',
                'https://chmulato.github.io/cara-core/secure/logout.html',
                'https://www.caracore.com.br/secure/logout.html'
            ]
        }
    };
    
    console.log('📋 TODAS AS URIs NECESSÁRIAS:');
    console.log('');
    console.log('🔵 GOOGLE CLOUD CONSOLE:');
    console.log('Redirect URIs:');
    allUris.google.redirect.forEach(uri => console.log(`  ${uri}`));
    console.log('');
    console.log('🔷 MICROSOFT AZURE PORTAL:');
    console.log('Redirect URIs:');
    allUris.microsoft.redirect.forEach(uri => console.log(`  ${uri}`));
    
    return allUris;
}

// Função para verificar se URI está registrada (simulação)
function checkUriRegistration() {
    const currentUri = 'https://www.caracore.com.br/secure/callback.html';
    
    console.log('🔍 Verificando registro da URI atual...');
    console.log('URI atual:', currentUri);
    console.log('');
    console.log('❌ Status: Provavelmente NÃO registrada');
    console.log('💡 Evidência: Erro "redirect_uri is not valid"');
    console.log('');
    console.log('✅ Solução: Adicionar no Google Cloud Console');
    console.log('🔗 Link direto: https://console.cloud.google.com/apis/credentials');
    
    return {
        uri: currentUri,
        registered: false,
        evidence: 'redirect_uri error',
        solution: 'Add to Google Cloud Console'
    };
}

// Log estruturado para debugging
function logCaracoreConfiguration() {
    if (window.logOIDC) {
        window.logOIDC.authEvent('caracore_domain_detected', {
            domain: 'www.caracore.com.br',
            current_uri: window.location.href,
            required_action: 'Add https://www.caracore.com.br/secure/callback.html to Google Cloud Console',
            google_client_id: '1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu',
            microsoft_client_id: '8ef17663-438f-4777-99ca-c5ad5b2a2993',
            environment: window.CARA_CORE_ENV,
            timestamp: new Date().toISOString()
        });
    }
}

// Expor funções
window.caracoreFix = {
    fix: fixCaracoreDomain,
    copyUri: copyCaracoreUri,
    generateAllUris: generateAllRequiredUris,
    checkRegistration: checkUriRegistration,
    log: logCaracoreConfiguration
};

// Auto-executar se estiver no domínio caracore
if (window.location.hostname === 'www.caracore.com.br') {
    console.log('🌐 Domínio www.caracore.com.br detectado - executando correção...');
    
    // Executar após carregamento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                fixCaracoreDomain();
                logCaracoreConfiguration();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            fixCaracoreDomain();
            logCaracoreConfiguration();
        }, 1000);
    }
}

console.log('🌐 Correção Caracore carregada. Use window.caracoreFix.fix() para executar manualmente.');