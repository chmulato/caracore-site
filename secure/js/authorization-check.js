/**
 * Authorization Check - Sistema de Verificação de Autorização
 * 
 * Este módulo verifica se um usuário autenticado tem autorização para
 * acessar as páginas protegidas da Área 51.
 * 
 * Funcionalidades:
 * - Verificação de autorização via API
 * - Cache de resultados por 5 minutos
 * - Redirecionamento automático se não autorizado
 * - Error handling robusto
 * - Integração com sistema OAuth existente
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-11-02
 */

class AuthorizationChecker {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.isChecking = false;
        
        // Configurações
        // Detectar URL do backend (produção ou local)
        const backendUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5051'
            : 'https://caracore-backend-docker.azurewebsites.net';
        
        this.config = {
            backendUrl: backendUrl, // Armazenar URL base do backend
            apiEndpoint: `${backendUrl}/api/check-authorization`,
            auditEndpoint: `${backendUrl}/api/audit/access-granted`,
            accessDeniedUrl: '/secure/access-denied.html',
            firstAccessUrl: '/secure/first-access.html', // Página de primeiro acesso
            maxRetries: 3,
            retryDelay: 1000 // 1 segundo
        };
        
        // Bind methods
        this.checkAuthorization = this.checkAuthorization.bind(this);
        this.handleAuthFailure = this.handleAuthFailure.bind(this);
    }
    
    /**
     * Verificar se usuário está autorizado
     * @param {string} userEmail - Email do usuário
     * @param {string} provider - Provedor OAuth (google/microsoft)
     * @param {boolean} forceCheck - Forçar verificação ignorando cache
     * @returns {Promise<{authorized: boolean, role: string|null, cached: boolean}>}
     */
    async checkAuthorization(userEmail, provider = null, forceCheck = false) {
        if (!userEmail) {
            console.warn('AuthorizationChecker: Email não fornecido');
            return { authorized: false, role: null, cached: false };
        }
        
        // Verificar cache se não forçar verificação
        if (!forceCheck) {
            const cached = this.getCachedResult(userEmail);
            if (cached) {
                console.log('AuthorizationChecker: Resultado do cache para', userEmail);
                return { ...cached, cached: true };
            }
        }
        
        // Evitar múltiplas verificações simultâneas
        if (this.isChecking) {
            console.log('AuthorizationChecker: Verificação já em andamento');
            await this.waitForCheck();
            return this.getCachedResult(userEmail) || { authorized: false, role: null, cached: false };
        }
        
        this.isChecking = true;
        
        try {
            const result = await this.performAuthCheck(userEmail, provider);
            
            // Armazenar no cache
            this.setCachedResult(userEmail, result);
            
            console.log('AuthorizationChecker: Verificação concluída para', userEmail, result);
            return { ...result, cached: false };
            
        } catch (error) {
            console.error('AuthorizationChecker: Erro na verificação:', error);
            return { authorized: false, role: null, cached: false, error: error.message };
        } finally {
            this.isChecking = false;
        }
    }
    
    /**
     * Realizar verificação de autorização via API
     * @param {string} userEmail - Email do usuário
     * @param {string} provider - Provedor OAuth
     * @returns {Promise<{authorized: boolean, role: string|null}>}
     */
    async performAuthCheck(userEmail, provider) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`AuthorizationChecker: Tentativa ${attempt}/${this.config.maxRetries} para ${userEmail}`);
                
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: userEmail,
                        provider: provider
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = `HTTP ${response.status}: ${errorData.error_description || response.statusText}`;
                    
                    // Tratar 405 (Method Not Allowed) e 404 (Not Found) como primeiro acesso
                    if (response.status === 405 || response.status === 404) {
                        throw new Error(`user_not_found: ${errorMessage}`);
                    }
                    
                    throw new Error(errorMessage);
                }
                
                const data = await response.json();
                
                return {
                    authorized: data.authorized === true,
                    role: data.role || null,
                    status: data.status || null,
                    inactive: data.inactive === true  // Flag indicando se usuário está inativo
                };
                
            } catch (error) {
                lastError = error;
                console.warn(`AuthorizationChecker: Tentativa ${attempt} falhou:`, error.message);
                
                // Aguardar antes de tentar novamente (exceto na última tentativa)
                if (attempt < this.config.maxRetries) {
                    await this.delay(this.config.retryDelay * attempt);
                }
            }
        }
        
        throw lastError || new Error('Falha na verificação de autorização');
    }
    
    /**
     * Verificar autorização e redirecionar se necessário
     * @param {string} userEmail - Email do usuário
     * @param {string} provider - Provedor OAuth
     * @param {boolean} showLoading - Mostrar indicador de carregamento
     * @returns {Promise<boolean>} - true se autorizado, false se redirecionou
     */
    async checkAndRedirect(userEmail, provider = null, showLoading = true) {
        if (showLoading) {
            this.showLoadingIndicator();
        }
        
        try {
            const result = await this.checkAuthorization(userEmail, provider);
            
            // Verificar se usuário está inativo (existe mas status = 'inactive')
            if (result.inactive === true) {
                console.log('AuthorizationChecker: Usuário está inativo:', userEmail);
                this.handleInactiveUser(userEmail, provider);
                return false;
            }
            
            if (!result.authorized) {
                // Se não está autorizado e status é null (usuário não encontrado), é primeiro acesso
                // Se status existe mas não é 'active', também pode ser primeiro acesso
                const isFirstAccess = result.status === null || result.status === undefined;
                const errorMsg = isFirstAccess ? 'user_not_found' : (result.error || 'unauthorized');
                console.log('AuthorizationChecker: Usuário não autorizado:', {
                    email: userEmail,
                    status: result.status,
                    isFirstAccess: isFirstAccess,
                    errorMsg: errorMsg
                });
                this.handleAuthFailure(userEmail, provider, errorMsg);
                return false;
            }
            
            // Usuário autorizado
            this.onAuthSuccess(userEmail, result.role, result.cached);
            return true;
            
        } catch (error) {
            console.error('AuthorizationChecker: Erro crítico:', error);
            this.handleAuthFailure(userEmail, provider, error.message);
            return false;
        } finally {
            if (showLoading) {
                this.hideLoadingIndicator();
            }
        }
    }
    
    /**
     * Lidar com usuário inativo
     * @param {string} userEmail - Email do usuário
     * @param {string} provider - Provedor OAuth
     */
    handleInactiveUser(userEmail, provider) {
        console.log('AuthorizationChecker: Redirecionando usuário inativo:', userEmail);
        
        // Construir URL de redirecionamento para página de usuário inativo
        const redirectUrl = new URL(this.config.accessDeniedUrl, window.location.origin);
        
        if (userEmail) {
            redirectUrl.searchParams.set('email', userEmail);
        }
        
        if (provider) {
            redirectUrl.searchParams.set('provider', provider);
        }
        
        // Adicionar parâmetro especial para identificar usuário inativo
        redirectUrl.searchParams.set('inactive', 'true');
        redirectUrl.searchParams.set('reason', 'user_inactive');
        
        // Log de auditoria
        this.logAccessDenied(userEmail, provider, 'Usuário está inativo');
        
        // Redirecionar
        window.location.href = redirectUrl.toString();
    }
    
    /**
     * Lidar com falha de autorização
     * @param {string} userEmail - Email do usuário
     * @param {string} provider - Provedor OAuth
     * @param {string} errorMessage - Mensagem de erro
     */
    handleAuthFailure(userEmail, provider, errorMessage = null) {
        console.log('AuthorizationChecker: Acesso negado para', userEmail);
        
        // Verificar se é um caso de primeiro acesso (usuário não registrado)
        // Se não há erro específico ou o erro indica usuário não encontrado, é primeiro acesso
        if (!errorMessage || this.isFirstAccessCase(errorMessage)) {
            console.log('AuthorizationChecker: Detectado como primeiro acesso, redirecionando para solicitação');
            this.redirectToFirstAccess(userEmail, provider);
            return;
        }
        
        // Se há erro específico que não é primeiro acesso (ex: usuário inativo, banido, etc)
        // Redirecionar para página de acesso negado
        const redirectUrl = new URL(this.config.accessDeniedUrl, window.location.origin);
        
        if (userEmail) {
            redirectUrl.searchParams.set('email', userEmail);
        }
        
        if (provider) {
            redirectUrl.searchParams.set('provider', provider);
        }
        
        if (errorMessage) {
            redirectUrl.searchParams.set('error', errorMessage);
        }
        
        // Log de auditoria
        this.logAccessDenied(userEmail, provider, errorMessage);
        
        // Redirecionar
        window.location.href = redirectUrl.toString();
    }
    
    /**
     * Callback para autorização bem-sucedida
     * @param {string} userEmail - Email do usuário
     * @param {string} role - Role do usuário
     * @param {boolean} fromCache - Se veio do cache
     */
    onAuthSuccess(userEmail, role, fromCache) {
        console.log('AuthorizationChecker: Acesso autorizado para', userEmail, `(role: ${role})`);
        
        // Armazenar informações do usuário no localStorage
        localStorage.setItem('auth_user_email', userEmail);
        localStorage.setItem('auth_user_role', role || 'user');
        localStorage.setItem('auth_check_timestamp', Date.now().toString());
        
        // Disparar evento customizado
        const event = new CustomEvent('authorizationSuccess', {
            detail: {
                email: userEmail,
                role: role,
                fromCache: fromCache
            }
        });
        document.dispatchEvent(event);
        
        // Log de auditoria
        this.logAccessGranted(userEmail, role, fromCache);
    }
    
    /**
     * Obter resultado do cache
     * @param {string} userEmail - Email do usuário
     * @returns {Object|null} - Resultado cached ou null
     */
    getCachedResult(userEmail) {
        const cached = this.cache.get(userEmail);
        if (!cached) return null;
        
        const now = Date.now();
        if (now - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(userEmail);
            return null;
        }
        
        return cached.result;
    }
    
    /**
     * Armazenar resultado no cache
     * @param {string} userEmail - Email do usuário
     * @param {Object} result - Resultado da verificação
     */
    setCachedResult(userEmail, result) {
        this.cache.set(userEmail, {
            result: result,
            timestamp: Date.now()
        });
        
        // Limpar cache antigo (manter máximo 100 entradas)
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }
    
    /**
     * Aguardar verificação em andamento
     * @returns {Promise<void>}
     */
    async waitForCheck() {
        while (this.isChecking) {
            await this.delay(100);
        }
    }
    
    /**
     * Delay promisificado
     * @param {number} ms - Milissegundos para aguardar
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Mostrar indicador de carregamento
     */
    showLoadingIndicator() {
        let indicator = document.getElementById('auth-loading-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'auth-loading-indicator';
            indicator.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div style="
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    ">
                        <div style="
                            width: 2rem;
                            height: 2rem;
                            border: 3px solid #e5e7eb;
                            border-top: 3px solid #3b82f6;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 1rem;
                        "></div>
                        <p style="margin: 0; color: #374151;">Verificando autorização...</p>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'flex';
    }
    
    /**
     * Esconder indicador de carregamento
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('auth-loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    /**
     * Log de acesso negado
     * @param {string} userEmail - Email do usuário
     * @param {string} provider - Provedor OAuth
     * @param {string} errorMessage - Mensagem de erro
     */
    logAccessDenied(userEmail, provider, errorMessage) {
        const logData = {
            timestamp: new Date().toISOString(),
            action: 'access_denied',
            email: userEmail,
            provider: provider,
            error: errorMessage,
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };
        
        // Enviar para endpoint de auditoria (fire-and-forget)
        fetch('/api/audit/access-denied', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        }).catch(err => {
            console.warn('AuthorizationChecker: Erro ao registrar acesso negado:', err);
        });
    }
    
    /**
     * Log de acesso autorizado
     * @param {string} userEmail - Email do usuário
     * @param {string} role - Role do usuário
     * @param {boolean} fromCache - Se veio do cache
     */
    logAccessGranted(userEmail, role, fromCache) {
        const logData = {
            timestamp: new Date().toISOString(),
            action: 'access_granted',
            email: userEmail,
            role: role,
            fromCache: fromCache,
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };
        
        // Usar o endpoint de auditoria configurado
        // Enviar para endpoint de auditoria (fire-and-forget)
        fetch(this.config.auditEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        }).catch(err => {
            console.warn('AuthorizationChecker: Erro ao registrar acesso autorizado:', err);
        });
    }
    
    /**
     * Limpar cache
     */
    clearCache() {
        this.cache.clear();
        localStorage.removeItem('auth_user_email');
        localStorage.removeItem('auth_user_role');
        localStorage.removeItem('auth_check_timestamp');
    }
    
    /**
     * Verificar se usuário tem role específica
     * @param {string} requiredRole - Role necessária (admin/user)
     * @param {string} userEmail - Email do usuário (opcional, usa cache se não fornecido)
     * @returns {Promise<boolean>}
     */
    async hasRole(requiredRole, userEmail = null) {
        if (!userEmail) {
            userEmail = localStorage.getItem('auth_user_email');
        }
        
        if (!userEmail) return false;
        
        const result = await this.checkAuthorization(userEmail);
        return result.authorized && result.role === requiredRole;
    }
    
    /**
     * Verificar se usuário é admin
     * @param {string} userEmail - Email do usuário (opcional)
     * @returns {Promise<boolean>}
     */
    async isAdmin(userEmail = null) {
        return this.hasRole('admin', userEmail);
    }
}

