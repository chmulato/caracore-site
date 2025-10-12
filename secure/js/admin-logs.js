// admin-logs.js - Centralizado do script de gerenciamento de logs
let allLogs = [];
let filteredLogs = [];
const VERIFICATION_STORAGE_KEY = 'cara_core_oidc_uri_verifications_v1';
let currentVerificationEntries = [];
let lastVerificationContext = { google: null, microsoft: null, origin: window.location.origin };

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    refreshLogs();
    loadServerLogFiles();

    const reloadFilesBtn = document.getElementById('btnReloadLogFiles');
    if (reloadFilesBtn) {
        reloadFilesBtn.addEventListener('click', function() {
            loadServerLogFiles();
        });
    }

    const exportVerificationBtn = document.getElementById('btnExportVerificationLog');
    if (exportVerificationBtn) {
        exportVerificationBtn.addEventListener('click', exportVerificationRecords);
    }

    const clearVerificationBtn = document.getElementById('btnClearVerificationLog');
    if (clearVerificationBtn) {
        clearVerificationBtn.addEventListener('click', clearVerificationRecords);
    }
    
    // Auto-refresh a cada 30 segundos
    setInterval(refreshLogs, 30000);
});

function refreshLogs() {
    if (!window.OIDCLogger) {
        document.getElementById('logs-container').innerHTML = 
            '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> Sistema de logging não encontrado</div>';
        return;
    }

    // Use snapshot() when available for richer context
    let snapshot = null;
    try {
        if (typeof window.OIDCLogger.snapshot === 'function') snapshot = window.OIDCLogger.snapshot();
    } catch (e) {
        console.warn('snapshot() failed', e);
    }

    // If snapshot available, render session and client context
    if (snapshot) {
        renderSessionInfo(snapshot);
        renderSummary(snapshot.summary || {});
    }

        // Try to obtain provider configs to show exact client IDs and redirect URIs
        try {
            if (typeof window.getProviderConfig === 'function') {
                Promise.all([
                    window.getProviderConfig('google').catch(() => null),
                    window.getProviderConfig('microsoft').catch(() => null)
                ]).then(([googleConfig, microsoftConfig]) => {
                    renderProviderInstructions(googleConfig, microsoftConfig, snapshot);
                }).catch(e => {
                    console && console.warn && console.warn('Falha ao obter provider configs', e);
                });
            } else {
                renderProviderInstructions(null, null, snapshot);
            }
        } catch (e) {
            console && console.warn && console.warn('Erro ao buscar provider configs', e);
        }

    // If no in-memory logs, try to load persisted logs
    try {
        if ((!window.OIDCLogger.logs || window.OIDCLogger.logs.length === 0) && typeof window.OIDCLogger.loadFromLocalStorage === 'function') {
            const saved = window.OIDCLogger.loadFromLocalStorage();
            if (Array.isArray(saved) && saved.length) {
                window.OIDCLogger.logs = (window.OIDCLogger.logs || []).concat(saved);
            }
        }
    } catch (e) {
        console && console.warn && console.warn('Falha ao carregar logs persistidos:', e);
    }

    // Populate allLogs
    allLogs = window.OIDCLogger.logs || [];

    // Wire small buttons
    document.getElementById('btnCopyUris').onclick = () => copyRecommendedUris(snapshot && snapshot.clientContext ? snapshot.clientContext : null);
    document.getElementById('btnExportJsonSmall').onclick = () => { if (window.logOIDC && window.logOIDC.export) window.logOIDC.export('json'); };
    document.getElementById('btnReloadSmall').onclick = () => location.reload();

    // Apply filters
    const summary = window.OIDCLogger.getLogsSummary();
    updateStats(summary);
    updateSessionInfo(summary);
    filterLogs();
}

function updateStats(summary) {
    document.getElementById('error-count').textContent = summary.levels.ERROR || 0;
    document.getElementById('warn-count').textContent = summary.levels.WARN || 0;
    document.getElementById('info-count').textContent = summary.levels.INFO || 0;
    document.getElementById('total-count').textContent = summary.totalLogs || 0;
}

