// Main.js - Funcionalidades para a página principal do blog
// Christian Mulato Dev Blog - Sistema de Temas Dark/Light

document.addEventListener('DOMContentLoaded', function() {
    
    // Classe para gerenciar o tema
    class ThemeManager {
        constructor() {
            this.themeToggle = document.getElementById('themeToggle');
            this.themeIcon = document.getElementById('themeIcon');
            this.init();
        }
        
        init() {
            // Detecta tema salvo ou preferência do sistema
            const savedTheme = localStorage.getItem('theme');
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const currentTheme = savedTheme || systemTheme;
            
            this.setTheme(currentTheme);
            this.updateIcon(currentTheme);
            
            // Event listeners
            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                    this.updateIcon(e.matches ? 'dark' : 'light');
                }
            });
        }
        
        toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            this.setTheme(newTheme);
            this.updateIcon(newTheme);
            localStorage.setItem('theme', newTheme);
        }
        
        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        updateIcon(theme) {
            if (this.themeIcon) {
                this.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
            }
            if (this.themeToggle) {
                this.themeToggle.setAttribute('aria-label', 
                    theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
            }
        }
    }
    
    // Filtros de artigos
    function initializeFilters() {
        // Utilitário para gerar slugs sem acentos/símbolos
        const slugify = (str) => {
            if (!str) return '';
            return str
                .toString()
                .toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}+/gu, '') // remove acentos
                .replace(/&/g, ' e ')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        };
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const articles = document.querySelectorAll('.article-card');
        
        // Filtro por categoria
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                const selectedCategory = slugify(this.value);
                filterArticles(selectedCategory, searchInput ? searchInput.value.toLowerCase() : '');
            });
        }
        
        // Busca por texto
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const selectedCategory = categoryFilter ? slugify(categoryFilter.value) : '';
                filterArticles(selectedCategory, searchTerm);
            });
        }
        
        function filterArticles(category, searchTerm) {
            articles.forEach(article => {
                const categoryEl = article.querySelector('.category');
                const articleCategory = categoryEl ? categoryEl.textContent.toLowerCase() : '';
                const articleSlug = article.dataset.categorySlug || slugify(articleCategory);
                const articleTitle = article.querySelector('.article-title').textContent.toLowerCase();
                const articleDescription = article.querySelector('.article-description').textContent.toLowerCase();
                
                const matchesCategory = !category || category === 'todas' || articleSlug.includes(category);
                const matchesSearch = !searchTerm || 
                    articleTitle.includes(searchTerm) || 
                    articleDescription.includes(searchTerm);
                
                if (matchesCategory && matchesSearch) {
                    article.style.display = 'block';
                    article.style.animation = 'fadeIn 0.3s ease-in-out';
                } else {
                    article.style.display = 'none';
                }
            });
            
            // Mostrar/ocultar seções vazias
            document.querySelectorAll('.month-section').forEach(section => {
                const visibleArticles = section.querySelectorAll('.article-card[style*="display: block"], .article-card:not([style*="display: none"])');
                section.style.display = visibleArticles.length > 0 ? 'block' : 'none';
            });
        }
    }
    
    // Smooth scroll para navegação interna
    function initializeSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Animações de scroll
    function initializeScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.article-card, .year-section, .month-section').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Estatísticas dinâmicas
    function updateStats() {
        const totalArticles = document.querySelectorAll('.article-card').length;
        const statElement = document.querySelector('.stat');
        if (statElement) {
            statElement.textContent = `${totalArticles} artigos publicados`;
        }
    }
    
    // Inicializar tudo
    new ThemeManager();
    initializeFilters();
    initializeSmoothScroll();
    initializeScrollAnimations();
    updateStats();
    
    console.log('🚀 Main.js carregado com sucesso!');
    console.log(`📊 Artigos carregados: ${document.querySelectorAll('.article-card').length}`);
});

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .article-card {
        transition: all 0.3s ease;
    }
    
    .article-card:not(.animate) {
        opacity: 0;
        transform: translateY(20px);
    }
    
    .article-card.animate {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
