<#
sync-consolidate-master.ps1
Script seguro para criar backup remoto, alinhar master com origin/master
e reaplicar alterações locais de forma controlada.

Instruções:
- Abra PowerShell com `git` disponível no PATH.
- Navegue até a raiz do repositório ou ajuste a variável `$repo` abaixo.
- Execute: `.uild-sync-consolidate-master.ps1` (ou `.
un` se preferir).
#>

Set-StrictMode -Version Latest

# Ajuste se necessário
$repo = "d:\\onedrive\\dev\\caracore-site"
if (-not (Test-Path $repo)) { Write-Error "Repositório não encontrado: $repo"; exit 1 }
Set-Location $repo

# Verifica disponibilidade do git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git não encontrado no PATH. Abra um terminal com git instalado."; exit 1
}

Write-Host "== Iniciando sincronização e consolidação de branches =="

# 1) Verificar status
$porcelain = git status --porcelain
if ($porcelain) {
  Write-Host "Há alterações locais não commitadas. Efetuando commit temporário (recomendado)."
  git add -A
  git commit -m "WIP: salvando alterações locais antes de sincronizar master" | Out-Null
}

# 2) Criar branch de backup com timestamp e enviar para origin
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = "backup-local-$ts"
git branch $backup
git push origin $backup

# 3) Buscar e atualizar refs remotos
git fetch origin --prune

Write-Host "Backup criado em origin/$backup"

# 4) Mostrar commits locais não presentes em origin/master (inspeção)
Write-Host "Commits locais exclusivos (master vs origin/master):"
git --no-pager log --oneline origin/master..master | Out-Host

Read-Host -Prompt "Pressione Enter para continuar com reset hard de master para origin/master (ou Ctrl+C para abortar)"

# 5) Reset de master para origin/master
git checkout master
git reset --hard origin/master

# 6) Reaplicar alterações do backup (merge seguro)
git merge --no-ff $backup -m "merge: reaplicar alterações locais salvas em $backup"

# 7) Push final usando force-with-lease (mais seguro que force simples)
git push --force-with-lease origin master

Write-Host "Push finalizado (origin/master atualizado)."

# 8) Listar branches locais e remotos para verificação
Write-Host "\nBranches locais:"; git branch
Write-Host "\nBranches remotas (origin):"; git branch -r

Write-Host "\nConcluído. Backup remoto: origin/$backup";

exit 0
