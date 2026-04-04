/**
 * Reino OIDC — Sistema de Validação de Licença (Cara Core Informática)
 * Chave de Soberania: apenas hash alfanumérico + hífens, sem dados sensíveis (LGPD).
 * Formato: REINO-OIDC-{8 hex do HID}-{sufixo alfanum}. Cara-Core gera o prefixo
 * com o mesmo algoritmo (prefixoFromHid(HID)) e envia a chave à usuária.
 * verificarStatusReino() | ativarReino(chave) | simbiose com Super Trunfo e Academia.
 */
(function () {
    'use strict';

    var STORAGE_CHAVE = 'chave_soberania_oidc';
    var STORAGE_ELITE = 'reino_oidc_elite_unlocked';
    var STORAGE_HWID = 'reino_oidc_hwid';
    /** Chave usada por isPremium() — simbiose com checkout (mesmo HID). */
    var STORAGE_LICENSE = 'reino_oidc_license';

    /** Status global do reino: 'SOBERANO' | 'VASSALO' */
    window.reinoStatus = 'VASSALO';

    /**
     * Identificação da licença Premium.
     * Verifica se existe chave válida reino_oidc_license no localStorage.
     * Para teste: qualquer string com mais de 10 caracteres é considerada válida.
     * Em produção pode ser trocado por validação completa (ex.: validarChave).
     */
    function isPremium() {
        try {
            var raw = localStorage.getItem(STORAGE_LICENSE);
            if (!raw || typeof raw !== 'string') return false;
            return raw.trim().length > 10;
        } catch (e) {
            return false;
        }
    }
    window.isPremium = isPremium;

    /**
     * Hardware ID (mesmo algoritmo do Super Trunfo para consistência).
     * Apenas identificador técnico do dispositivo, sem dados pessoais.
     */
    function getHardwareId() {
        try {
            var stored = localStorage.getItem(STORAGE_HWID);
            if (stored) return stored;
            var s = navigator.userAgent + navigator.language + screen.width + screen.height;
            var h = 'reino_' + s.split('').reduce(function (a, b) {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0).toString(16);
            localStorage.setItem(STORAGE_HWID, h);
            return h;
        } catch (e) {
            return 'browser_' + Date.now();
        }
    }

    /**
     * Gera prefixo de 8 caracteres hex a partir do HID (determinístico).
     * Cara-Core usa o mesmo algoritmo para gerar chaves válidas para esta máquina.
     */
    function prefixoFromHid(hid) {
        var n = hid.split('').reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        var hex = (n >>> 0).toString(16);
        return ('00000000' + hex).slice(-8).substring(0, 8);
    }

    /**
     * Valida chave: apenas hash alfanumérico + hífens, sem dados sensíveis (LGPD).
     * Formato: REINO-OIDC-{8 hex}-{12 a 24 alfanum}. Prefixo deve bater com HID.
     */
    function validarChave(chave) {
        if (!chave || typeof chave !== 'string') return false;
        var t = chave.trim();
        if (t.length < 24 || t.length > 64) return false;
        if (!/^[A-Za-z0-9\-]+$/.test(t)) return false;
        var parts = t.split('-');
        if (parts.length < 4) return false;
        if (parts[0] !== 'REINO' || parts[1] !== 'OIDC') return false;
        var prefixoStored = parts[2];
        if (!/^[a-f0-9]{8}$/i.test(prefixoStored)) return false;
        var prefixoEsperado = prefixoFromHid(getHardwareId());
        return prefixoStored.toLowerCase() === prefixoEsperado.toLowerCase();
    }

    /**
     * Verificação de Soberania: lê chave no localStorage e atualiza reinoStatus.
     * Se válida (e compatível com HID), define SOBERANO e desbloqueia elite.
     */
    function verificarStatusReino() {
        try {
            var chave = localStorage.getItem(STORAGE_CHAVE);
            if (chave && validarChave(chave)) {
                window.reinoStatus = 'SOBERANO';
                localStorage.setItem(STORAGE_ELITE, '1');
                localStorage.setItem(STORAGE_LICENSE, chave);
                return true;
            }
            if (isPremium()) {
                window.reinoStatus = 'SOBERANO';
                localStorage.setItem(STORAGE_ELITE, '1');
                return true;
            }
            window.reinoStatus = 'VASSALO';
            localStorage.setItem(STORAGE_ELITE, '0');
            return false;
        } catch (e) {
            window.reinoStatus = 'VASSALO';
            return false;
        }
    }

    /**
     * Abre o modal de Ritual de Ativação (Checkout).
     */
    function openRitualAtivacao() {
        var modal = document.getElementById('modal-pergaminho');
        if (modal && window.bootstrap) {
            var m = new bootstrap.Modal(modal);
            m.show();
        }
    }

    window.openRitualAtivacao = openRitualAtivacao;

    /**
     * Aplica estado da interface conforme reinoStatus (simbiose).
     */
    function applyReinoUI() {
        var isSoberano = window.reinoStatus === 'SOBERANO';
        document.body.classList.toggle('reino-soberano', isSoberano);
        document.body.classList.toggle('reino-vassalo', !isSoberano);

        if (isSoberano) {
            document.body.classList.add('reino-premium-active');
            removeLockedFeatureClass();
            if (document.querySelector('.super-trunfo')) {
                document.body.classList.add('reino-soberano-trunfo');
            }
            var titleEl = document.getElementById('academia-page-title');
            if (titleEl) {
                titleEl.textContent = 'Mestre da Identidade';
            }
            if (document.title && document.title.indexOf('Aprendiz') !== -1) {
                document.title = 'Mestre da Identidade - Reino OIDC';
            }
            injectSealPremium();
            injectUserTitle(true);
        } else {
            injectUserTitle(false);
            document.body.classList.remove('reino-premium-active');
            applyLockedFeatureClass();
            bindVassaloClicks();
        }
    }

    function applyLockedFeatureClass() {
        ['deck3', 'deck4', 'deck5'].forEach(function (deckId) {
            var el = document.querySelector('.deck-tab[data-deck="' + deckId + '"]');
            if (el) el.classList.add('locked-feature');
        });
        var area = document.getElementById('area-mineracao');
        if (area) area.classList.add('locked-feature');
    }

    function removeLockedFeatureClass() {
        document.querySelectorAll('.locked-feature').forEach(function (el) {
            el.classList.remove('locked-feature');
        });
    }

    function injectSealPremium() {
        if (document.getElementById('reino-seal-injected')) return;
        var nav = document.querySelector('.navbar .navbar-nav');
        if (!nav) return;
        var li = document.createElement('li');
        li.className = 'nav-item';
        li.id = 'reino-seal-injected';
        var span = document.createElement('span');
        span.className = 'nav-link reino-seal-premium';
        span.textContent = 'Acesso Premium Ativo';
        li.appendChild(span);
        nav.insertBefore(li, nav.firstChild);
    }

    function bindVassaloClicks() {
        ['deck3', 'deck4', 'deck5'].forEach(function (deckId) {
            var el = document.querySelector('.deck-tab[data-deck="' + deckId + '"]');
            if (!el || el._reinoBound) return;
            el._reinoBound = true;
            el.addEventListener('click', function (e) {
                if (el.classList.contains('locked')) {
                    e.preventDefault();
                    openRitualAtivacao();
                }
            });
        });
        var zonaSombreada = document.getElementById('carta-sombreada-premium');
        if (zonaSombreada) {
            zonaSombreada.querySelectorAll('.btn-abrir-pergaminho').forEach(function (btn) {
                if (btn._reinoBound) return;
                btn._reinoBound = true;
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    openRitualAtivacao();
                });
            });
        }
    }

    /**
     * Efeito de celebração (vitral / brilho) e recarga.
     */
    function celebrarERecarregar() {
        var style = document.createElement('style');
        style.textContent = '#reino-celebracao-overlay{position:fixed;inset:0;z-index:99999;pointer-events:none;background:radial-gradient(ellipse 80% 80% at 50% 50%,rgba(212,175,55,0.25) 0%,transparent 50%);animation:reino-celebracao 2s ease-out forwards;}@keyframes reino-celebracao{0%{opacity:0;}20%{opacity:1;}80%{opacity:1;}100%{opacity:1;background:radial-gradient(ellipse 100% 100% at 50% 50%,rgba(212,175,55,0.5) 0%,rgba(46,8,84,0.9) 70%);}}';
        document.head.appendChild(style);
        var overlay = document.createElement('div');
        overlay.id = 'reino-celebracao-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
        setTimeout(function () {
            try {
                location.reload();
            } catch (e) {
                window.location.href = window.location.href;
            }
        }, 2200);
    }

    /**
     * Ativa o reino com a chave fornecida pela Cara Core Informática.
     * Se válida, persiste no navegador e recarrega com celebração.
     */
    function ativarReino(chaveInput) {
        var chave = (chaveInput && chaveInput.trim) ? chaveInput.trim() : String(chaveInput || '');
        if (!validarChave(chave)) {
            return false;
        }
        try {
            localStorage.setItem(STORAGE_CHAVE, chave);
            localStorage.setItem(STORAGE_ELITE, '1');
            localStorage.setItem(STORAGE_LICENSE, chave);
            window.reinoStatus = 'SOBERANO';
            if (typeof window.exibirCoronacao === 'function') {
                window.exibirCoronacao();
            } else {
                celebrarERecarregar();
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    window.ativarReino = ativarReino;

    /**
     * Injeta ou atualiza o título do usuário no cabeçalho: Aventureira do Reino | Soberana das Identidades Federadas.
     */
    function injectUserTitle(isSoberano) {
        var container = document.querySelector('.navbar .container');
        if (!container) return;
        var existing = document.getElementById('reino-user-title');
        if (existing) {
            existing.textContent = isSoberano ? 'Soberana das Identidades Federadas' : 'Aventureira do Reino';
            existing.classList.toggle('reino-user-title-soberana', isSoberano);
            return;
        }
        var brand = container.querySelector('.navbar-brand');
        if (!brand) return;
        var span = document.createElement('span');
        span.id = 'reino-user-title';
        span.className = 'reino-user-title d-none d-md-inline' + (isSoberano ? ' reino-user-title-soberana' : '');
        span.textContent = isSoberano ? 'Soberana das Identidades Federadas' : 'Aventureira do Reino';
        brand.parentNode.insertBefore(span, brand.nextSibling);
    }

    verificarStatusReino();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyReinoUI);
        document.addEventListener('DOMContentLoaded', initReinoImgFallback);
    } else {
        applyReinoUI();
        initReinoImgFallback();
    }

    /**
     * Fallback elegante (CSS gótico) quando uma imagem falha ao carregar.
     * Evita ícone de link quebrado; exibe fundo e ícone do Reino.
     */
    function initReinoImgFallback() {
        try {
            document.querySelectorAll('img').forEach(function (img) {
                if (img._reinoFallbackBound) return;
                img._reinoFallbackBound = true;
                img.addEventListener('error', function () {
                    if (this.classList.contains('reino-img-fallback')) return;
                    this.classList.add('reino-img-fallback');
                    this.src = 'data:image/gif;base64,R0lGOODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                });
            });
        } catch (e) {}
    }
})();
