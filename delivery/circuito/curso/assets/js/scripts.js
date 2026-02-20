// ===================================
// Circuito Ferradura — Scripts JavaScript
// Palotina, 1993 · Cara Core Informática
// ===================================

// Virar flashcards (frente/verso)
function initFlashcards() {
    document.querySelectorAll('.flashcard').forEach(card => {
        card.addEventListener('click', function () { this.classList.toggle('flipped'); });
    });
}

// ── LGPD ────────────────────────────────────────────

function hasLGPDConsent() {
    return localStorage.getItem('lgpd_consent_ferradura') === 'accepted';
}

function checkLGPDConsent() {
    if (!hasLGPDConsent()) {
        console.warn('⚠️ Consentimento LGPD não fornecido (Circuito Ferradura).');
        return false;
    }
    return true;
}

// ── Checklist de progresso ───────────────────────────

function initChecklist() {
    if (!checkLGPDConsent()) {
        console.warn('⚠️ Progresso não será salvo: consentimento LGPD ausente.');
        return;
    }

    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const storageKey = 'circuito_ferradura_progress';
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

    checkboxes.forEach((cb, i) => {
        const id = cb.id || `cf-cb-${i}`;
        cb.id = id;
        if (saved[id]) cb.checked = true;

        cb.addEventListener('change', function () {
            if (!hasLGPDConsent()) {
                alert('⚠️ Para salvar o progresso, aceite o banner LGPD.');
                this.checked = !this.checked;
                return;
            }
            saved[id] = this.checked;
            localStorage.setItem(storageKey, JSON.stringify(saved));
            updateProgress();
        });
    });

    updateProgress();
}

function updateProgress() {
    const all = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const done = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
    const el = document.getElementById('progress-indicator');
    if (el && all.length > 0) {
        const pct = Math.round((done / all.length) * 100);
        el.innerHTML = `🏁 Progresso: ${done}/${all.length} (${pct}%)
            <div class="progress mt-2" style="height:8px;">
              <div class="progress-bar" role="progressbar"
                   style="width:${pct}%; background:var(--verde-pista);"
                   aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>`;
    }
}

// ── Certificado ──────────────────────────────────────

const INSTRUCTOR_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // "password"

async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function gerarCodigoCertificado(nome) {
    const base = nome.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4).padEnd(4, 'X');
    const num  = Math.floor(Math.random() * 90000000 + 10000000);
    return `CF-1993-${base}${num}`;
}

async function gerarCertificado(ev) {
    ev.preventDefault();
    const nome  = document.getElementById('student-name').value.trim();
    const data  = document.getElementById('completion-date').value;
    const senha = document.getElementById('admin-password').value;

    if (!nome) { alert('Por favor, informe o nome do aluno.'); return; }

    const hash = await sha256(senha);
    if (hash !== INSTRUCTOR_HASH) { alert('❌ Senha administrativa incorreta.'); return; }

    const codigo = gerarCodigoCertificado(nome);
    const dataFmt = data
        ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })
        : new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

    document.getElementById('cert-nome').textContent = nome;
    document.getElementById('cert-data').textContent = dataFmt;
    document.getElementById('cert-codigo').textContent = codigo;
    document.getElementById('form-certificado').classList.add('d-none');
    document.getElementById('certificado-gerado').classList.remove('d-none');
}

// ── Quiz / Mundo do Conhecimento ─────────────────────

function initQuiz() {
    const form = document.getElementById('quiz-form');
    if (!form) return;

    form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        let acertos = 0, total = 0;
        document.querySelectorAll('.quiz-question').forEach(q => {
            total++;
            const correta = q.dataset.answer;
            const selecionada = q.querySelector('input[type=radio]:checked');
            const feedback = q.querySelector('.quiz-feedback');
            if (selecionada && selecionada.value === correta) {
                acertos++;
                if (feedback) { feedback.textContent = '✅ Correto!'; feedback.className = 'quiz-feedback text-success fw-bold'; }
            } else {
                if (feedback) {
                    const textoCorreta = q.querySelector(`input[value="${correta}"]`);
                    const label = textoCorreta ? textoCorreta.nextElementSibling?.textContent : correta;
                    feedback.textContent = `❌ Incorreto. Resposta: ${label || correta}`;
                    feedback.className = 'quiz-feedback text-danger fw-bold';
                }
            }
        });
        const resultado = document.getElementById('quiz-resultado');
        if (resultado) {
            const pct = Math.round((acertos / total) * 100);
            resultado.innerHTML = `<strong>🏁 Resultado: ${acertos}/${total} (${pct}%)</strong><br>
                ${pct >= 70 ? '🎉 Aprovado! Parabéns, piloto!' : '📚 Continue estudando. A pista de Palotina exige prática!'}`;
            resultado.className = `alert mt-3 ${pct >= 70 ? 'alert-success' : 'alert-warning'}`;
            resultado.classList.remove('d-none');
        }
    });
}

// ── Inicialização ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    initFlashcards();
    initChecklist();
    initQuiz();

    const certForm = document.getElementById('certificate-form');
    if (certForm) certForm.addEventListener('submit', gerarCertificado);

    // LGPD banner
    if (!localStorage.getItem('lgpd_consent_ferradura')) {
        const banner = document.getElementById('lgpd-banner');
        if (banner) banner.classList.remove('d-none');
    }

    document.getElementById('lgpd-accept')?.addEventListener('click', () => {
        localStorage.setItem('lgpd_consent_ferradura', 'accepted');
        localStorage.setItem('lgpd_consent_ferradura_date', new Date().toISOString());
        document.getElementById('lgpd-banner')?.classList.add('d-none');
    });

    document.getElementById('lgpd-deny')?.addEventListener('click', () => {
        localStorage.setItem('lgpd_consent_ferradura', 'denied');
        localStorage.removeItem('circuito_ferradura_progress');
        document.getElementById('lgpd-banner')?.classList.add('d-none');
        alert('Você optou por não salvar dados. O progresso não será registrado.');
    });
});
