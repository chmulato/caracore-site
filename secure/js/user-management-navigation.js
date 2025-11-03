// Navigation Integration for User Management System

class UserManagementNavigation {
    constructor() {
        this.currentUser = null;
        this.initializeNavigation();
    }

    async initializeNavigation() {
        await this.loadCurrentUser();
        this.createNavigationMenu();
        this.setupNavigationEvents();
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/api/user/info', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                this.currentUser = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar usuário atual:', error);
        }
    }

    createNavigationMenu() {
        // Verifica se já existe menu de navegação
        let navMenu = document.getElementById('user-management-nav');
        if (!navMenu) {
            navMenu = this.createNavMenuElement();
            this.insertNavigationMenu(navMenu);
        }

        this.updateNavigationVisibility();
    }

    createNavMenuElement() {
        const nav = document.createElement('nav');
        nav.id = 'user-management-nav';
        nav.className = 'user-management-navigation';
        
        nav.innerHTML = `
            <div class="nav-container">
                <div class="nav-header">
                    <h3 class="nav-title">Gestão de Usuários</h3>
                </div>
                <ul class="nav-menu">
                    <li class="nav-item" data-role="super_admin,admin">
                        <a href="/secure/admin-users.html" class="nav-link" data-page="admin-users">
                            <span class="nav-icon">👥</span>
                            <span class="nav-text">Gerenciar Usuários</span>
                        </a>
                    </li>
                    <li class="nav-item" data-role="super_admin,admin">
                        <a href="/secure/approval-requests.html" class="nav-link" data-page="approval-requests">
                            <span class="nav-icon">📋</span>
                            <span class="nav-text">Aprovar Solicitações</span>
                            <span id="pending-requests-badge" class="nav-badge hidden">0</span>
                        </a>
                    </li>
                    <li class="nav-item" data-role="user">
                        <a href="/secure/request-access-enhanced.html" class="nav-link" data-page="request-access">
                            <span class="nav-icon">📝</span>
                            <span class="nav-text">Solicitar Acesso</span>
                        </a>
                    </li>
                    <li class="nav-item nav-separator" data-role="super_admin">
                        <span class="nav-separator-text">Super Administrador</span>
                    </li>
                    <li class="nav-item" data-role="super_admin">
                        <a href="/secure/super-admin-setup.html" class="nav-link" data-page="super-admin-setup">
                            <span class="nav-icon">⚙️</span>
                            <span class="nav-text">Configuração Inicial</span>
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return nav;
    }

    insertNavigationMenu(navMenu) {
        // Procura por um container adequado ou cria um
        const container = document.querySelector('.container') || 
                         document.querySelector('main') || 
                         document.body;

        // Insere no início do container
        if (container.firstChild) {
            container.insertBefore(navMenu, container.firstChild);
        } else {
            container.appendChild(navMenu);
        }
    }

    updateNavigationVisibility() {
        if (!this.currentUser) return;

        const userRole = this.currentUser.role || 'user';
        const navItems = document.querySelectorAll('[data-role]');

        navItems.forEach(item => {
            const allowedRoles = item.dataset.role.split(',');
            const isVisible = allowedRoles.includes(userRole) || allowedRoles.includes('user');
            
            if (isVisible) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

        this.updateActiveNavItem();
        this.updatePendingRequestsBadge();
    }

    updateActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(currentPath.split('/').pop())) {
                link.classList.add('active');
            }
        });
    }

    async updatePendingRequestsBadge() {
        if (!this.currentUser || !['admin', 'super_admin'].includes(this.currentUser.role)) {
            return;
        }

        try {
            const response = await fetch('/api/admin/access-requests/count', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const badge = document.getElementById('pending-requests-badge');
                
                if (badge && data.pending > 0) {
                    badge.textContent = data.pending;
                    badge.classList.remove('hidden');
                } else if (badge) {
                    badge.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar contagem de solicitações:', error);
        }
    }

    setupNavigationEvents() {
        // Atualizar badge periodicamente
        setInterval(() => {
            this.updatePendingRequestsBadge();
        }, 30000); // A cada 30 segundos

        // Adicionar estilos CSS
        this.addNavigationStyles();
    }

    addNavigationStyles() {
        if (document.getElementById('user-management-nav-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'user-management-nav-styles';
        styles.textContent = `
            .user-management-navigation {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 2rem;
                overflow: hidden;
            }

            .nav-container {
                padding: 0;
            }

            .nav-header {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                padding: 1rem 1.5rem;
            }

            .nav-title {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .nav-menu {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .nav-item {
                border-bottom: 1px solid #f3f4f6;
            }

            .nav-item:last-child {
                border-bottom: none;
            }

            .nav-link {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 1.5rem;
                text-decoration: none;
                color: #374151;
                transition: all 0.2s;
                position: relative;
            }

            .nav-link:hover {
                background: #f9fafb;
                color: #3b82f6;
            }

            .nav-link.active {
                background: #eff6ff;
                color: #1d4ed8;
                border-right: 3px solid #3b82f6;
            }

            .nav-icon {
                font-size: 1.1rem;
                width: 1.5rem;
                text-align: center;
            }

            .nav-text {
                flex: 1;
                font-weight: 500;
            }

            .nav-badge {
                background: #ef4444;
                color: white;
                font-size: 0.75rem;
                font-weight: 600;
                padding: 0.25rem 0.5rem;
                border-radius: 1rem;
                min-width: 1.5rem;
                text-align: center;
            }

            .nav-separator {
                background: #f9fafb;
                padding: 0.5rem 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .nav-separator-text {
                font-size: 0.8rem;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .hidden {
                display: none;
            }

            @media (max-width: 768px) {
                .nav-link {
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
                }

                .nav-icon {
                    font-size: 1rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Inicializar navegação quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UserManagementNavigation();
    });
} else {
    new UserManagementNavigation();
}