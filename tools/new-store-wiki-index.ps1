# Gera docs/wiki/index.html em cada loja (UTF-8 sem BOM).
param([string]$DevRoot = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$items = @(
    @{ Dir = "caracore-area51-releases"; Title = "Área 51"; Proj = "projeto-area51.html"; Desc = "Reino das Entidades Federadas (OpenID Connect), autenticação enterprise e consultoria OIDC."; ExtraHref = "../download.html"; ExtraLabel = "Download / o que entrega" }
    @{ Dir = "caracore-pdv-releases"; Title = "CaraCore PDV"; Proj = "projeto-pdv.html"; Desc = "PDV Bunker Digital, SQLite, Reforma Tributária, PIX e operação offline."; ExtraHref = "../download.html"; ExtraLabel = "Download / releases" }
    @{ Dir = "caracore-seed-releases"; Title = "Cara Core Seed"; Proj = "projeto-seed.html"; Desc = "Contador de licenças e gestão de ativos Windows."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-oidc-releases"; Title = "Reino OIDC"; Proj = "projeto-reino.html"; Desc = "Educação OAuth 2.1 e OpenID Connect (material educacional)."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-ink-releases"; Title = "Ink Agenda"; Proj = "projeto-ink.html"; Desc = "Agenda e compromissos (produto Ink)."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-hub-releases"; Title = "Cara Core Hub"; Proj = "projeto-hub.html"; Desc = "Integração, e-commerce e painel centralizado."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-ete-releases"; Title = "Minerador 4.0 (ETE)"; Proj = "projeto-minerador.html"; Desc = "Simulador ETE / hidrometalurgia para ensino e mineração."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-circuito-releases"; Title = "Circuito Ferradura"; Proj = "projeto-python.html"; Desc = "Curso de lógica e Python para jovens (Circuito Ferradura)."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-cso-releases"; Title = "Cara Core CSO"; Proj = "projeto-cso.html"; Desc = "Gestão de transportes, JavaFX e operação logística."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-ru-releases"; Title = "RU Soberano"; Proj = "projeto-ru.html"; Desc = "Simulação de reator e balanço de massa (ensino)."; ExtraHref = "../download.html"; ExtraLabel = "Download" }
    @{ Dir = "caracore-mkt-releases"; Title = "Cara Core Mkt"; Proj = "projeto-mkt.html"; Desc = "Automação, governança de sala e presença digital da operação."; ExtraHref = "../readme.html"; ExtraLabel = "README da loja" }
)

$tpl = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wiki — __TITLE__ | Loja oficial Cara Core</title>
    <meta name="description" content="Wiki do produto __TITLE__ nesta loja (subdomínio). Documentação e links permanecem no ambiente da loja; ecossistema completo em caracore.com.br/wiki.">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="assets/css/wiki.css">
    <link rel="stylesheet" href="assets/css/wiki-unified.css">
    <link rel="icon" href="../assets/images/favicon.ico" type="image/ico">
    <link rel="stylesheet" href="/assets/caracore-core-typography.css">
    <link rel="stylesheet" href="/assets/caracore-institutional-components.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark wiki-nav">
        <div class="container">
            <a class="navbar-brand" href="index.html"><i class="bi bi-journal-code"></i> Wiki da loja</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarWiki" aria-label="Menu"><span class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse" id="navbarWiki">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="../index.html"><i class="bi bi-shop"></i> Loja</a></li>
                    <li class="nav-item"><a class="nav-link active" href="index.html" aria-current="page"><i class="bi bi-journal-text"></i> Wiki (início)</a></li>
                    <li class="nav-item"><a class="nav-link" href="__EXTRA_HREF__"><i class="bi bi-box-arrow-down"></i> __EXTRA_LABEL__</a></li>
                    <li class="nav-item"><a class="nav-link" href="../canal-feedback.html"><i class="bi bi-chat-dots"></i> Canal de feedback</a></li>
                    <li class="nav-item"><a class="nav-link" href="https://caracore.com.br/wiki/" target="_blank" rel="noopener"><i class="bi bi-globe2"></i> Wiki Cara Core (completa)</a></li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="wiki-breadcrumb">
        <div class="container">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><a href="../index.html">Loja</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Wiki</li>
                </ol>
            </nav>
        </div>
    </div>
    <div class="wiki-container">
        <div class="wiki-content py-4">
            <h1><i class="bi bi-journal-bookmark"></i> Wiki — __TITLE__</h1>
            <p class="lead text-muted">Documentação deste produto no site da <strong>loja oficial</strong> (subdomínio). A navegação desta wiki não substitui o site principal: use o link aberto em nova aba para trilhas, glossário e visão geral do ecossistema.</p>
            <p>__DESC__</p>
            <div class="alert alert-info mt-3" role="note">
                <i class="bi bi-info-circle"></i> A <strong>wiki completa</strong> da Cara Core (trilhas Cliente / Estagiário / Sócio, história e referências) está em <a href="https://caracore.com.br/wiki/" target="_blank" rel="noopener">caracore.com.br/wiki</a>.
            </div>
            <div class="d-flex flex-wrap gap-2 mt-4">
                <a class="btn btn-primary" href="__PROJ__"><i class="bi bi-file-earmark-text"></i> Documentação do produto</a>
                <a class="btn btn-outline-secondary" href="__EXTRA_HREF__"><i class="bi bi-box-arrow-down"></i> __EXTRA_LABEL__</a>
                <a class="btn btn-outline-secondary" href="../index.html"><i class="bi bi-shop"></i> Voltar à loja</a>
                <a class="btn btn-outline-secondary" href="../canal-feedback.html"><i class="bi bi-chat-dots"></i> Canal de feedback</a>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
'@

$fixScript = Join-Path $PSScriptRoot "fix-html-mojibake.ps1"

foreach ($it in $items) {
    $out = Join-Path (Join-Path $DevRoot $it.Dir) "docs\wiki\index.html"
    $html = $tpl.Replace("__TITLE__", $it.Title).Replace("__DESC__", $it.Desc).Replace("__PROJ__", $it.Proj).Replace("__EXTRA_HREF__", $it.ExtraHref).Replace("__EXTRA_LABEL__", $it.ExtraLabel)
    [IO.File]::WriteAllText($out, $html, $utf8NoBom)
    Write-Host "Wrote $out"
    if (Test-Path -LiteralPath $fixScript) {
        $wikiRoot = Join-Path (Join-Path $DevRoot $it.Dir) "docs\wiki"
        & $fixScript -RootPath $wikiRoot -HtmlOnly | Out-Null
    }
}
