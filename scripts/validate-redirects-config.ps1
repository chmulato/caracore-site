# Valida as regras catch-all /delivery/* declaradas em _redirects vs lojas canonicas.
# Escopo: apenas _redirects. O GitHub Pages serve o site e nao aplica o ficheiro;
# ele e o mapa declarado de rotas e o que os stubs HTML replicam.
# Uso: powershell -File scripts/validate-redirects-config.ps1
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
$outFile = Join-Path $siteRoot 'sala\regis\VALIDACAO_REDIRECTS_CONFIG.txt'

$ProductBases = @{
    'pdv'          = 'https://pdv.caracore.com.br'
    'pdv-rust'     = 'https://pdv-rust.caracore.com.br'
    'hub'          = 'https://hub.caracore.com.br'
    'circuito'     = 'https://circuito.caracore.com.br'
    'oidc'         = 'https://oidc.caracore.com.br'
    'seed'         = 'https://seed.caracore.com.br'
    'area51'       = 'https://area51.caracore.com.br'
    'ru'           = 'https://ru.caracore.com.br'
    'cso'          = 'https://cso.caracore.com.br'
    'ink'          = 'https://ink.caracore.com.br'
    'ete'          = 'https://ete.caracore.com.br'
    'mkt'          = 'https://mkt.caracore.com.br'
    'sala'         = 'https://tools.caracore.com.br/sala/'
}

function Normalize-RedirectBase([string]$Url) {
    $d = $Url.Trim().ToLowerInvariant()
    $d = $d -replace '/:splat$', ''
    return $d.TrimEnd('/')
}

function Parse-RedirectsFile([string]$Path) {
    $map = @{}
    if (-not (Test-Path -LiteralPath $Path)) { return $map }
    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        $t = $line.Trim()
        if (-not $t -or $t.StartsWith('#')) { continue }
        if ($t -match '^(/delivery/([a-z0-9-]+)/\*)\s+(\S+)') {
            $map[$Matches[2]] = $Matches[3]
        }
    }
    return $map
}

$issues = New-Object System.Collections.ArrayList
$redirectsPath = Join-Path $siteRoot '_redirects'

$netlify = Parse-RedirectsFile $redirectsPath
if ($netlify.Count -eq 0) {
    [void]$issues.Add("_redirects: nenhuma regra catch-all /delivery/<produto>/* encontrada em $redirectsPath")
}

foreach ($product in $ProductBases.Keys | Sort-Object) {
    $expectedBase = Normalize-RedirectBase $ProductBases[$product]
    if ($netlify.ContainsKey($product)) {
        $dest = Normalize-RedirectBase $netlify[$product]
        if ($dest -ne $expectedBase) {
            [void]$issues.Add("_redirects /delivery/$product/* -> '$($netlify[$product])' (esperado base '$($ProductBases[$product])')")
        }
    } else {
        [void]$issues.Add("_redirects: falta regra catch-all /delivery/$product/*")
    }
}

$lines = @(
    "Validacao redirects config - $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    "_redirects: $redirectsPath",
    'Host: GitHub Pages (serve a raiz do repo; _redirects documenta o mapa, stubs HTML replicam).',
    ''
)
if ($issues.Count -eq 0) {
    $lines += 'OK: _redirects alinhado as lojas canonicas.'
} else {
    $lines += "Problemas: $($issues.Count)"
    $lines += ($issues | Sort-Object)
}
$reportDir = Split-Path $outFile -Parent
if (-not (Test-Path -LiteralPath $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
[System.IO.File]::WriteAllText($outFile, ($lines -join "`r`n") + "`r`n", [Text.UTF8Encoding]::new($false))

Write-Host "=== Redirects config - problemas $($issues.Count) ==="
$issues | Sort-Object | ForEach-Object { Write-Host $_ }
Write-Host "Report: $outFile"
if ($issues.Count -gt 0) { exit 1 }
