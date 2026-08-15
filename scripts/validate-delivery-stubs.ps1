# Valida stubs HTML em delivery/ — destinos alinhados às lojas canónicas.
# Uso: powershell -File scripts/validate-delivery-stubs.ps1
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
$deliveryRoot = Join-Path $siteRoot 'delivery'
$outFile = Join-Path $siteRoot 'sala\regis\VALIDACAO_DELIVERY_STUBS.txt'

$ProductBases = @{
    'pdv'          = 'https://pdv.caracore.com.br'
    'pdv-rust'     = 'https://rust-pdv.caracore.com.br'
    'hub'          = 'https://hub.caracore.com.br'
    'circuito'     = 'https://circuito.caracore.com.br'
    'oidc'         = 'https://oidc.caracore.com.br'
    'seed'         = 'https://seed.caracore.com.br'
    'area51'       = 'https://area51.caracore.com.br'
    'ru'           = 'https://ru.caracore.com.br'
    'cso'          = 'https://cso-caracore.up.railway.app'
    'ink'          = 'https://ink.caracore.com.br'
    'ete'          = 'https://ete.caracore.com.br'
    'mkt'          = 'https://mkt.caracore.com.br'
    'sala'         = 'https://tools.caracore.com.br/sala/'
    'publications' = 'https://tools.caracore.com.br/sala/'
}

$FileAliases = @{
    'download-oficial.html' = 'download.html'
}

function Normalize-RedirectUrl([string]$Url) {
    if (-not $Url) { return '' }
    $u = $Url.Trim()
    if ($u -match '^//') { $u = 'https:' + $u }
    $u = $u.TrimEnd('/')
    if ($u -match '/index\.html$') { $u = $u -replace '/index\.html$', '' }
    return $u.ToLowerInvariant()
}

function Get-StubRedirectUrls([string]$Html) {
    $urls = [System.Collections.Generic.List[string]]::new()
    foreach ($pat in @(
        'http-equiv="refresh"[^>]+content="[^;]*;\s*url=(?<u>[^"]+)"',
        '<link[^>]+rel="canonical"[^>]+href="(?<u>[^"]+)"',
        '<link[^>]+href="(?<u>[^"]+)"[^>]+rel="canonical"',
        "location\.replace\('(?<u>[^']+)'\)",
        'location\.replace\("(?<u>[^"]+)"\)'
    )) {
        foreach ($m in [regex]::Matches($Html, $pat, 'IgnoreCase')) {
            [void]$urls.Add($m.Groups['u'].Value.Trim())
        }
    }
    foreach ($m in [regex]::Matches($Html, '<a[^>]+href="(https?://[^"]+)"', 'IgnoreCase')) {
        [void]$urls.Add($m.Groups[1].Value.Trim())
    }
    return $urls | Select-Object -Unique
}

function Get-ExpectedRedirectUrl {
    param([string]$Product, [string]$FileName)
    if (-not $ProductBases.ContainsKey($Product)) {
        return $null
    }
    $base = $ProductBases[$Product].TrimEnd('/')
    # CSO: loja desativada — todos os stubs apontam para a aplicação (raiz).
    if ($Product -eq 'cso') { return $base }
    if ($FileName -eq 'index.html') { return $base }
    $leaf = $FileName
    if ($FileAliases.ContainsKey($FileName)) { $leaf = $FileAliases[$FileName] }
    return "$base/$leaf"
}

$issues = New-Object System.Collections.ArrayList
$checked = 0

if (-not (Test-Path -LiteralPath $deliveryRoot)) {
    throw "Pasta delivery/ nao encontrada: $deliveryRoot"
}

foreach ($file in Get-ChildItem -Path $deliveryRoot -Recurse -Filter '*.html' -File) {
    $rel = $file.FullName.Substring($deliveryRoot.Length).TrimStart('\', '/')
    $parts = $rel -split '[\\/]'
    if ($parts.Count -lt 2) { continue }
    $product = $parts[0]
    $fileName = $parts[-1]
    $expected = Get-ExpectedRedirectUrl -Product $product -FileName $fileName
    if (-not $expected) {
        [void]$issues.Add("UNKNOWN_PRODUCT: delivery/$rel (produto '$product')")
        continue
    }
    $checked++
    $html = [IO.File]::ReadAllText($file.FullName)
    $found = Get-StubRedirectUrls $html
    if ($found.Count -eq 0) {
        [void]$issues.Add("NO_REDIRECT: delivery/$rel")
        continue
    }
    $expNorm = Normalize-RedirectUrl $expected
    foreach ($u in $found) {
        $norm = Normalize-RedirectUrl $u
        if ($norm -ne $expNorm) {
            [void]$issues.Add("MISMATCH: delivery/$rel -> '$u' (esperado '$expected')")
        }
    }
}

$lines = @(
    "Validacao delivery stubs - $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    "Ficheiros verificados: $checked",
    "Mapa: docs/MAPA_ROTAS_DELIVERY_SUBDOMINIOS.md",
    ''
)
if ($issues.Count -eq 0) {
    $lines += 'OK: todos os stubs apontam para a loja canónica esperada.'
} else {
    $lines += "Problemas: $($issues.Count)"
    $lines += ($issues | Sort-Object)
}
$reportDir = Split-Path $outFile -Parent
if (-not (Test-Path -LiteralPath $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
[System.IO.File]::WriteAllText($outFile, ($lines -join "`r`n") + "`r`n", [Text.UTF8Encoding]::new($false))

Write-Host "=== Delivery stubs - verificados $checked, problemas $($issues.Count) ==="
$issues | Sort-Object | ForEach-Object { Write-Host $_ }
Write-Host "Report: $outFile"
if ($issues.Count -gt 0) { exit 1 }
