# Validate: (1) strict UTF-8 (2) common Portuguese mojibake (UTF-8 valid but wrong glyphs)
# Patterns use Unicode escapes only (ASCII source file).
$ErrorActionPreference = "Stop"
$devRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path (Join-Path $devRoot "caracore-pdv-releases"))) {
    $devRoot = "D:\dev"
}

$stores = @(Get-ChildItem -Path $devRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "caracore-*-releases" })
if (Test-Path (Join-Path $devRoot "reino-oidc-releases")) {
    $stores = @($stores) + (Get-Item (Join-Path $devRoot "reino-oidc-releases"))
}

# Regex patterns (ASCII only). Mojibake = U+00C3 prefix pairs common when Latin-1/Win-1252 misread as UTF-8.
$patternList = @(
    @{ Name = "Informatica_classic"; Pattern = "Inform\u00C3\u00A1tica" }
    @{ Name = "Navegacao";             Pattern = "Navega\u00C3\u00A7\u00C3\u00A3o" }
    @{ Name = "emdash_threechar";      Pattern = "\u00E2\u20AC\u201D" }    # classic â€" for en/em dash
    @{ Name = "Middle_dot_mojibake";   Pattern = "\u00C2\u00B7" }      # Â·
    @{ Name = "cao_suffix";            Pattern = "\u00C3\u00A7\u00C3\u00A3o" }
    @{ Name = "voce";                  Pattern = "voc\u00C3\u00AA" }
    @{ Name = "nao";                   Pattern = "n\u00C3\u00A3o" }
)

$summary = @{}
$all = New-Object System.Collections.ArrayList

foreach ($store in $stores | Sort-Object Name) {
    $docs = Join-Path $store.FullName "docs"
    if (-not (Test-Path $docs)) { continue }
    $html = Get-ChildItem -Path $docs -Filter "*.html" -Recurse -File
    $summary[$store.Name] = @{ NotUtf8 = 0; Mojibake = 0 }
    foreach ($f in $html) {
        $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
        $rel = $f.FullName.Substring($devRoot.Length).TrimStart("\")
        $utf8Strict = New-Object System.Text.UTF8Encoding $false, $true
        try {
            $text = $utf8Strict.GetString($bytes)
        } catch {
            [void]$all.Add([pscustomobject]@{ Relative = $rel; Kind = "NOT_UTF8"; Detail = $_.Exception.Message })
            $summary[$store.Name].NotUtf8++
            continue
        }
        $labels = New-Object System.Collections.Generic.HashSet[string]
        foreach ($p in $patternList) {
            if ([regex]::IsMatch($text, $p.Pattern)) {
                [void]$labels.Add($p.Name)
            }
        }
        if ($labels.Count -gt 0) {
            $detail = ($labels | Sort-Object) -join "; "
            [void]$all.Add([pscustomobject]@{ Relative = $rel; Kind = "MOJIBAKE_SUSPECT"; Detail = $detail })
            $summary[$store.Name].Mojibake++
        }
    }
}

Write-Host "=== RESUMO POR LOJA (docs/**/*.html) ==="
Write-Host "NOT_UTF8 = ficheiro nao e UTF-8 valido (strict)."
Write-Host "MOJIBAKE_SUSPECT = UTF-8 valido mas padroes tipicos de texto PT corrompido."
Write-Host ""
foreach ($name in ($summary.Keys | Sort-Object)) {
    $s = $summary[$name]
    Write-Host ("{0}: NOT_UTF8={1}  MOJIBAKE_SUSPECT={2}" -f $name, $s.NotUtf8, $s.Mojibake)
}
$total = ($all | Measure-Object).Count
Write-Host ""
Write-Host "Total linhas de relatorio: $total"
Write-Host ""
Write-Host "=== LISTAGEM ==="
$all | Sort-Object Relative | ForEach-Object { Write-Host ($_.Relative + " | " + $_.Kind + " | " + $_.Detail) }
