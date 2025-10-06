/**
 * copy-google-config.js - Script para copiar todas as configurações necessárias para o Google
 */

// Função para copiar configurações completas do Google Cloud Console
async function copyGoogleCloudConfig() {
    console.log('📋 Copiando configurações completas para Google Cloud Console...');
    
    const googleConfig = {
        clientId: '1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com',
        javascriptOrigins: [
            'http://localhost:8000',
            'http://localhost:3000',
            'https://chmulato.github.io',
            'https://www.caracore.com.br'
        ],
        redirectUris: [
            'http://localhost:8000/secure/callback.html',
            'http://localhost:3000/secure/callback.html',
            'https://chmulato.github.io/cara-core/secure/callback.html',
            'https://www.caracore.com.br/secure/callback.html'
        ]
    };
    
    // Formatar texto para cópia
    const configText = `
GOOGLE CLOUD CONSOLE - OAuth 2.0 Client ID
==========================================

Client ID: ${googleConfig.clientId}

AUTHORIZED JAVASCRIPT ORIGINS:
${googleConfig.javascriptOrigins.join('\n')}

AUTHORIZED REDIRECT URIS:
${googleConfig.redirectUris.join('\n')}

Link direto: https://console.cloud.google.com/apis/credentials
`;

    try {
        await navigator.clipboard.writeText(configText);
        console.log('✅ Configuração completa copiada para clipboard!');
        
        // Mostrar no console também
        console.log(configText);

        // Destacar o que é específico para caracore
        console.log('%c🎯 ESPECÍFICO PARA CARACORE:', 'color: #ff6b35; font-size: 16px; font-weight: bold;');
        console.log('%cJavaScript Origin: https://www.caracore.com.br', 'background: #e3f2fd; color: #000; padding: 5px;');
        console.log('%cRedirect URI: https://www.caracore.com.br/secure/callback.html', 'background: #ffeb3b; color: #000; padding: 5px;');
        
    } catch (error) {
        console.error('❌ Erro ao copiar para clipboard:', error);
        console.log('📋 Copie manualmente as configurações abaixo:');
        console.log(configText);
    }
    
    return googleConfig;
}

// Função para copiar apenas as URIs do caracore
async function copyCaracoreOnly() {
    const caracoreConfig = {
        origin: 'https://www.caracore.com.br',
        redirectUri: 'https://www.caracore.com.br/secure/callback.html'
    };
    
    const text = `JavaScript Origin: ${caracoreConfig.origin}\nRedirect URI: ${caracoreConfig.redirectUri}`;
    
    try {
        await navigator.clipboard.writeText(text);
        console.log('✅ URIs do Caracore copiadas para clipboard!');
        console.log(text);
    } catch (error) {
        console.log('📋 Copie manualmente:');
        console.log(text);
    }
    
    return caracoreConfig;
}

// Função para mostrar diferenças entre configurações atuais e necessárias
function compareCurrentWithRequired() {
    const current = {
        origin: window.location.origin,
    redirectUri: `${window.location.origin}/secure/callback.html`
    };
    
    const required = [
        {
            name: 'Localhost 8000',
            origin: 'http://localhost:8000',
            redirectUri: 'http://localhost:8000/secure/callback.html',
            status: 'Desenvolvimento'
        },
        {
            name: 'GitHub Pages',
            origin: 'https://chmulato.github.io',
            redirectUri: 'https://chmulato.github.io/cara-core/secure/callback.html',
            status: 'Produção'
        },
        {
            name: 'Caracore',
            origin: 'https://www.caracore.com.br',
            redirectUri: 'https://www.caracore.com.br/secure/callback.html',
            status: current.origin === 'https://www.caracore.com.br' ? 'ATUAL' : 'Produção'
        }
    ];
    
    console.log('📊 COMPARAÇÃO DE CONFIGURAÇÕES:');
    console.table(required);
    
    // Verificar qual configuração está sendo usada
    const currentConfig = required.find(config => config.origin === current.origin);
    if (currentConfig) {
        console.log(`✅ Configuração atual: ${currentConfig.name} (${currentConfig.status})`);
    } else {
        console.log('⚠️ Configuração atual não está na lista padrão');
    }
    
    return { current, required };
}

// Função para gerar instruções passo a passo
function generateStepByStepInstructions() {
    console.log('📝 INSTRUÇÕES PASSO A PASSO:');
    console.log('');
    console.log('1️⃣ Acesse o Google Cloud Console:');
    console.log('   https://console.cloud.google.com/apis/credentials');
    console.log('');
    console.log('2️⃣ Encontre o OAuth 2.0 Client ID:');
    console.log('   1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com');
    console.log('');
    console.log('3️⃣ Clique no Client ID para editar');
    console.log('');
    console.log('4️⃣ Na seção "Authorized JavaScript origins":');
    console.log('   - Clique em "ADD URI"');
    console.log('   - Adicione: https://www.caracore.com.br');
    console.log('');
    console.log('5️⃣ Na seção "Authorized redirect URIs":');
    console.log('   - Clique em "ADD URI"');
    console.log('   - Adicione: https://www.caracore.com.br/secure/callback.html');
    console.log('');
    console.log('6️⃣ Clique em "SAVE"');
    console.log('');
    console.log('7️⃣ Aguarde 2-5 minutos para propagação');
    console.log('');
    console.log('8️⃣ Recarregue esta página e teste o login');
    
    return {
        console_url: 'https://console.cloud.google.com/apis/credentials',
    client_id: '1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com',
        javascript_origin: 'https://www.caracore.com.br',
    redirect_uri: 'https://www.caracore.com.br/secure/callback.html'
    };
}

// Expor funções
window.googleConfig = {
    copyAll: copyGoogleCloudConfig,
    copyCaracore: copyCaracoreOnly,
    compare: compareCurrentWithRequired,
    instructions: generateStepByStepInstructions
};

// Auto-executar se estiver no domínio caracore
if (window.location.hostname === 'www.caracore.com.br') {
    console.log('🌐 Domínio caracore detectado - preparando configurações do Google...');
    
    // Aguardar carregamento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                compareCurrentWithRequired();
                console.log('💡 Use window.googleConfig.copyCaracore() para copiar apenas as URIs do Caracore');
                console.log('💡 Use window.googleConfig.copyAll() para copiar todas as configurações');
            }, 1500);
        });
    } else {
        setTimeout(() => {
            compareCurrentWithRequired();
            console.log('💡 Use window.googleConfig.copyCaracore() para copiar apenas as URIs do Caracore');
            console.log('💡 Use window.googleConfig.copyAll() para copiar todas as configurações');
        }, 1500);
    }
}

console.log('🔧 Google Config Helper carregado. Use window.googleConfig.copyAll() para copiar configurações.');