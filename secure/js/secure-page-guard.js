/**
 * secure-page-guard.js
 *
 * Simulação estática: não há autenticação real, apenas uma mensagem explicativa
 * para manter o comportamento visual sem depender de backend Azure/Google.
 */

(function() {
    'use strict';

    function renderStaticBanner() {
        const target = document.getElementById('mainContent') || document.body;
        if (!target) {
            return;
        }

        const banner = document.createElement('div');
        banner.style.maxWidth = '900px';
        banner.style.margin = '32px auto';
        banner.style.padding = '24px 28px';
        banner.style.borderRadius = '18px';
        banner.style.background = 'rgba(251, 191, 36, 0.08)';
        banner.style.border = '1px solid rgba(251, 191, 36, 0.35)';
        banner.style.color = '#fef3c7';
        banner.style.boxShadow = '0 16px 40px rgba(0,0,0,0.22)';
        banner.innerHTML = `
            <div style="font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7dd3fc; margin-bottom:12px;">Modo estático</div>
            <h1 style="margin:0 0 12px; font-size:clamp(1.8rem, 4vw, 2.6rem); color:#f8fafc;">Área restrita em simulação</h1>
            <p style="margin:0; color:#dbeafe; line-height:1.7; font-size:1rem;">
                O fluxo de autenticação foi removido neste ambiente para evitar dependência de Google, Microsoft ou Azure. A página continua em modo demonstrativo com banner explicativo.
            </p>
        `;

        target.innerHTML = '';
        target.appendChild(banner);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderStaticBanner, { once: true });
    } else {
        renderStaticBanner();
    }
})();
        window.location.href = redirectUrl.toString();
    }

    /**
     * Protege a página atual
     */
    async function protectPage() {
        console.log('[SecurePageGuard] Iniciando proteção da página...');

        // Aguardar um pouco para scripts carregarem
        await new Promise(resolve => setTimeout(resolve, 500));

        // Tentar verificar autenticação em ordem de prioridade
        let authResult = null;

        // 1. Tentar OIDCAuth primeiro (mais confiável)
        authResult = await checkOIDCAuthentication();
        
        // 2. Se OIDCAuth não funcionou, tentar SessionManager
        if (!authResult.authenticated) {
            console.log('[SecurePageGuard] OIDCAuth não autenticado, tentando SessionManager...');
            authResult = checkSessionManagerAuth();
        }

        // 3. Se SessionManager não funcionou, tentar storage
        if (!authResult.authenticated) {
            console.log('[SecurePageGuard] SessionManager não autenticado, tentando storage...');
            authResult = checkStorageAuth();
        }

        // Se não está autenticado, redirecionar para login
        if (!authResult.authenticated) {
            console.warn('[SecurePageGuard] Usuário não autenticado, redirecionando...', authResult.reason);
            redirectToLogin(authResult.reason);
            return false;
        }

        console.log('[SecurePageGuard] Usuário autenticado:', authResult.email);

        // Verificar autorização
        const authzResult = await checkAuthorization(authResult.email, authResult.provider);
        
        if (!authzResult.authorized) {
            console.warn('[SecurePageGuard] Usuário não autorizado, redirecionando...', authzResult.reason);
            
            // Redirecionar para primeiro acesso se não autorizado
            if (authzResult.reason === 'not_authorized') {
                const firstAccessUrl = new URL('/secure/first-access.html', window.location.origin);
                firstAccessUrl.searchParams.set('email', authResult.email || '');
                firstAccessUrl.searchParams.set('provider', authResult.provider);
                window.location.href = firstAccessUrl.toString();
            } else {
                redirectToLogin('not_authorized');
            }
            return false;
        }

        console.log('[SecurePageGuard] Página protegida com sucesso');
        return true;
    }

    // Executar proteção quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            protectPage().catch(error => {
                console.error('[SecurePageGuard] Erro fatal na proteção:', error);
                redirectToLogin('protection_error');
            });
        });
    } else {
        protectPage().catch(error => {
            console.error('[SecurePageGuard] Erro fatal na proteção:', error);
            redirectToLogin('protection_error');
        });
    }

    // Exportar função para uso manual se necessário
    window.SecurePageGuard = {
        protect: protectPage,
        checkAuth: checkOIDCAuthentication,
        checkAuthz: checkAuthorization
    };

})();

