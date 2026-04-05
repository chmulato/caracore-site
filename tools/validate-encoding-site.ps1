# Validação de encoding do site matriz — delegado para Python.
# Preferir: python tools/validate_encoding.py site
$ErrorActionPreference = "Stop"
$siteRoot = Split-Path $PSScriptRoot -Parent
$py = Join-Path $PSScriptRoot "validate_encoding.py"
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if (-not $python) {
    Write-Error "Python 3 não encontrado no PATH. Instale Python e use: python tools/validate_encoding.py site"
    exit 2
}
& $python.Source $py site --root $siteRoot
exit $LASTEXITCODE
