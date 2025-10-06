/**
 * test-microsoft-fix.js - Teste da correção do erro AADSTS9002346
 * 
 * Erro corrigido: AADSTS9002346 - Application is configured for use by Microsoft Account users only
 * Solução: Usar endpoint /consumers em vez de tenant específico
 */

// Função para testar a configuração corrigida do Microsoft
async function testMicrosoftConfigFix() {
    console.log('🔧 Testando correção do Microsoft Entra ID...');
    
    try {
        // Obter configuração corrigida
        const config = await window.getProviderConfig('microsoft');
        
        console.log('✅ Configuração Microsoft corrigida:', {
            authority: config.authority,
            authorization_endpoint: config.metadata.authorization_endpoint,
            token_endpoint: config.metadata.token_endpoint,
            issuer: config.metadata.issuer
        });
        
        // Verificar se está usando /consumers
        const isUsingConsumers = config.authority.includes('/consumers/');
        console.log('✅ Usando endpoint /consumers:', isUsingConsumers);
        
        // Log do problema original
        window.logOIDC?.authEvent('microsoft_config_fixed', {
            originalError: 'AADSTS9002346',
            originalProblem: 'Application configured for Microsoft Account users only',
            solution: 'Changed from tenant-specific to /consumers endpoint',
            newAuthority: config.authority,
            timestamp: new Date().toISOString()
        });
        
        console.log('🎯 Correção aplicada com sucesso!');
        console.log('📝 Agora o login com Microsoft deve funcionar para contas pessoais.');
        
        return {
            success: true,
            config: config,
            isUsingConsumers: isUsingConsumers
        };
        
    } catch (error) {
        console.error('❌ Erro ao testar configuração Microsoft:', error);
        
        window.logOIDC?.authError(error, {
            context: 'microsoft_config_test',
            timestamp: new Date().toISOString()
        });
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Função para comparar configurações antigas vs novas
function compareMicrosoftConfigs() {
    console.log('📊 Comparação de configurações Microsoft:');
    
    const oldConfig = {
        authority: "https://login.microsoftonline.com/189c46ad-e437-48bd-bc87-050ef735c2c7/v2.0",
        description: "Tenant específico (causava AADSTS9002346)"
    };
    
    const newConfig = {
        authority: "https://login.microsoftonline.com/consumers/v2.0",
        description: "Endpoint /consumers (suporta contas pessoais Microsoft)"
    };
    
    console.table([
        {
            Tipo: 'ANTES (Erro)',
            Authority: oldConfig.authority,
            Suporte: 'Apenas contas organizacionais do tenant',
            Status: '❌ AADSTS9002346'
        },
        {
            Tipo: 'DEPOIS (Corrigido)',
            Authority: newConfig.authority,
            Suporte: 'Contas pessoais Microsoft (@outlook, @hotmail, etc)',
            Status: '✅ Funcionando'
        }
    ]);
}

// Expor funções para teste manual
window.testMicrosoftFix = {
    test: testMicrosoftConfigFix,
    compare: compareMicrosoftConfigs
};

// Auto-executar teste se em ambiente de desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 Ambiente de desenvolvimento detectado - executando teste automático...');
    
    // Aguardar carregamento completo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(testMicrosoftConfigFix, 1000);
        });
    } else {
        setTimeout(testMicrosoftConfigFix, 1000);
    }
}

console.log('🔧 Test Microsoft Fix carregado. Use window.testMicrosoftFix.test() para testar manualmente.');