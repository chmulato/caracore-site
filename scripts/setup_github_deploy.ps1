# Script para configurar GitHub Actions secret com perfil de publicação Azure
# Uso: .\setup_github_deploy.ps1

Write-Host "🔧 Configurando GitHub Actions para deploy automático no Azure" -ForegroundColor Cyan
Write-Host ""

# Variáveis
$resourceGroup = "rg-caracore"
$appName = "caracore-backend"
$repo = "chmulato/cara-core"

# 1. Obter perfil de publicação do Azure
Write-Host "📥 Obtendo perfil de publicação do Azure..." -ForegroundColor Yellow
$publishProfile = az webapp deployment list-publishing-profiles `
    --name $appName `
    --resource-group $resourceGroup `
    --xml

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao obter perfil de publicação" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Perfil de publicação obtido" -ForegroundColor Green

# 2. Salvar em arquivo temporário (será excluído)
$tempFile = "publish_profile_temp.xml"
$publishProfile | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host ""
Write-Host "📋 Para configurar o GitHub Actions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse: https://github.com/$repo/settings/secrets/actions" -ForegroundColor White
Write-Host ""
Write-Host "2. Clique em 'New repository secret'" -ForegroundColor White
Write-Host ""
Write-Host "3. Configure:" -ForegroundColor White
Write-Host "   Nome: AZURE_WEBAPP_PUBLISH_PROFILE" -ForegroundColor Yellow
Write-Host "   Valor: [Cole o conteúdo do arquivo $tempFile]" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Clique em 'Add secret'" -ForegroundColor White
Write-Host ""

# Opção: configurar automaticamente via GitHub CLI (se instalado)
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled) {
    Write-Host "🤖 GitHub CLI detectado! Deseja configurar automaticamente? (S/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host "🚀 Configurando secret via GitHub CLI..." -ForegroundColor Yellow
        
        gh secret set AZURE_WEBAPP_PUBLISH_PROFILE `
            --repo $repo `
            --body-file $tempFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Secret configurado com sucesso!" -ForegroundColor Green
            Remove-Item $tempFile -Force
            Write-Host "🗑️  Arquivo temporário removido" -ForegroundColor Gray
        } else {
            Write-Host "❌ Erro ao configurar secret. Configure manualmente." -ForegroundColor Red
            Write-Host "📄 Arquivo salvo em: $tempFile" -ForegroundColor Yellow
        }
    } else {
        Write-Host "📄 Perfil de publicação salvo em: $tempFile" -ForegroundColor Yellow
        Write-Host "⚠️  Lembre-se de deletar este arquivo após configurar!" -ForegroundColor Red
    }
} else {
    Write-Host "💡 Dica: Instale GitHub CLI para configurar automaticamente:" -ForegroundColor Cyan
    Write-Host "   winget install GitHub.cli" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📄 Perfil de publicação salvo em: $tempFile" -ForegroundColor Yellow
    Write-Host "⚠️  Lembre-se de deletar este arquivo após configurar!" -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 Próximos passos após configurar o secret:" -ForegroundColor Cyan
Write-Host "1. git add .github/workflows/azure-backend-deploy.yml" -ForegroundColor White
Write-Host "2. git commit -m 'ci: Adicionar GitHub Actions para deploy Azure'" -ForegroundColor White
Write-Host "3. git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "🎯 O deploy será executado automaticamente a cada push em 'main' que altere 'backend/**'" -ForegroundColor Green
