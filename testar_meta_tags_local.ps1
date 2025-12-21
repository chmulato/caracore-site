# Script para testar meta tags de segurança localmente
# Verifica se as páginas HTML contêm as meta tags esperadas

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTE DE META TAGS DE SEGURANÇA - LOCAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"
$total = 0
$passed = 0
$failed = 0

# Lista de páginas para testar
$pages = @(
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

foreach ($page in $pages) {
    $total++
    $url = "$baseUrl/$page"
    
    Write-Host "[$total/$($pages.Count)] Testando: $page" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
        $html = $response.Content
        
        $pagePassed = $true
        $missingTags = @()
        
        # Verificar cada meta tag
        foreach ($tag in $expectedTags) {
            $found = $false
            
            if ($tag -eq "Content-Security-Policy") {
                if ($html -match '<meta\s+http-equiv="Content-Security-Policy"') {
                    $found = $true
                }
            }
            elseif ($tag -eq "X-Content-Type-Options") {
                if ($html -match '<meta\s+http-equiv="X-Content-Type-Options"') {
                    $found = $true
                }
            }
            elseif ($tag -eq "referrer") {
                if ($html -match '<meta\s+name="referrer"') {
                    $found = $true
                }
            }
            
            if (-not $found) {
                $pagePassed = $false
                $missingTags += $tag
            }
        }
        
        if ($pagePassed) {
            Write-Host "   ✅ PASSOU - Todas as meta tags presentes" -ForegroundColor Green
            $passed++
        }
        else {
            Write-Host "   ❌ FALHOU - Meta tags ausentes: $($missingTags -join ', ')" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        Write-Host "   ❌ ERRO ao acessar: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total de páginas testadas: $total" -ForegroundColor White
Write-Host "Páginas aprovadas: $passed" -ForegroundColor Green
Write-Host "Páginas com falhas: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "⚠️  ALGUNS TESTES FALHARAM. Revise as páginas marcadas acima." -ForegroundColor Yellow
    exit 1
}
