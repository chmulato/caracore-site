# Verifica sequencia retro 2026, feed vs disco, indice blog vs disco. Uso: powershell -File tools/validate_integrity_2026.ps1
$ErrorActionPreference = 'Stop'
$retro = Join-Path $PSScriptRoot '..\sala\redes\retro\articles' | Resolve-Path
$feed = Join-Path (Split-Path $retro) 'feed.xml'
$blogRoot = Join-Path $PSScriptRoot '..\personal' | Resolve-Path
$outFile = Join-Path (Join-Path $PSScriptRoot '..') 'sala\regis\VALIDACAO_INTEGRIDADE_2026.txt'

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add(('Integridade 2026 - {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm')))
$lines.Add('')

# Retro: gaps 66..95 among 2026_*_article_*.html
$ids = @()
foreach ($f in Get-ChildItem -LiteralPath $retro -Filter '2026_*_article_*.html' -File) {
  if ($f.Name -match 'article_(\d+)\.html$') { $ids += [int]$Matches[1] }
}
$ids = $ids | Sort-Object -Unique
$min = ($ids | Measure-Object -Minimum).Minimum
$max = ($ids | Measure-Object -Maximum).Maximum
$gaps = @()
for ($i = $min; $i -le $max; $i++) { if ($ids -notcontains $i) { $gaps += $i } }
$lines.Add(('Retro (disco): {0} ficheiros 2026, article_{1}..article_{2}' -f $ids.Count, $min, $max))
if ($gaps.Count -eq 0) { $lines.Add('  Sequencia article_NN: sem lacunas.') }
else { $lines.Add(('  LACUNAS: {0}' -f ($gaps -join ', '))) }

$feedLinks = Select-String -Path $feed -Pattern 'articles/2026_\d{2}_\d{2}_article_\d+\.html' -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Value -replace '^articles/', '' } | Sort-Object -Unique
$disk = Get-ChildItem -LiteralPath $retro -Filter '2026_*_article_*.html' | ForEach-Object { $_.Name } | Sort-Object -Unique
$onlyFeed = $feedLinks | Where-Object { $_ -notin $disk }
$onlyDisk = $disk | Where-Object { $_ -notin $feedLinks }
$lines.Add('Retro feed.xml vs disco (2026):')
$lines.Add(('  feed: {0} | disco: {1}' -f $feedLinks.Count, $disk.Count))
if ($onlyFeed) { $lines.Add(('  No feed mas nao no disco: {0}' -f ($onlyFeed -join ', '))) }
if ($onlyDisk) { $lines.Add(('  No disco mas nao no feed: {0}' -f ($onlyDisk -join ', '))) }
if (-not $onlyFeed -and -not $onlyDisk) { $lines.Add('  OK: feed alinhado ao disco.') }
$lines.Add('')

# Blog index vs 2026 files
$indexPath = Join-Path $blogRoot 'index.html'
$idxHtml = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
$linked = [regex]::Matches($idxHtml, 'href="articles/(2026_[^"]+\.html)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$onDisk = Get-ChildItem (Join-Path $blogRoot 'articles') -Filter '2026_*.html' -File | ForEach-Object { $_.Name } | Sort-Object -Unique
$miss = $linked | Where-Object { $_ -notin $onDisk }
$orph = $onDisk | Where-Object { $_ -notin $linked }
$lines.Add(('Blog personal (2026): {0} HTML, {1} href no index' -f $onDisk.Count, $linked.Count))
if ($miss) { $lines.Add(('  ERRO href sem ficheiro: {0}' -f ($miss -join ', '))) } else { $lines.Add('  OK: todos os href do index existem.') }
if ($orph) { $lines.Add(('  Aviso: ficheiros sem entrada na lista principal: {0}' -f ($orph -join ', '))) } else { $lines.Add('  OK: sem HTML 2026 orfao face ao index.') }

[System.IO.File]::WriteAllLines($outFile, $lines, [System.Text.UTF8Encoding]::new($false))
Write-Host $outFile
