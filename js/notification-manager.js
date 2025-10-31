/**
 * Notification Manager - Sistema de toasts/notificações
 * Suporta múltiplos tipos, acessibilidade (ARIA), e auto-dismiss
 */

const NotificationManager = (function() {
    'use strict';
    
    // Configurações
    const CONFIG = {
        CONTAINER_ID: 'notificationContainer',
        AUTO_DISMISS_DELAY: 5000, // 5 segundos
        ANIMATION_DURATION: 300,   // ms
        MAX_NOTIFICATIONS: 5,
        POSITIONS: {
            TOP_RIGHT: 'top-right',
            TOP_LEFT: 'top-left',
            BOTTOM_RIGHT: 'bottom-right',
            BOTTOM_LEFT: 'bottom-left',
            TOP_CENTER: 'top-center',
            BOTTOM_CENTER: 'bottom-center'
        }
    };
    
    // Tipos de notificação
    const TYPES = {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    };
    
    let container = null;
    let notifications = [];
    let notificationIdCounter = 0;
    
    /**
     * Inicializa o container de notificações
     */
    function init(position = CONFIG.POSITIONS.TOP_RIGHT) {
        if (container) {
            return; // Já inicializado
        }
        
        // Criar container
        container = document.createElement('div');
        container.id = CONFIG.CONTAINER_ID;
        container.className = `notification-container ${position}`;
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        container.setAttribute('role', 'status');
        
        document.body.appendChild(container);
        
        // Adicionar estilos
        addStyles();
        
        console.log('[NotificationManager] Inicializado');
    }
    
    /**
     * Adiciona estilos CSS
     */
    function addStyles() {
        if (document.getElementById('notificationManagerStyles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'notificationManagerStyles';
        style.textContent = `
            .notification-container {
                position: fixed;
                z-index: 99999;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 420px;
            }
            
            .notification-container.top-right {
                top: 20px;
                right: 20px;
            }
            
            .notification-container.top-left {
                top: 20px;
                left: 20px;
            }
            
            .notification-container.bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .notification-container.bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .notification-container.top-center {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .notification-container.bottom-center {
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .notification {
                pointer-events: auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                min-width: 320px;
                max-width: 420px;
                animation: slideIn 0.3s ease-out;
                transition: all 0.3s ease;
            }
            
            .notification.removing {
                animation: slideOut 0.3s ease-in;
                opacity: 0;
                transform: translateX(100%);
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
            
            .notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-icon svg {
                width: 16px;
                height: 16px;
            }
            
            .notification.success .notification-icon {
                background: #10b981;
                color: white;
            }
            
            .notification.error .notification-icon {
                background: #ef4444;
                color: white;
            }
            
            .notification.warning .notification-icon {
                background: #f59e0b;
                color: white;
            }
            
            .notification.info .notification-icon {
                background: #3b82f6;
                color: white;
            }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                margin: 0 0 4px 0;
                line-height: 1.4;
            }
            
            .notification-message {
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                line-height: 1.5;
                word-wrap: break-word;
            }
            
            .notification-close {
                flex-shrink: 0;
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .notification-close:hover {
                background: #f3f4f6;
                color: #1f2937;
            }
            
            .notification-close:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                transition: width linear;
            }
            
            .notification.success .notification-progress {
                color: #10b981;
            }
            
            .notification.error .notification-progress {
                color: #ef4444;
            }
            
            .notification.warning .notification-progress {
                color: #f59e0b;
            }
            
            .notification.info .notification-progress {
                color: #3b82f6;
            }
            
            /* Responsivo */
            @media (max-width: 480px) {
                .notification-container {
                    left: 10px !important;
                    right: 10px !important;
                    max-width: calc(100% - 20px);
                    transform: none !important;
                }
                
                .notification {
                    min-width: auto;
                    max-width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Cria ícone SVG para o tipo de notificação
     */
    function createIcon(type) {
        const icons = {
            success: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>`,
            error: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>`,
            warning: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>`,
            info: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`
        };
        
        return icons[type] || icons.info;
    }
    
    /**
     * Cria elemento de notificação
     */
    function createNotificationElement(id, type, title, message, autoDismiss) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = `notification-${id}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', type === TYPES.ERROR ? 'assertive' : 'polite');
        
        notification.innerHTML = `
            <div class="notification-icon" aria-hidden="true">
                ${createIcon(type)}
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button 
                class="notification-close" 
                aria-label="Fechar notificação"
                onclick="NotificationManager.dismiss(${id})"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        
        // Adicionar barra de progresso se auto-dismiss
        if (autoDismiss) {
            const progress = document.createElement('div');
            progress.className = 'notification-progress';
            progress.style.width = '100%';
            notification.appendChild(progress);
        }
        
        return notification;
    }
    
    /**
     * Mostra uma notificação
     */
    function show(options) {
        // Inicializar se necessário
        if (!container) {
            init();
        }
        
        const {
            type = TYPES.INFO,
            title = '',
            message = '',
            autoDismiss = true,
            duration = CONFIG.AUTO_DISMISS_DELAY
        } = options;
        
        // Limitar número de notificações
        if (notifications.length >= CONFIG.MAX_NOTIFICATIONS) {
            dismiss(notifications[0].id);
        }
        
        const id = ++notificationIdCounter;
        const element = createNotificationElement(id, type, title, message, autoDismiss);
        
        // Adicionar ao container
        container.appendChild(element);
        
        // Armazenar referência
        const notification = {
            id,
            type,
            title,
            message,
            element,
            timeout: null
        };
        
        notifications.push(notification);
        
        // Auto-dismiss
        if (autoDismiss) {
            const progress = element.querySelector('.notification-progress');
            
            if (progress) {
                // Animar progresso
                setTimeout(() => {
                    progress.style.width = '0%';
                    progress.style.transition = `width ${duration}ms linear`;
                }, 10);
            }
            
            notification.timeout = setTimeout(() => {
                dismiss(id);
            }, duration);
        }
        
        console.log(`[NotificationManager] Notificação exibida: ${type} - ${message}`);
        
        return id;
    }
    
    /**
     * Dispensa uma notificação
     */
    function dismiss(id) {
        const index = notifications.findIndex(n => n.id === id);
        
        if (index === -1) {
            return;
        }
        
        const notification = notifications[index];
        
        // Cancelar timeout se existir
        if (notification.timeout) {
            clearTimeout(notification.timeout);
        }
        
        // Adicionar classe de remoção
        notification.element.classList.add('removing');
        
        // Remover após animação
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            
            notifications.splice(index, 1);
        }, CONFIG.ANIMATION_DURATION);
        
        console.log(`[NotificationManager] Notificação dispensada: ${id}`);
    }
    
    /**
     * Dispensa todas as notificações
     */
    function dismissAll() {
        notifications.forEach(n => dismiss(n.id));
    }
    
    /**
     * Atalhos para tipos específicos
     */
    function success(message, title = 'Sucesso', autoDismiss = true) {
        return show({
            type: TYPES.SUCCESS,
            title,
            message,
            autoDismiss
        });
    }
    
    function error(message, title = 'Erro', autoDismiss = false) {
        return show({
            type: TYPES.ERROR,
            title,
            message,
            autoDismiss,
            duration: 7000 // Erros ficam mais tempo
        });
    }
    
    function warning(message, title = 'Atenção', autoDismiss = true) {
        return show({
            type: TYPES.WARNING,
            title,
            message,
            autoDismiss,
            duration: 6000
        });
    }
    
    function info(message, title = '', autoDismiss = true) {
        return show({
            type: TYPES.INFO,
            title,
            message,
            autoDismiss
        });
    }
    
    // API pública
    return {
        init,
        show,
        dismiss,
        dismissAll,
        success,
        error,
        warning,
        info,
        TYPES,
        POSITIONS: CONFIG.POSITIONS
    };
})();

// Export para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