function updateSessionInfo(summary) {
    // Keep legacy fields updated (if present in the page)
    const sid = summary.sessionId || (window.OIDCLogger && window.OIDCLogger.sessionId) || '-';
    const prov = summary.provider || (window.OIDCLogger && window.OIDCLogger.getCurrentProvider && window.OIDCLogger.getCurrentProvider()) || '-';
    const elSid = document.getElementById('session-id');
    const elProv = document.getElementById('current-provider');
    const elDur = document.getElementById('session-duration');
    if (elSid) elSid.textContent = sid;
    if (elProv) elProv.textContent = prov;

    if (summary.duration) {
        const minutes = Math.floor(summary.duration / 60000);
        const seconds = Math.floor((summary.duration % 60000) / 1000);
        if (elDur) elDur.textContent = `${minutes}m ${seconds}s`;
    }
}

// Render session snapshot and client context into the top card
function renderSessionInfo(snapshot) {
    const el = document.getElementById('sessionInfo');
    el.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'mb-2';
    p.innerHTML = `<strong>sessionId:</strong> ${snapshot.sessionId} <br/><strong>start:</strong> ${snapshot.startTime} <br/><strong>at:</strong> ${snapshot.timestamp}`;
    el.appendChild(p);

    const tbody = document.querySelector('#clientContextTable tbody');
    tbody.innerHTML = '';
    const ctx = snapshot.clientContext || {};
    const rows = [
        ['URL', ctx.url || ''],
        ['Title', ctx.pageTitle || ''],
        ['User Agent (hash)', ctx.userAgentHash ? (ctx.userAgentHash + ' • ' + (ctx.userAgent || '').substring(0,80)) : (ctx.userAgent || '')],
        ['Language', ctx.language || ''],
        ['Timezone', ctx.timezone || ''],
        ['Environment', ctx.environment || ''],
        ['Screen', ctx.screen && ctx.screen.width ? `${ctx.screen.width}x${ctx.screen.height} (${ctx.screen.colorDepth})` : ''],
        ['Connection', ctx.connection ? `${ctx.connection.effectiveType} rtt=${ctx.connection.rtt}ms downlink=${ctx.connection.downlink}Mbps` : ''],
        ['LocalStorage keys', ctx.localStorageKeys != null ? ctx.localStorageKeys : 'unknown']
    ];
    rows.forEach(([k,v]) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td'); td1.style.width = '35%'; td1.textContent = k;
        const td2 = document.createElement('td'); td2.textContent = v;
        tr.appendChild(td1); tr.appendChild(td2);
        tbody.appendChild(tr);
    });
}

// Render provider instructions block with copy buttons and explicit URIs to add
function renderProviderInstructions(googleConfig, microsoftConfig, snapshot) {
    const el = document.getElementById('providerInstructionsInner');
    el.innerHTML = '';

    const origin = (snapshot && snapshot.clientContext && snapshot.clientContext.url) ? (new URL(snapshot.clientContext.url)).origin : window.location.origin;
    const redirectUri = origin + '/secure/index.html';

    // Helper to build provider card
    const buildCard = (name, cfg) => {
        const card = document.createElement('div');
        card.className = 'mb-2 p-2 border rounded bg-white';

        const title = document.createElement('div');
        title.innerHTML = `<strong>${name}</strong>`;
        card.appendChild(title);

        const list = document.createElement('div');
        list.className = 'small text-muted';

        const clientId = cfg && cfg.client_id ? cfg.client_id : '<não disponível>';
        list.innerHTML = `
            <div><strong>Client ID:</strong> ${clientId}</div>
            <div><strong>Redirect URI atual:</strong> ${cfg && cfg.redirect_uri ? cfg.redirect_uri : redirectUri}</div>
        `;
        card.appendChild(list);

        const btnGroup = document.createElement('div');
        btnGroup.className = 'mt-2';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-sm btn-outline-primary me-2';
        copyBtn.textContent = 'Copiar URIs para provedor';
        copyBtn.onclick = () => {
            const text = `Client ID: ${clientId}\nAuthorized JavaScript origin: ${origin}\nRedirect URI: ${redirectUri}`;
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(()=>alert('URIs copiadas')) .catch(()=>prompt('Copiar manualmente:', text));
            else prompt('Copiar manualmente:', text);
        };

        const howtoBtn = document.createElement('button');
        howtoBtn.className = 'btn btn-sm btn-outline-secondary';
        howtoBtn.textContent = 'Instruções rápidas';
        howtoBtn.onclick = () => showHowTo(name, clientId, origin, redirectUri);

        btnGroup.appendChild(copyBtn);
        btnGroup.appendChild(howtoBtn);
        card.appendChild(btnGroup);

        return card;
    };

    el.appendChild(buildCard('Google Cloud Console', googleConfig));
    el.appendChild(buildCard('Microsoft (Azure / Entra)', microsoftConfig));

    // Add global note
    const note = document.createElement('div');
    note.className = 'mt-2 small text-muted';
    note.innerHTML = `
        <strong>Ação recomendada:</strong> No console do provedor, adicione o <em>Authorized JavaScript origin</em> com <code>${origin}</code> e o <em>Redirect URI</em> com <code>${redirectUri}</code> para o Client ID mostrado acima.
    `;
    el.appendChild(note);

    renderVerificationChecklist(googleConfig, microsoftConfig, origin);
}

