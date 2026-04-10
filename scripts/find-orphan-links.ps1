# Find internal href, src, srcset, poster, og:image / twitter:image in caracore-site that point to missing files.
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

function Get-SrcsFromHtml([string]$content) {
    $out = [System.Collections.Generic.List[string]]::new()
    foreach ($pat in @('src\s*=\s*"(?<u>[^"]*)"', "src\s*=\s*'(?<u>[^']*)'")) {
        foreach ($m in [regex]::Matches($content, $pat, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            $v = $m.Groups["u"].Value
            if ($v -and $v.Trim() -ne "") { [void]$out.Add($v) }
        }
    }
    return $out
}

function Get-SrcsetUrlsFromHtml([string]$content) {
    $urls = [System.Collections.Generic.List[string]]::new()
    foreach ($pat in @('srcset\s*=\s*"(?<u>[^"]*)"', "srcset\s*=\s*'(?<u>[^']*)'")) {
        foreach ($m in [regex]::Matches($content, $pat, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            $raw = $m.Groups["u"].Value
            if (-not $raw) { continue }
            foreach ($part in $raw -split ',') {
                $t = $part.Trim() -replace '\s+[\d.]+[wx]\s*$', '' -replace '\s+$', ''
                if ($t) { [void]$urls.Add($t) }
            }
        }
    }
    return $urls
}

function Get-MetaSocialImageContents([string]$content) {
    $urls = [System.Collections.Generic.List[string]]::new()
    foreach ($prop in @('og:image', 'twitter:image')) {
        foreach ($m in [regex]::Matches($content, "<meta[^>]+(?:property|name)\s*=\s*`"$prop`"[^>]+>", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            $t = $m.Value
            if ($t -match 'content\s*=\s*"(?<u>[^"]*)"') { [void]$urls.Add($Matches['u']) }
        }
        foreach ($m in [regex]::Matches($content, "<meta[^>]+content\s*=\s*`"[^`"]+`"[^>]+(?:property|name)\s*=\s*`"$prop`"", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            $t = $m.Value
            if ($t -match 'content\s*=\s*"(?<u>[^"]*)"') { [void]$urls.Add($Matches['u']) }
        }
    }
    return $urls
}

function Get-PostersFromHtml([string]$content) {
    $out = [System.Collections.Generic.List[string]]::new()
    foreach ($pat in @('poster\s*=\s*"(?<u>[^"]*)"', "poster\s*=\s*'(?<u>[^']*)'")) {
        foreach ($m in [regex]::Matches($content, $pat, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            $v = $m.Groups["u"].Value
            if ($v -and $v.Trim() -ne "") { [void]$out.Add($v) }
        }
    }
    return $out
}

function Test-InternalSiteRef {
    param(
        [string]$Ref,
        [string]$SourceFile,
        [string]$SiteRoot
    )
    $h = $Ref.Trim()
    # Placeholders em exemplos de código (gulp, templates, etc.)
    if ($h -match '\+\s*filepath\s*\+' -or $h -match '^\{[a-zA-Z_][a-zA-Z0-9_]*\}$') { return $null }
    if ($h -match '^(https?:)?//' -or $h -match '^(mailto:|tel:|javascript:|blob:)') { return $null }
    if ($h -match '^data:' -or $h -match '^\{\{') { return $null }
    if ($h -eq '#' -or $h.StartsWith('#')) { return $null }
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
            foreach ($ix in @('index.html', 'index.htm', 'default.html')) {
                $ixp = Join-Path $target $ix
                if (Test-Path -LiteralPath $ixp) { return $null }
            }
            return "MISSING_DIR_INDEX: $h -> $target"
        }
        return $null
    }
    if ($pathPart -notmatch '\.[a-zA-Z0-9]{1,8}$') {
        foreach ($ext in @('.html', '.htm')) {
            $t2 = $target + $ext
            if (Test-Path -LiteralPath $t2) { return $null }
        }
    }
    return "MISSING: $h -> $target"
}

function Resolve-WithBase {
    param([string]$Ref, [string]$BaseHref, [string]$SourceFile)
    $resolved = $Ref
    if ($BaseHref -and -not ($Ref -match '^(https?:)?//' -or $Ref.StartsWith('/'))) {
        try {
            $u = [Uri]::new([Uri]$BaseHref, $Ref)
            $resolved = $u.LocalPath + $u.Query + $u.Fragment
        } catch { }
    }
    return $resolved
}

$files = Get-ChildItem -Path $siteRoot -Recurse -Include *.html, *.htm -File |
    Where-Object {
        $p = $_.FullName
        $p -notmatch '\\\.git\\' -and
        $p -notmatch '\\delivery\\' -and
        $p -notmatch '\\node_modules\\' -and
        $p -notmatch '\\backend\\' -and
        $p -notmatch '\\htmlcov\\'
    }

$issues = New-Object System.Collections.ArrayList
foreach ($f in $files) {
    $raw = [IO.File]::ReadAllText($f.FullName)
    $baseHref = $null
    if ($raw -match '<base[^>]+href\s*=\s*"([^"]+)"') { $baseHref = $Matches[1].TrimEnd('/') }
    if ($raw -match "<base[^>]+href\s*=\s*'([^']+)'") { $baseHref = $Matches[1].TrimEnd('/') }

    $relPath = $f.FullName.Substring($siteRoot.Length).TrimStart('\')

    foreach ($href in (Get-HrefsFromHtml $raw) | Select-Object -Unique) {
        $resolved = Resolve-WithBase -Ref $href -BaseHref $baseHref -SourceFile $f.FullName
        $r = Test-InternalSiteRef -Ref $resolved -SourceFile $f.FullName -SiteRoot $siteRoot
        if ($r) {
            [void]$issues.Add([pscustomobject]@{ Source = $relPath; Kind = 'href'; Ref = $href; Detail = $r })
        }
    }

    foreach ($src in (Get-SrcsFromHtml $raw) | Select-Object -Unique) {
        $resolved = Resolve-WithBase -Ref $src -BaseHref $baseHref -SourceFile $f.FullName
        $r = Test-InternalSiteRef -Ref $resolved -SourceFile $f.FullName -SiteRoot $siteRoot
        if ($r) {
            [void]$issues.Add([pscustomobject]@{ Source = $relPath; Kind = 'src'; Ref = $src; Detail = $r })
        }
    }

    foreach ($u in (Get-SrcsetUrlsFromHtml $raw) | Select-Object -Unique) {
        $resolved = Resolve-WithBase -Ref $u -BaseHref $baseHref -SourceFile $f.FullName
        $r = Test-InternalSiteRef -Ref $resolved -SourceFile $f.FullName -SiteRoot $siteRoot
        if ($r) {
            [void]$issues.Add([pscustomobject]@{ Source = $relPath; Kind = 'srcset'; Ref = $u; Detail = $r })
        }
    }

    foreach ($poster in (Get-PostersFromHtml $raw) | Select-Object -Unique) {
        $resolved = Resolve-WithBase -Ref $poster -BaseHref $baseHref -SourceFile $f.FullName
        $r = Test-InternalSiteRef -Ref $resolved -SourceFile $f.FullName -SiteRoot $siteRoot
        if ($r) {
            [void]$issues.Add([pscustomobject]@{ Source = $relPath; Kind = 'poster'; Ref = $poster; Detail = $r })
        }
    }

    foreach ($mic in (Get-MetaSocialImageContents $raw) | Select-Object -Unique) {
        $resolved = Resolve-WithBase -Ref $mic -BaseHref $baseHref -SourceFile $f.FullName
        $r = Test-InternalSiteRef -Ref $resolved -SourceFile $f.FullName -SiteRoot $siteRoot
        if ($r) {
            [void]$issues.Add([pscustomobject]@{ Source = $relPath; Kind = 'meta-og/twitter:image'; Ref = $mic; Detail = $r })
        }
    }

}

Write-Host ("=== Recursos internos em falta (href, src, srcset, poster, og/twitter:image) - total {0} ===" -f $issues.Count)
$issues | Sort-Object Source, Kind, Ref | ForEach-Object { Write-Host ('{0} | {1} | {2} | {3}' -f $_.Source, $_.Kind, $_.Ref, $_.Detail) }
