/**
 * Logout Modal - UI de confirmação para logout
 * Suporta logout local e logout federado
 */

const LogoutModal = (function() {
    'use strict';
    
    let modalElement = null;
    let provider = null;
    
    /**
     * Cria o HTML do modal de logout
     */
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'logoutModal';
        modal.className = 'logout-modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'logoutModalTitle');
        
        modal.innerHTML = `
            <div class="logout-modal-content">
                <div class="logout-modal-header">
                    <h2 id="logoutModalTitle">Confirmar Saída</h2>
                    <button 
                        class="logout-modal-close" 
                        aria-label="Fechar modal"
                        onclick="LogoutModal.close()"
                    >
                        &times;
                    </button>
                </div>
                
                <div class="logout-modal-body">
                    <p class="logout-modal-text">
                        Você deseja sair apenas deste site ou de todas as contas vinculadas?
                    </p>
                    
                    <div class="logout-modal-info">
                        <div class="logout-option-info">
                            <strong>Sair deste site:</strong>
                            <span>Remove sua sessão apenas neste site. Você permanecerá conectado no Google/Microsoft.</span>
                        </div>
                        
                        <div class="logout-option-info">
                            <strong>Sair de todas as contas:</strong>
                            <span>Faz logout também no Google/Microsoft. Você precisará fazer login novamente em todos os serviços.</span>
                        </div>
                    </div>
                </div>
                
                <div class="logout-modal-footer">
                    <button 
                        class="btn btn-secondary" 
                        onclick="LogoutModal.close()"
                        aria-label="Cancelar logout"
                    >
                        Cancelar
                    </button>
                    
                    <button 
                        class="btn btn-primary" 
                        onclick="LogoutModal.confirmLocalLogout()"
                        aria-label="Sair apenas deste site"
                    >
                        Sair deste site
                    </button>
                    
                    <button 
                        class="btn btn-danger" 
                        onclick="LogoutModal.confirmFederatedLogout()"
                        aria-label="Sair de todas as contas"
                    >
                        Sair de todas as contas
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar estilos CSS
        addModalStyles();
        
        return modal;
    }
    
    /**
     * Adiciona estilos CSS para o modal
     */
    function addModalStyles() {
        if (document.getElementById('logoutModalStyles')) {
            return; // Estilos já adicionados
        }
        
        const style = document.createElement('style');
        style.id = 'logoutModalStyles';
        style.textContent = `
            .logout-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease-in-out;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            .logout-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 540px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .logout-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 28px 16px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .logout-modal-header h2 {
                margin: 0;
                font-size: 22px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .logout-modal-close {
                background: none;
                border: none;
                font-size: 32px;
                line-height: 1;
                color: #6b7280;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .logout-modal-close:hover {
                background-color: #f3f4f6;
                color: #1f2937;
            }
            
            .logout-modal-close:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            
            .logout-modal-body {
                padding: 24px 28px;
            }
            
            .logout-modal-text {
                font-size: 16px;
                color: #374151;
                margin: 0 0 20px 0;
                line-height: 1.6;
            }
            
            .logout-modal-info {
                background: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                border-left: 4px solid #3b82f6;
            }
            
            .logout-option-info {
                margin-bottom: 16px;
            }
            
            .logout-option-info:last-child {
                margin-bottom: 0;
            }
            
            .logout-option-info strong {
                display: block;
                color: #1f2937;
                font-size: 14px;
                margin-bottom: 4px;
            }
            
            .logout-option-info span {
                display: block;
                color: #6b7280;
                font-size: 13px;
                line-height: 1.5;
            }
            
            .logout-modal-footer {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                padding: 16px 28px 24px;
                border-top: 1px solid #e5e7eb;
            }
            
            .logout-modal-footer .btn {
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                border: none;
                transition: all 0.2s;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .btn-secondary:focus {
                outline: 2px solid #9ca3af;
                outline-offset: 2px;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-primary:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
            }
            
            .btn-danger:hover {
                background: #dc2626;
            }
            
            .btn-danger:focus {
                outline: 2px solid #ef4444;
                outline-offset: 2px;
            }
            
            /* Responsivo */
            @media (max-width: 640px) {
                .logout-modal-content {
                    width: 95%;
                    margin: 20px;
                }
                
                .logout-modal-footer {
                    flex-direction: column;
                }
                
                .logout-modal-footer .btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Mostra o modal de logout
     * @param {string} currentProvider - Provedor atual (google ou microsoft)
     */
    function show(currentProvider) {
        provider = currentProvider;
        
        // Criar modal se não existir
        if (!modalElement) {
            modalElement = createModal();
            document.body.appendChild(modalElement);
        }
        
        // Mostrar modal
        modalElement.style.display = 'flex';
        
        // Focar no botão de cancelar para acessibilidade
        setTimeout(() => {
            const cancelBtn = modalElement.querySelector('.btn-secondary');
            if (cancelBtn) {
                cancelBtn.focus();
            }
        }, 100);
        
        // Adicionar listener para fechar com ESC
        document.addEventListener('keydown', handleEscapeKey);
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
        
        console.log('[LogoutModal] Modal exibido');
    }
    
    /**
     * Fecha o modal
     */
    function close() {
        if (modalElement) {
            modalElement.style.display = 'none';
        }
        
        // Remover listener do ESC
        document.removeEventListener('keydown', handleEscapeKey);
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        
        console.log('[LogoutModal] Modal fechado');
    }
    
    /**
     * Handler para fechar com tecla ESC
     */
    function handleEscapeKey(event) {
        if (event.key === 'Escape') {
            close();
        }
    }
    
    /**
     * Confirma logout LOCAL (apenas deste site)
     */
    async function confirmLocalLogout() {
        console.log('[LogoutModal] Logout local confirmado');
        close();
        
        // Fazer logout local via SessionManager
        if (typeof SessionManager !== 'undefined' && SessionManager.logoutLocal) {
            await SessionManager.logoutLocal();
            SessionManager.redirectToLogin();
        } else {
            console.error('[LogoutModal] SessionManager não disponível');
        }
    }
    
    /**
     * Confirma logout FEDERADO (todas as contas)
     */
    async function confirmFederatedLogout() {
        console.log('[LogoutModal] Logout federado confirmado');
        close();
        
        // Fazer logout federado via SessionManager
        if (typeof SessionManager !== 'undefined' && SessionManager.logoutFederated) {
            const returnUrl = window.location.origin + '/secure/index.html';
            await SessionManager.logoutFederated(provider, returnUrl);
        } else {
            console.error('[LogoutModal] SessionManager não disponível');
        }
    }
    
    // API pública
    return {
        show,
        close,
        confirmLocalLogout,
        confirmFederatedLogout
    };
})();

// Export para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogoutModal;
}
