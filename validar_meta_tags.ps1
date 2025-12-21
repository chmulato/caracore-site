# Script para validar meta tags de segurança nos arquivos HTML
# Verifica se os arquivos contêm as meta tags necessárias

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VALIDAÇÃO DE META TAGS DE SEGURANÇA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$total = 0
$passed = 0
$failed = 0

# Lista de arquivos para validar
$files = @(
    "index.html",
    "portfolio.html",
    "404.html",
    "secure/index.html",
    "secure/callback.html",
    "secure/logout.html",
    "secure/admin-users.html",
    "secure/admin-logs.html",
    "secure/access-denied.html",
    "secure/access-pending.html",
    "secure/approval-requests.html",
    "secure/apresentacao-hub.html",
    "secure/apresentacao-seed.html",
    "secure/change-password.html",
    "secure/consent.html",
    "secure/first-access.html",
    "secure/historia.html",
    "secure/reauthorize-microsoft.html",
    "secure/request-access.html",
    "secure/restrita.html",
    "secure/super-admin-login.html"
)

# Meta tags esperadas
$expectedTags = @(
    "Content-Security-Policy",
    "X-Content-Type-Options",
    "referrer"
)

foreach ($file in $files) {
    $total++
    $filePath = Join-Path $PSScriptRoot $file
    
    Write-Host "[$total/$($files.Count)] Validando: $file" -ForegroundColor Yellow
    
    if (-not (Test-Path $filePath)) {
        Write-Host "   ❌ ARQUIVO NÃO ENCONTRADO: $filePath" -ForegroundColor Red
        $failed++
        Write-Host ""
        continue
    }
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        $filePassed = $true
        $missingTags = @()
        
        # Verificar cada meta tag
        foreach ($tag in $expectedTags) {
            $found = $false
            
            if ($tag -eq "Content-Security-Policy") {
                if ($content -match '<meta\s+http-equiv="Content-Security-Policy"') {
                    $found = $true
                }
            }
            elseif ($tag -eq "X-Content-Type-Options") {
                if ($content -match '<meta\s+http-equiv="X-Content-Type-Options"') {
                    $found = $true
                }
            }
            elseif ($tag -eq "referrer") {
                if ($content -match '<meta\s+name="referrer"') {
                    $found = $true
                }
            }
            
            if (-not $found) {
                $filePassed = $false
                $missingTags += $tag
            }
        }
        
        if ($filePassed) {
            Write-Host "   ✅ PASSOU - Todas as meta tags presentes" -ForegroundColor Green
            $passed++
        }
        else {
            Write-Host "   ❌ FALHOU - Meta tags ausentes: $($missingTags -join ', ')" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        Write-Host "   ❌ ERRO ao ler arquivo: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DA VALIDAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total de arquivos: $total" -ForegroundColor White
Write-Host "Aprovados: $passed" -ForegroundColor Green
Write-Host "Falharam: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""

$percentual = [math]::Round(($passed / $total) * 100, 2)
Write-Host "Taxa de sucesso: $percentual%" -ForegroundColor $(if ($percentual -eq 100) { "Green" } elseif ($percentual -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ TODAS AS VALIDAÇÕES PASSARAM!" -ForegroundColor Green
    Write-Host "As meta tags de segurança estão corretamente implementadas." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "⚠️  $failed arquivo(s) falharam na validação." -ForegroundColor Yellow
    Write-Host "Revise os arquivos marcados acima para garantir que todas as meta tags estejam presentes." -ForegroundColor Yellow
    exit 1
}
