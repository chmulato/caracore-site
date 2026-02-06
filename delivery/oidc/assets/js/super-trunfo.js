/**
 * Reino OIDC — Motor de Cálculo Super Trunfo
 * compareCards(attr): valida quem tem maior valor no atributo.
 * FREE: decks 1 e 2. PREMIUM (R$ 29,90): decks 3, 4 e 5 com Poderes Especiais.
 * Log [BATALHA], tremer tela + Selo Pawlowsky dourado em carta Premium.
 * check_license(HID): Cara-Core; sem license.key → pergaminho com QR PIX.
 */

(function () {
    'use strict';

    const ATTR_IDS = ['seguranca', 'complexidade', 'escalabilidade', 'privacidade'];
    const ATTR_LABELS = {
        seguranca: 'Fortificação',
        complexidade: 'Nobreza',
        escalabilidade: 'Linhagem',
        privacidade: 'Sigilo'
    };
    const ATTR_LABELS_TECNICO = {
        seguranca: 'Segurança',
        complexidade: 'Complexidade',
        escalabilidade: 'Escalabilidade',
        privacidade: 'Privacidade (LGPD)'
    };
    /* Ordem de exibição nas cartas: Fortificação, Nobreza, Linhagem, Sigilo */
    const ATTR_DISPLAY_ORDER = ['seguranca', 'complexidade', 'escalabilidade', 'privacidade'];
    const ATTR_DISPLAY_NAMES = { seguranca: 'Fortificação', complexidade: 'Nobreza', escalabilidade: 'Linhagem', privacidade: 'Sigilo' };
    /* Deck 1: Nobreza (Autoridade) = higher is better. Outros decks podem usar LOWER_IS_BETTER para complexidade. */
    const LOWER_IS_BETTER = { complexidade: true };

    /**
     * REINO_DECK — Os 9 personagens (prompt_eras_historia.txt). Cada um tem era em que 'despertou'.
     * isLocked por era: Era 1 só Lady OAuth; Era 2 desbloqueia Lord OIDC, Rex, Pixie, Alex, IDA; Era 3 (Premium) desbloqueia Devia, Seraph, Ace.
     */
    const REINO_DECK = [
        { id: 'lady-oauth', name: 'Lady OAuth', subtitle: 'Guardiã das Portas', emoji: '👑', seguranca: 72, escalabilidade: 65, privacidade: 62, complexidade: 58, deckId: 1, reinoDeck: true, era: 1, flavor_text: 'Ela guarda as Portas do Reino; quem não tem o selo de autorização não passa.' },
        { id: 'lord-oidc', name: 'Lord OIDC', subtitle: 'O Mago da Identidade', emoji: '🧙‍♂️', seguranca: 68, escalabilidade: 72, privacidade: 68, complexidade: 65, deckId: 1, reinoDeck: true, era: 2, flavor_text: 'Governa o Baile das Identidades, revelando a verdade através do ID Token.' },
        { id: 'alex-client', name: 'Alex Client', subtitle: 'O Mensageiro Confiável', emoji: '🧑‍💼', seguranca: 58, escalabilidade: 68, privacidade: 60, complexidade: 55, deckId: 1, reinoDeck: true, era: 2, flavor_text: 'O mensageiro que nunca guarda segredos — apenas entrega os códigos aos porteiros.' },
        { id: 'pixie-pkce', name: 'Pixie PKCE', subtitle: 'Guardiã dos Códigos Secretos', emoji: '🧚', seguranca: 92, escalabilidade: 85, privacidade: 94, complexidade: 91, deckId: 1, reinoDeck: true, era: 2, flavor_text: 'O espírito que tece code_verifier e code_challenge antes de cada travessia.' },
        { id: 'ida-token', name: 'IDA Token', subtitle: 'A Mensageira da Verdade', emoji: '🪪', seguranca: 90, escalabilidade: 92, privacidade: 95, complexidade: 93, deckId: 1, reinoDeck: true, era: 2, flavor_text: 'A verdade assinada por Lord OIDC; quem a lê conhece o usuário sem ver a senha.' },
        { id: 'rex-token', name: 'Rex Token', subtitle: 'O Renovador Eterno', emoji: '♾️', seguranca: 89, escalabilidade: 87, privacidade: 91, complexidade: 94, deckId: 1, reinoDeck: true, era: 2, flavor_text: 'Quando Ace e IDA viram pó, ele traz nova vida dos cofres seguros.' },
        { id: 'ace-token', name: 'Ace Token', subtitle: 'O Guerreiro das Permissões', emoji: '🛡️', seguranca: 88, escalabilidade: 90, privacidade: 87, complexidade: 91, deckId: 1, reinoDeck: true, era: 3, flavor_text: 'O cavaleiro Bearer que abre os portões dos recursos a quem porta o token válido.' },
        { id: 'seraph-resource', name: 'Seraph Resource', subtitle: 'O Guardião dos Dados', emoji: '🏦', seguranca: 95, escalabilidade: 88, privacidade: 90, complexidade: 87, deckId: 1, reinoDeck: true, era: 3, flavor_text: 'A muralha que só abre aos tokens legítimos; verifica assinatura e escopo.' },
        { id: 'devia', name: 'Devia', subtitle: 'Integradora Suprema', emoji: '👩‍💻', seguranca: 85, escalabilidade: 86, privacidade: 88, complexidade: 92, deckId: 1, reinoDeck: true, era: 3, integradoraSuprema: true, flavor_text: 'A programadora do futuro: une o poder de todos os personagens no seu código. O Reino OIDC é o seu presente.' }
    ];

    var DECK_1 = REINO_DECK.slice();

    /* Deck 2 — FREE. Aliança Federada. */
    const DECK_2 = [
        { id: 'oauth-2.1', name: 'OAuth 2.1', subtitle: 'Protocolo das Autorizações', emoji: '🔑', seguranca: 9, complexidade: 6, escalabilidade: 9, privacidade: 8, deckId: 2 },
        { id: 'oidc-core', name: 'OIDC Core', subtitle: 'Núcleo da Identidade', emoji: '🪙', seguranca: 9, complexidade: 7, escalabilidade: 9, privacidade: 9, deckId: 2 },
        { id: 'pkce-flow', name: 'PKCE Flow', subtitle: 'Fluxo da Confirmação', emoji: '🔐', seguranca: 9, complexidade: 5, escalabilidade: 8, privacidade: 8, deckId: 2 },
        { id: 'jwks', name: 'JWKS', subtitle: 'Conjunto de Chaves Públicas', emoji: '📜', seguranca: 8, complexidade: 6, escalabilidade: 9, privacidade: 7, deckId: 2 },
        { id: 'jwt', name: 'JWT', subtitle: 'Token Assinado', emoji: '🎫', seguranca: 8, complexidade: 5, escalabilidade: 9, privacidade: 8, deckId: 2 }
    ];

    /* Decks 3, 4, 5 — PREMIUM. Poderes Especiais (matemática inquebrável). */
    const DECK_3 = [
        { id: 'rainha-oidc', name: 'Rainha OIDC', subtitle: 'Soberana da Identidade', emoji: '👑', seguranca: 10, complexidade: 5, escalabilidade: 10, privacidade: 10, deckId: 3, elite: true, poder: 'Espelho da Verdade' },
        { id: 'ecdh', name: 'Criptografia de Curva Elíptica', subtitle: 'Mineração de Chaves', emoji: '🔐', seguranca: 10, complexidade: 9, escalabilidade: 8, privacidade: 10, deckId: 3, elite: true, poder: 'Chave Inquebrável' }
    ];
    const DECK_4 = [
        { id: 'selo-federada', name: 'Selo de Identidade Federada', subtitle: 'Protocolo de Mineração', emoji: '🏅', seguranca: 10, complexidade: 6, escalabilidade: 9, privacidade: 10, deckId: 4, elite: true, poder: 'Selo do Conselho' },
        { id: 'guardiã-biometria', name: 'A Guardiã da Biometria', subtitle: 'Proteção Quântica', emoji: '🛡️', seguranca: 10, complexidade: 7, escalabilidade: 9, privacidade: 10, deckId: 4, elite: true, poder: 'Escudo Criptográfico' }
    ];
    const DECK_5 = [
        { id: 'arquiteta-acesso', name: 'Arquiteta do Acesso', subtitle: 'Mestre OIDC', emoji: '🧙‍♀️', seguranca: 10, complexidade: 5, escalabilidade: 10, privacidade: 10, deckId: 5, elite: true, poder: 'Linhagem do Trono' },
        { id: 'defensora-tokens', name: 'Defensora dos Tokens', subtitle: 'Validação Assinada', emoji: '⚔️', seguranca: 10, complexidade: 6, escalabilidade: 10, privacidade: 10, deckId: 5, elite: true, poder: 'Revocação do Invasor' }
    ];

    const DECK_BY_ID = { 1: DECK_1, 2: DECK_2, 3: DECK_3, 4: DECK_4, 5: DECK_5 };
    const DECK_NAMES = { 1: 'Personagens do Reino', 2: 'Aliança Federada', 3: 'Mineração de Chaves I', 4: 'Mineração de Chaves II', 5: 'Mineração de Chaves III' };
    /* Compatibilidade: basico = deck 1, elite = deck 3 (ou 4,5 conforme seleção) */
    var DECK_BASICO = DECK_1;
    var DECK_ELITE_MINERACAO = DECK_3.concat(DECK_4).concat(DECK_5);

    const CONFIG = {
        CNPJ: '23.969.028/0001-37',
        VALOR: 29.90,
        UPGRADE_URL: 'upgrade-trono.html',
        STORAGE_ELITE_KEY: 'reino_oidc_elite_unlocked',
        STORAGE_HWID_KEY: 'reino_oidc_hwid',
        STORAGE_LAST_ERA_KEY: 'reino_oidc_last_era_seen',
        LICENSE_KEY_URL: 'https://caracore.com.br/license.key'
    };

    let state = {
        deckAtivo: 'deck1',
        deckId: 1,
        deck: [],
        cartaMaquina: null,
        cartaJogadoraAtual: null,
        rodadaAtiva: false,
        eliteUnlocked: false,
        licenseChecked: false,
        currentEra: 1
    };

    function getHardwareId() {
        try {
            var stored = localStorage.getItem(CONFIG.STORAGE_HWID_KEY);
            if (stored) return stored;
            var h = 'reino_' + (navigator.userAgent + navigator.language + screen.width + screen.height).split('').reduce(function (a, b) {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0).toString(16);
            localStorage.setItem(CONFIG.STORAGE_HWID_KEY, h);
            return h;
        } catch (e) {
            return 'browser_' + Date.now();
        }
    }

    function isEliteUnlocked() {
        try {
            var v = localStorage.getItem(CONFIG.STORAGE_ELITE_KEY);
            state.eliteUnlocked = v === 'true' || v === '1';
            return state.eliteUnlocked;
        } catch (e) {
            return false;
        }
    }

    /**
     * Verificação de licença Cara-Core. Antes de carregar cartas 3, 4 e 5.
     * Usa isPremium() (reino_oidc_license) quando disponível; senão localStorage elite.
     * @param {string} HID - Hardware ID (simbiose com checkout)
     * @returns {boolean}
     */
    function check_license(HID) {
        try {
            if (typeof window.isPremium === 'function' && window.isPremium()) {
                state.eliteUnlocked = true;
                state.licenseChecked = true;
                return true;
            }
            if (state.licenseChecked) return state.eliteUnlocked;
            var local = localStorage.getItem(CONFIG.STORAGE_ELITE_KEY);
            if (local === 'true' || local === '1') {
                state.eliteUnlocked = true;
                state.licenseChecked = true;
                return true;
            }
            state.licenseChecked = true;
            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * Comparação de cartas: valida quem tem o maior valor no atributo escolhido.
     * @param {string} attr - seguranca | complexidade | escalabilidade | privacidade
     * @returns {number} 1 = jogadora vence, -1 = conselho vence, 0 = empate
     */
    function compareCards(attr) {
        if (!state.cartaJogadoraAtual || !state.cartaMaquina) return 0;
        var vJ = state.cartaJogadoraAtual[attr];
        var vM = state.cartaMaquina[attr];
        return compareValues(attr, vJ, vM, state.cartaJogadoraAtual, state.cartaMaquina);
    }

    function logTelemetria(message, type) {
        type = type || 'AUDIT';
        var logEl = document.getElementById('telemetria-log');
        if (!logEl) return;
        var ts = new Date().toLocaleTimeString('pt-BR', { hour12: false });
        var line = document.createElement('div');
        line.className = 'log-line' + (type === 'SUCESSO' ? ' log-success' : '') + (type === 'BATALHA' ? ' log-batalha' : '');
        line.innerHTML = '<span class="ts">[' + ts + ']</span> <span class="audit">[' + type + ']</span> ' + escapeHtml(message);
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function logBatalha(message) {
        logTelemetria(message, 'BATALHA');
    }

    function getBattleNarrative(result, attr, cardJ, cardM) {
        var label = ATTR_LABELS[attr] || attr;
        var vJ = cardJ && cardJ[attr] != null ? cardJ[attr] : 0;
        var vM = cardM && cardM[attr] != null ? cardM[attr] : 0;
        var who = result === 1 ? (cardJ && cardJ.name) || 'Jogadora' : (cardM && cardM.name) || 'Conselho';
        var power = result === 1 && cardJ && cardJ.poder ? cardJ.poder : (cardM && cardM.poder) || null;
        if (power) {
            return who + " usou '" + power + "'. " + label + " do Invasor " + (result === 1 ? "superada." : "reduzida.");
        }
        return "Comparação " + label + ": " + (result === 1 ? "Jogadora " + vJ + " vence Conselho " + vM + "." : "Conselho " + vM + " vence Jogadora " + vJ + ".");
    }

    function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        return a;
    }

    function drawCard(deck) {
        if (!deck.length) return null;
        return deck.pop();
    }

    function compareValues(attr, valorJogadora, valorMaquina, cardJ, cardM) {
        var lowerBetter = LOWER_IS_BETTER[attr];
        if (attr === 'complexidade' && (cardJ && cardJ.reinoDeck) || (cardM && cardM.reinoDeck)) {
            lowerBetter = false;
        }
        if (lowerBetter) {
            if (valorJogadora < valorMaquina) return 1;
            if (valorJogadora > valorMaquina) return -1;
        } else {
            if (valorJogadora > valorMaquina) return 1;
            if (valorJogadora < valorMaquina) return -1;
        }
        return 0;
    }

    function triggerPremiumEffect() {
        var body = document.body;
        var selo = document.querySelector('.selo-pawlowsky');
        if (body) body.classList.add('screen-shake');
        if (selo) selo.classList.add('glow-gold');
        setTimeout(function () {
            if (body) body.classList.remove('screen-shake');
            if (selo) setTimeout(function () { if (selo) selo.classList.remove('glow-gold'); }, 1500);
        }, 400);
    }

    function renderPergaminhoPIX(container) {
        var cnpj = CONFIG.CNPJ.replace(/\D/g, '');
        var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent('PIX+' + CONFIG.CNPJ + '+R%2429%2C90');
        var div = document.createElement('div');
        div.className = 'trunfo-card pergaminho-pix';
        div.innerHTML =
            '<span class="badge-locked">🔒 LICENÇA</span>' +
            '<div class="card-name">Pergaminho de Selagem</div>' +
            '<div class="card-subtitle">Desbloqueie com R$ 29,90 — PIX CNPJ</div>' +
            '<div class="pergaminho-qr"><img src="' + qrUrl + '" alt="QR PIX" width="100" height="100"></div>' +
            '<code class="pergaminho-cnpj">' + escapeHtml(CONFIG.CNPJ) + '</code>' +
            '<p class="pergaminho-hint">Chave PIX · R$ 29,90 · Cara Core Informática</p>';
        container.appendChild(div);
    }

    function attrBarHtml(attrKey, value) {
        var label = ATTR_DISPLAY_NAMES[attrKey] || attrKey;
        var pct = (value != null && value > 10) ? Math.min(100, Math.max(0, value)) : Math.min(100, Math.max(0, value) * 10);
        return '<div class="attr-row">' +
            '<span class="attr-name">' + label + '</span>' +
            '<span class="attr-bar-wrap"><span class="attr-bar-fill" style="width:' + pct + '%"></span></span>' +
            '<span class="attr-value">' + value + '</span></div>';
    }

    /**
     * Renderiza uma carta. Se isLocked e !isPremium(), exibe cadeado e ao clicar redireciona ao checkout (Cara-Core).
     * Inclui flavor_text místico-técnico e Selo Pawlowsky em toda carta.
     */
    function renderCard(card, container, isMachine) {
        if (!card) return;
        var isPremiumCard = (card.deckId >= 3 || card.elite) && (card.deckId !== undefined || card.elite);
        if (isPremiumCard && !check_license(getHardwareId())) {
            renderPergaminhoPIX(container);
            return;
        }
        var premium = check_license(getHardwareId());
        var locked = card.isLocked && !premium;
        var div = document.createElement('div');
        div.className = 'trunfo-card' + (card.elite ? ' elite' : '') + (locked ? ' trunfo-card-locked' : '');
        if (locked) div.setAttribute('role', 'button');
        if (locked) div.setAttribute('tabindex', '0');
        if (card.elite) div.innerHTML = '<span class="badge-elite">ELITE</span>';
        if (card.poder) div.innerHTML += '<span class="badge-poder">' + escapeHtml(card.poder) + '</span>';
        if (card.reinoDeck && card.era) div.innerHTML += '<span class="card-awakened-era" title="Despertou nesta Era">Era ' + card.era + '</span>';
        if (card.integradoraSuprema) div.classList.add('devia-integradora');
        if (locked) div.innerHTML += '<span class="card-lock-icon" aria-hidden="true">🔒</span>';
        var subtitleHtml = card.subtitle ? '<div class="card-subtitle">' + escapeHtml(card.subtitle) + '</div>' : '';
        var flavorHtml = (card.flavor_text && !locked) ? '<p class="card-flavor-text">' + escapeHtml(card.flavor_text) + '</p>' : (card.flavor_text && locked) ? '<p class="card-flavor-text card-flavor-text-locked">' + escapeHtml(card.flavor_text) + '</p>' : '';
        var deviaTransitionHtml = (card.integradoraSuprema && !locked) ? '<p class="card-devia-transition">' + (typeof window.ReinoEras !== 'undefined' ? window.ReinoEras.getDeviaTransitionText() : 'O futuro chegou. Você é Devia. O Reino OIDC agora é o seu código.') + '</p>' : '';
        div.innerHTML +=
            '<div class="card-name">' + escapeHtml(card.name) + '</div>' +
            subtitleHtml +
            '<div class="card-emoji">' + card.emoji + '</div>';
        if (!locked) {
            ATTR_DISPLAY_ORDER.forEach(function (key) {
                div.innerHTML += attrBarHtml(key, card[key] != null ? card[key] : 0);
            });
        } else {
            div.innerHTML += '<p class="card-desbloqueie">Desbloqueie com a Chave de Soberania (R$ 29,90)</p>';
        }
        div.innerHTML += flavorHtml + deviaTransitionHtml;
        /* Foco Técnico no rodapé (subtítulo discreto por era) */
        if (card.reinoDeck && card.era && typeof window.ReinoEras !== 'undefined') {
            var foco = window.ReinoEras.getFocoTecnicoEra(card.era);
            div.innerHTML += '<div class="card-foco-tecnico">' + escapeHtml(foco) + '</div>';
        }
        /* Era 3 Devia: glitch dourado + CTA para não-Premium */
        if (card.integradoraSuprema) {
            div.classList.add('devia-glitch-card');
            if (locked) {
                div.innerHTML += '<button type="button" class="btn-assuma-trono" data-cta-checkout>Assuma seu trono por R$ 29,90</button>';
            }
        }
        div.innerHTML += '<div class="card-seal-pawlowsky" aria-hidden="true">P</div>';
        if (locked) {
            div.addEventListener('click', function (e) {
                if (e.target && e.target.getAttribute && e.target.getAttribute('data-cta-checkout') !== null) return;
                e.preventDefault();
                if (typeof window.openRitualAtivacao === 'function') window.openRitualAtivacao();
            });
            div.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (typeof window.openRitualAtivacao === 'function') window.openRitualAtivacao();
                }
            });
        }
        var ctaBtn = div.querySelector('[data-cta-checkout]');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (typeof window.openRitualAtivacao === 'function') window.openRitualAtivacao();
            });
        }
        container.appendChild(div);
    }

    /**
     * Renderiza o deck (personagens por era). Cartas da era atual desbloqueadas; Era 3 requer Premium.
     */
    function renderDeck(container) {
        if (!container) return;
        container.innerHTML = '';
        var list = getReinoDeckForEra();
        list.forEach(function (card) {
            renderCard(card, container, false);
        });
    }

    function getReinoDeckForEra() {
        var unlockedIds = typeof window.ReinoEras !== 'undefined' ? window.ReinoEras.getUnlockedCharacterIds() : ['lady-oauth'];
        return REINO_DECK.map(function (c) {
            var unlocked = unlockedIds.indexOf(c.id) !== -1;
            return Object.assign({}, c, { isLocked: !unlocked });
        });
    }

    function buildDeck(deckId) {
        var id = typeof deckId === 'string' ? parseInt(deckId.replace('deck', ''), 10) : deckId;
        if (!id || !DECK_BY_ID[id]) return shuffle(DECK_1.slice());
        var list;
        if (id === 1) {
            list = getReinoDeckForEra().slice();
        } else {
            list = DECK_BY_ID[id].slice();
            if (id >= 3 && !check_license(getHardwareId())) {
                list = list.filter(function (c) { return !c.isLocked; });
            }
        }
        return shuffle(list);
    }

    function startGame() {
        var activeTab = document.querySelector('.deck-tab.active');
        var deckKey = (activeTab && activeTab.dataset.deck) || 'deck1';
        state.deckAtivo = deckKey;
        state.deckId = parseInt(deckKey.replace('deck', ''), 10) || 1;
        if (state.deckId >= 3 && !check_license(getHardwareId())) {
            state.deckId = 1;
            state.deckAtivo = 'deck1';
            document.querySelectorAll('.deck-tab').forEach(function (t) {
                t.classList.toggle('active', t.dataset.deck === 'deck1');
            });
        }
        var list = buildDeck(state.deckId);
        state.deck = list;
        state.cartaJogadoraAtual = drawCard(state.deck);
        state.cartaMaquina = drawCard(state.deck);
        state.rodadaAtiva = true;

        logTelemetria('Sessão iniciada no Reino. Deck: ' + (DECK_NAMES[state.deckId] || state.deckAtivo) + '.');
        logTelemetria('Identidade Federada Validada via OIDC (ambiente local).');

        updateUI();
        hideResult();
        hidePremiumTrigger();
        bindAttrButtons();
    }

    function updateUI() {
        var zonaJogadora = document.getElementById('cartas-jogadora');
        var zonaMaquina = document.getElementById('carta-maquina');
        if (!zonaJogadora || !zonaMaquina) return;

        zonaJogadora.innerHTML = '';
        zonaMaquina.innerHTML = '';

        if (state.cartaJogadoraAtual) {
            renderCard(state.cartaJogadoraAtual, zonaJogadora, false);
        }
        if (state.cartaMaquina) {
            renderCard(state.cartaMaquina, zonaMaquina, true);
        }

        var chooseEl = document.getElementById('choose-attr');
        if (chooseEl) {
            chooseEl.style.display = state.rodadaAtiva && state.cartaJogadoraAtual && state.cartaMaquina ? 'block' : 'none';
        }

        var scoreEl = document.getElementById('score-jogadora');
        if (scoreEl) {
            scoreEl.textContent = state.deck.length + (state.cartaJogadoraAtual ? 1 : 0) + (state.cartaMaquina ? 1 : 0);
        }
    }

    function hideResult() {
        var r = document.getElementById('round-result');
        if (r) {
            r.classList.remove('show', 'win', 'lose');
            r.style.display = 'none';
        }
    }

    function showResult(won, attr) {
        var r = document.getElementById('round-result');
        if (!r) return;
        r.classList.remove('win', 'lose');
        r.classList.add(won ? 'win' : 'lose', 'show');
        r.style.display = 'block';
        var msg = r.querySelector('.result-msg');
        if (msg) {
            msg.textContent = won
                ? 'Você venceu esta rodada! Governa suas identidades.'
                : 'O Conselho da Confiança venceu. Proteja seu Reino na próxima.';
        }
        var detail = r.querySelector('.result-detail');
        if (detail) {
            var label = ATTR_LABELS[attr] || attr;
            var tech = ATTR_LABELS_TECNICO[attr];
            detail.textContent = 'Atributo: ' + label + (tech ? ' (' + tech + ')' : '');
        }
    }

    function playRound(attr) {
        if (!state.rodadaAtiva || !state.cartaJogadoraAtual || !state.cartaMaquina) return;

        var result = compareCards(attr);
        var cardJ = state.cartaJogadoraAtual;
        var cardM = state.cartaMaquina;
        var hasPremium = (cardJ && (cardJ.poder || cardJ.deckId >= 3)) || (cardM && (cardM.poder || cardM.deckId >= 3));

        logBatalha(getBattleNarrative(result, attr, cardJ, cardM));
        if (result === 1) {
            logTelemetria('Protocolo OIDC validado com honras.', 'SUCESSO');
        } else if (result === -1) {
            logTelemetria('Rodada: vitória do Conselho da Confiança. Defesa registrada no Reino.');
        } else {
            logTelemetria('Empate no Reino. Nova rodada disponível.');
        }

        if (hasPremium) triggerPremiumEffect();

        showResult(result === 1, attr);
        state.rodadaAtiva = false;

        var attrBtns = document.querySelectorAll('.attr-btn');
        attrBtns.forEach(function (b) { b.disabled = true; });

        var btnProxima = document.getElementById('btn-proxima');
        if (btnProxima) btnProxima.style.display = 'inline-block';

        showPremiumTrigger();
    }

    function showPremiumTrigger() {
        var zone = document.getElementById('carta-sombreada-premium');
        if (!zone) return;
        zone.classList.add('show');
    }

    function hidePremiumTrigger() {
        var zone = document.getElementById('carta-sombreada-premium');
        if (zone) zone.classList.remove('show');
    }

    function nextRound() {
        if (state.deck.length < 2) {
            logTelemetria('Baralho insuficiente. Fim de jogo.');
            state.rodadaAtiva = false;
            state.cartaJogadoraAtual = null;
            state.cartaMaquina = null;
            updateUI();
            var chooseEl = document.getElementById('choose-attr');
            if (chooseEl) chooseEl.style.display = 'none';
            var btnProxima = document.getElementById('btn-proxima');
            if (btnProxima) btnProxima.style.display = 'none';
            var r = document.getElementById('round-result');
            if (r) {
                r.classList.remove('win', 'lose');
                r.classList.add('show', 'win');
                var msg = r.querySelector('.result-msg');
                if (msg) msg.textContent = 'Partida encerrada. Torne-se a Arquiteta do Acesso!';
                var det = r.querySelector('.result-detail');
                if (det) det.textContent = '';
            }
            return;
        }

        state.cartaJogadoraAtual = drawCard(state.deck);
        state.cartaMaquina = drawCard(state.deck);
        if (!state.cartaJogadoraAtual || !state.cartaMaquina) {
            nextRound();
            return;
        }
        state.rodadaAtiva = true;
        hideResult();
        hidePremiumTrigger();
        updateUI();
        bindAttrButtons();
        var btnProxima = document.getElementById('btn-proxima');
        if (btnProxima) btnProxima.style.display = 'none';
        logTelemetria('Nova rodada no Reino. Carta da jogadora e do Conselho da Confiança distribuídas.');
    }

    function bindAttrButtons() {
        ATTR_IDS.forEach(function (attr) {
            var btn = document.getElementById('attr-' + attr);
            if (btn) {
                btn.onclick = function () { playRound(attr); };
                btn.disabled = false;
            }
        });
    }

    function initDeckTabs() {
        var unlocked = check_license(getHardwareId());
        [1, 2, 3, 4, 5].forEach(function (id) {
            var tab = document.getElementById('deck-' + id);
            if (!tab) return;
            if (id <= 2) {
                tab.classList.remove('locked');
                tab.onclick = function () { setDeck('deck' + id); };
            } else {
                if (unlocked) {
                    tab.classList.remove('locked');
                    tab.onclick = function () { setDeck('deck' + id); };
                } else {
                    tab.classList.add('locked');
                    tab.onclick = function () {
                        logTelemetria('Tentativa de acesso ao deck ' + (DECK_NAMES[id] || id) + '. Upgrade R$ 29,90 necessário.');
                    };
                }
            }
        });
    }

    function setDeck(deckId) {
        var id = typeof deckId === 'string' ? parseInt(deckId.replace('deck', ''), 10) : deckId;
        if (id >= 3 && !check_license(getHardwareId())) return;
        state.deckAtivo = 'deck' + id;
        state.deckId = id;
        document.querySelectorAll('.deck-tab').forEach(function (t) {
            t.classList.toggle('active', t.dataset.deck === state.deckAtivo);
        });
        logTelemetria('Deck selecionado no Reino: ' + (DECK_NAMES[id] || state.deckAtivo) + '.');
    }

    function renderTimeline() {
        var container = document.getElementById('reino-timeline');
        if (!container || typeof window.ReinoEras === 'undefined') return;
        var state = window.ReinoEras.getTimelineState();
        var eras = window.ReinoEras.ERAS;
        container.innerHTML = '';
        container.className = 'reino-timeline';
        [1, 2, 3].forEach(function (e) {
            var era = eras[e];
            var done = e === 1 ? state.part1 : e === 2 ? state.part2 : state.part3;
            var span = document.createElement('span');
            span.className = 'timeline-era' + (done ? ' active' : '') + (e === 3 ? ' timeline-era-premium' : '');
            span.setAttribute('title', era.title + (e === 3 ? ' (Premium)' : ''));
            span.innerHTML = '<span class="timeline-era-dot"></span><span class="timeline-era-label">Era ' + e + '</span>';
            if (e < 3) {
                var link = document.createElement('a');
                link.href = era.storyPage;
                link.className = 'timeline-era-link';
                link.textContent = era.subtitle;
                span.appendChild(link);
            }
            container.appendChild(span);
        });
    }

    function applyEraTheme() {
        var era = typeof window.ReinoEras !== 'undefined' ? window.ReinoEras.getCurrentEra() : 1;
        state.currentEra = era;
        document.body.classList.remove('era-1', 'era-2', 'era-3');
        document.body.classList.add('era-' + era);
    }

    /**
     * Overlay dos Contos das Eras: título gótico + texto técnico sem-serifa.
     * Quando currentEra muda, exibe o texto da era. Era 3 + não-Premium: glitch Devia + CTA.
     */
    function showEraOverlay(era) {
        if (typeof window.ReinoEras === 'undefined') return;
        var narrativa = window.ReinoEras.getNarrativaEra(era);
        var premium = check_license(getHardwareId());
        var isEra3 = era === 3;

        var overlay = document.getElementById('reino-era-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'reino-era-overlay';
            overlay.className = 'reino-era-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-labelledby', 'reino-era-overlay-title');
            document.body.appendChild(overlay);
        }

        var deviaText = window.ReinoEras.getDeviaTransitionText();
        var deviaBlock = (isEra3 && !premium)
            ? '<p class="reino-era-devia-glitch">' + escapeHtml(deviaText) + '</p><button type="button" class="btn-assuma-trono btn-assuma-trono-overlay" data-cta-checkout>Assuma seu trono por R$ 29,90</button>'
            : (isEra3 ? '<p class="reino-era-devia-glitch">' + escapeHtml(deviaText) + '</p>' : '');

        overlay.innerHTML =
            '<div class="reino-era-overlay-inner">' +
            '<h2 id="reino-era-overlay-title" class="reino-era-overlay-titulo">' + escapeHtml(narrativa.titulo) + '</h2>' +
            '<p class="reino-era-overlay-subtitulo">' + escapeHtml(narrativa.subtitulo) + '</p>' +
            '<p class="reino-era-overlay-tecnico">' + escapeHtml(narrativa.textoTecnico) + '</p>' +
            deviaBlock +
            '<button type="button" class="reino-era-overlay-fechar">Continuar</button>' +
            '</div>';
        overlay.classList.add('show');

        overlay.querySelector('.reino-era-overlay-fechar').addEventListener('click', function () {
            overlay.classList.remove('show');
        });
        var ctaOverlay = overlay.querySelector('.btn-assuma-trono-overlay[data-cta-checkout]');
        if (ctaOverlay) {
            ctaOverlay.addEventListener('click', function (e) {
                e.preventDefault();
                overlay.classList.remove('show');
                if (typeof window.openRitualAtivacao === 'function') window.openRitualAtivacao();
            });
        }
    }

    function checkEraTransitionAndShowOverlay() {
        if (typeof window.ReinoEras === 'undefined') return;
        var currentEra = window.ReinoEras.getCurrentEra();
        var lastSeen = null;
        try {
            lastSeen = sessionStorage.getItem(CONFIG.STORAGE_LAST_ERA_KEY);
        } catch (e) {}
        if (String(currentEra) !== lastSeen) {
            showEraOverlay(currentEra);
            try {
                sessionStorage.setItem(CONFIG.STORAGE_LAST_ERA_KEY, String(currentEra));
            } catch (e) {}
        }
    }

    function init() {
        var hid = getHardwareId();
        logTelemetria('Reino da Identidade Federada — Super Trunfo iniciado. Proteja seu Reino. Hardware ID: ' + hid.substring(0, 8) + '…');
        check_license(hid);
        applyEraTheme();
        renderTimeline();
        checkEraTransitionAndShowOverlay();
        initDeckTabs();
        setDeck('deck1');

        var btnIniciar = document.getElementById('btn-iniciar');
        if (btnIniciar) btnIniciar.onclick = startGame;

        var btnProxima = document.getElementById('btn-proxima');
        if (btnProxima) btnProxima.onclick = nextRound;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
