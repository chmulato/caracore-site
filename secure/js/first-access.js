/**
 * first-access.js - Sistema de Primeiro Acesso à Área 51
 * 
 * Este módulo gerencia o processo de cadastro inicial para usuários
 * que estão autenticados via OAuth mas não estão registrados no sistema.
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-11-13
 */

class FirstAccessManager {
    constructor() {
        this.userEmail = null;
        this.userProvider = null;
        this.isSubmitting = false;
        
        // Configurações
        this.config = {
            registrationEndpoint: '/api/request-access',
            logoutEndpoint: '/secure/index.html',
            successRedirect: '/secure/access-pending.html',
            whatsappNumber: '5541999097797',
            whatsappTimeout: 10000, // 10 segundos para detectar se WhatsApp abriu
            statusPageUrl: '/secure/access-pending.html',
            maxRetries: 3,
            retryDelay: 2000
        };
        
        // Elementos DOM
        this.elements = {
            form: document.getElementById('firstAccessForm'),
            submitBtn: document.getElementById('submitBtn'),
            loadingSpinner: document.querySelector('.loading-spinner'),
            alertContainer: document.getElementById('alertContainer'),
            userEmail: document.getElementById('userEmail'),
            userProvider: document.getElementById('userProvider'),
            userAvatar: document.getElementById('userAvatar'),
            logoutLink: document.getElementById('logoutLink')
        };
        
        // Elementos de loading
        this.loadingElement = document.getElementById('initialLoading');
        this.mainContentElement = document.getElementById('mainContent');
        
        // Inicializar
        this.init();
    }
    
