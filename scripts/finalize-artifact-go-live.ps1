$ErrorActionPreference = "Stop"

param(
    [switch]$AllowPublicExe
)

$root = Split-Path -Parent $PSScriptRoot
function Resolve-LegacyDeliveryRoot($siteRoot) {
    $candidates = @("delivery")
    foreach ($candidate in $candidates) {
        $path = Join-Path $siteRoot $candidate
        if (Test-Path $path) {
            return $path
        }
    }
    throw "Nenhuma pasta de legado encontrada (delivery/)."
}

$legacyRoot = Resolve-LegacyDeliveryRoot -siteRoot $root
$eteArtifacts = Join-Path $legacyRoot "ete\artifacts"
$pdvArtifacts = Join-Path $legacyRoot "pdv\artifacts"
$eteExe = Join-Path $eteArtifacts "Minerador40.exe"
$pdvExe = Join-Path $pdvArtifacts "CaraCorePDV.exe"

$eteOfficial = Join-Path $legacyRoot "ete\download-oficial.html"
$pdvOfficial = Join-Path $legacyRoot "pdv\download-oficial.html"

function Test-RequiredFile($path) {
    if (-not (Test-Path $path)) {
        throw "Arquivo obrigatorio nao encontrado: $path"
    }
}

function Test-ChecksumNotPending($path) {
    $content = Get-Content -Path $path -Raw
    if ($content -match "PENDING_PUBLICATION") {
        throw "Checksum ainda em placeholder: $path"
    }
}

function Set-UpdatedFileContent($filePath, $old, $new) {
    $content = Get-Content -Path $filePath -Raw
    if ($content.Contains($old)) {
        $content = $content.Replace($old, $new)
        Set-Content -Path $filePath -Value $content -Encoding UTF8
    }
}

# 1) Validar artefatos publicados
Test-RequiredFile $eteExe
Test-RequiredFile $pdvExe
Test-RequiredFile (Join-Path $eteArtifacts "checksum.sha256")
Test-RequiredFile (Join-Path $eteArtifacts "checksum.md5")
Test-RequiredFile (Join-Path $pdvArtifacts "checksum.sha256")
Test-RequiredFile (Join-Path $pdvArtifacts "checksum.md5")

Test-ChecksumNotPending (Join-Path $eteArtifacts "checksum.sha256")
Test-ChecksumNotPending (Join-Path $eteArtifacts "checksum.md5")
Test-ChecksumNotPending (Join-Path $pdvArtifacts "checksum.sha256")
Test-ChecksumNotPending (Join-Path $pdvArtifacts "checksum.md5")

# 2) Regra de seguranca de distribuicao
if ($AllowPublicExe) {
        # Habilita EXE publico somente por excecao explicita.
    # Distribuicao publica: CTA para loja oficial (verdade de produto); artefatos no legado validados acima.
        Set-UpdatedFileContent -filePath $eteOfficial `
            -old '<a class="btn btn-primary" href="canal-feedback.html">Solicitar entrega segura</a>' `
            -new '<a class="btn btn-primary" href="https://ete.caracore.com.br/download.html">Baixar na loja oficial (ETE)</a>'

        Set-UpdatedFileContent -filePath $pdvOfficial `
            -old '<a href="canal-feedback.html" class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white font-bold hover:bg-slate-800">`r`n          Solicitar entrega segura`r`n        </a>' `
            -new '<a href="https://pdv.caracore.com.br/download.html" class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white font-bold hover:bg-slate-800">`r`n          Baixar na loja oficial (PDV)`r`n        </a>'

        Write-Host "Go-live validado e EXE publico habilitado por excecao." -ForegroundColor Yellow
        Write-Host "- Artefatos validados"
        Write-Host "- CTAs dos endpoints oficiais apontando para .exe"
}
else {
        # Modo padrao seguro: mantem entrega controlada via canal institucional.
        Write-Host "Go-live validado em modo seguro (padrao)." -ForegroundColor Green
        Write-Host "- Artefatos validados"
        Write-Host "- Entrega publica de EXE mantida desabilitada"
        Write-Host "- CTAs permanecem em solicitacao de entrega segura"
}
