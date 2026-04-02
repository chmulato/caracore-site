# Equaliza imagens do blog: copia legado -> canonico quando a origem existe e o destino nao.
# Series (indice *_index.html): nao usar este script para renomear cartoes — ver assets/img/README.txt
# Nao cobre renomeacoes entre meses diferentes de artigos distintos (fazer manual).
# Uso: powershell -File tools/equalize_article_images.ps1
$ErrorActionPreference = 'Stop'

$blogImg = (Join-Path (Join-Path $PSScriptRoot '..') 'personal\articles\assets\img')
if (-not (Test-Path $blogImg)) { New-Item -ItemType Directory -Path $blogImg -Force | Out-Null }
$blogImg = Resolve-Path $blogImg
$logFile = Join-Path (Join-Path $PSScriptRoot '..') 'sala\regis\MANIFEST_EQUALIZACAO_IMAGENS.txt'

# Origem = ficheiro antigo no disco; Destino = nome que o HTML ja referencia hoje
$blogPairs = [ordered]@{
  '2026_03_24_IMAGE_001.png' = '2026_04_02_IMAGE_001.png'
  '2026_02_15_IMAGE_001.png' = '2026_02_05_IMAGE_001.png'
  '2026_02_28_IMAGE_001.png' = '2026_02_22_IMAGE_001.png'
  '2026_03_10_IMAGE_001.png' = '2026_03_08_IMAGE_001.png'
  '2026_05_09_IMAGE_001.png' = '2026_05_10_IMAGE_001.png'
  '2026_03_30_IMAGE_001.png' = '2026_04_25_IMAGE_001.png'
  '2026_03_03_IMAGE_001.png' = '2026_04_03_IMAGE_001.png'
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("Equalizacao: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
$lines.Add("Blog img: $blogImg")
$lines.Add("")

$copied = 0
foreach ($srcName in $blogPairs.Keys) {
  $dstName = $blogPairs[$srcName]
  $src = Join-Path $blogImg $srcName
  $dst = Join-Path $blogImg $dstName
  if (Test-Path -LiteralPath $dst) {
    $lines.Add("OK exists: $dstName")
    continue
  }
  if (Test-Path -LiteralPath $src) {
    Copy-Item -LiteralPath $src -Destination $dst -Force
    $lines.Add("COPIED: $srcName -> $dstName")
    $copied++
  } else {
    $lines.Add("SKIP no source: $srcName -> $dstName")
  }
}

$lines.Add("")
$lines.Add("Copies performed: $copied")
$lines.Add("")
$lines.Add("Manual (artigos 2025_12_09 / 2025_12_10): se ainda tiver PNG com nome 2026_02_05_*,")
$lines.Add("renomeie para 2025_12_09_* conforme README em personal/articles/assets/img/")

$dir = Split-Path $logFile
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
[System.IO.File]::WriteAllText($logFile, ($lines -join "`r`n") + "`r`n", [System.Text.UTF8Encoding]::new($false))
Write-Host "Wrote $logFile ; copies: $copied"
Get-Content $logFile