function showHowTo(providerName, clientId, origin, redirectUri) {
    const steps = [];
    if (providerName.toLowerCase().includes('google')) {
        steps.push('1) Entre no Google Cloud Console (APIs & Services > Credentials).');
        steps.push(`2) Localize o OAuth 2.0 Client com Client ID: ${clientId}`);
        steps.push(`3) Em 'Authorized JavaScript origins' adicione: ${origin}`);
        steps.push(`4) Em 'Authorized redirect URIs' adicione: ${redirectUri}`);
        steps.push('5) Salve as alterações e teste o login novamente.');
    } else {
        steps.push('1) Entre no Azure Portal > App registrations.');
        steps.push(`2) Localize a aplicação com Client ID: ${clientId}`);
        steps.push('3) Em Authentication > Platform configurations > Web, adicione o Redirect URI abaixo');
        steps.push(`   Redirect URI: ${redirectUri}`);
        steps.push(`4) Em 'Implicit grant' não é necessário marcar para Authorization Code flow; apenas salve.`);
        steps.push('5) Teste o login novamente.');
    }

    alert(providerName + '\n\n' + steps.join('\n'));
}

function renderSummary(summary) {
    const el = document.getElementById('logsSummary');
    el.innerHTML = '';
    const html = `
        <div><strong>Total logs:</strong> ${summary.totalLogs || 0}</div>
        <div><strong>Levels:</strong> ${JSON.stringify(summary.levels || {})}</div>
        <div><strong>Provider:</strong> ${summary.provider || 'unknown'}</div>
    `;
    el.innerHTML = html;
}

