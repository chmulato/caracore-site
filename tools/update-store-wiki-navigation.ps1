# Atualiza navbar, breadcrumb e sidebar dos docs/wiki/projeto-*.html (LF).
param(
    [string]$DevRoot = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
)

$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Normalize-Lf([string]$s) {
    if ($null -eq $s) { return "" }
    return ($s -replace "`r`n", "`n") -replace "`r", "`n"
}

$stores = @(
    @{ Rel = "caracore-area51-releases\docs\wiki\projeto-area51.html"; Proj = "projeto-area51.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $true }
    @{ Rel = "caracore-pdv-releases\docs\wiki\projeto-pdv.html"; Proj = "projeto-pdv.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $false }
    @{ Rel = "caracore-seed-releases\docs\wiki\projeto-seed.html"; Proj = "projeto-seed.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $false }
    @{ Rel = "caracore-oidc-releases\docs\wiki\projeto-reino.html"; Proj = "projeto-reino.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $false }
    @{ Rel = "caracore-ink-releases\docs\wiki\projeto-ink.html"; Proj = "projeto-ink.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $false }
    @{ Rel = "caracore-hub-releases\docs\wiki\projeto-hub.html"; Proj = "projeto-hub.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $false }
    @{ Rel = "caracore-ete-releases\docs\wiki\projeto-minerador.html"; Proj = "projeto-minerador.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $false }
    @{ Rel = "caracore-circuito-releases\docs\wiki\projeto-python.html"; Proj = "projeto-python.html"; Extra = @{ Href = "../download.html"; Label = "Download / entregas" }; Area51 = $false }
)

$navOldPath = Join-Path $PSScriptRoot "fragments\wiki-nav-old.txt"
$navOld = Normalize-Lf ([IO.File]::ReadAllText($navOldPath, $utf8NoBom))

$navNew = Normalize-Lf @'
            <div class="collapse navbar-collapse" id="navbarWiki">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="../index.html">
                            <i class="bi bi-shop"></i> Loja
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">
                            <i class="bi bi-journal-text"></i> Wiki da loja
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="__EXTRA_HREF__">
                            <i class="bi bi-download"></i> __EXTRA_LABEL__
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../canal-feedback.html">
                            <i class="bi bi-chat-dots"></i> Canal de feedback
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="https://wiki.caracore.com.br/index.html" target="_blank" rel="noopener">
                            <i class="bi bi-globe2"></i> Wiki Cara Core (completa)
                        </a>
                    </li>
                </ul>
            </div>
'@

$breadcrumbOld = Normalize-Lf @'
                    <li class="breadcrumb-item"><a href="../index.html">Wiki Home</a></li>
                    <li class="breadcrumb-item"><a href="../index.html">Projetos</a></li>
'@

$breadcrumbNew = Normalize-Lf @'
                    <li class="breadcrumb-item"><a href="../index.html">Loja</a></li>
                    <li class="breadcrumb-item"><a href="index.html">Wiki</a></li>
'@

# Evita problema de encoding do .ps1: "ú" explícito (U+00FA)
$markerConteudo = "`n            <!-- Conte$([char]0x00FA)do Principal -->"

foreach ($s in $stores) {
    $path = Join-Path $DevRoot $s.Rel
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Warning "Skip (missing): $path"
        continue
    }
    $text = Normalize-Lf ([IO.File]::ReadAllText($path, $utf8NoBom))

    $nav = $navNew.Replace("__EXTRA_HREF__", $s.Extra.Href).Replace("__EXTRA_LABEL__", $s.Extra.Label)
    if ($text.IndexOf($navOld, [StringComparison]::Ordinal) -lt 0) {
        Write-Warning "Nav antigo não encontrado (já atualizado?): $path"
        continue
    }
    $text = $text.Replace($navOld, $nav)
    $text = $text.Replace($breadcrumbOld, $breadcrumbNew)
    $text = $text.Replace('<a class="navbar-brand" href="../index.html">', '<a class="navbar-brand" href="index.html">')

    $menuUl = @"
                    <ul class="wiki-menu">
                        <li><a href="index.html"><i class="bi bi-journal-text"></i> Início do wiki</a></li>
                        <li><a href="$($s.Proj)" class="active"><i class="bi bi-file-earmark-text"></i> Documentação do produto</a></li>
                        <li><a href="$($s.Extra.Href)"><i class="bi bi-box-arrow-down"></i> $($s.Extra.Label)</a></li>
                        <li><a href="../canal-feedback.html"><i class="bi bi-chat-dots"></i> Canal de feedback</a></li>
                        <li><a href="https://wiki.caracore.com.br/index.html" target="_blank" rel="noopener"><i class="bi bi-globe2"></i> Wiki completa — Cara Core</a></li>
                    </ul>
"@

    $i0 = $text.IndexOf('<div class="wiki-sidebar">', [StringComparison]::Ordinal)
    if ($i0 -lt 0) { Write-Warning "wiki-sidebar não encontrado: $path"; continue }

    $iMain = $text.IndexOf($markerConteudo, $i0, [StringComparison]::Ordinal)
    if ($iMain -lt 0) { Write-Warning "Marcador Conteúdo Principal não encontrado: $path"; continue }

    $chunk = $text.Substring($i0, $iMain - $i0)

    if ($s.Area51) {
        $iNav = $chunk.IndexOf('class="area51-nav"', [StringComparison]::Ordinal)
        if ($iNav -lt 0) { Write-Warning "area51-nav não encontrado: $path"; continue }
        $iLady = $chunk.LastIndexOf('<!--', $iNav)
        if ($iLady -lt 0) { Write-Warning "Comentário antes de area51-nav não encontrado: $path"; continue }
        $newBlock = @"
                <div class="wiki-sidebar">
                    <h4><i class="bi bi-list-ul"></i> Nesta loja</h4>
$menuUl
$($chunk.Substring($iLady))
"@
    }
    else {
        $newBlock = @"
                <div class="wiki-sidebar">
                    <h4><i class="bi bi-list-ul"></i> Nesta loja</h4>
$menuUl
                </div>
            </div>

"@
    }

    $text = $text.Substring(0, $i0) + $newBlock + $text.Substring($iMain)
    [IO.File]::WriteAllText($path, $text, $utf8NoBom)
    Write-Host "OK: $($s.Rel)"
}

Write-Host "--- Feito (Bootstrap wiki projeto-*.html)."
