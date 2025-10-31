/**
 * Notification Manager - Sistema de Toasts/Notificações
 * Suporta notificações visuais acessíveis (ARIA) para feedback ao usuário
 * Tipos: success, error, warning, info
 */

const NotificationManager = (function() {
    'use strict';
    
    // Configuração
    const CONFIG = {
        CONTAINER_ID: 'notificationContainer',
        AUTO_DISMISS_TIME: 5000, // 5 segundos
        MAX_NOTIFICATIONS: 5,
        POSITION: 'top-right' // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    };
    
    let container = null;
    let notificationCount = 0;
    
    /**
     * Inicializa o container de notificações
     */
    function init() {
        if (container) {
            return; // Já inicializado
        }
        
        // Criar container
        container = document.createElement('div');
        container.id = CONFIG.CONTAINER_ID;
        container.className = `notification-container notification-${CONFIG.POSITION}`;
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        container.setAttribute('role', 'status');
        
        document.body.appendChild(container);
        
        // Adicionar estilos
        addStyles();
        
        console.log('[NotificationManager] Inicializado');
    }
    
    /**
     * Adiciona estilos CSS para as notificações
     */
    function addStyles() {
        if (document.getElementById('notificationManagerStyles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'notificationManagerStyles';
        style.textContent = `
            /* Container de notificações */
            .notification-container {
                position: fixed;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 420px;
                pointer-events: none;
            }
            
            /* Posicionamento */
            .notification-top-right {
                top: 24px;
                right: 24px;
            }
            
            .notification-top-left {
                top: 24px;
                left: 24px;
            }
            
            .notification-bottom-right {
                bottom: 24px;
                right: 24px;
            }
            
            .notification-bottom-left {
                bottom: 24px;
                left: 24px;
            }
            
            .notification-top-center {
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .notification-bottom-center {
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            /* Toast individual */
            .notification-toast {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 100%;
                word-wrap: break-word;
            }
            
            .notification-toast:hover {
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
                transform: translateY(-2px);
            }
            
            /* Animação de entrada */
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
            
            /* Animação de saída */
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
            
            .notification-toast.removing {
                animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Ícone da notificação */
            .notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .notification-icon svg {
                width: 16px;
                height: 16px;
            }
            
            /* Conteúdo */
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                line-height: 1.4;
                margin: 0 0 4px 0;
                color: #1f2937;
            }
            
            .notification-message {
                font-size: 13px;
                line-height: 1.5;
                margin: 0;
                color: #6b7280;
            }
            
            /* Botão de fechar */
            .notification-close {
                flex-shrink: 0;
                background: none;
                border: none;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 4px;
                color: #9ca3af;
                transition: all 0.2s;
            }
            
            .notification-close:hover {
                background-color: #f3f4f6;
                color: #1f2937;
            }
            
            .notification-close:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            
            /* Progress bar */
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                transition: width linear;
            }
            
            /* Tipos de notificação */
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-success .notification-icon {
                background-color: #d1fae5;
                color: #10b981;
            }
            
            .notification-success .notification-progress {
                background-color: #10b981;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-error .notification-icon {
                background-color: #fee2e2;
                color: #ef4444;
            }
            
            .notification-error .notification-progress {
                background-color: #ef4444;
            }
            
            .notification-warning {
                border-left: 4px solid #f59e0b;
            }
            
            .notification-warning .notification-icon {
                background-color: #fef3c7;
                color: #f59e0b;
            }
            
            .notification-warning .notification-progress {
                background-color: #f59e0b;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification-info .notification-icon {
                background-color: #dbeafe;
                color: #3b82f6;
            }
            
            .notification-info .notification-progress {
                background-color: #3b82f6;
            }
            
            /* Responsivo */
            @media (max-width: 640px) {
                .notification-container {
                    max-width: calc(100% - 32px);
                    left: 16px !important;
                    right: 16px !important;
                    transform: none !important;
                }
                
                .notification-toast {
                    padding: 14px 16px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Ícones SVG para cada tipo de notificação
     */
    const ICONS = {
        success: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>`,
        error: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>`,
        warning: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>`,
        info: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`
    };
    
    /**
     * Cria o HTML de uma notificação
     */
    function createNotificationElement(type, title, message, options) {
        const id = `notification-${++notificationCount}`;
        const toast = document.createElement('div');
        
        toast.id = id;
        toast.className = `notification-toast notification-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        
        // Construir HTML
        let html = `
            <div class="notification-icon" aria-hidden="true">
                ${ICONS[type]}
            </div>
            <div class="notification-content">
        `;
        
        if (title) {
            html += `<div class="notification-title">${escapeHtml(title)}</div>`;
        }
        
        if (message) {
            html += `<div class="notification-message">${escapeHtml(message)}</div>`;
        }
        
        html += `
            </div>
            <button class="notification-close" aria-label="Fechar notificação">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        
        // Progress bar se auto-dismiss
        if (options.autoDismiss) {
            html += `<div class="notification-progress" style="width: 100%"></div>`;
        }
        
        toast.innerHTML = html;
        
        // Event listeners
        const closeBtn = toast.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismiss(id);
        });
        
        // Click na notificação também fecha
        toast.addEventListener('click', () => {
            if (options.onClick) {
                options.onClick();
            }
            dismiss(id);
        });
        
        return toast;
    }
    
    /**
     * Escapa HTML para prevenir XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Mostra uma notificação
     */
    function show(type, title, message, options = {}) {
        // Inicializar se necessário
        if (!container) {
            init();
        }
        
        // Opções padrão
        const opts = {
            autoDismiss: options.autoDismiss !== false,
            duration: options.duration || CONFIG.AUTO_DISMISS_TIME,
            onClick: options.onClick || null
        };
        
        // Limitar número de notificações
        const notifications = container.querySelectorAll('.notification-toast');
        if (notifications.length >= CONFIG.MAX_NOTIFICATIONS) {
            dismiss(notifications[0].id);
        }
        
        // Criar elemento
        const toast = createNotificationElement(type, title, message, opts);
        container.appendChild(toast);
        
        // Auto-dismiss com progress bar
        if (opts.autoDismiss) {
            const progressBar = toast.querySelector('.notification-progress');
            
            if (progressBar) {
                // Animar progress bar
                setTimeout(() => {
                    progressBar.style.width = '0%';
                    progressBar.style.transition = `width ${opts.duration}ms linear`;
                }, 10);
            }
            
            // Remover após duração
            setTimeout(() => {
                dismiss(toast.id);
            }, opts.duration);
        }
        
        console.log(`[NotificationManager] ${type} - ${title}: ${message}`);
        
        return toast.id;
    }
    
    /**
     * Remove uma notificação
     */
    function dismiss(id) {
        const toast = document.getElementById(id);
        if (!toast) return;
        
        // Adicionar classe de remoção
        toast.classList.add('removing');
        
        // Remover após animação
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    /**
     * Remove todas as notificações
     */
    function dismissAll() {
        if (!container) return;
        
        const notifications = container.querySelectorAll('.notification-toast');
        notifications.forEach(toast => {
            dismiss(toast.id);
        });
    }
    
    /**
     * Atalhos para cada tipo
     */
    function success(title, message, options) {
        return show('success', title, message, options);
    }
    
    function error(title, message, options) {
        return show('error', title, message, options);
    }
    
    function warning(title, message, options) {
        return show('warning', title, message, options);
    }
    
    function info(title, message, options) {
        return show('info', title, message, options);
    }
    
    /**
     * Configura posição do container
     */
    function setPosition(position) {
        if (!container) {
            init();
        }
        
        // Remover classe antiga
        container.className = container.className.replace(/notification-\w+-?\w*/g, '');
        
        // Adicionar nova classe
        container.classList.add('notification-container', `notification-${position}`);
        CONFIG.POSITION = position;
    }
    
    // API pública
    return {
        init,
        show,
        success,
        error,
        warning,
        info,
        dismiss,
        dismissAll,
        setPosition
    };
})();

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationManager.init());
} else {
    NotificationManager.init();
}

// Export para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
