// Super Admin Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    const token = localStorage.getItem('super_admin_token');
    const authenticated = localStorage.getItem('super_admin_authenticated');
    
    if (token && authenticated === 'true') {
        window.location.href = '/secure/approval-requests.html';
        return;
    }

    // Setup form handler
    const form = document.getElementById('super-admin-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitButton = document.getElementById('login-button');
    const buttonText = document.getElementById('button-text');
    const buttonLoading = document.getElementById('button-loading');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Reset messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    // Show loading
    submitButton.disabled = true;
    buttonText.classList.add('hidden');
    buttonLoading.classList.remove('hidden');

    try {
        const apiUrl = window.CARA_CORE_CONFIG?.API_BASE_URL || 'https://caracore-backend-docker.azurewebsites.net';
        const response = await fetch(`${apiUrl}/api/admin/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            // Sucesso - salvar token e redirecionar
            localStorage.setItem('super_admin_token', data.token);
            localStorage.setItem('super_admin_authenticated', 'true');
            localStorage.setItem('super_admin_email', email);

            successMessage.textContent = 'Login realizado com sucesso! Redirecionando...';
            successMessage.style.display = 'block';

            setTimeout(() => {
                window.location.href = '/secure/approval-requests.html';
            }, 1500);

        } else {
            // Erro do servidor (401, 403, 500, etc)
            let errorMsg = 'Erro ao fazer login. Tente novamente.';
            
            try {
                const data = await response.json();
                
                // Mensagens específicas baseadas no erro
                if (response.status === 401) {
                    errorMsg = data.error_description || 'Email ou senha incorretos. Verifique suas credenciais.';
                } else if (response.status === 403) {
                    errorMsg = 'Acesso negado. Você não tem permissão para acessar esta área.';
                } else if (response.status === 500) {
                    errorMsg = 'Erro interno do servidor. Tente novamente mais tarde.';
                } else {
                    errorMsg = data.error_description || data.message || errorMsg;
                }
            } catch (e) {
                // Se não conseguir ler JSON, usar mensagem padrão baseada no status
                if (response.status === 401) {
                    errorMsg = 'Email ou senha incorretos. Verifique suas credenciais.';
                }
            }
            
            errorMessage.textContent = errorMsg;
            errorMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro de conexão:', error);
        // Este é um erro de REDE (não conseguiu nem fazer a requisição)
        errorMessage.textContent = 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
        errorMessage.style.display = 'block';
    } finally {
        // Reset button
        submitButton.disabled = false;
        buttonText.classList.remove('hidden');
        buttonLoading.classList.add('hidden');
    }
}