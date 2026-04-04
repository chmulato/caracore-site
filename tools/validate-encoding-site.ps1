# Validates: (1) <meta charset> within first 1024 UTF-8 bytes, (2) mojibake markers in HTML.
param(
    [string]$RootPath = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding($false)
$mojibakePattern = '\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]{1,2}|\uFFFD'
$charsetPattern = '(?i)<meta\s+charset\s*=\s*[^>]+>'

$exclude = '\\tools\\|\\backend\\|\\node_modules\\|\\.python_packages\\|htmlcov\\|playwright\\'
$files = Get-ChildItem -LiteralPath $RootPath -Recurse -File |
    Where-Object { $_.Extension -match '^\.html?$' -and $_.FullName -notmatch $exclude }

$lateCharset = @()
$mojibakeFiles = @()

foreach ($file in $files) {
    $raw = [IO.File]::ReadAllText($file.FullName, $utf8)
    # Fragmentos embutidos (sem <head>) não exigem meta charset
    if ($raw -notmatch '(?i)<head[\s>]') {
        $hits = [regex]::Matches($raw, $mojibakePattern).Count
        if ($hits -gt 0) {
            $mojibakeFiles += [pscustomobject]@{ File = $file.FullName; MojibakeMarkers = $hits }
        }
        continue
    }
    $m = [regex]::Match($raw, $charsetPattern)
    if (-not $m.Success) {
        $lateCharset += [pscustomobject]@{ File = $file.FullName; Issue = 'no_charset_meta' }
        continue
    }
    $bytes = $utf8.GetByteCount($raw.Substring(0, $m.Index))
    if ($bytes -ge 1024) {
        $lateCharset += [pscustomobject]@{ File = $file.FullName; BytesBeforeCharset = $bytes }
    }
    $hits = [regex]::Matches($raw, $mojibakePattern).Count
    if ($hits -gt 0) {
        $mojibakeFiles += [pscustomobject]@{ File = $file.FullName; MojibakeMarkers = $hits }
    }
}

Write-Host "=== Remodelagem / estado (ficheiros de plano) ===" -ForegroundColor Cyan
$plan = Join-Path $RootPath 'docs\CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md'
$sm = Join-Path $RootPath 'sitemap.xml'
$rb = Join-Path $RootPath 'docs\RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md'
$ck = Join-Path $RootPath 'docs\CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md'
foreach ($p in @($plan, $sm, $rb, $ck)) {
    Write-Host ($(if (Test-Path $p) { '[OK]' } else { '[FALTA]' }) + ' ' + $p)
}

Write-Host "`n=== Charset: meta dentro dos primeiros 1024 bytes ===" -ForegroundColor Cyan
Write-Host "Total HTML analisados: $($files.Count)"
if ($lateCharset.Count -eq 0) {
    Write-Host "Nenhum ficheiro com charset tardio ou ausente." -ForegroundColor Green
} else {
    $lateCharset | Format-Table -AutoSize
}

Write-Host "`n=== Mojibake (padrao UTF-8 lido como CP1252) ===" -ForegroundColor Cyan
if ($mojibakeFiles.Count -eq 0) {
    Write-Host "Nenhum marcador de mojibake encontrado." -ForegroundColor Green
} else {
    $mojibakeFiles | Sort-Object MojibakeMarkers -Descending | Format-Table -AutoSize
}

if ($lateCharset.Count -gt 0 -or $mojibakeFiles.Count -gt 0) { exit 1 }
exit 0
