/**
 * Mock API Backend para Área 51 - Sistema de Autorização
 * 
 * Este arquivo simula as respostas do backend para o sistema de autorização.
 * ATENÇÃO: Ativo APENAS em desenvolvimento local (localhost).
 * Em produção, usa o backend Flask real (/backend/app.py).
 * 
 * Endpoints simulados:
 * - POST /api/check-authorization
 * - POST /api/register-first-access
 * 
 * @version 1.1
 * @date 2025-11-13
 */

// ==========================================
// CONTROLE DE AMBIENTE
// ==========================================

// Detectar se está em ambiente de desenvolvimento
const isDevelopment = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('local') ||
    window.location.port !== '' // Qualquer porta indica desenvolvimento
);

// Permitir override manual via URL (?mock=true ou ?mock=false)
const urlParams = new URLSearchParams(window.location.search);
const mockOverride = urlParams.get('mock');
const useMockAPI = mockOverride !== null ? mockOverride === 'true' : isDevelopment;

// Log do ambiente detectado
if (isDevelopment) {
    console.log('🏠 [Mock API] Ambiente: DESENVOLVIMENTO');
} else {
    console.log('🏭 [Mock API] Ambiente: PRODUÇÃO');
}

console.log(`🎛️ [Mock API] Status: ${useMockAPI ? 'ATIVO' : 'INATIVO'}`);

// Se não deve usar Mock API, sair do script
if (!useMockAPI) {
    console.log('📡 [Mock API] Usando backend real em produção');
    // Não interceptar nada, deixar fetch original funcionar
    return;
}

// Base de usuários simulada
const mockUsers = {
    // Usuários autorizados
    'admin@caracore.com.br': { 
        authorized: true, 
        role: 'admin', 
        name: 'Administrador CaraCore',
        registered: true
    },
    'dev@caracore.com.br': { 
        authorized: true, 
        role: 'developer', 
        name: 'Desenvolvedor CaraCore',
        registered: true
    },
    'user@teste.com': { 
        authorized: true, 
        role: 'user', 
        name: 'Usuário Teste',
        registered: true
    },
    
    // Usuários com solicitação pendente
    'pendente@teste.com': {
        authorized: false,
        role: null,
        name: 'Usuário Pendente',
        registered: true,
        status: 'pending_approval'
    }
    
    // Usuários não registrados retornarão erro "user_not_found"
};

// Simulação de endpoint de verificação de autorização
function handleCheckAuthorization(email, provider) {
    console.log(`[Mock API] Verificando autorização para: ${email} (${provider})`);
    
    const user = mockUsers[email.toLowerCase()];
    
    if (!user) {
        // Usuário não encontrado - primeiro acesso
        return {
            success: false,
            authorized: false,
            role: null,
            error: 'user_not_found',
            error_description: 'Usuário não está registrado no sistema. Primeiro acesso necessário.',
            timestamp: new Date().toISOString()
        };
    }
    
    if (user.status === 'pending_approval') {
        // Usuário com solicitação pendente
        return {
            success: true,
            authorized: false,
            role: null,
            error: 'access_pending',
            error_description: 'Sua solicitação de acesso está sendo analisada pela equipe.',
            timestamp: new Date().toISOString()
        };
    }
    
    // Usuário autorizado
    return {
        success: true,
        authorized: user.authorized,
        role: user.role,
        user_name: user.name,
        timestamp: new Date().toISOString()
    };
}

// Simulação de endpoint de registro de primeiro acesso
function handleFirstAccessRegistration(data) {
    console.log('[Mock API] Processando solicitação de primeiro acesso:', data);
    
    // Validar dados obrigatórios
    const requiredFields = ['email', 'firstName', 'lastName', 'accessReason'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return {
                success: false,
                error: 'validation_error',
                error_description: `Campo obrigatório ausente: ${field}`,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    // Simular processamento (adicionar usuário com status pendente)
    mockUsers[data.email.toLowerCase()] = {
        authorized: false,
        role: null,
        name: `${data.firstName} ${data.lastName}`,
        registered: true,
        status: 'pending_approval',
        registrationData: data,
        registeredAt: new Date().toISOString()
    };
    
    return {
        success: true,
        message: 'Solicitação de acesso registrada com sucesso.',
        requestId: `REQ-${Date.now()}`,
        estimatedProcessingTime: '1-24 horas',
        timestamp: new Date().toISOString()
    };
}

// ==========================================
// INTERCEPTAÇÃO DE API (APENAS DESENVOLVIMENTO)
// ==========================================

// Interceptar requests para simular API
if (typeof window !== 'undefined' && useMockAPI) {
    console.log('🔄 [Mock API] Interceptando chamadas para backend simulado');
    
    // Sobrescrever fetch para interceptar chamadas da API
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options) {
        const urlObj = new URL(url, window.location.origin);
        
        // Interceptar endpoint de verificação de autorização
        if (urlObj.pathname === '/api/check-authorization' && options?.method === 'POST') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    try {
                        const requestData = JSON.parse(options.body);
                        const response = handleCheckAuthorization(requestData.email, requestData.provider);
                        
                        resolve({
                            ok: true,
                            status: 200,
                            json: () => Promise.resolve(response)
                        });
                    } catch (error) {
                        resolve({
                            ok: false,
                            status: 400,
                            json: () => Promise.resolve({
                                success: false,
                                error: 'invalid_request',
                                error_description: 'Dados da solicitação inválidos'
                            })
                        });
                    }
                }, 500); // Simular delay da rede
            });
        }
        
        // Interceptar endpoint de registro de primeiro acesso
        if (urlObj.pathname === '/api/register-first-access' && options?.method === 'POST') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    try {
                        const requestData = JSON.parse(options.body);
                        const response = handleFirstAccessRegistration(requestData);
                        
                        resolve({
                            ok: true,
                            status: 200,
                            json: () => Promise.resolve(response)
                        });
                    } catch (error) {
                        resolve({
                            ok: false,
                            status: 400,
                            json: () => Promise.resolve({
                                success: false,
                                error: 'invalid_request',
                                error_description: 'Dados da solicitação inválidos'
                            })
                        });
                    }
                }, 1000); // Simular delay maior para registro
            });
        }
        
        // Para outras URLs, usar fetch original
        return originalFetch.apply(this, arguments);
    };
    
    console.log('✅ [Mock API] Sistema de simulação carregado com sucesso');
    console.log('👥 [Mock API] Usuários disponíveis para teste:', Object.keys(mockUsers));
    console.log('💡 [Mock API] Para desativar, acesse com ?mock=false');
}

// ==========================================
// FUNÇÕES DE UTILIDADE (DESENVOLVIMENTO)
// ==========================================

// Função para adicionar usuário de teste
window.addMockUser = function(email, userData) {
    if (!useMockAPI) {
        console.warn('⚠️ [Mock API] Não ativo - usuário não adicionado');
        return false;
    }
    mockUsers[email.toLowerCase()] = userData;
    console.log(`👤 [Mock API] Usuário adicionado: ${email}`, userData);
    return true;
};

// Função para listar usuários
window.listMockUsers = function() {
    if (!useMockAPI) {
        console.warn('⚠️ [Mock API] Não ativo - usando backend real');
        return null;
    }
    console.table(mockUsers);
    return mockUsers;
};

// Função para verificar status do Mock API
window.getMockAPIStatus = function() {
    return {
        active: useMockAPI,
        environment: isDevelopment ? 'development' : 'production',
        hostname: window.location.hostname,
        port: window.location.port,
        override: mockOverride
    };
};

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleCheckAuthorization,
        handleFirstAccessRegistration,
        mockUsers
    };
}