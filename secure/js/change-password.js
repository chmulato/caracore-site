/**
 * Gestão de Alteração de Senha do Super Admin
 * Área administrativa segura para alteração de senhas
 */

class PasswordManager {
    constructor() {
        this.form = document.getElementById('changePasswordForm');
        this.submitButton = document.getElementById('submitButton');
        this.newPasswordInput = document.getElementById('newPassword');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.currentPasswordInput = document.getElementById('currentPassword');
        this.alertContainer = document.getElementById('alert-container');
        this.successContainer = document.getElementById('success-container');
        
        this.requirements = {
            length: document.getElementById('req-length'),
            upper: document.getElementById('req-upper'),
            lower: document.getElementById('req-lower'),
            digit: document.getElementById('req-digit'),
            special: document.getElementById('req-special')
        };
        
        this.init();
    }
    
    init() {
        // Verificar autenticação
        this.checkAuthentication();
        
        // Event listeners
        this.newPasswordInput.addEventListener('input', () => this.validatePassword());
        this.confirmPasswordInput.addEventListener('input', () => this.validateConfirmation());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validação inicial
        this.validateForm();
    }
    
    checkAuthentication() {
        const token = localStorage.getItem('super_admin_token');
        const authenticated = localStorage.getItem('super_admin_authenticated');
        
        if (!token || authenticated !== 'true') {
            this.showAlert('error', 'Sessão expirada. Redirecionando para login...');
            setTimeout(() => {
                window.location.href = 'super-admin-login.html';
            }, 2000);
            return false;
        }
        
        return true;
    }
    
    validatePassword() {
        const password = this.newPasswordInput.value;
        
        // Validar cada requisito
        const validations = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            digit: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
        };
        
        // Atualizar UI dos requisitos
        Object.keys(validations).forEach(req => {
            const element = this.requirements[req];
            const icon = element.querySelector('.requirement-icon');
            
            if (validations[req]) {
                element.classList.add('valid');
                element.classList.remove('invalid');
                icon.textContent = '✓';
            } else {
                element.classList.add('invalid');
                element.classList.remove('valid');
                icon.textContent = '✗';
            }
        });
        
        this.validateForm();
        return Object.values(validations).every(v => v);
    }
    
    validateConfirmation() {
        const newPassword = this.newPasswordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            this.confirmPasswordInput.setCustomValidity('Senhas não coincidem');
        } else {
            this.confirmPasswordInput.setCustomValidity('');
        }
        
        this.validateForm();
    }
    
    validateForm() {
        const currentPassword = this.currentPasswordInput.value;
        const newPassword = this.newPasswordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        const isPasswordValid = this.validatePassword();
        const isConfirmationValid = newPassword === confirmPassword;
        const hasCurrentPassword = currentPassword.length > 0;
        
        const isFormValid = hasCurrentPassword && isPasswordValid && isConfirmationValid && newPassword.length > 0;
        
        this.submitButton.disabled = !isFormValid;
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.checkAuthentication()) {
            return;
        }
        
        const formData = new FormData(this.form);
        const data = {
            current_password: formData.get('currentPassword'),
            new_password: formData.get('newPassword'),
            confirm_password: formData.get('confirmPassword')
        };
        
        // Validações finais
        if (data.new_password !== data.confirm_password) {
            this.showAlert('error', 'Nova senha e confirmação não coincidem');
            return;
        }
        
        if (!this.validatePassword()) {
            this.showAlert('error', 'Nova senha não atende aos requisitos de segurança');
            return;
        }
        
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Processando...';
        
        try {
            await this.changePassword(data);
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            this.showAlert('error', 'Erro interno. Tente novamente em alguns minutos.');
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Alterar Senha';
        }
    }
    
    async changePassword(data) {
        const token = localStorage.getItem('super_admin_token');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.handleSuccess(result);
            } else {
                this.handleError(result);
            }
            
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showAlert('error', 'Erro de conexão. Verifique sua internet e tente novamente.');
        }
    }
    
    handleSuccess(result) {
        // Ocultar formulário
        this.form.style.display = 'none';
        
        // Mostrar container de sucesso
        this.successContainer.style.display = 'block';
        
        // Preencher hash e comando
        document.getElementById('newHash').textContent = result.new_password_hash;
        document.getElementById('azureCommand').textContent = result.azure_command;
        
        this.showAlert('success', 'Hash da nova senha gerado com sucesso! Siga as instruções abaixo.');
        
        // Log de auditoria
        console.log('Senha alterada com sucesso:', new Date().toISOString());
    }
    
    handleError(result) {
        let errorMessage = 'Erro ao alterar senha';
        
        switch (result.error) {
            case 'unauthorized':
                errorMessage = result.error_description || 'Senha atual incorreta';
                break;
            case 'invalid_password':
                errorMessage = result.error_description || 'Nova senha não atende aos critérios de segurança';
                break;
            case 'invalid_request':
                errorMessage = result.error_description || 'Dados inválidos';
                break;
            case 'token_expired':
                errorMessage = 'Sessão expirada. Faça login novamente.';
                setTimeout(() => {
                    window.location.href = 'super-admin-login.html';
                }, 2000);
                break;
            case 'forbidden':
                errorMessage = 'Acesso negado';
                break;
            default:
                errorMessage = result.error_description || 'Erro interno do servidor';
        }
        
        this.showAlert('error', errorMessage);
    }
    
    showAlert(type, message) {
        this.alertContainer.innerHTML = `
            <div class="alert alert-${type}" style="display: block;">
                ${message}
            </div>
        `;
        
        // Auto-hide após 5 segundos se não for erro crítico
        if (type !== 'error') {
            setTimeout(() => {
                this.alertContainer.innerHTML = '';
            }, 5000);
        }
    }
}

// Funções auxiliares globais
function copyHash() {
    const hashElement = document.getElementById('newHash');
    const hash = hashElement.textContent;
    
    navigator.clipboard.writeText(hash).then(() => {
        showTemporaryMessage('Hash copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar hash:', err);
        // Fallback para seleção manual
        selectText(hashElement);
    });
}

function copyCommand() {
    const commandElement = document.getElementById('azureCommand');
    const command = commandElement.textContent;
    
    navigator.clipboard.writeText(command).then(() => {
        showTemporaryMessage('Comando copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar comando:', err);
        // Fallback para seleção manual
        selectText(commandElement);
    });
}

function selectText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function showTemporaryMessage(message) {
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'temp-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new PasswordManager();
});