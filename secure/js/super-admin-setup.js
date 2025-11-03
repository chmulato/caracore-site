// Super Admin Setup JavaScript

// Verificar se já existe super admin
window.addEventListener('DOMContentLoaded', function() {
    checkSuperAdminStatus();
});

async function checkSuperAdminStatus() {
    try {
        const response = await fetch('/api/admin/super-admin-status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.has_super_admin) {
                // Já existe super admin, redirecionar para login normal
                showStatusInfo('Super Administrador já configurado. Redirecionando para login...', true);
                setTimeout(() => {
                    window.location.href = '/secure/';
                }, 2000);
                return;
            }
        }
    } catch (error) {
        console.error('Erro ao verificar status do super admin:', error);
    }
}

function showStatusInfo(message, showLoading = false) {
    const statusInfo = document.getElementById('status-info');
    const statusText = document.getElementById('status-text');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    statusText.textContent = message;
    statusInfo.classList.remove('hidden');
    
    if (showLoading) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function authenticateWithGoogle() {
    showStatusInfo('Iniciando autenticação com Google...', true);
    
    // Configurar callback específico para setup
    sessionStorage.setItem('auth_mode', 'super_admin_setup');
    
    // Redirecionar para autenticação Google
    window.location.href = '/auth/google?setup=true';
}

function authenticateWithMicrosoft() {
    showStatusInfo('Iniciando autenticação com Microsoft...', true);
    
    // Configurar callback específico para setup
    sessionStorage.setItem('auth_mode', 'super_admin_setup');
    
    // Redirecionar para autenticação Microsoft
    window.location.href = '/auth/microsoft?setup=true';
}

// Verificar se voltou de autenticação
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('setup') === 'complete') {
    showStatusInfo('Super Administrador configurado com sucesso! Redirecionando...', true);
    setTimeout(() => {
        window.location.href = '/secure/admin-users.html';
    }, 2000);
}