// Instância global
const authChecker = new AuthorizationChecker();

// Funções de conveniência para uso global
window.checkAuthorization = authChecker.checkAuthorization;
window.checkAndRedirect = authChecker.checkAndRedirect.bind(authChecker);
window.isUserAdmin = authChecker.isAdmin.bind(authChecker);

// Função utilitária para integração fácil
window.requireAuthorization = async function(options = {}) {
    const userEmail = options.email || 
                     localStorage.getItem('user_email') || 
                     localStorage.getItem('auth_user_email');
    
    const provider = options.provider || 
                    localStorage.getItem('auth_provider') || 
                    'google';
    
    if (!userEmail) {
        console.warn('requireAuthorization: Email do usuário não encontrado');
        window.location.href = '/';
        return false;
    }
    
    const showLoading = options.showLoading !== false; // default true
    
    return await authChecker.checkAndRedirect(userEmail, provider, showLoading);
};

// Adicionar novos métodos à classe AuthorizationChecker
AuthorizationChecker.prototype.isFirstAccessCase = function(errorMessage) {
    if (!errorMessage) return false;
    
    // Padrões de erro que indicam usuário não registrado
    const firstAccessPatterns = [
        'user_not_found',
        'user_not_registered',
        'first_access_required',
        'user not found',
        'not registered',
        'no record found',
        'http 405',
        'http 404',
        'method not allowed',
        'not found'
    ];
    
    const lowerMessage = errorMessage.toLowerCase();
    return firstAccessPatterns.some(pattern => lowerMessage.includes(pattern));
};

