// Article.js - Funcionalidades para artigos individuais
// Christian Mulato Dev Blog

document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar highlighting de código se disponível
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
    
    // Smooth scroll para links internos
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
    
    // Adicionar funcionalidade de cópia para blocos de código
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        
        // Criar botão de cópia
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '📋';
        copyButton.title = 'Copiar código';
        
        // Adicionar evento de cópia
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                copyButton.innerHTML = '✅';
                copyButton.title = 'Copiado!';
                
                setTimeout(() => {
                    copyButton.innerHTML = '📋';
                    copyButton.title = 'Copiar código';
                }, 2000);
            } catch (err) {
                console.error('Erro ao copiar:', err);
            }
        });
        
        // Adicionar o botão ao container do código
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
    
    // Adicionar estilos para o botão de cópia
    const style = document.createElement('style');
    style.textContent = `
        .copy-code-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }
        
        .copy-code-btn:hover {
            opacity: 1;
        }
        
        pre:hover .copy-code-btn {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar indicadores de leitura
    const article = document.querySelector('.article-content');
    if (article) {
        const readingProgress = document.createElement('div');
        readingProgress.className = 'reading-progress';
        readingProgress.innerHTML = `
            <div class="reading-progress-bar"></div>
        `;
        document.body.appendChild(readingProgress);
        
        // Adicionar estilos para barra de progresso
        const progressStyle = document.createElement('style');
        progressStyle.textContent = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(37, 99, 235, 0.1);
                z-index: 1000;
            }
            
            .reading-progress-bar {
                height: 100%;
                background: var(--primary-color);
                width: 0%;
                transition: width 0.1s ease;
            }
        `;
        document.head.appendChild(progressStyle);
        
        // Atualizar progresso de leitura
        function updateReadingProgress() {
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;
            
            const progress = Math.max(0, Math.min(100, 
                ((scrollTop - articleTop + windowHeight) / articleHeight) * 100
            ));
            
            document.querySelector('.reading-progress-bar').style.width = progress + '%';
        }
        
        window.addEventListener('scroll', updateReadingProgress);
        updateReadingProgress(); // Inicializar
    }
    
    console.log('🚀 Article.js carregado com sucesso!');
});
