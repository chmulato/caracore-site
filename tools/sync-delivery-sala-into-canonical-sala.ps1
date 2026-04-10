#Requires -Version 5.1
# Une o conteudo de delivery*/sala/ na Sala canonica sala/: (1) ficheiros que so existem na fonte;
# (2) onde ambos existem e diferem, prefere-se o ficheiro com maior tamanho (heuristica para paginas completas vs fragmentos).
# Revisar diff no Git antes de commit.
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$srcCandidates = @((Join-Path $repo 'delivery\sala'))
$src = $null
foreach ($candidate in $srcCandidates) {
  if (Test-Path -LiteralPath $candidate) {
    $src = $candidate
    break
  }
}
$dst = Join-Path $repo 'sala'
if (-not $src) {
  Write-Host 'Nenhuma fonte legado encontrada em delivery/sala. Nada para sincronizar.'
  exit 0
}

$copied = 0
$updated = 0
$skipped = 0

Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($src.Length).TrimStart('\')
  $target = Join-Path $dst $rel
  $dir = Split-Path -Parent $target
  if (-not (Test-Path -LiteralPath $target)) {
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Copy-Item -LiteralPath $_.FullName -Destination $target -Force
    $script:copied++
    return
  }
  $h1 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
  $h2 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
  if ($h1 -eq $h2) { $script:skipped++; return }
  $s1 = (Get-Item -LiteralPath $_.FullName).Length
  $s2 = (Get-Item -LiteralPath $target).Length
  if ($s1 -gt $s2) {
    Copy-Item -LiteralPath $_.FullName -Destination $target -Force
    $script:updated++
  }
  else {
    $script:skipped++
  }
}

Write-Host "Novos em sala/ (copiados do legado): $copied"
Write-Host "Atualizados em sala/ (delivery maior que canonico): $updated"
Write-Host "Mantido canonico (igual ou sala maior): $skipped"
