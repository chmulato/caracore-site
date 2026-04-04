# Move <meta charset> to immediately after <head> when it falls after the first 1024 bytes (HTML5 prescan).
param(
    [string]$RootPath = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding($false)
# Matches <meta charset="UTF-8">, <meta charset="UTF-8" />, optional leading whitespace
$charsetMetaRegex = '(?i)\s*<meta\s+charset\s*=\s*["'']UTF-8["'']\s*/?>'

$files = Get-ChildItem -LiteralPath $RootPath -Recurse -File |
    Where-Object { $_.Extension -match '^\.html?$' -and $_.FullName -notmatch '\\tools\\' }

$changed = 0
foreach ($file in $files) {
    $raw = [IO.File]::ReadAllText($file.FullName, $utf8)
    $idx = $raw.IndexOf('<meta charset', [StringComparison]::OrdinalIgnoreCase)
    if ($idx -lt 0) { continue }

    $bytesBefore = $utf8.GetByteCount($raw.Substring(0, $idx))
    if ($bytesBefore -lt 1024) { continue }

    $without = [regex]::Replace($raw, $charsetMetaRegex, '', 1)
    if ($without -eq $raw) {
        Write-Host "SKIP (regex no match): $($file.FullName)" -ForegroundColor Yellow
        continue
    }

    $headMatch = [regex]::Match($without, '(?i)<head[^>]*>\s*')
    if (-not $headMatch.Success) {
        Write-Host "SKIP (no head): $($file.FullName)" -ForegroundColor Yellow
        continue
    }

    $headEnd = $headMatch.Index + $headMatch.Length
    $newRaw = $without.Substring(0, $headEnd) + '<meta charset="UTF-8">' + "`r`n" + $without.Substring($headEnd)

    [IO.File]::WriteAllText($file.FullName, $newRaw, $utf8)
    $changed++
    Write-Host "OK: $($file.FullName)"
}

Write-Host "--- Updated: $changed file(s)"
