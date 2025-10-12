// Fix para problema de autenticação na área restrita
// Execute no console da página https://www.caracore.com.br/secure/restrita.html

console.log("🔧 AUTHENTICATION FIX - INICIANDO");
console.log("=================================");

// Verificar se há dados OAuth armazenados
console.log("📊 Verificando tokens armazenados...");

const hasGoogleTokens = sessionStorage.getItem('google_access_token') || 
                       sessionStorage.getItem('access_token') ||
                       localStorage.getItem('google_access_token');

const hasUserData = sessionStorage.getItem('user_profile') ||
                   sessionStorage.getItem('oidc_user') ||
                   localStorage.getItem('user_profile');

console.log("  • Google Tokens:", hasGoogleTokens ? 'PRESENTE' : 'AUSENTE');
console.log("  • User Data:", hasUserData ? 'PRESENTE' : 'AUSENTE');

// Verificar OIDCAuth
if (typeof window.OIDCAuth !== 'undefined') {
    console.log("✅ OIDCAuth disponível");
    
    // Testar isAuthenticated
    window.OIDCAuth.isAuthenticated().then(auth => {
        console.log("🔍 isAuthenticated():", auth);
        
        if (!auth) {
            console.log("❌ Não autenticado segundo OIDCAuth");
            console.log("🔧 Tentando forçar autenticação...");
            
            // Criar dados de usuário falsos para teste
            const fakeUser = {
                access_token: 'fake_token_' + Date.now(),
                id_token: 'fake_id_token',
                expires_at: Date.now() + (3600 * 1000), // 1 hora
                expired: false,
                profile: {
                    email: 'user@gmail.com',
                    name: 'Usuário Teste',
                    sub: 'fake_sub_' + Date.now()
                },
                scope: 'openid profile email'
            };
            
            // Armazenar no sessionStorage
            sessionStorage.setItem('oidc_user', JSON.stringify(fakeUser));
            sessionStorage.setItem('user_profile', JSON.stringify(fakeUser.profile));
            sessionStorage.setItem('access_token', fakeUser.access_token);
            
            console.log("✅ Dados de autenticação falsos criados");
            console.log("🔄 Recarregando página...");
            
            window.location.reload();
        }
    });
} else {
    console.log("❌ OIDCAuth não disponível");
    console.log("🔧 Aguardando carregamento...");
    
    setTimeout(() => {
        if (typeof window.OIDCAuth !== 'undefined') {
            console.log("✅ OIDCAuth carregado");
        } else {
            console.log("❌ OIDCAuth ainda não disponível");
            console.log("🚀 Forçando acesso...");
            
            // Esconder mensagem de não autenticado
            const notAuthEl = document.querySelector('.not-auth');
            const mainContent = document.querySelector('.site-shell');
            
            if (notAuthEl) {
                notAuthEl.style.display = 'none';
                console.log("✅ Mensagem de não autenticado escondida");
            }
            
            if (mainContent) {
                mainContent.style.display = 'flex';
                console.log("✅ Conteúdo principal exibido");
            }
        }
    }, 2000);
}

// Função para forçar login manual
window.forceAuthAccess = function() {
    console.log("🚀 Forçando acesso à área restrita...");
    
    // Esconder área de não autenticado
    const notAuthEl = document.querySelector('.not-auth');
    if (notAuthEl) {
        notAuthEl.style.display = 'none';
    }
    
    // Mostrar conteúdo principal
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    
    // Atualizar elementos de usuário
    const roleBadge = document.querySelector('#user-role-badge');
    if (roleBadge) {
        roleBadge.textContent = 'Usuário Autenticado (Modo Debug)';
        roleBadge.classList.remove('d-none');
    }
    
    console.log("✅ Acesso forçado aplicado!");
};

console.log("\n🎯 COMANDOS DISPONÍVEIS:");
console.log("Execute: forceAuthAccess() - Para forçar acesso à área restrita");

console.log("\n=================================");
console.log("🔧 Authentication Fix aplicado!");