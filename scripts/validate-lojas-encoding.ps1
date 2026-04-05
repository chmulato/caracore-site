# Validação encoding das lojas (*-releases/docs) — delegado para Python.
# Preferir: python tools/validate_encoding.py lojas
$ErrorActionPreference = "Stop"
$caracoreSite = Split-Path $PSScriptRoot -Parent
$py = Join-Path $caracoreSite "tools\validate_encoding.py"
$devRoot = Split-Path $caracoreSite -Parent
if (-not (Test-Path (Join-Path $devRoot "caracore-pdv-releases"))) {
    $devRoot = "D:\dev"
}
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if (-not $python) {
    Write-Error "Python 3 não encontrado no PATH."
    exit 2
}
& $python.Source $py lojas --root $devRoot
exit $LASTEXITCODE
