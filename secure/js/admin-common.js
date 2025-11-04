// Admin Common JavaScript Functions

// Verificação de autorização super admin
function checkSuperAdminAuth() {
    const superAdminToken = localStorage.getItem('super_admin_token');
    const superAdminAuth = localStorage.getItem('super_admin_authenticated');
    
    if (!superAdminToken || superAdminAuth !== 'true') {
        window.location.href = '/secure/super-admin-login.html';
        return false;
    }
    return true;
}

// Função de logout
function handleAdminLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('super_admin_token');
        localStorage.removeItem('super_admin_authenticated');
        localStorage.removeItem('super_admin_email');
        window.location.href = '/secure/super-admin-login.html';
    }
}

// Setup dos event listeners para logout
function setupLogoutHandlers() {
    const logoutLinks = document.querySelectorAll('[id$="logout-link"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleAdminLogout();
        });
    });
}

// Obter token de autenticação
function getAuthToken() {
    // Primeiro tenta super admin
    const superAdminToken = localStorage.getItem('super_admin_token');
    const superAdminAuth = localStorage.getItem('super_admin_authenticated');
    
    if (superAdminToken && superAdminAuth === 'true') {
        return superAdminToken;
    }
    
    // Senão, token OAuth normal
    return localStorage.getItem('access_token');
}

// Inicialização comum para páginas admin
function initAdminCommon() {
    // Verificar autenticação
    if (!checkSuperAdminAuth()) {
        return;
    }
    
    // Setup logout handlers
    setupLogoutHandlers();
    
    console.log('Admin common initialized');
}

// Auto-inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Só inicializa se estivermos em uma página admin
    if (window.location.pathname.includes('/secure/')) {
        initAdminCommon();
    }
});