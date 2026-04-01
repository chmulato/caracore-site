# Validate image refs: retro article_NN vs filename; blog file exists and date prefix.
# Use: powershell -File tools/validate_article_images.ps1
# Note: Do not use ForEach-Object { return } — return exits the whole pipeline.
$ErrorActionPreference = 'Stop'
$retroRoot = Join-Path $PSScriptRoot '..\sala\redes\retro\articles' | Resolve-Path
$blogRoot = Join-Path $PSScriptRoot '..\personal\articles' | Resolve-Path
$outFile = Join-Path (Join-Path $PSScriptRoot '..') 'sala\regis\VALIDACAO_IMAGENS_RETRO_BLOG.txt'
$issues = New-Object System.Collections.Generic.List[string]

function Get-RetroArticleId([string]$name) {
  if ($name -match '^(\d{4}_\d{2}_\d{2})_article_(\d+)\.html$') { return [int]$Matches[2] }
  return $null
}

function Get-BlogPrefix([string]$name) {
  if ($name -match '^(\d{4}_\d{2}_\d{2})_') { return $Matches[1] }
  return $null
}

function Is-BlogIndexPage([string]$name) {
  return $name -match '_index\.html$'
}

foreach ($file in Get-ChildItem $retroRoot -Filter '*.html' -File) {
  $name = $file.Name
  $aid = Get-RetroArticleId $name
  if ($null -eq $aid) { continue }
  $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $base = $file.DirectoryName
  foreach ($m in [regex]::Matches($html, '(?:src|content)=["'']([^"'']+\.(?:png|jpg|jpeg|gif|webp|svg))["'']', 'IgnoreCase')) {
    $u = $m.Groups[1].Value.Trim()
    if ($u -match '^data:' -or $u -match '^\{\{') { continue }
    if ($u -match '^https?://') {
      if ($u -match 'article_(\d+)_') {
        $imgId = [int]$Matches[1]
        if ($imgId -ne $aid -and $u -notmatch 'logo') {
          $issues.Add("RETRO ID: $name - URL uses article_$imgId but HTML is article_${aid}: $u")
        }
      }
      continue
    }
    $rel = $u -replace '/', '\'
    $local = Join-Path $base $rel
    if ($u -match 'article_(\d+)_') {
      $imgId = [int]$Matches[1]
      if ($imgId -ne $aid -and $u -notmatch 'logo') {
        $issues.Add("RETRO ID: $name - img article_$imgId vs article $aid : $u")
      }
    }
    if (-not (Test-Path -LiteralPath $local)) {
      $issues.Add("RETRO MISSING: $name - $u")
    }
  }
}

foreach ($file in Get-ChildItem $blogRoot -Filter '*.html' -File) {
  $name = $file.Name
  $prefix = Get-BlogPrefix $name
  if (-not $prefix) { continue }
  $skipDate = Is-BlogIndexPage $name
  $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $base = $file.DirectoryName
  $seen = @{}
  foreach ($m in [regex]::Matches($html, '(?:src|content)=["'']([^"'']+\.(?:png|jpg|jpeg|gif|webp|svg))["'']', 'IgnoreCase')) {
    $u = $m.Groups[1].Value.Trim()
    if ($seen.ContainsKey($u)) { continue }
    $seen[$u] = $true
    if ($u -match '^https?://' -or $u -match '^data:') { continue }
    $rel = $u -replace '/', '\'
    $local = Join-Path $base $rel
    if (-not (Test-Path -LiteralPath $local)) {
      $issues.Add("BLOG MISSING: $name - $u")
    }
    if (-not $skipDate -and $u -match 'assets/img/(\d{4}_\d{2}_\d{2})_') {
      $d = $Matches[1]
      if ($d -ne $prefix -and $u -notmatch 'favicon') {
        $issues.Add("BLOG DATE: $name - article $prefix but asset $d in $u")
      }
    }
  }
}

$hdr = @"
Validation: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
Retro: $retroRoot
Blog:  $blogRoot

Rules:
- Retro: article_NN in image path must match NN in filename (except logo.png).
- Blog: referenced files must exist under the article folder.
- Blog date: assets/img/YYYY_MM_DD_* must match the article filename date, except *_index.html (cards for several episodes).

"@
$body = if ($issues.Count -eq 0) {
  "OK: no problems detected.`n"
} else {
  (($issues | Sort-Object -Unique) -join "`r`n") + "`r`n"
}
$null = New-Item -ItemType File -Path $outFile -Force
[System.IO.File]::WriteAllText($outFile, $hdr + $body, [System.Text.UTF8Encoding]::new($false))
Write-Host "Unique issues: $(($issues | Sort-Object -Unique).Count)"
Write-Host "Report: $outFile"
