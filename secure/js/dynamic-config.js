/**
 * dynamic-config.js
 *
 * Configuração neutralizada: o site foi convertido para simulação estática,
 * sem fluxo real de OIDC, Google ou Microsoft Entra.
 */

(function() {
    'use strict';

    function noopConfig() {
        return {
            mode: 'static-simulation',
            enabled: false,
            note: 'Autenticação real removida para manter o site estático.'
        };
    }

    window.resolveOidcPaths = function() {
        return {
            login: '/secure/index.html',
            callback: '/secure/callback.html',
            restrita: '/secure/restrita.html',
            logout: '/secure/logout.html',
            postLogoutLanding: '/index.html'
        };
    };

    window.generateGoogleConfig = function() {
        return noopConfig();
    };

    window.resolveMicrosoftAuthorityBase = function() {
        return 'https://login.microsoftonline.com/consumers';
    };

    window.generateMicrosoftConfig = function() {
        return noopConfig();
    };

    window.getProviderConfig = async function(provider) {
        const config = noopConfig();
        if (provider && provider !== 'google' && provider !== 'microsoft' && provider !== 'entra') {
            throw new Error(`Provider '${provider}' não suportado`);
        }
        return config;
    };
})();