function copyRecommendedUris(ctx) {
    const origin = (ctx && ctx.url) ? (new URL(ctx.url)).origin : window.location.origin;
    const jsOrigin = origin;
    const redirectUri = origin + '/secure/index.html';
    const text = `JavaScript Origin: ${jsOrigin}\nRedirect URI: ${redirectUri}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert('URIs copiadas para a área de transferência'))
            .catch(() => prompt('Copiar manualmente:', text));
    } else {
        prompt('Copiar manualmente:', text);
    }
}

// --- URI verification helpers ---

function loadVerificationRecords() {
    try {
        const raw = localStorage.getItem(VERIFICATION_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
        console.warn('Falha ao ler registros de verificação', err);
        return {};
    }
}

function saveVerificationRecords(records) {
    try {
        localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
        alert('Não foi possível salvar o registro local. Veja o console para detalhes.');
        console.error('Falha ao salvar registros de verificação', err);
    }
}

function buildExpectedVerificationEntries(googleConfig, microsoftConfig, origin) {
    const entries = [];
    const safeOrigin = origin || window.location.origin;

    if (safeOrigin) {
        entries.push({
            id: 'global:origin',
            provider: 'Ambiente',
            label: 'Domínio principal da aplicação',
            expectedValue: safeOrigin,
            description: 'Deve constar como JavaScript origin/autorização principal nos provedores.'
        });
        entries.push({
            id: 'global:api_access_token',
            provider: 'APIs',
            label: 'APIs aceitam apenas access token válido',
            expectedValue: 'Testes confirmam que endpoints rejeitam tokens inválidos/expirados',
            description: 'Cenários de consumo de APIs devem usar access token verificado pelo backend.'
        });
        entries.push({
            id: 'global:refresh_plan',
            provider: 'APIs',
            label: 'Plano de gerenciamento de refresh tokens',
            expectedValue: 'Procedimento definido para armazenar, renovar e revogar refresh tokens',
            description: 'Documentar onde os refresh tokens ficam armazenados e como são rotacionados.'
        });
    }

    if (googleConfig) {
        const googleRedirect = googleConfig.redirect_uri || (safeOrigin + '/secure/index.html');
        entries.push({
            id: 'google:redirect',
            provider: 'Google',
            label: 'Redirect URI (OAuth 2.0)',
            expectedValue: googleRedirect,
            description: 'Google Cloud Console > OAuth client > Authorized redirect URIs'
        });
        entries.push({
            id: 'google:origin',
            provider: 'Google',
            label: 'Authorized JavaScript origin',
            expectedValue: safeOrigin,
            description: 'Google Cloud Console > OAuth client > Authorized JavaScript origins'
        });
        if (googleConfig.post_logout_redirect_uri) {
            entries.push({
                id: 'google:postlogout',
                provider: 'Google',
                label: 'URL de logout (opcional)',
                expectedValue: googleConfig.post_logout_redirect_uri,
                description: 'Se aplicável, deve constar em "Post-logout redirect URIs"'
            });
        }
        entries.push({
            id: 'google:consent_screen',
            provider: 'Google',
            label: 'Consent screen publicado',
            expectedValue: 'Status: In production',
            description: 'Google Cloud Console > OAuth consent screen > Publishing status'
        });
    }

    if (microsoftConfig) {
        const msRedirect = microsoftConfig.redirect_uri || (safeOrigin + '/secure/index.html');
        entries.push({
            id: 'microsoft:redirect',
            provider: 'Microsoft',
            label: 'Redirect URI (Web)',
            expectedValue: msRedirect,
            description: 'Azure Portal > App registrations > Authentication > Web > Redirect URIs'
        });
        if (microsoftConfig.post_logout_redirect_uri) {
            entries.push({
                id: 'microsoft:postlogout',
                provider: 'Microsoft',
                label: 'Post logout redirect URI',
                expectedValue: microsoftConfig.post_logout_redirect_uri,
                description: 'Azure Portal > App registrations > Authentication > Logout URL'
            });
        }
        entries.push({
            id: 'microsoft:origin',
            provider: 'Microsoft',
            label: 'Front-channel logout/Reply URL base',
            expectedValue: safeOrigin,
            description: 'Confirme que o domínio está listado nos Reply URLs compatíveis.'
        });
        entries.push({
            id: 'microsoft:admin_consent',
            provider: 'Microsoft',
            label: 'Admin consent concedido',
            expectedValue: 'Status: Admin consent granted',
            description: 'Azure Portal > App registrations > API permissions > Grant admin consent'
        });
    }

    return entries;
}

function renderVerificationChecklist(googleConfig, microsoftConfig, origin) {
    const container = document.getElementById('verificationChecklistBody');
    if (!container) return;

    lastVerificationContext = { google: googleConfig, microsoft: microsoftConfig, origin };

    const entries = buildExpectedVerificationEntries(googleConfig, microsoftConfig, origin);
    currentVerificationEntries = entries;

    if (!entries || entries.length === 0) {
        container.innerHTML = '<div class="text-muted">Não foi possível gerar a lista de URIs esperadas. Verifique se as configurações dinâmicas foram carregadas.</div>';
        return;
    }

    const records = loadVerificationRecords();

    const table = document.createElement('table');
    table.className = 'table table-sm align-middle';
    table.innerHTML = `
        <thead>
            <tr>
                <th style="width: 12%">Provedor</th>
                <th style="width: 23%">Item</th>
                <th style="width: 30%">Valor esperado</th>
                <th style="width: 20%">Status</th>
                <th style="width: 15%" class="text-end">Ações</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');
    entries.forEach(entry => {
        const tr = document.createElement('tr');

        const tdProvider = document.createElement('td');
        tdProvider.innerHTML = `<span class="badge bg-${entry.provider === 'Google' ? 'danger' : (entry.provider === 'Microsoft' ? 'primary' : 'secondary')}">${entry.provider}</span>`;
        tr.appendChild(tdProvider);

        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `<strong>${entry.label}</strong><br/><small class="text-muted">${entry.description}</small>`;
        tr.appendChild(tdLabel);

        const tdValue = document.createElement('td');
        tdValue.innerHTML = `<code class="small">${entry.expectedValue}</code>`;
        tr.appendChild(tdValue);

        const record = records[entry.id];
        const tdStatus = document.createElement('td');
        if (record) {
            const formattedDate = formatTimestamp(record.verifiedAt);
            tdStatus.innerHTML = `
                <span class="badge bg-success mb-1">Verificado</span>
                <div class="small text-muted">${formattedDate}<br/>por ${record.verifier || 'N/D'}</div>
                ${record.evidence ? `<div class="small">Evidência: <a href="${record.evidence}" target="_blank" rel="noopener noreferrer">link</a></div>` : ''}
            `;
        } else {
            tdStatus.innerHTML = '<span class="badge bg-secondary">Pendente</span><div class="small text-muted">Aguardando confirmação manual</div>';
        }
        tr.appendChild(tdStatus);

        const tdActions = document.createElement('td');
        tdActions.className = 'text-end';

        const actionGroup = document.createElement('div');
        actionGroup.className = 'btn-group btn-group-sm';

        const verifyBtn = document.createElement('button');
        verifyBtn.className = 'btn btn-outline-success';
        verifyBtn.textContent = record ? 'Atualizar' : 'Registrar';
        verifyBtn.onclick = () => handleVerificationEntry(entry);
        actionGroup.appendChild(verifyBtn);

        if (record) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn btn-outline-secondary';
            clearBtn.textContent = 'Remover';
            clearBtn.onclick = () => removeVerificationEntry(entry.id);
            actionGroup.appendChild(clearBtn);
        }

        tdActions.appendChild(actionGroup);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    const info = document.createElement('div');
    info.className = 'small text-muted';
    info.innerHTML = `Os registros são armazenados localmente neste navegador (localStorage). Exporte o JSON após cada auditoria para arquivar as evidências.`;
    container.appendChild(info);
}

function formatTimestamp(isoString) {
    if (!isoString) return 'Data não registrada';
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(date);
    } catch (err) {
        return isoString;
    }
}

