/**
 * secure-page-guard.js
 *
 * Simulação estática: a área restrita não depende mais de autenticação real.
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

