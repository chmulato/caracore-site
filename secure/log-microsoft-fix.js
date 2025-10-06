/**
 * log-microsoft-fix.js - Script para registrar a correção do erro Microsoft
 */

// Função para registrar a correção no sistema de logs
function logMicrosoftFix() {
    if (!window.logOIDC) {
        console.warn('⚠️ Sistema de logs OIDC não disponível');
        return;
    }

    const tenantId = window.CARA_CORE_CONFIG?.azureTenantId || window.CARA_CORE_ENV?.azureTenantId;
    const clientId = window.CARA_CORE_CONFIG?.azureClientId || '***AZURE_SECRET_REDACTED***';
    const audience = window.CARA_CORE_CONFIG?.azureUserAudience || 'unknown';
    const authority = tenantId
        ? `https://login.microsoftonline.com/${tenantId}/v2.0`
        : 'https://login.microsoftonline.com/common/v2.0';

    window.logOIDC.authEvent('microsoft_single_tenant_configured', {
        message: 'Microsoft Entra ID configurado para usar tenant específico conforme userAudience',
        tenantId,
        clientId,
        authority,
        audience,
        guidance: 'Se a aplicação estiver configurada como single-tenant, usar endpoint específico do tenant. Para aceitar contas pessoais, alterar Supported account types e liberar /common ou /consumers',
        timestamp: new Date().toISOString(),
        environment: window.location.hostname
    });

    console.log('✅ Configuração Microsoft Entra registrada nos logs OIDC');
}

// Registrar a correção quando o script for carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', logMicrosoftFix);
} else {
    logMicrosoftFix();
}

// Expor função para uso manual
window.logMicrosoftFix = logMicrosoftFix;