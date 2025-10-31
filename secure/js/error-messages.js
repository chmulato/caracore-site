/**
 * Error Messages Dictionary
 * Mapeia códigos de erro OAuth/OIDC para mensagens amigáveis
 * Suporta: pt-BR (padrão) e en-US
 */

const ErrorMessages = (function() {
    'use strict';
    
    // Idioma padrão
    let currentLang = 'pt-BR';
    
    /**
     * Dicionário de mensagens
     */
    const messages = {
        'pt-BR': {
            // OAuth/OIDC Errors
            'invalid_request': {
                title: 'Requisição Inválida',
                message: 'A requisição está malformada ou contém parâmetros inválidos.'
            },
            'invalid_grant': {
                title: 'Autorização Inválida',
                message: 'O código de autorização ou token de atualização é inválido ou expirou. Por favor, faça login novamente.'
            },
            'invalid_token': {
                title: 'Token Inválido',
                message: 'Sua sessão expirou ou o token é inválido. Por favor, faça login novamente.'
            },
            'unauthorized_client': {
                title: 'Cliente Não Autorizado',
                message: 'Este aplicativo não está autorizado a realizar esta operação.'
            },
            'access_denied': {
                title: 'Acesso Negado',
                message: 'Você negou as permissões necessárias ou não tem autorização para acessar este recurso.'
            },
            'unsupported_response_type': {
                title: 'Tipo de Resposta Não Suportado',
                message: 'O tipo de resposta solicitado não é suportado pelo servidor.'
            },
            'unsupported_grant_type': {
                title: 'Tipo de Grant Não Suportado',
                message: 'O tipo de grant solicitado não é suportado pelo servidor.'
            },
            'invalid_scope': {
                title: 'Escopo Inválido',
                message: 'O escopo solicitado é inválido ou não está disponível.'
            },
            'server_error': {
                title: 'Erro do Servidor',
                message: 'Ocorreu um erro inesperado no servidor. Por favor, tente novamente mais tarde.'
            },
            'temporarily_unavailable': {
                title: 'Serviço Temporariamente Indisponível',
                message: 'O serviço está temporariamente indisponível. Por favor, tente novamente em alguns minutos.'
            },
            
            // Session Errors
            'token_expired': {
                title: 'Sessão Expirada',
                message: 'Sua sessão expirou por inatividade. Por favor, faça login novamente.'
            },
            'session_invalid': {
                title: 'Sessão Inválida',
                message: 'Sua sessão não é mais válida. Por favor, faça login novamente.'
            },
            'refresh_failed': {
                title: 'Falha ao Renovar Sessão',
                message: 'Não foi possível renovar sua sessão automaticamente. Por favor, faça login novamente.'
            },
            'session_timeout': {
                title: 'Timeout de Inatividade',
                message: 'Sua sessão foi encerrada devido à inatividade prolongada.'
            },
            
            // Network Errors
            'network_error': {
                title: 'Erro de Conexão',
                message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
            },
            'timeout': {
                title: 'Tempo Esgotado',
                message: 'A requisição demorou muito para responder. Por favor, tente novamente.'
            },
            'cors_error': {
                title: 'Erro de CORS',
                message: 'Requisição bloqueada por política de segurança (CORS). Entre em contato com o suporte.'
            },
            
            // PKCE Errors
            'pkce_missing': {
                title: 'PKCE Ausente',
                message: 'Parâmetros de segurança PKCE estão faltando. Por favor, tente fazer login novamente.'
            },
            'pkce_invalid': {
                title: 'PKCE Inválido',
                message: 'Validação de segurança PKCE falhou. Por favor, tente fazer login novamente.'
            },
            'code_verifier_invalid': {
                title: 'Verificador de Código Inválido',
                message: 'O verificador de código PKCE é inválido. Por favor, tente fazer login novamente.'
            },
            
            // Rate Limiting
            'rate_limit_exceeded': {
                title: 'Limite de Requisições Excedido',
                message: 'Você fez muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.'
            },
            'too_many_requests': {
                title: 'Muitas Requisições',
                message: 'Você está fazendo requisições muito rapidamente. Por favor, aguarde um momento.'
            },
            
            // Consent Errors
            'consent_required': {
                title: 'Consentimento Necessário',
                message: 'Você precisa aceitar os termos de uso e política de privacidade para continuar.'
            },
            'consent_denied': {
                title: 'Consentimento Negado',
                message: 'Você negou o consentimento necessário para usar esta aplicação.'
            },
            
            // Logout Errors
            'logout_failed': {
                title: 'Falha ao Sair',
                message: 'Não foi possível encerrar sua sessão completamente. Por favor, tente novamente.'
            },
            'logout_partial': {
                title: 'Logout Parcial',
                message: 'Você foi desconectado desta aplicação, mas pode ainda estar conectado em outras contas.'
            },
            
            // Generic Errors
            'unknown_error': {
                title: 'Erro Desconhecido',
                message: 'Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.'
            },
            'not_authenticated': {
                title: 'Não Autenticado',
                message: 'Você precisa fazer login para acessar este recurso.'
            },
            'permission_denied': {
                title: 'Permissão Negada',
                message: 'Você não tem permissão para realizar esta ação.'
            },
            
            // Success Messages
            'login_success': {
                title: 'Login Realizado',
                message: 'Você entrou com sucesso!'
            },
            'logout_success': {
                title: 'Logout Realizado',
                message: 'Você saiu com sucesso!'
            },
            'session_refreshed': {
                title: 'Sessão Renovada',
                message: 'Sua sessão foi renovada automaticamente.'
            },
            'consent_registered': {
                title: 'Consentimento Registrado',
                message: 'Seu consentimento foi registrado com sucesso.'
            },
            'consent_revoked': {
                title: 'Consentimento Revogado',
                message: 'Seu consentimento foi revogado com sucesso.'
            }
        },
        
        'en-US': {
            // OAuth/OIDC Errors
            'invalid_request': {
                title: 'Invalid Request',
                message: 'The request is malformed or contains invalid parameters.'
            },
            'invalid_grant': {
                title: 'Invalid Grant',
                message: 'The authorization code or refresh token is invalid or expired. Please login again.'
            },
            'invalid_token': {
                title: 'Invalid Token',
                message: 'Your session has expired or the token is invalid. Please login again.'
            },
            'unauthorized_client': {
                title: 'Unauthorized Client',
                message: 'This application is not authorized to perform this operation.'
            },
            'access_denied': {
                title: 'Access Denied',
                message: 'You denied the required permissions or are not authorized to access this resource.'
            },
            'unsupported_response_type': {
                title: 'Unsupported Response Type',
                message: 'The requested response type is not supported by the server.'
            },
            'unsupported_grant_type': {
                title: 'Unsupported Grant Type',
                message: 'The requested grant type is not supported by the server.'
            },
            'invalid_scope': {
                title: 'Invalid Scope',
                message: 'The requested scope is invalid or unavailable.'
            },
            'server_error': {
                title: 'Server Error',
                message: 'An unexpected error occurred on the server. Please try again later.'
            },
            'temporarily_unavailable': {
                title: 'Temporarily Unavailable',
                message: 'The service is temporarily unavailable. Please try again in a few minutes.'
            },
            
            // Session Errors
            'token_expired': {
                title: 'Session Expired',
                message: 'Your session has expired due to inactivity. Please login again.'
            },
            'session_invalid': {
                title: 'Invalid Session',
                message: 'Your session is no longer valid. Please login again.'
            },
            'refresh_failed': {
                title: 'Session Refresh Failed',
                message: 'Could not automatically refresh your session. Please login again.'
            },
            'session_timeout': {
                title: 'Inactivity Timeout',
                message: 'Your session was terminated due to prolonged inactivity.'
            },
            
            // Network Errors
            'network_error': {
                title: 'Connection Error',
                message: 'Could not connect to the server. Please check your internet connection.'
            },
            'timeout': {
                title: 'Request Timeout',
                message: 'The request took too long to respond. Please try again.'
            },
            'cors_error': {
                title: 'CORS Error',
                message: 'Request blocked by security policy (CORS). Please contact support.'
            },
            
            // PKCE Errors
            'pkce_missing': {
                title: 'PKCE Missing',
                message: 'PKCE security parameters are missing. Please try logging in again.'
            },
            'pkce_invalid': {
                title: 'PKCE Invalid',
                message: 'PKCE security validation failed. Please try logging in again.'
            },
            'code_verifier_invalid': {
                title: 'Invalid Code Verifier',
                message: 'The PKCE code verifier is invalid. Please try logging in again.'
            },
            
            // Rate Limiting
            'rate_limit_exceeded': {
                title: 'Rate Limit Exceeded',
                message: 'You have made too many attempts. Please wait a few minutes before trying again.'
            },
            'too_many_requests': {
                title: 'Too Many Requests',
                message: 'You are making requests too quickly. Please wait a moment.'
            },
            
            // Consent Errors
            'consent_required': {
                title: 'Consent Required',
                message: 'You need to accept the terms of service and privacy policy to continue.'
            },
            'consent_denied': {
                title: 'Consent Denied',
                message: 'You denied the required consent to use this application.'
            },
            
            // Logout Errors
            'logout_failed': {
                title: 'Logout Failed',
                message: 'Could not fully terminate your session. Please try again.'
            },
            'logout_partial': {
                title: 'Partial Logout',
                message: 'You were logged out of this application but may still be logged in to other accounts.'
            },
            
            // Generic Errors
            'unknown_error': {
                title: 'Unknown Error',
                message: 'An unexpected error occurred. Please try again or contact support.'
            },
            'not_authenticated': {
                title: 'Not Authenticated',
                message: 'You need to login to access this resource.'
            },
            'permission_denied': {
                title: 'Permission Denied',
                message: 'You do not have permission to perform this action.'
            },
            
            // Success Messages
            'login_success': {
                title: 'Login Successful',
                message: 'You have successfully logged in!'
            },
            'logout_success': {
                title: 'Logout Successful',
                message: 'You have successfully logged out!'
            },
            'session_refreshed': {
                title: 'Session Refreshed',
                message: 'Your session was automatically refreshed.'
            },
            'consent_registered': {
                title: 'Consent Registered',
                message: 'Your consent was successfully registered.'
            },
            'consent_revoked': {
                title: 'Consent Revoked',
                message: 'Your consent was successfully revoked.'
            }
        }
    };
    
    /**
     * Retorna a mensagem para um código de erro
     */
    function get(errorCode, lang = null) {
        const language = lang || currentLang;
        const langMessages = messages[language] || messages['pt-BR'];
        
        // Buscar mensagem exata
        if (langMessages[errorCode]) {
            return langMessages[errorCode];
        }
        
        // Normalizar código (remover underscores, minúsculo)
        const normalizedCode = errorCode.toLowerCase().replace(/_/g, '');
        
        // Buscar por código normalizado
        for (const key in langMessages) {
            if (key.toLowerCase().replace(/_/g, '') === normalizedCode) {
                return langMessages[key];
            }
        }
        
        // Retornar erro desconhecido
        return langMessages['unknown_error'];
    }
    
    /**
     * Define o idioma atual
     */
    function setLanguage(lang) {
        if (messages[lang]) {
            currentLang = lang;
            console.log(`[ErrorMessages] Idioma alterado para: ${lang}`);
        } else {
            console.warn(`[ErrorMessages] Idioma não suportado: ${lang}`);
        }
    }
    
    /**
     * Retorna o idioma atual
     */
    function getLanguage() {
        return currentLang;
    }
    
    /**
     * Retorna lista de idiomas suportados
     */
    function getSupportedLanguages() {
        return Object.keys(messages);
    }
    
    /**
     * Detecta idioma do navegador
     */
    function detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Verificar se há suporte exato
        if (messages[browserLang]) {
            return browserLang;
        }
        
        // Verificar apenas código de idioma (ex: "pt" de "pt-BR")
        const langCode = browserLang.split('-')[0];
        for (const lang in messages) {
            if (lang.startsWith(langCode)) {
                return lang;
            }
        }
        
        // Retornar padrão
        return 'pt-BR';
    }
    
    /**
     * Auto-detectar e configurar idioma
     */
    function autoDetectLanguage() {
        const detectedLang = detectLanguage();
        setLanguage(detectedLang);
        return detectedLang;
    }
    
    // API pública
    return {
        get,
        setLanguage,
        getLanguage,
        getSupportedLanguages,
        detectLanguage,
        autoDetectLanguage
    };
})();

// Auto-detectar idioma ao carregar
ErrorMessages.autoDetectLanguage();

// Export para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorMessages;
}
