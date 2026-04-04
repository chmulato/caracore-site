# Find internal hrefs in caracore-site that point to missing files (broken links).
# Usage: powershell -File find-orphan-links.ps1
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path (Join-Path $repoRoot "caracore-site\index.html"))) {
    $repoRoot = "D:\dev"
}
$siteRoot = Join-Path $repoRoot "caracore-site"
if (-not (Test-Path $siteRoot)) { throw "caracore-site not found: $siteRoot" }

function Get-HrefsFromHtml([string]$content) {
    $hrefs = [regex]::Matches($content, 'href\s*=\s*"(?<u>[^"]*)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) |
        ForEach-Object { $_.Groups["u"].Value }
    $hrefs += [regex]::Matches($content, "href\s*=\s*'(?<u>[^']*)'", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) |
        ForEach-Object { $_.Groups["u"].Value }
    return $hrefs | Where-Object { $_ -and $_.Trim() -ne "" }
}

function Test-InternalHref {
    param(
        [string]$Href,
        [string]$SourceFile,
        [string]$SiteRoot
    )
    $h = $Href.Trim()
    if ($h -match '^(https?:)?//' -or $h -match '^(mailto:|tel:|javascript:)') { return $null }
    if ($h -eq '#' -or $h.StartsWith('#')) { return $null }
    # strip query and fragment for file check
    $pathPart = $h -replace '[?#].*$', ''
    if ($pathPart -eq '' -or $pathPart -eq '/') { return $null }

    $target = $null
    if ($pathPart.StartsWith('/')) {
        $rel = $pathPart.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        $target = Join-Path $SiteRoot $rel
    } else {
        $dir = Split-Path -Parent $SourceFile
        $combined = Join-Path $dir $pathPart
        try {
            $target = [IO.Path]::GetFullPath($combined)
        } catch { return "BAD_PATH: $h" }
    }

    if (-not $target.StartsWith($SiteRoot, [StringComparison]::OrdinalIgnoreCase)) {
        return $null
    }
    if (Test-Path -LiteralPath $target) {
        if (Test-Path -LiteralPath $target -PathType Container) {
            # directory: accept if index.html or index.htm exists
            foreach ($ix in @('index.html', 'index.htm', 'default.html')) {
                $ixp = Join-Path $target $ix
                if (Test-Path -LiteralPath $ixp) { return $null }
            }
            return "MISSING_DIR_INDEX: $h -> $target"
        }
        return $null
    }
    # try .html if no extension
    if ($pathPart -notmatch '\.[a-zA-Z0-9]{1,8}$') {
        foreach ($ext in @('.html', '.htm')) {
            $t2 = $target + $ext
            if (Test-Path -LiteralPath $t2) { return $null }
        }
    }
    return "MISSING: $h -> $target"
}

$files = Get-ChildItem -Path $siteRoot -Recurse -Include *.html, *.htm -File |
    Where-Object {
        $p = $_.FullName
        $p -notmatch '\\\.git\\' -and
        $p -notmatch '\\delivery_old\\' -and
        $p -notmatch '\\node_modules\\'
    }

$issues = New-Object System.Collections.ArrayList
foreach ($f in $files) {
    $raw = [IO.File]::ReadAllText($f.FullName)
    $baseHref = $null
    if ($raw -match '<base[^>]+href\s*=\s*"([^"]+)"') { $baseHref = $Matches[1].TrimEnd('/') }
    $hrefs = Get-HrefsFromHtml $raw
    foreach ($href in $hrefs | Select-Object -Unique) {
        $resolved = $href
        if ($baseHref -and -not ($href -match '^(https?:)?//' -or $href.StartsWith('/'))) {
            try {
                $u = [Uri]::new([Uri]$baseHref, $href)
                $resolved = $u.LocalPath + $u.Query + $u.Fragment
            } catch { }
        }
        $r = Test-InternalHref -Href $resolved -SourceFile $f.FullName -SiteRoot $siteRoot
        if ($r) {
            [void]$issues.Add([pscustomobject]@{
                Source = $f.FullName.Substring($siteRoot.Length).TrimStart('\')
                Href   = $href
                Detail = $r
            })
        }
    }
}

Write-Host "=== Links internos com destino em falta (amostra / total $($issues.Count)) ==="
$issues | Sort-Object Source, Href | ForEach-Object { Write-Host "$($_.Source) | $($_.Href) | $($_.Detail)" }
