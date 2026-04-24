(function () {
    'use strict';

    const titleMap = {
        informacoesPessoais: 'Informações pessoais',
        siteDaEmpresa: 'Site da empresa',
        experiencia: 'Experiência',
        experience: 'Experience',
        esperienza: 'Esperienza',
        informazioniPersonali: 'Informazioni personali',
        formacaoAcademica: 'Formação acadêmica',
        education: 'Education',
        formazioneAccademica: 'Formazione accademica',
        certificacoes: 'Certificações',
        certifications: 'Certifications',
        certificazioni: 'Certificazioni',
        idiomas: 'Idiomas',
        languages: 'Languages',
        lingue: 'Lingue',
        resumo: 'Resumo',
        summary: 'Summary',
        riepilogo: 'Riepilogo',
        principaisCompetencias: 'Principais competências',
        keySkills: 'Key skills',
        competenzePrincipali: 'Competenze principali',
        honrasEPremios: 'Honras e prêmios',
        onorificenzePremi: 'Onorificenze e premi',
        patenti: 'Patenti',
        proficiencia: 'Proficiência',
        posicao: 'Posição',
        posicoes: 'Posições',
        posizione: 'Posizione',
        posizioni: 'Posizioni',
        duracao: 'Duração',
        durata: 'Durata',
        localizacao: 'Localização',
        localita: 'Località',
        descricao: 'Descrição',
        descrizione: 'Descrizione',
        tecnologias: 'Tecnologias',
        tecnologie: 'Tecnologie',
        projetos: 'Projetos',
        progetti: 'Progetti',
        instituicao: 'Instituição',
        istituzione: 'Istituzione',
        titulo: 'Título',
        azienda: 'Azienda',
        nome: 'Nome',
        titolo: 'Titolo',
        periodo: 'Período',
        campo: 'Campo'
    };

    const ignoreKeys = new Set(['contato', 'contact']);

    function labelFromKey(key) {
        if (!key) {
            return '';
        }
        if (titleMap[key]) {
            return titleMap[key];
        }
        const normalized = String(key)
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderInlineValue(value) {
        const text = String(value).trim();

        if (/^https?:\/\//i.test(text)) {
            const safeUrl = escapeHtml(text);
            return `<a class="cv-inline-link" href="${safeUrl}" target="_blank" rel="noreferrer noopener">${safeUrl}</a>`;
        }

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
            const safeEmail = escapeHtml(text);
            return `<a class="cv-inline-link" href="mailto:${safeEmail}">${safeEmail}</a>`;
        }

        return escapeHtml(text);
    }

    function renderString(value) {
        const lines = String(value)
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length > 1) {
            return `<ul class="cv-list">${lines.map((line) => `<li class="cv-list-item">${renderInlineValue(line.replace(/^\-\s*/, ''))}</li>`).join('')}</ul>`;
        }

        return `<p class="cv-paragraph">${renderInlineValue(value)}</p>`;
    }

    function renderValue(value) {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return renderString(value);
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '';
            }

            const allPrimitives = value.every((item) => ['string', 'number', 'boolean'].includes(typeof item));
            if (allPrimitives) {
                return `<ul class="cv-list">${value.map((item) => `<li class="cv-list-item">${renderInlineValue(item)}</li>`).join('')}</ul>`;
            }

            return value
                .map((item) => `<article class="card cv-card">${renderObject(item)}</article>`)
                .join('');
        }

        if (typeof value === 'object') {
            return renderObject(value);
        }

        return '';
    }

    function renderObject(obj) {
        if (!obj || typeof obj !== 'object') {
            return '';
        }

        return Object.entries(obj)
            .filter(([key]) => !ignoreKeys.has(key))
            .map(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    return '';
                }

                const label = labelFromKey(key);
                const content = renderValue(value);

                if (!content) {
                    return '';
                }

                return `<section class="block cv-block"><h2 class="cv-section-title">${escapeHtml(label)}</h2>${content}</section>`;
            })
            .join('');
    }

    window.loadResumeAsHtml = async function loadResumeAsHtml(options) {
        const target = document.getElementById(options.targetId);
        if (!target) {
            return;
        }

        try {
            const response = await fetch(options.jsonPath, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Falha ao carregar ${options.jsonPath}`);
            }

            const data = await response.json();
            target.innerHTML = renderObject(data);
        } catch (error) {
            target.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
        }
    };
})();
