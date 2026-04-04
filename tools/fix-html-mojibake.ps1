# Fix UTF-8 misinterpreted as CP1252 (mojibake) in HTML and Markdown under this repo.
param(
    [string]$RootPath = (Split-Path -Parent $PSScriptRoot),
    [switch]$WhatIf,
    [switch]$HtmlOnly,
    [switch]$MarkdownOnly
)

$ErrorActionPreference = "Stop"
$cp1252 = [Text.Encoding]::GetEncoding(1252)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$mojibakePattern = '\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]{1,2}|\uFFFD'

$includeHtml = -not $MarkdownOnly
$includeMd = -not $HtmlOnly

$files = Get-ChildItem -LiteralPath $RootPath -Recurse -File |
    Where-Object {
        $_.FullName -notmatch '\\tools\\|\\node_modules\\|\\.git\\' -and (
            ($includeHtml -and $_.Extension -match '^\.html?$') -or
            ($includeMd -and $_.Extension -eq '.md')
        )
    }

$fixed = 0
$skipped = 0
$errors = New-Object System.Collections.ArrayList

foreach ($f in $files) {
    try {
        $raw = [IO.File]::ReadAllText($f.FullName, $utf8NoBom)
        $before = [regex]::Matches($raw, $mojibakePattern).Count
        if ($before -le 0) { continue }

        $newText = [Text.Encoding]::UTF8.GetString($cp1252.GetBytes($raw))
        $after = [regex]::Matches($newText, $mojibakePattern).Count

        if ($newText -eq $raw) {
            $skipped++
            continue
        }
        if ($after -ge $before -and $after -gt 0) {
            $skipped++
            Write-Host "WARN: $($f.FullName) markers $before -> $after (not writing)" -ForegroundColor Yellow
            continue
        }
        if ($WhatIf) {
            Write-Host "Would fix: $($f.FullName) ($before -> $after)"
            $fixed++
            continue
        }
        [IO.File]::WriteAllText($f.FullName, $newText, $utf8NoBom)
        $fixed++
        Write-Host "OK: $($f.Name)  markers $before -> $after"
    }
    catch {
        [void]$errors.Add("$($f.FullName): $_")
    }
}

Write-Host "--- Fixed: $fixed  skipped: $skipped  errors: $($errors.Count)"
$errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
if ($errors.Count -gt 0) { exit 1 }
