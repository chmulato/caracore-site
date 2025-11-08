# Script para converter diagramas Mermaid (.mmd) para PNG
# Requer: npm install -g @mermaid-js/mermaid-cli

Write-Host "=== Conversor de Diagramas Mermaid para PNG ===" -ForegroundColor Cyan
Write-Host ""

# Verifica se o mmdc está instalado
$mmdcInstalled = Get-Command mmdc -ErrorAction SilentlyContinue

if (-not $mmdcInstalled) {
    Write-Host "ERRO: Mermaid CLI (mmdc) não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar, execute:" -ForegroundColor Yellow
    Write-Host "  npm install -g @mermaid-js/mermaid-cli" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou com Chocolatey:" -ForegroundColor Yellow
    Write-Host "  choco install mermaid-cli" -ForegroundColor White
    exit 1
}

Write-Host "Mermaid CLI encontrado: $($mmdcInstalled.Source)" -ForegroundColor Green
Write-Host ""

# Define o diretório dos diagramas
$portfolioDir = "D:\dev\site\cara-core\images\portfolio"

# Lista de arquivos para converter
$diagramas = @(
    "caracore-hub-architecture.mmd",
    "caracore-seed-architecture.mmd",
    "reino-oidc-journey.mmd"
)

# Configuração de qualidade para PNG
$width = 1920
$height = 1080
$backgroundColor = "white"
$scale = 2

Write-Host "Iniciando conversão dos diagramas..." -ForegroundColor Cyan
Write-Host ""

foreach ($diagrama in $diagramas) {
    $inputFile = Join-Path $portfolioDir $diagrama
    $outputFile = $inputFile -replace '\.mmd$', '.png'
    
    if (Test-Path $inputFile) {
        Write-Host "Convertendo: $diagrama" -ForegroundColor Yellow
        
        try {
            # Executa mmdc com configurações de alta qualidade
            & mmdc -i $inputFile -o $outputFile -w $width -H $height -b $backgroundColor -s $scale
            
            if (Test-Path $outputFile) {
                $fileInfo = Get-Item $outputFile
                Write-Host "  ✓ Sucesso! Arquivo gerado: $($fileInfo.Name) ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Erro ao gerar arquivo PNG" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "  ✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    else {
        Write-Host "Arquivo não encontrado: $inputFile" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "=== Conversão Concluída ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Os arquivos PNG foram salvos em:" -ForegroundColor White
Write-Host $portfolioDir -ForegroundColor Cyan
Write-Host ""

# Lista os arquivos PNG gerados
Write-Host "Arquivos gerados:" -ForegroundColor White
Get-ChildItem -Path $portfolioDir -Filter "*.png" | ForEach-Object {
    Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
