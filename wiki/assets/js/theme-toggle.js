/**
 * Theme Toggle - Sistema de alternância entre tema claro e escuro
 * Salva a preferência do usuário no localStorage
 */

(function() {
    'use strict';

    // Elementos (serão inicializados quando o DOM estiver pronto)
    let themeToggleBtn = null;
    const htmlElement = document.documentElement;
    
    // Chave para localStorage
    const THEME_KEY = 'wiki-theme';
    
    // Ícones
    const sunIcon = '<i class="bi bi-sun-fill"></i>';
    const moonIcon = '<i class="bi bi-moon-stars-fill"></i>';

    /**
     * Obtém o tema salvo ou usa preferência do sistema
     */
    function getSavedTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        
        if (savedTheme) {
            return savedTheme;
        }
        
        // Detecta preferência do sistema operacional
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }

    /**
     * Aplica o tema
     */
    function setTheme(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = sunIcon;
                themeToggleBtn.setAttribute('aria-label', 'Alternar para tema claro');
                themeToggleBtn.setAttribute('title', 'Tema claro');
            }
        } else {
            htmlElement.removeAttribute('data-theme');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = moonIcon;
                themeToggleBtn.setAttribute('aria-label', 'Alternar para tema escuro');
                themeToggleBtn.setAttribute('title', 'Tema escuro');
            }
        }
        
        localStorage.setItem(THEME_KEY, theme);
        
        // Dispara evento customizado para outras partes da aplicação
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    /**
     * Alterna entre os temas
     */
    function toggleTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        
        // Efeito de transição suave
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    /**
     * Inicializa o tema ao carregar a página
     */
    function initTheme() {
        // Inicializa o botão apenas quando o DOM estiver pronto
        themeToggleBtn = document.getElementById('theme-toggle');
        
        const savedTheme = getSavedTheme();
        setTheme(savedTheme);
        
        // Adiciona listener ao botão
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        } else {
            console.warn('WikiTheme: Botão theme-toggle não encontrado no DOM');
        }
        
        // Detecta mudanças na preferência do sistema (opcional)
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Só muda automaticamente se o usuário não tiver feito uma escolha manual
                const savedTheme = localStorage.getItem(THEME_KEY);
                if (!savedTheme) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    // Exporta funções para uso externo se necessário
    window.WikiTheme = {
        toggle: toggleTheme,
        set: setTheme,
        get: () => htmlElement.getAttribute('data-theme') || 'light'
    };
})();