function handleVerificationEntry(entry) {
    const records = loadVerificationRecords();
    const existing = records[entry.id] || {};

    const verifier = prompt('Informe o nome ou equipe que confirmou esse item:', existing.verifier || '');
    if (!verifier) {
        return;
    }

    const evidence = prompt('Cole um link de evidência (screenshot, change log) ou descreva a conferência:', existing.evidence || '');

    records[entry.id] = {
        id: entry.id,
        provider: entry.provider,
        label: entry.label,
        expectedValue: entry.expectedValue,
        description: entry.description,
        verifier: verifier.trim(),
        evidence: evidence ? evidence.trim() : '',
        verifiedAt: new Date().toISOString(),
        environmentOrigin: window.location.origin
    };

    saveVerificationRecords(records);
    renderVerificationChecklist(lastVerificationContext.google, lastVerificationContext.microsoft, lastVerificationContext.origin);
}

function removeVerificationEntry(entryId) {
    const records = loadVerificationRecords();
    if (!records[entryId]) {
        return;
    }
    const confirmRemoval = confirm('Remover o registro de verificação deste item?');
    if (!confirmRemoval) {
        return;
    }
    delete records[entryId];
    saveVerificationRecords(records);
    renderVerificationChecklist(lastVerificationContext.google, lastVerificationContext.microsoft, lastVerificationContext.origin);
}