AuthorizationChecker.prototype.redirectToFirstAccess = function(userEmail, provider) {
    console.log('AuthorizationChecker: Redirecionando para primeiro acesso:', userEmail);
    
    // Construir URL de redirecionamento
    const redirectUrl = new URL(this.config.firstAccessUrl, window.location.origin);
    
    if (userEmail) {
        redirectUrl.searchParams.set('email', userEmail);
    }
    
    if (provider) {
        redirectUrl.searchParams.set('provider', provider);
    }
    
    // Adicionar timestamp para evitar cache
    redirectUrl.searchParams.set('t', Date.now().toString());
    
    // Log de auditoria
    this.logFirstAccessRedirect(userEmail, provider);
    
    // Redirecionar
    window.location.href = redirectUrl.toString();
};

AuthorizationChecker.prototype.logFirstAccessRedirect = function(userEmail, provider) {
    const logData = {
        timestamp: new Date().toISOString(),
        event: 'first_access_redirect',
        userEmail: userEmail,
        provider: provider,
        userAgent: navigator.userAgent,
        referrer: document.referrer
    };
    
    console.log('AuthorizationChecker: Log de primeiro acesso:', logData);
    
    // Enviar para analytics se disponível
    if (window.gtag) {
        window.gtag('event', 'first_access_redirect', {
            'event_category': 'User Registration',
            'event_label': userEmail,
            'custom_parameter_1': provider
        });
    }
    
    // Armazenar no localStorage para debug
    try {
        const logs = JSON.parse(localStorage.getItem('auth_logs') || '[]');
        logs.push(logData);
        
        // Manter apenas os últimos 10 logs
        if (logs.length > 10) {
            logs.splice(0, logs.length - 10);
        }
        
        localStorage.setItem('auth_logs', JSON.stringify(logs));
    } catch (error) {
        console.warn('Erro ao salvar log no localStorage:', error);
    }
};

// Export para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthorizationChecker, authChecker };
}

console.log('AuthorizationChecker carregado e pronto para uso');