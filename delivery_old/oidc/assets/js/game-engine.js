/**
 * Reino OIDC — Motor de Eras (Níveis de Consciência)
 * Progressão por prompt_eras_historia.txt: Era 1 → 2 → 3 (Devia = nosso presente).
 * Sincronizado com historia_p1, historia_p2, historia_p3 e Premium (Era 3).
 */
(function () {
    'use strict';

    const STORAGE_STORY_P1 = 'reino_oidc_story_part_1_done';
    const STORAGE_STORY_P2 = 'reino_oidc_story_part_2_done';
    const STORAGE_STORY_P3 = 'reino_oidc_story_part_3_done';
    const STORAGE_ELITE = 'reino_oidc_elite_unlocked';

    /** Eras (Níveis de Consciência) — alinhado a prompt_eras_historia.txt */
    const ERAS = {
        1: {
            id: 1,
            title: 'O Caos dos Silos',
            subtitle: 'Era das Senhas',
            theme: 'parchment',       /* Interface rústica (pergaminho) */
            goal: 'Entender a delegação',
            storyPage: 'historia_p1.html'
        },
        2: {
            id: 2,
            title: 'A Ordem da Identidade',
            subtitle: 'Era da Confiança',
            theme: 'silver',          /* Detalhes em prata; conceito ID Token */
            goal: 'ID Token e autenticação',
            storyPage: 'historia_p2.html'
        },
        3: {
            id: 3,
            title: 'O Presente Soberano',
            subtitle: 'Nova Era Digital',
            theme: 'gothic-cyber',   /* Ápice Gótico/Cibernético — Roxo e Ouro */
            goal: 'Integrar e dominar APIs',
            storyPage: 'historia_p3.html',
            requiresPremium: true
        }
    };

    /** Em qual Era cada personagem 'despertou' (id do personagem → era) */
    const CHARACTER_ERA = {
        'lady-oauth': 1,
        'lord-oidc': 2,
        'alex-client': 2,
        'pixie-pkce': 2,
        'ida-token': 2,
        'rex-token': 2,
        'ace-token': 3,
        'seraph-resource': 3,
        'devia': 3
    };

    /** IDs que desbloqueiam por era (para filtro no deck) */
    const ERA_CHARACTER_IDS = {
        1: ['lady-oauth'],
        2: ['lord-oidc', 'alex-client', 'pixie-pkce', 'ida-token', 'rex-token'],
        3: ['ace-token', 'seraph-resource', 'devia']
    };

    /**
     * Contos das Eras — textos para overlay de transição.
     * Título = tipografia gótica (antigo); texto técnico = sem-serifa moderna (futuro).
     */
    const NARRATIVA_ERAS = {
        1: {
            titulo: 'O Caos dos Silos',
            subtitulo: 'Era das Senhas',
            textoTecnico: 'Lady OAuth traz a delegação: as senhas permanecem com seus donos. OAuth 2.0/2.1 introduz tokens de autorização, escopos e o Authorization Server. O reino deixa de depender de senhas compartilhadas.'
        },
        2: {
            titulo: 'A Ordem da Identidade',
            subtitulo: 'Era da Confiança',
            textoTecnico: 'Lord OIDC assina a identidade com o ID Token (JWT). Autenticação e autorização unem-se: OpenID Connect sobre OAuth. PKCE, Rex Token (refresh) e IDA Token entram em cena. Quem você é e o que pode fazer passam a ser verificáveis.'
        },
        3: {
            titulo: 'O Presente Soberano',
            subtitulo: 'Nova Era Digital',
            textoTecnico: 'Devia integra todos os personagens no código. Seraph Resource valida tokens e protege as APIs. Access Token (Ace), ID Token (IDA) e Refresh (Rex) em harmonia. O futuro é o presente: OAuth 2.1 + OIDC em produção.'
        }
    };

    /** Foco Técnico por era — subtítulo discreto no rodapé de cada carta daquela era. */
    const FOCO_TECNICO_ERAS = {
        1: 'Foco: Delegação (OAuth 2.1)',
        2: 'Foco: ID Token · Autenticação',
        3: 'Foco: APIs · Integração'
    };

    function getNarrativaEra(era) {
        return NARRATIVA_ERAS[era] || NARRATIVA_ERAS[1];
    }

    function getFocoTecnicoEra(era) {
        return FOCO_TECNICO_ERAS[era] || FOCO_TECNICO_ERAS[1];
    }

    function getStoryPartDone(part) {
        try {
            var key = part === 1 ? STORAGE_STORY_P1 : part === 2 ? STORAGE_STORY_P2 : STORAGE_STORY_P3;
            return localStorage.getItem(key) === 'true' || localStorage.getItem(key) === '1';
        } catch (e) {
            return false;
        }
    }

    function setStoryPartDone(part) {
        try {
            var key = part === 1 ? STORAGE_STORY_P1 : part === 2 ? STORAGE_STORY_P2 : STORAGE_STORY_P3;
            localStorage.setItem(key, 'true');
            return true;
        } catch (e) {
            return false;
        }
    }

    function isPremium() {
        try {
            if (typeof window.isPremium === 'function' && window.isPremium()) return true;
            return localStorage.getItem(STORAGE_ELITE) === 'true' || localStorage.getItem(STORAGE_ELITE) === '1';
        } catch (e) {
            return false;
        }
    }

    /** Retorna a era máxima desbloqueada (1, 2 ou 3). */
    function getCurrentEra() {
        if (getStoryPartDone(1) && getStoryPartDone(2) && isPremium()) return 3;
        if (getStoryPartDone(1)) return 2;
        return 1;
    }

    /** Indica se uma era específica está desbloqueada para jogar. */
    function isEraUnlocked(era) {
        var current = getCurrentEra();
        if (era <= current) return true;
        if (era === 2) return getStoryPartDone(1);
        if (era === 3) return getStoryPartDone(1) && getStoryPartDone(2) && isPremium();
        return false;
    }

    /** Lista de IDs de personagens disponíveis no deck segundo a era atual. Era 3 só entra com Premium. */
    function getUnlockedCharacterIds() {
        var era = getCurrentEra();
        var ids = [];
        for (var e = 1; e <= era; e++) {
            if (e < 3) ids = ids.concat(ERA_CHARACTER_IDS[e] || []);
            else if (e === 3 && isPremium()) ids = ids.concat(ERA_CHARACTER_IDS[3] || []);
        }
        return ids;
    }

    /** Retorna a era em que o personagem despertou (para exibir na carta). */
    function getCharacterEra(characterId) {
        return CHARACTER_ERA[characterId] || 1;
    }

    /** Texto de transição ao desbloquear Devia (Era 3). */
    function getDeviaTransitionText() {
        return 'O futuro chegou. Você é Devia. O Reino OIDC agora é o seu código.';
    }

    /** Devia é a Integradora Suprema (única que usa o poder de todos). */
    function isIntegradoraSuprema(characterId) {
        return characterId === 'devia';
    }

    /** Estado da linha do tempo: quais partes da história estão completas (para brilho). */
    function getTimelineState() {
        return {
            part1: getStoryPartDone(1),
            part2: getStoryPartDone(2),
            part3: getStoryPartDone(3)
        };
    }

    /** API pública no window para uso em super-trunfo e páginas de história */
    window.ReinoEras = {
        ERAS: ERAS,
        NARRATIVA_ERAS: NARRATIVA_ERAS,
        FOCO_TECNICO_ERAS: FOCO_TECNICO_ERAS,
        CHARACTER_ERA: CHARACTER_ERA,
        ERA_CHARACTER_IDS: ERA_CHARACTER_IDS,
        getCurrentEra: getCurrentEra,
        getNarrativaEra: getNarrativaEra,
        getFocoTecnicoEra: getFocoTecnicoEra,
        isEraUnlocked: isEraUnlocked,
        getUnlockedCharacterIds: getUnlockedCharacterIds,
        getCharacterEra: getCharacterEra,
        getStoryPartDone: getStoryPartDone,
        setStoryPartDone: setStoryPartDone,
        isPremium: isPremium,
        getDeviaTransitionText: getDeviaTransitionText,
        isIntegradoraSuprema: isIntegradoraSuprema,
        getTimelineState: getTimelineState
    };
})();
