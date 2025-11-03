// Super Admin Setup JavaScript

// Configuração
const BACKEND_URL = 'https://caracore-backend.azurewebsites.net';
const SUPER_ADMIN_EMAIL = 'suporte@caracore.com.br';

// Verificar se já está autenticado ao carregar
window.addEventListener('DOMContentLoaded', function() {
    checkExistingAuth();
    setupLoginForm();
});

function checkExistingAuth() {
    const token = localStorage.getItem('super_admin_token');
    const authenticated = localStorage.getItem('super_admin_authenticated');
    
    if (token && authenticated === 'true') {
        // Já autenticado, redirecionar
        showStatusInfo('Você já está autenticado. Redirecionando...', true);
        setTimeout(() => {
            window.location.href = '/secure/approval-requests.html';
        }, 1500);
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('super-admin-login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await authenticateSuperAdmin();
        });
    }
}

async function authenticateSuperAdmin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if (!password) {
        showError('Por favor, digite a senha.');
        return;
    }
    
    showStatusInfo('Autenticando...', true);
    
    try {
        const response = await fetch(`${BACKEND_URL}/auth/super-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error_description || result.error || 'Credenciais inválidas');
        }
        
        // Armazenar token e informações de autenticação
        localStorage.setItem('super_admin_token', result.token);
        localStorage.setItem('super_admin_email', result.email);
        localStorage.setItem('super_admin_role', result.role);
        localStorage.setItem('super_admin_authenticated', 'true');
        
        showStatusInfo('✅ Autenticado com sucesso! Redirecionando...', false);
        
        // Redirecionar para painel administrativo
        setTimeout(() => {
            window.location.href = '/secure/approval-requests.html';
        }, 1500);
        
    } catch (error) {
        console.error('Erro na autenticação:', error);
        showError('❌ ' + error.message);
        
        // Limpar campo de senha
        document.getElementById('admin-password').value = '';
    }
}

function showStatusInfo(message, showLoading = false) {
    const statusInfo = document.getElementById('status-info');
    const statusText = document.getElementById('status-text');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (statusInfo && statusText) {
        statusText.textContent = message;
        statusInfo.classList.remove('hidden');
        statusInfo.style.backgroundColor = '#e3f2fd';
        statusInfo.style.borderColor = '#2196f3';
        
        if (loadingIndicator) {
            if (showLoading) {
                loadingIndicator.classList.remove('hidden');
            } else {
                loadingIndicator.classList.add('hidden');
            }
        }
    }
}

function showError(message) {
    const statusInfo = document.getElementById('status-info');
    const statusText = document.getElementById('status-text');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (statusInfo && statusText) {
        statusText.textContent = message;
        statusInfo.classList.remove('hidden');
        statusInfo.style.backgroundColor = '#ffebee';
        statusInfo.style.borderColor = '#f44336';
        
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
        
        // Remover mensagem de erro após 5 segundos
        setTimeout(() => {
            statusInfo.classList.add('hidden');
        }, 5000);
    }
}

// Função global para verificar se super admin está autenticado (usar em outras páginas)
function isSuperAdminAuthenticated() {
    const token = localStorage.getItem('super_admin_token');
    const authenticated = localStorage.getItem('super_admin_authenticated');
    return token && authenticated === 'true';
}

// Função global para logout do super admin (usar em outras páginas)
function logoutSuperAdmin() {
    localStorage.removeItem('super_admin_token');
    localStorage.removeItem('super_admin_email');
    localStorage.removeItem('super_admin_role');
    localStorage.removeItem('super_admin_authenticated');
    window.location.href = '/secure/super-admin-setup.html';
}