function exportVerificationRecords() {
    const records = loadVerificationRecords();
    const exportPayload = {
        generatedAt: new Date().toISOString(),
        environmentOrigin: window.location.origin,
        expectedEntries: currentVerificationEntries,
        records: Object.values(records)
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oidc-uri-verifications-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function clearVerificationRecords() {
    const confirmClear = confirm('Remover todos os registros de verificação salvos neste navegador?');
    if (!confirmClear) {
        return;
    }
    try {
        localStorage.removeItem(VERIFICATION_STORAGE_KEY);
    } catch (err) {
        console.warn('Falha ao limpar registros de verificação', err);
    }
    renderVerificationChecklist(lastVerificationContext.google, lastVerificationContext.microsoft, lastVerificationContext.origin);
}

async function loadServerLogFiles() {
    const body = document.getElementById('logFilesBody');
    if (!body) return;

    body.innerHTML = '<div class="text-muted"><i class="bi bi-hourglass-split"></i> Carregando lista de arquivos...</div>';

    try {
        const response = await fetch('/logs');
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const data = await response.json();
        renderLogFilesIndex(data);
    } catch (error) {
        console.error('Falha ao obter lista de logs do servidor:', error);
        body.innerHTML = `
            <div class="alert alert-warning mb-0">
                <i class="bi bi-exclamation-triangle"></i> Não foi possível acessar os arquivos de log no servidor.<br>
                <small class="text-muted">Confirme se está executando via server.py ou se o endpoint /logs está disponível.</small>
            </div>
        `;
    }
}

function renderLogFilesIndex(indexData) {
    const body = document.getElementById('logFilesBody');
    if (!body) return;

    const categories = (indexData && Array.isArray(indexData.categories)) ? indexData.categories : [];
    if (!categories.length) {
        body.innerHTML = '<div class="text-muted"><i class="bi bi-inbox"></i> Nenhum arquivo de log disponível.</div>';
        return;
    }

    body.innerHTML = '';

    categories.forEach(category => {
        const section = document.createElement('div');
        section.className = 'mb-4';

        const header = document.createElement('div');
        header.className = 'd-flex align-items-center justify-content-between mb-2';
        header.innerHTML = `
            <div>
                <i class="bi bi-folder2-open"></i>
                <strong class="ms-1">${category.label || category.key}</strong>
            </div>
            <span class="badge bg-secondary">${(category.files || []).length} arquivos</span>
        `;
        section.appendChild(header);

        const files = Array.isArray(category.files) ? category.files : [];
        if (!files.length) {
            const empty = document.createElement('div');
            empty.className = 'text-muted small';
            empty.innerHTML = '<i class="bi bi-info-circle"></i> Nenhum arquivo encontrado nesta categoria.';
            section.appendChild(empty);
        } else {
            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'table-responsive';
            const table = document.createElement('table');
            table.className = 'table table-sm align-middle mb-0';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Arquivo</th>
                        <th style="width: 180px;">Última modificação</th>
                        <th style="width: 110px;">Tamanho</th>
                        <th style="width: 80px;">Ações</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const tbody = table.querySelector('tbody');

            files.forEach(file => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <code>${file.name}</code>
                    </td>
                    <td>${formatDateTime(file.modified)}</td>
                    <td>${formatFileSize(file.size)}</td>
                    <td class="text-end">
                        <button class="btn btn-outline-primary btn-sm" type="button">
                            <i class="bi bi-download"></i>
                        </button>
                    </td>
                `;
                const btn = tr.querySelector('button');
                btn.addEventListener('click', () => downloadLogFile(category.key, file.name, btn));
                tbody.appendChild(tr);
            });

            tableWrapper.appendChild(table);
            section.appendChild(tableWrapper);
        }

        body.appendChild(section);
    });
}

function formatFileSize(bytes) {
    if (typeof bytes !== 'number' || isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    for (let i = 0; i < units.length; i++) {
        if (value < 1024 || i === units.length - 1) {
            return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
        }
        value /= 1024;
    }
    return `${bytes} B`;
}

function formatDateTime(isoDate) {
    if (!isoDate) return '-';
    try {
        const date = new Date(isoDate);
        return date.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return isoDate;
    }
}

async function downloadLogFile(category, fileName, buttonEl) {
    if (!category || !fileName) return;

    const originalHtml = buttonEl ? buttonEl.innerHTML : null;
    if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    }

    try {
        const response = await fetch(`/logs?category=${encodeURIComponent(category)}&file=${encodeURIComponent(fileName)}`);
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Falha ao baixar log', error);
        alert('Não foi possível baixar o arquivo de log. Verifique o console para mais detalhes.');
    } finally {
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.innerHTML = originalHtml || '<i class="bi bi-download"></i>';
        }
    }
}

function filterLogs() {
    const levelFilter = document.getElementById('level-filter').value;
    const providerFilter = document.getElementById('provider-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();
    const maxLogs = document.getElementById('max-logs').value;

    // Aplicar filtros
    filteredLogs = allLogs.filter(log => {
        // Filtro de nível
        if (levelFilter !== 'ALL') {
            const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
            const minLevelIndex = levels.indexOf(levelFilter);
            const logLevelIndex = levels.indexOf(log.level);
            if (logLevelIndex > minLevelIndex) return false;
        }

        // Filtro de provider
        if (providerFilter !== 'ALL') {
            const logProvider = log.context?.currentProvider || log.data?.provider;
            if (logProvider !== providerFilter) return false;
        }

        // Filtro de busca
        if (searchFilter) {
            const searchText = `${log.message} ${JSON.stringify(log.data)}`.toLowerCase();
            if (!searchText.includes(searchFilter)) return false;
        }

        return true;
    });

    // Limitar quantidade
    if (maxLogs !== 'ALL') {
        filteredLogs = filteredLogs.slice(-parseInt(maxLogs));
    }

    // Ordenar por timestamp (mais recentes primeiro)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Renderizar
    renderLogs();
}

function renderLogs() {
    const container = document.getElementById('logs-container');
    const showingCount = document.getElementById('showing-count');

    showingCount.textContent = `${filteredLogs.length} logs`;

    if (filteredLogs.length === 0) {
        container.innerHTML = '<div class="text-center text-muted"><i class="bi bi-inbox"></i> Nenhum log encontrado</div>';
        return;
    }

    const html = filteredLogs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString('pt-BR');
        const hasData = log.data && Object.keys(log.data).length > 0;
        
        return `
            <div class="log-entry ${log.level}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <span class="log-level-${log.level}">[${log.level}]</span>
                        <strong>${log.message}</strong>
                        <small class="text-muted ms-2">${timestamp}</small>
                    </div>
                    ${hasData ? '<button class="btn btn-sm btn-outline-secondary" onclick="toggleLogData(this)"><i class="bi bi-chevron-down"></i></button>' : ''}
                </div>
                ${hasData ? `<div class="log-data" style="display: none;">${JSON.stringify(log.data, null, 2)}</div>` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Função global
window.toggleLogData = function(button) {
    const logData = button.closest('.log-entry').querySelector('.log-data');
    const icon = button.querySelector('i');
    
    if (logData.style.display === 'none') {
        logData.style.display = 'block';
        icon.className = 'bi bi-chevron-up';
    } else {
        logData.style.display = 'none';
        icon.className = 'bi bi-chevron-down';
    }
};

function exportLogs(format) {
    if (window.logOIDC) {
        window.logOIDC.export(format);
    }
}

function clearLogs() {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
        if (window.logOIDC) {
            window.logOIDC.clear();
            refreshLogs();
        }
    }
}

// Expor funções necessárias no escopo global
window.exportLogs = exportLogs;
window.clearLogs = clearLogs;
window.filterLogs = filterLogs;