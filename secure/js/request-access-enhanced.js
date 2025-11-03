// Request Access Enhanced JavaScript

let currentUser = null;

// Carregar informações do usuário logado
window.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
});

async function loadUserInfo() {
    try {
        const response = await fetch('/api/user/info', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            displayUserInfo();
        }
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
    }
}

function displayUserInfo() {
    if (!currentUser) return;

    const userInfoDiv = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');

    userAvatar.src = currentUser.picture || '/images/default-avatar.png';
    userName.textContent = currentUser.name || 'Usuário';
    userEmail.textContent = currentUser.email || '';

    userInfoDiv.classList.remove('hidden');
}

// Manipular envio do formulário
document.getElementById('access-request-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await submitAccessRequest();
});

async function submitAccessRequest() {
    const submitButton = document.getElementById('submit-button');
    const buttonText = document.getElementById('button-text');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Mostrar loading
    submitButton.disabled = true;
    buttonText.textContent = 'Enviando...';
    loadingSpinner.classList.remove('hidden');

    try {
        const formData = new FormData(document.getElementById('access-request-form'));
        const requestData = {
            access_level: formData.get('access-level'),
            department: formData.get('department'),
            manager_email: formData.get('manager-email'),
            justification: formData.get('justification'),
            urgency: formData.get('urgency'),
            user_info: currentUser
        };

        const response = await fetch('/api/access-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            // Mostrar mensagem de sucesso
            document.getElementById('success-message').classList.remove('hidden');
            document.getElementById('access-request-form').style.display = 'none';
            
            // Redirecionar após alguns segundos
            setTimeout(() => {
                window.location.href = '/secure/';
            }, 3000);
        } else {
            throw new Error('Erro ao enviar solicitação');
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
        // Restaurar botão
        submitButton.disabled = false;
        buttonText.textContent = 'Enviar Solicitação';
        loadingSpinner.classList.add('hidden');
    }
}