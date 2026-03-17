document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing script...');

    const DATA_VERSION = '20260315-render-order-fix';

    const langSwitcher = document.querySelector('.lang-switcher');
    let currentTranslations = {}; // Variável para guardar as traduções atuais

    const mojibakePattern = /(?:Ã.|Â.|â.|¤|€|™|œ|ž|Ÿ)/;

    const repairMojibakeString = (value) => {
        if (typeof value !== 'string' || !mojibakePattern.test(value)) {
            return value;
        }

        try {
            const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
            const repaired = new TextDecoder('utf-8').decode(bytes);

            // Keep the original when the transformation clearly degrades the text.
            if (!repaired || repaired.includes('\ufffd')) {
                return value;
            }

            return repaired;
        } catch (error) {
            console.warn('Unable to repair mojibake string:', error);
            return value;
        }
    };

    const normalizeEncoding = (value) => {
        if (Array.isArray(value)) {
            return value.map(normalizeEncoding);
        }

        if (value && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([key, nestedValue]) => [
                    repairMojibakeString(key),
                    normalizeEncoding(nestedValue)
                ])
            );
        }

        return repairMojibakeString(value);
    };

    const personalTermsPattern = /\b(christian|mulato|guilherme)\b/gi;

    const institutionalizeText = (value) => {
        if (typeof value !== 'string') {
            return value;
        }

        let safeValue = value.replace(personalTermsPattern, 'Equipe Cara Core');
        safeValue = safeValue.replace(/di\s+[a-z\s'-]+/gi, 'dados institucionalizados');
        return safeValue;
    };

    const institutionalizeProfileData = (value) => {
        if (Array.isArray(value)) {
            return value.map(institutionalizeProfileData);
        }

        if (value && typeof value === 'object') {
            const normalized = Object.fromEntries(
                Object.entries(value).map(([key, nestedValue]) => [key, institutionalizeProfileData(nestedValue)])
            );

            if (normalized.informacoesPessoais && typeof normalized.informacoesPessoais === 'object') {
                normalized.informacoesPessoais.nome = 'Avatar Institucional Cara Core';
            }

            if (normalized.personalInfo && typeof normalized.personalInfo === 'object') {
                normalized.personalInfo.name = 'Cara Core Institutional Avatar';
            }

            if (normalized.informazioniPersonali && typeof normalized.informazioniPersonali === 'object') {
                normalized.informazioniPersonali.nome = 'Avatar Istituzionale Cara Core';
            }

            return normalized;
        }

        return institutionalizeText(value);
    };

    // --- Lógica do Modal ---
    const noticeModal = document.getElementById("noticeModal");
    const fullResumeModal = document.getElementById("fullResumeModal");
    const closeNoticeModalBtn = document.getElementById("closeNoticeModal");
    const closeModalResumeBtn = document.getElementById("closeFullResumeModal");
    const closeFullResumeFooterBtn = document.getElementById("closeFullResumeFooterBtn");
    const showFullResumeBtn = document.getElementById("show-full-resume");
    const continueButton = document.getElementById("continueButton");
    const consentCheckbox = document.getElementById("consentCheckbox");
    const experienceContent = document.getElementById("experience-content");
    const fullResumeContent = document.getElementById("full-resume-content");

    const safeGtag = (...args) => {
        if (typeof window.gtag === 'function') {
            window.gtag(...args);
        }
    };

    const applyCvAnalyticsGuard = (granted) => {
        safeGtag('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: granted ? 'granted' : 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
        });

        safeGtag('set', 'allow_google_signals', false);
        safeGtag('set', 'allow_ad_personalization_signals', false);
    };

    const trackFullResumeAccess = () => {
        safeGtag('event', 'cv_full_resume_access', {
            event_category: 'cv_security',
            event_label: 'institutional_avatar',
            access_scope: 'aggregated',
            interface_lang: document.documentElement.lang || 'pt',
            non_interaction: true
        });
    };

    // Default seguro: sem analytics para o currículo completo até consentimento explícito.
    applyCvAnalyticsGuard(false);

    // Create skill modal dynamically
    let skillModal;
    function createSkillModal() {
        if (!skillModal) {
            skillModal = document.createElement('div');
            skillModal.id = 'skillModal';
            skillModal.className = 'modal';
            skillModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn" id="closeSkillModal">&times;</span>
                    <h3 id="skillModalTitle"></h3>
                    <p id="skillModalDescription"></p>
                </div>
            `;
            document.body.appendChild(skillModal);

            // Add event listener for close button
            const closeSkillModalBtn = document.getElementById("closeSkillModal");
            closeSkillModalBtn.addEventListener('click', () => closeModal(skillModal));
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target == skillModal) {
                    closeModal(skillModal);
                }
            });
        }
        return skillModal;
    }

    function showSkillModal(skillName, skillDescription) {
        console.log('Creating skill modal for:', skillName);
        const modal = createSkillModal();
        document.getElementById("skillModalTitle").textContent = skillName;
        document.getElementById("skillModalDescription").textContent = skillDescription;
        console.log('Opening skill modal');
        openModal(modal);
    }

    consentCheckbox.addEventListener('change', () => {
        continueButton.disabled = !consentCheckbox.checked;
    });

    const openModal = (modal) => {
        modal.style.display = "block";
    };

    const closeModal = (modal) => {
        modal.style.display = "none";
    };

    showFullResumeBtn.addEventListener('click', () => openModal(noticeModal));
    closeNoticeModalBtn.addEventListener('click', () => closeModal(noticeModal));
    closeModalResumeBtn.addEventListener('click', () => closeModal(fullResumeModal));
    closeFullResumeFooterBtn.addEventListener('click', () => closeModal(fullResumeModal));

    window.addEventListener('click', (e) => {
        if (e.target == noticeModal) {
            closeModal(noticeModal);
        }
        if (e.target == fullResumeModal) {
            closeModal(fullResumeModal);
        }
    });

    continueButton.addEventListener('click', async () => {
        closeModal(noticeModal);
        applyCvAnalyticsGuard(true);
        trackFullResumeAccess();

        // Só carrega o currículo completo do arquivo profile_full.json
        fullResumeContent.innerHTML = '<p>Carregando currículo completo...</p>';
        openModal(fullResumeModal);
        try {
            const response = await fetch(`json/profile_full.json?v=${DATA_VERSION}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const profileData = institutionalizeProfileData(normalizeEncoding(await response.json()));
            // Usa a função de conversão correta para o perfil completo
            const htmlContent = convertFullProfileJsonToHtml(profileData);
            fullResumeContent.innerHTML = htmlContent;
        } catch (error) {
            fullResumeContent.innerHTML = '<p>Erro ao carregar o currículo: ' + error.message + '</p>';
        } finally {
            // Reforça privacidade: encerra analytics_storage após o registro agregado.
            setTimeout(() => applyCvAnalyticsGuard(false), 1500);
        }
    });

    const load8YearResume = async (lang) => {
        console.log(`Attempting to load 8-year resume from JSON for ${lang}...`);
        try {
            const response = await fetch(`json/resume_last_8_years_${lang}.json?v=${DATA_VERSION}`);
            if (!response.ok) {
                throw new Error(`Could not load resume_last_8_years_${lang}.json`);
            }
            const resumeData = normalizeEncoding(await response.json());
            
            // Convert JSON data to HTML
            const htmlContent = convertResumeJsonToHtml(resumeData);
            experienceContent.innerHTML = htmlContent;
            console.log('8-year resume loaded successfully from JSON.');
        } catch (error) {
            console.error('Failed to load 8-year resume from JSON. Error:', error);
            let errorMessage = 'Erro ao carregar as experiências.';
            if (error instanceof SyntaxError) {
                errorMessage += ' (Erro de sintaxe no arquivo JSON)';
            } else if (error instanceof TypeError) {
                errorMessage += ' (Erro de tipo, possivelmente rede)';
            }
            experienceContent.innerHTML = `<p>${errorMessage}</p><p>Detalhes: ${error.message}</p>`;
        }
    };

    const loadTranslations = async (lang) => {
        console.log(`Loading translations for ${lang}...`);
        try {
            const response = await fetch(`lang/${lang}.json?v=${DATA_VERSION}`);
            if (!response.ok) {
                throw new Error(`Could not load ${lang}.json`);
            }
            const translations = normalizeEncoding(await response.json());
            currentTranslations = translations;
            
            document.querySelectorAll('[data-key]').forEach(elem => {
                const key = elem.getAttribute('data-key');
                if (translations[key]) {
                    elem.innerHTML = translations[key];
                }
            });

            const skillsListUL = document.querySelector(".skills-list");
            skillsListUL.innerHTML = ''; 
            if (translations.skillsList) {
                translations.skillsList.forEach(skill => {
                    const li = document.createElement('li');
                    li.textContent = skill;
                    li.classList.add('skill-item');
                    li.style.cursor = 'pointer';
                    li.addEventListener('click', () => {
                        console.log('Skill clicked:', skill);
                        if (translations.skills && translations.skills[skill]) {
                            console.log('Showing modal for:', skill);
                            showSkillModal(skill, translations.skills[skill]);
                        } else {
                            console.log('No description found for skill:', skill);
                        }
                    });
                    skillsListUL.appendChild(li);
                });
            }

            document.title = translations.pageTitle;
            document.documentElement.lang = lang;
            
            // Show/hide full resume button based on language (only available in Portuguese)
            const fullResumeContainer = document.querySelector('.full-resume-container');
            if (fullResumeContainer) {
                fullResumeContainer.style.display = (lang === 'pt') ? 'block' : 'none';
            }
            
            console.log('Translations loaded successfully.');

            // Load 8-year resume based on selected language
            load8YearResume(lang);

        } catch (error) {
            console.error('Failed to load translations:', error);
        }
    };

    const allowedLangs = new Set(['pt', 'en', 'it']);

    const resolveInitialLanguage = () => {
        const qsLang = new URLSearchParams(window.location.search).get('lang');
        if (qsLang && allowedLangs.has(qsLang.toLowerCase())) {
            return qsLang.toLowerCase();
        }

        const htmlLang = (document.documentElement.lang || '').toLowerCase();
        if (allowedLangs.has(htmlLang)) {
            return htmlLang;
        }
        if (htmlLang.startsWith('pt')) return 'pt';
        if (htmlLang.startsWith('en')) return 'en';
        if (htmlLang.startsWith('it')) return 'it';

        return 'pt';
    };

    if (langSwitcher) {
        langSwitcher.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            if (lang && allowedLangs.has(lang)) {
                loadTranslations(lang);
            }
        });
    }

    // Initial load
    loadTranslations(resolveInitialLanguage());

    const extractYear = (value) => {
        const match = (value || '').match(/(19|20)\d{2}/);
        return match ? parseInt(match[0], 10) : null;
    };

    const splitPeriod = (period) => {
        const raw = (period || '').trim();
        const parts = raw.split('-');
        const start = (parts[0] || '').trim();
        const endRaw = parts.slice(1).join('-').trim();
        const end = (endRaw.split('(')[0] || '').trim();
        return { start, end };
    };

    const isChronological = (start, end) => {
        if (!start || !end) {
            return false;
        }
        const startYear = extractYear(start);
        const endYear = extractYear(end);
        if (startYear === null || endYear === null) {
            return true;
        }
        return startYear <= endYear;
    };

    const yearSpan = (start, end) => {
        const startYear = extractYear(start);
        const endYear = extractYear(end);
        if (startYear === null || endYear === null) {
            return 0;
        }
        return endYear - startYear;
    };

    const getPositionPeriod = (position) => position?.duracao || position?.duration || position?.durata || '';

    const buildCombinedPeriodLabel = (positions) => {
        if (!positions || positions.length === 0) {
            return '';
        }

        const firstPeriod = getPositionPeriod(positions[0]);
        const lastPeriod = getPositionPeriod(positions[positions.length - 1]);

        if (!firstPeriod && !lastPeriod) {
            return '';
        }
        if (!firstPeriod || !lastPeriod || firstPeriod === lastPeriod) {
            return firstPeriod || lastPeriod;
        }

        const firstRange = splitPeriod(firstPeriod);
        const lastRange = splitPeriod(lastPeriod);

        const forward = {
            start: firstRange.start,
            end: lastRange.end
        };

        const reverse = {
            start: lastRange.start,
            end: firstRange.end
        };

        const forwardValid = isChronological(forward.start, forward.end);
        const reverseValid = isChronological(reverse.start, reverse.end);

        if (forwardValid && reverseValid) {
            return yearSpan(reverse.start, reverse.end) > yearSpan(forward.start, forward.end)
                ? `${reverse.start} - ${reverse.end}`
                : `${forward.start} - ${forward.end}`;
        }

        if (reverseValid) {
            return `${reverse.start} - ${reverse.end}`;
        }

        if (forwardValid) {
            return `${forward.start} - ${forward.end}`;
        }

        return `${firstPeriod} / ${lastPeriod}`;
    };

    // Function to convert 8-year resume JSON to HTML
    function convertResumeJsonToHtml(data) {
        let html = '<div class="resume-content">';
        
        // Support different language structures
        const experienceData = data.experiencia || data.experience || data.esperienza || [];
        
        // Experience section
        if (experienceData && experienceData.length > 0) {
            experienceData.forEach(exp => {
                html += '<div class="job-item">';
                
                // Support different field names based on language
                const position = exp.posicao || exp.position || exp.posizione || '';
                const company = exp.empresa || exp.company || exp.azienda || '';
                const duration = exp.duracao || exp.duration || exp.durata || '';
                const description = exp.descricao || exp.description || exp.descrizione || '';
                const technologies = exp.tecnologias || exp.technologies || exp.tecnologie || [];
                const projects = exp.projetos || exp.projects || exp.progetti || [];
                const positions = exp.posicoes || exp.positions || exp.posizioni || [];
                
                // Handle entries that only have company and positions (like Wipro)
                if (positions && positions.length > 0 && !position) {
                    const periodLabel = buildCombinedPeriodLabel(positions);
                    html += `<h4>${company ? company : ''}</h4>`;
                    if (periodLabel && periodLabel.trim() !== '') {
                        html += `<div class="details">${periodLabel}</div>`;
                    }
                    positions.forEach(pos => {
                        html += '<div class="sub-position">';
                        const subPosition = pos.posicao || pos.position || pos.posizione || '';
                        const subDuration = pos.duracao || pos.duration || pos.durata || '';
                        const subDescription = pos.descricao || pos.description || pos.descrizione || '';
                        const subTechnologies = pos.tecnologias || pos.technologies || pos.tecnologie || [];
                        if (subPosition && subPosition !== 'undefined') {
                            html += `<h5>${subPosition}</h5>`;
                        }
                        if (subDuration && subDuration !== 'undefined') {
                            html += `<div class="details">${subDuration}</div>`;
                        }
                        if (subDescription && subDescription !== 'undefined') {
                            html += `<p>${subDescription}</p>`;
                        }
                        if (subTechnologies && subTechnologies.length > 0) {
                            const techLabel = pos.tecnologias ? 'Tecnologias:' : 
                                            pos.technologies ? 'Technologies:' : 
                                            pos.tecnologie ? 'Tecnologie:' :
                                            'Technologies:';
                            html += `<div class="technologies"><strong>${techLabel}</strong> `;
                            html += subTechnologies.join(', ');
                            html += '</div>';
                        }
                        html += '</div>';
                    });
                } else {
                    // Regular entry with position, company, duration, etc.
                    html += `<h4>${position}</h4>`;
                    html += `<div class="details">${company} | ${duration}</div>`;
                    html += `<p>${description}</p>`;
                    
                    if (technologies && technologies.length > 0) {
                        const techLabel = exp.tecnologias ? 'Tecnologias:' : 
                                        exp.technologies ? 'Technologies:' : 
                                        exp.tecnologie ? 'Tecnologie:' :
                                        'Technologies:';
                        html += `<div class="technologies"><strong>${techLabel}</strong> `;
                        html += technologies.join(', ');
                        html += '</div>';
                    }
                    
                    if (projects && projects.length > 0) {
                        const projLabel = exp.projetos ? 'Projetos:' :
                                         exp.projects ? 'Projects:' :
                                         exp.progetti ? 'Progetti:' :
                                         'Projects:';
                        html += `<div class="projects"><strong>${projLabel}</strong>`;
                        projects.forEach(proj => {
                            const projectName = proj.nome || proj.name || '';
                            const projectUrl = proj.url || '';
                            html += `<br>• <a href="${projectUrl}" target="_blank">${projectName}</a>`;
                        });
                        html += '</div>';
                    }
                    
                    if (positions && positions.length > 0) {
                        positions.forEach(pos => {
                            html += '<div class="sub-position">';
                            const subPosition = pos.posicao || pos.position || pos.posizione || '';
                            const subDuration = pos.duracao || pos.duration || pos.durata || '';
                            const subDescription = pos.descricao || pos.description || pos.descrizione || '';
                            const subTechnologies = pos.tecnologias || pos.technologies || pos.tecnologie || [];
                            
                            html += `<h5>${subPosition}</h5>`;
                            html += `<div class="details">${subDuration}</div>`;
                            html += `<p>${subDescription}</p>`;
                            if (subTechnologies && subTechnologies.length > 0) {
                                const techLabel = pos.tecnologias ? 'Tecnologias:' : 
                                                pos.technologies ? 'Technologies:' : 
                                                pos.tecnologie ? 'Tecnologie:' :
                                                'Technologies:';
                                html += `<div class="technologies"><strong>${techLabel}</strong> `;
                                html += subTechnologies.join(', ');
                                html += '</div>';
                            }
                            html += '</div>';
                        });
                    }
                }
                
                html += '</div>';
            });
        }
        
        html += '</div>';
        return html;
    }

    // Function to convert full profile JSON to HTML
    function convertFullProfileJsonToHtml(data) {
        console.log('Starting conversion to HTML...');
        let html = '<div class="full-profile-content">';
        
        try {
            // Personal Information
            console.log('Processing personal info...');
            html += '<div class="personal-info">';
            const publicAvatarName = data.informacoesPessoais?.nome || 'Avatar Institucional Cara Core';
            html += `<h2>${publicAvatarName}</h2>`;
            html += `<h3>${data.informacoesPessoais.titulo}</h3>`;
            html += `<p><strong>Localização:</strong> Remoto | on-site sob demanda</p>`;
            
            // Contact info
            html += '<div class="contact-details">';
            html += `<p><strong>Email:</strong> suporte@caracore.com.br</p>`;
            html += `<p><strong>Website:</strong> <a href="https://www.caracore.com.br" target="_blank">https://www.caracore.com.br</a></p>`;
            html += '</div>';
            html += '</div>';
            
            // Summary
            console.log('Processing summary...');
            html += '<div class="summary-section">';
            html += '<h3>Resumo Profissional</h3>';
            html += `<p>${data.resumo}</p>`;
            html += '</div>';
            
            // Languages
            console.log('Processing languages...');
            if (data.idiomas && data.idiomas.length > 0) {
                html += '<div class="languages-section">';
                html += '<h3>Idiomas</h3>';
                html += '<ul>';
                data.idiomas.forEach(idioma => {
                    html += `<li><strong>${idioma.idioma}:</strong> ${idioma.proficiencia}</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            // Certifications
            console.log('Processing certifications...');
            if (data.certificacoes && data.certificacoes.length > 0) {
                html += '<div class="certifications-section">';
                html += '<h3>Certificações</h3>';
                html += '<ul>';
                data.certificacoes.forEach(cert => {
                    html += `<li>${cert}</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            // Experience
            console.log('Processing experience...');
            if (data.experiencia && data.experiencia.length > 0) {
                html += '<div class="experience-section">';
                html += '<h3>Experiência Profissional Completa</h3>';
                
                data.experiencia.forEach(exp => {
                    html += '<div class="job-item">';

                    // Logic from convertResumeJsonToHtml to handle different structures
                    const position = exp.posicao || '';
                    const company = exp.empresa || '';
                    const positions = exp.posicoes || [];

                    if (positions.length > 0 && !position) {
                        // Wipro-like entry
                        const periodLabel = buildCombinedPeriodLabel(positions);
                        html += `<h4>${company}</h4>`;
                        if (periodLabel) {
                            html += `<div class="details">${periodLabel}</div>`;
                        }
                        positions.forEach(pos => {
                            html += '<div class="sub-position">';
                            html += `<h5>${pos.posicao}</h5>`;
                            html += `<div class="details">${pos.duracao}</div>`;
                            if (pos.localizacao) {
                                html += `<div class="location">${pos.localizacao}</div>`;
                            }
                            html += `<p>${pos.descricao}</p>`;
                            if (pos.tecnologias && pos.tecnologias.length > 0) {
                                html += '<div class="technologies"><strong>Tecnologias:</strong> ';
                                html += pos.tecnologias.join(', ');
                                html += '</div>';
                            }
                            html += '</div>';
                        });
                    } else {
                        // Regular entry
                        html += `<h4>${exp.posicao}</h4>`;
                        html += `<div class="details">${exp.empresa} | ${exp.duracao}</div>`;
                        if (exp.localizacao) {
                            html += `<div class="location">${exp.localizacao}</div>`;
                        }
                        html += `<p>${exp.descricao}</p>`;
                        
                        if (exp.tecnologias && exp.tecnologias.length > 0) {
                            html += '<div class="technologies"><strong>Tecnologias:</strong> ';
                            html += exp.tecnologias.join(', ');
                            html += '</div>';
                        }
                        
                        if (exp.projetos && exp.projetos.length > 0) {
                            html += '<div class="projects"><strong>Projetos:</strong>';
                            exp.projetos.forEach(proj => {
                                html += `<br>• <a href="${proj.url}" target="_blank">${proj.nome}</a>`;
                            });
                            html += '</div>';
                        }
                    }
                    
                    html += '</div>';
                });
                html += '</div>';
            }
            
            // Education
            console.log('Processing education...');
            if (data.formacaoAcademica && data.formacaoAcademica.length > 0) {
                html += '<div class="education-section">';
                html += '<h3>Formação Acadêmica</h3>';
                
                data.formacaoAcademica.forEach(edu => {
                    html += '<div class="education-item">';
                    html += `<h4>${edu.titulo}</h4>`;
                    html += `<div class="details">${edu.instituicao} | ${edu.periodo}</div>`;
                    if (edu.campo) {
                        html += `<div class="field">${edu.campo}</div>`;
                    }
                    html += '</div>';
                });
                html += '</div>';
            }
            
            html += '</div>';
            console.log('HTML conversion completed successfully');
            return html;
        } catch (error) {
            console.error('Error in convertFullProfileJsonToHtml:', error);
            return '<p>Erro ao processar dados do currículo: ' + error.message + '</p>';
        }
    }
});