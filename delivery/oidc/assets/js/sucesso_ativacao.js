/**
 * Reino OIDC — Componente de Celebração: Coroação (sucesso na ativação da licença).
 * Vitral dourado, Selo Pawlowsky, partículas de ouro, mensagem épica.
 * Som opcional: sino de catedral / fanfarra real (se assets/audio disponível).
 */
(function () {
    'use strict';

    var OVERLAY_ID = 'reino-coronacao-overlay';
    var AUDIO_PATHS = [
        'assets/audio/sino_catedral.mp3',
        'assets/audio/fanfarra_real.mp3',
        'assets/audio/campana.mp3'
    ];

    /**
     * Dispara ao validar a chave de licença com sucesso.
     * Tela escurece, Vitral Dourado ilumina no centro com Selo Pawlowsky,
     * partículas de ouro, mensagem épica e botão para Mineração de Chaves.
     */
    function exibirCoronacao() {
        if (document.getElementById(OVERLAY_ID)) return;

        tocarSomAtivacao();

        var overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'coronacao-titulo');
        overlay.className = 'reino-coronacao-overlay';

        overlay.innerHTML =
            '<div class="reino-coronacao-backdrop"></div>' +
            '<div class="reino-coronacao-vitral">' +
            '  <div class="reino-coronacao-selo-pawlowsky">P</div>' +
            '  <h2 id="coronacao-titulo" class="reino-coronacao-titulo">O Trono da Identidade agora é seu, Soberana!</h2>' +
            '  <p class="reino-coronacao-subtitulo">O Protocolo de Mineração de Chaves foi desbloqueado. Seus súditos (identidades) estão seguros sob sua nova governança.</p>' +
            '  <div class="reino-coronacao-actions">' +
            '    <a href="mapa_evolucao.html" class="reino-coronacao-btn-mineracao">Ir para a Mineração de Chaves</a>' +
            '    <button type="button" class="reino-coronacao-btn-fechar" aria-label="Fechar">Fechar</button>' +
            '  </div>' +
            '</div>' +
            '<canvas id="reino-coronacao-canvas" class="reino-coronacao-canvas" aria-hidden="true"></canvas>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function () {
            overlay.classList.add('reino-coronacao-visible');
        });

        iniciarParticulas(overlay.querySelector('.reino-coronacao-canvas'));

        overlay.querySelector('.reino-coronacao-btn-fechar').addEventListener('click', fecharCoronacao);
        overlay.querySelector('.reino-coronacao-backdrop').addEventListener('click', fecharCoronacao);
        overlay.querySelector('.reino-coronacao-btn-mineracao').addEventListener('click', function () {
            fecharCoronacao();
        });
    }

    function fecharCoronacao() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;
        overlay.classList.remove('reino-coronacao-visible');
        overlay.classList.add('reino-coronacao-saindo');
        setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            aplicarTituloSoberanaNoHeader();
            try {
                location.reload();
            } catch (e) {
                window.location.href = window.location.href;
            }
        }, 400);
    }

    /**
     * Após fechar o modal: cabeçalho muda para 'Soberana das Identidades Federadas' com glow.
     * Persistido via localStorage; licenca.js aplica no próximo load.
     */
    function aplicarTituloSoberanaNoHeader() {
        try {
            localStorage.setItem('reino_oidc_coronacao_mostrada', '1');
        } catch (e) {}
    }

    /**
     * Partículas de ouro (Canvas).
     */
    function iniciarParticulas(canvas) {
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width = window.innerWidth;
        var h = canvas.height = window.innerHeight;
        var particles = [];
        var golds = ['#d4af37', '#b8962e', '#f0d050', '#8b6914', '#ffd700'];
        var n = 80;

        for (var i = 0; i < n; i++) {
            particles.push({
                x: w / 2 + (Math.random() - 0.5) * 200,
                y: h / 2 + (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                r: 2 + Math.random() * 3,
                c: golds[Math.floor(Math.random() * golds.length)],
                life: 1,
                decay: 0.008 + Math.random() * 0.01
            });
        }

        function loop() {
            if (!canvas.parentNode) return;
            ctx.clearRect(0, 0, w, h);
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) continue;
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (particles.some(function (p) { return p.life > 0; })) {
                requestAnimationFrame(loop);
            }
        }
        requestAnimationFrame(loop);
    }

    /**
     * Som opcional: sino de catedral ou fanfarra real (se arquivo existir).
     * Tenta cada caminho em ordem; o primeiro que carregar será reproduzido.
     */
    function tocarSomAtivacao() {
        var idx = 0;
        function tentar() {
            if (idx >= AUDIO_PATHS.length) return;
            var audio = new Audio(AUDIO_PATHS[idx]);
            audio.volume = 0.5;
            audio.onerror = function () { idx++; tentar(); };
            audio.play().then(function () {}).catch(function () { idx++; tentar(); });
        }
        tentar();
    }

    window.exibirCoronacao = exibirCoronacao;
})();