    showMainContent() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        if (this.mainContentElement) {
            this.mainContentElement.style.display = 'block';
        }
    }
    
    async init() {
        try {
            // Verificar se usuário está autenticado
            await this.checkAuthentication();
            
            // Verificar se usuário já está autorizado
            const isAuthorized = await this.checkUserAuthorization();
            if (isAuthorized) {
                // Mostrar conteúdo principal para exibir mensagem de redirecionamento
                this.showMainContent();
                // Se já autorizado, redirecionar para área restrita
                this.showAuthorizationRedirect();
                setTimeout(() => {
                    window.location.href = '/secure/restrita.html';
                }, 2000);
                return;
            }
            
            // Mostrar conteúdo principal
            this.showMainContent();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Pré-preencher informações do usuário
            this.populateUserInfo();
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showMainContent();
            this.showError('Erro ao carregar a página. Por favor, tente novamente.');
            setTimeout(() => {
                window.location.href = '/secure/index.html';
            }, 3000);
        }
    }
    
    async checkAuthentication() {
        // Verificar se OIDCAuth está disponível
        if (!window.OIDCAuth) {
            throw new Error('Sistema de autenticação não disponível');
        }
        
        // Verificar se usuário está autenticado
        const isAuthenticated = await window.OIDCAuth.isAuthenticated();
        if (!isAuthenticated) {
            throw new Error('Usuário não autenticado');
        }
        
        // Obter informações do usuário
        const user = await window.OIDCAuth.getUser();
        if (!user || !user.profile || !user.profile.email) {
            throw new Error('Informações do usuário não disponíveis');
        }
        
        this.userEmail = user.profile.email;
        this.userProvider = user.provider || 'desconhecido';
    }
    
    async checkUserAuthorization() {
        try {
            const response = await fetch('/api/check-authorization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.userEmail
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.authorized === true;
            }
            
            // Se a API não estiver disponível, assumir não autorizado
            console.warn('API de verificação de autorização não disponível');
            return false;
            
        } catch (error) {
            console.warn('Erro ao verificar autorização:', error);
            // Em caso de erro, assumir não autorizado para permitir solicitação
            return false;
        }
    }
    
    setupEventListeners() {
        // Formulário de registro
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Link de logout
        this.elements.logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        // Formatação de telefone
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', this.formatPhone);
        
        // Validação em tempo real
        this.setupRealTimeValidation();
    }
    
    setupRealTimeValidation() {
        const requiredFields = ['firstName', 'lastName', 'accessReason'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                // Remover indicação de erro quando usuário começar a digitar
                field.classList.remove('is-invalid');
                const feedback = field.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.remove();
                }
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        
        if (field.required && !value) {
            this.markFieldAsInvalid(field, 'Este campo é obrigatório');
            return false;
        }
        
        // Validações específicas
        if (field.id === 'firstName' || field.id === 'lastName') {
            if (value.length < 2) {
                this.markFieldAsInvalid(field, 'Nome deve ter pelo menos 2 caracteres');
                return false;
            }
        }
        
        if (field.id === 'accessReason') {
            if (value.length < 10) {
                this.markFieldAsInvalid(field, 'Por favor, forneça mais detalhes (mín. 10 caracteres)');
                return false;
            }
        }
        
        this.markFieldAsValid(field);
        return true;
    }
    
    markFieldAsInvalid(field, message) {
        field.classList.add('is-invalid');
        
        // Remover feedback anterior
        const existingFeedback = field.nextElementSibling;
        if (existingFeedback && existingFeedback.classList.contains('invalid-feedback')) {
            existingFeedback.remove();
        }
        
        // Adicionar novo feedback
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        field.parentNode.insertBefore(feedback, field.nextSibling);
    }
    
    markFieldAsValid(field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        
        // Remover feedback de erro
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
    
    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length <= 10) {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
            } else {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
        }
        
        e.target.value = value;
    }
    
    populateUserInfo() {
        if (this.userEmail) {
            this.elements.userEmail.textContent = this.userEmail;
            
            // Atualizar avatar com primeira letra do email
            const firstLetter = this.userEmail.charAt(0).toUpperCase();
            this.elements.userAvatar.innerHTML = firstLetter;
        }
        
        if (this.userProvider) {
            const providerNames = {
                'google': 'Google',
                'microsoft': 'Microsoft',
                'entra': 'Microsoft Entra ID'
            };
            
            this.elements.userProvider.innerHTML = 
                `<i class="bi bi-${this.getProviderIcon(this.userProvider)}"></i> ${providerNames[this.userProvider] || this.userProvider}`;
        }
    }
    
    getProviderIcon(provider) {
        const icons = {
            'google': 'google',
            'microsoft': 'microsoft',
            'entra': 'microsoft'
        };
        return icons[provider] || 'shield-check';
    }
    
    async handleSubmit() {
        if (this.isSubmitting) return;
        
        try {
            // Validar formulário
            if (!this.validateForm()) {
                return;
            }
            
            // Coletar dados do formulário
            const formData = this.collectFormData();
            
            // Mostrar confirmação antes de enviar
            const confirmed = await this.showConfirmationModal(formData);
            if (!confirmed) {
                return;
            }
            
            this.setSubmitting(true);
            
            // Enviar solicitação de registro
            const registrationResult = await this.submitRegistration(formData);
            
            // Preparar mensagem para WhatsApp
            const whatsappMessage = this.prepareWhatsAppMessage(formData);
            
            // Tentar enviar via WhatsApp e validar
            const whatsappSent = await this.sendWhatsAppMessage(whatsappMessage);
            
            // Redirecionar para página de status com informações
            this.redirectToStatusPage(registrationResult, whatsappSent, formData);
            
        } catch (error) {
            console.error('Erro no envio:', error);
            this.showError(error.message || 'Erro ao enviar solicitação. Tente novamente.');
            this.setSubmitting(false);
        }
    }
    
    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'accessReason'];
        let isValid = true;
        
        // Validar campos obrigatórios
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validar termos
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            this.showError('Você deve concordar com os Termos de Serviço e Política de Privacidade.');
            isValid = false;
        }
        
        return isValid;
    }
    
    collectFormData() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const company = document.getElementById('company').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const accessReason = document.getElementById('accessReason').value.trim();
        
        // Construir nome completo para o backend
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Construir mensagem detalhada
        let message = `Motivo do acesso: ${accessReason}`;
        if (company) message += `\nEmpresa: ${company}`;
        if (phone) message += `\nTelefone: ${phone}`;
        message += `\nSolicitado em: ${new Date().toLocaleString('pt-BR')}`;
        
        return {
            // Campos obrigatórios do backend
            email: this.userEmail,
            name: fullName,
            provider: this.userProvider,
            message: message,
            // Campos adicionais para uso interno
            _internal: {
                firstName,
                lastName,
                company,
                phone,
                accessReason,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct'
            }
        };
    }
    
    async submitRegistration(formData) {
        const response = await fetch(this.config.registrationEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error_description || `Erro HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        // O backend retorna uma estrutura diferente
        // Verificar se a operação foi bem-sucedida
        if (response.status === 201 && result.status === 'pending') {
            return {
                success: true,
                message: result.message,
                status: result.status,
                next_steps: result.next_steps
            };
        }
        
        // Se chegou aqui, algo deu errado
        throw new Error(result.error_description || result.message || 'Erro desconhecido no servidor');
    }
    
    async sendWhatsAppMessage(message) {
        return new Promise((resolve) => {
            // Mostrar modal de confirmação para WhatsApp
            this.showWhatsAppConfirmationModal(message, (confirmed, sent) => {
                resolve(sent);
            });
        });
    }
    
    showWhatsAppConfirmationModal(message, callback) {
        const modal = this.createWhatsAppConfirmationModal(message, callback);
        document.body.appendChild(modal);
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Remover modal do DOM quando fechado
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    createWhatsAppConfirmationModal(message, callback) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-whatsapp"></i>
                            Enviar Solicitação via WhatsApp
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <strong>Próximo passo:</strong> Clique no botão abaixo para abrir o WhatsApp Web e enviar sua solicitação automaticamente.
                        </div>
                        
                        <h6>Mensagem que será enviada:</h6>
                        <div class="bg-light p-3 rounded mb-3" style="font-family: monospace; white-space: pre-wrap; font-size: 0.9em;">${message}</div>
                        
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle"></i>
                            <strong>Importante:</strong> 
                            <ul class="mb-0 mt-2">
                                <li>Certifique-se de estar logado no WhatsApp Web</li>
                                <li>A mensagem será preenchida automaticamente</li>
                                <li>Você precisa clicar em "Enviar" no WhatsApp</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="whatsappSkip">
                            <i class="bi bi-x-circle"></i> Pular WhatsApp
                        </button>
                        <button type="button" class="btn btn-success" id="whatsappSend">
                            <i class="bi bi-whatsapp"></i> Abrir WhatsApp Web
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Event listeners
        modal.querySelector('#whatsappSend').addEventListener('click', () => {
            this.openWhatsAppWeb(message);
            // Aguardar um pouco e então mostrar confirmação
            setTimeout(() => {
                this.showWhatsAppValidation(modal, callback);
            }, 2000);
        });
        
        modal.querySelector('#whatsappSkip').addEventListener('click', () => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
            callback(false, false); // Não confirmado, não enviado
        });
        
        return modal;
    }
    
    showWhatsAppValidation(modal, callback) {
        // Atualizar conteúdo do modal para validação
        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalBody.innerHTML = `
            <div class="text-center py-4">
                <div class="mb-4">
                    <i class="bi bi-whatsapp text-success" style="font-size: 4rem;"></i>
                </div>
                <h5>Você conseguiu enviar a mensagem no WhatsApp?</h5>
                <p class="text-muted mb-4">
                    Confirme se a mensagem foi enviada com sucesso para +55 41 99909-7797
                </p>
                <div class="alert alert-info">
                    <small>
                        <i class="bi bi-info-circle"></i>
                        Se você não conseguiu enviar, não se preocupe. Você receberá instruções de contato alternativo.
                    </small>
                </div>
            </div>
        `;
        
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-outline-danger" id="whatsappFailed">
                <i class="bi bi-x-circle"></i> Não consegui enviar
            </button>
            <button type="button" class="btn btn-success" id="whatsappSuccess">
                <i class="bi bi-check-circle"></i> Sim, enviei com sucesso
            </button>
        `;
        
        // Novos event listeners
        modal.querySelector('#whatsappSuccess').addEventListener('click', () => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
            callback(true, true); // Confirmado e enviado
        });
        
        modal.querySelector('#whatsappFailed').addEventListener('click', () => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
            callback(true, false); // Confirmado, mas não enviado
        });
    }
    
    openWhatsAppWeb(message) {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.config.whatsappNumber}?text=${encodedMessage}`;
        
        // Tentar abrir em nova aba
        const newWindow = window.open(whatsappUrl, '_blank');
        
        // Verificar se a janela foi bloqueada
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // Fallback: abrir na mesma aba
            window.location.href = whatsappUrl;
        }
    }
    
    redirectToStatusPage(registrationResult, whatsappSent, formData) {
        // Preparar dados para a página de status
        const statusData = {
            registrationSuccess: true,
            whatsappSent: whatsappSent,
            userEmail: formData.email,
            userName: formData.name,
            requestTime: new Date().toISOString(),
            message: registrationResult.message || 'Solicitação registrada com sucesso'
        };
        
        // Armazenar dados no sessionStorage
        sessionStorage.setItem('cara_core_registration_status', JSON.stringify(statusData));
        
        // Redirecionar para página de status
        window.location.href = this.config.statusPageUrl;
    }
    
    setSubmitting(submitting) {
        this.isSubmitting = submitting;
        this.elements.submitBtn.disabled = submitting;
        
        if (submitting) {
            this.elements.loadingSpinner.style.display = 'inline-block';
            this.elements.submitBtn.innerHTML = 
                '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        } else {
            this.elements.loadingSpinner.style.display = 'none';
            this.elements.submitBtn.innerHTML = 
                '<i class="bi bi-send"></i> Solicitar Acesso';
        }
    }
    
    showError(message) {
        this.showAlert(message, 'danger');
    }
    
    showSuccess(message) {
        this.showAlert(message, 'success');
    }
    
    showAuthorizationRedirect() {
        // Remover alertas existentes
        this.elements.alertContainer.innerHTML = '';
        
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-custom';
        alert.innerHTML = `
            <i class="bi bi-check-circle-fill"></i>
            <strong>Acesso Autorizado!</strong> Você já tem permissão para acessar a Área 51.
            <div class="mt-2">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Redirecionando para área restrita...
            </div>
        `;
        
        this.elements.alertContainer.appendChild(alert);
        
        // Esconder o formulário
        if (this.elements.form) {
            this.elements.form.style.display = 'none';
        }
    }
    
    showAlert(message, type = 'info') {
        // Remover alertas existentes
        this.elements.alertContainer.innerHTML = '';
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-custom alert-dismissible fade show`;
        alert.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle-fill' : type === 'danger' ? 'exclamation-triangle-fill' : 'info-circle-fill'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        this.elements.alertContainer.appendChild(alert);
        
        // Auto-remover após 5 segundos (exceto erros)
        if (type !== 'danger') {
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }
    
    async handleLogout() {
        try {
            if (window.OIDCAuth && typeof window.OIDCAuth.logout === 'function') {
                await window.OIDCAuth.logout();
            } else {
                // Fallback: limpar storage e redirecionar
                sessionStorage.clear();
                localStorage.removeItem('cara_core_oidc_provider');
                localStorage.removeItem('cara_core_oidc_user');
                window.location.href = this.config.logoutEndpoint;
            }
        } catch (error) {
            console.error('Erro no logout:', error);
            // Forçar redirecionamento mesmo com erro
            window.location.href = this.config.logoutEndpoint;
        }
    }
    
    async showConfirmationModal(formData) {
        return new Promise((resolve) => {
            // Criar modal de confirmação
            const modal = this.createConfirmationModal(formData);
            document.body.appendChild(modal);
            
            // Mostrar modal
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // Event listeners
            modal.querySelector('#confirmYes').addEventListener('click', () => {
                bsModal.hide();
                resolve(true);
            });
            
            modal.querySelector('#confirmNo').addEventListener('click', () => {
                bsModal.hide();
                resolve(false);
            });
            
            // Remover modal do DOM quando fechado
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
        });
    }
    
    createConfirmationModal(formData) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-question-circle"></i>
                            Confirmar Solicitação de Acesso
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <strong>Atenção:</strong> Confirme os dados antes de enviar sua solicitação.
                        </div>
                        
                        <h6>Dados da Solicitação:</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Nome:</strong> ${formData.name}</p>
                                <p><strong>Email:</strong> ${formData.email}</p>
                                ${formData._internal?.company ? `<p><strong>Empresa:</strong> ${formData._internal.company}</p>` : ''}
                            </div>
                            <div class="col-md-6">
                                <p><strong>Provedor OAuth:</strong> ${this.getProviderDisplayName(formData.provider)}</p>
                                ${formData._internal?.phone ? `<p><strong>Telefone:</strong> ${formData._internal.phone}</p>` : ''}
                            </div>
                        </div>
                        
                        <h6>Motivo do Acesso:</h6>
                        <p class="text-muted">"${formData._internal?.accessReason || 'Não especificado'}"</p>
                        
                        <div class="alert alert-warning mt-3">
                            <i class="bi bi-whatsapp text-success"></i>
                            <strong>Próximo Passo:</strong> Após confirmar, você será direcionado para enviar os dados via WhatsApp para nossa equipe.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="confirmNo">
                            <i class="bi bi-x-circle"></i> Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" id="confirmYes">
                            <i class="bi bi-check-circle"></i> Confirmar e Enviar
                        </button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }
    
    prepareWhatsAppMessage(formData) {
        const timestamp = new Date().toLocaleString('pt-BR');
        const internal = formData._internal || {};
        
        return `🔐 *SOLICITAÇÃO DE ACESSO - ÁREA 51*

👤 *DADOS DO SOLICITANTE:*
• Nome: ${formData.name}
• Email: ${formData.email}
• Provedor OAuth: ${this.getProviderDisplayName(formData.provider)}
${internal.company ? `• Empresa: ${internal.company}` : ''}
${internal.phone ? `• Telefone: ${internal.phone}` : ''}

📝 *MOTIVO DO ACESSO:*
"${internal.accessReason}"

📅 *DATA/HORA:* ${timestamp}

🆔 *REQUEST ID:* REQ-${Date.now()}

---
*Cara Core Informática - Sistema de Acesso Área 51*
Solicitação gerada automaticamente via sistema web.`;
    }
    
    async showWhatsAppInstructions(message) {
        return new Promise((resolve) => {
            // Criar modal de instruções WhatsApp
            const modal = this.createWhatsAppModal(message);
            document.body.appendChild(modal);
            
            // Mostrar modal
            const bsModal = new bootstrap.Modal(modal, {
                backdrop: 'static',
                keyboard: false
            });
            bsModal.show();
            
            // Event listeners
            modal.querySelector('#sendWhatsApp').addEventListener('click', () => {
                this.openWhatsApp(message);
            });
            
            modal.querySelector('#finishLater').addEventListener('click', () => {
                bsModal.hide();
                this.showSuccess('Solicitação registrada! Lembre-se de enviar os dados via WhatsApp.');
                setTimeout(() => {
                    window.location.href = this.config.successRedirect;
                }, 2000);
                resolve();
            });
            
            // Remover modal do DOM quando fechado
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
        });
    }
    
    createWhatsAppModal(message) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-whatsapp"></i>
                            Enviar via WhatsApp
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-success">
                            <h6><i class="bi bi-check-circle-fill"></i> Solicitação Registrada!</h6>
                            <p class="mb-0">Agora você precisa enviar os dados via WhatsApp para nossa equipe.</p>
                        </div>
                        
                        <h6>📋 Instruções:</h6>
                        <ol class="mb-4">
                            <li><strong>Instale o WhatsApp Web</strong> no seu navegador (se ainda não tiver)</li>
                            <li><strong>Clique no botão</strong> "Enviar via WhatsApp" abaixo</li>
                            <li><strong>Confirme o envio</strong> da mensagem no WhatsApp</li>
                            <li><strong>Aguarde o retorno</strong> da nossa equipe (1-24h)</li>
                        </ol>
                        
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <strong>Número de Contato:</strong> +55 41 999097797<br>
                            <strong>Horário de Atendimento:</strong> Seg-Sex, 9h-18h
                        </div>
                        
                        <h6>📄 Prévia da Mensagem:</h6>
                        <div class="bg-light p-3 rounded" style="max-height: 200px; overflow-y: auto;">
                            <small class="font-monospace">${message.replace(/\n/g, '<br>')}</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" id="finishLater">
                            <i class="bi bi-clock"></i> Enviar Depois
                        </button>
                        <button type="button" class="btn btn-success" id="sendWhatsApp">
                            <i class="bi bi-whatsapp"></i> Enviar via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }
    
    openWhatsApp(message) {
        // Codificar mensagem para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Construir URL do WhatsApp
        const whatsappUrl = `https://wa.me/${this.config.whatsappNumber}?text=${encodedMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        // Mostrar sucesso e redirecionar após delay
        this.showSuccess('WhatsApp aberto! Complete o envio e aguarde nosso retorno.');
        
        setTimeout(() => {
            // Adicionar parâmetro para indicar que veio do WhatsApp
            const successUrl = new URL(this.config.successRedirect, window.location.origin);
            successUrl.searchParams.set('from', 'whatsapp');
            window.location.href = successUrl.toString();
        }, 3000);
        
        // Log para analytics
        if (window.gtag) {
            gtag('event', 'whatsapp_message_sent', {
                'event_category': 'User Registration',
                'event_label': this.userEmail
            });
        }
    }
    
    getProviderDisplayName(provider) {
        const providers = {
            'google': '🔵 Google',
            'microsoft': '🔷 Microsoft',
            'entra': '🔷 Microsoft Entra ID'
        };
        return providers[provider] || provider;
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new FirstAccessManager();
});

// Exportar para uso global se necessário
window.FirstAccessManager = FirstAccessManager;