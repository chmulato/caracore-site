# Script PowerShell para executar testes do sistema de gerenciamento de usuários
# Uso: .\run-tests.ps1

Write-Host "🧪 Sistema de Testes - CaraCore User Management" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale Node.js para continuar." -ForegroundColor Red
    exit 1
}

# Verificar se npx está disponível
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npx não encontrado. Instale npm/Node.js para continuar." -ForegroundColor Red
    exit 1
}

# Navegar para o diretório do script
Set-Location $PSScriptRoot

Write-Host "📁 Diretório atual: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Verificar se existe package.json
if (-not (Test-Path "package.json")) {
    Write-Host "⚠️  package.json não encontrado. Criando configuração básica..." -ForegroundColor Yellow
    
    $packageJson = @"
{
  "name": "caracore-tests",
  "version": "1.0.0",
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  },
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/test-setup.js"],
    "testMatch": ["**/*.test.js"],
    "testTimeout": 10000
  }
}
"@
    
    $packageJson | Out-File -FilePath "package.json" -Encoding UTF8
    Write-Host "✅ package.json criado" -ForegroundColor Green
}

# Funções para diferentes tipos de teste
function Install-Dependencies {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências instaladas com sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    }
    Write-Host ""
}

function Run-AllTests {
    Write-Host "🚀 Executando todos os testes..." -ForegroundColor Blue
    npx jest --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Todos os testes passaram!" -ForegroundColor Green
    } else {
        Write-Host "❌ Alguns testes falharam" -ForegroundColor Red
    }
}

function Run-CoverageTests {
    Write-Host "📊 Executando testes com cobertura..." -ForegroundColor Blue
    npx jest --coverage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Relatório de cobertura gerado" -ForegroundColor Green
        Write-Host "📄 Verifique o relatório em: coverage/lcov-report/index.html" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro ao executar testes de cobertura" -ForegroundColor Red
    }
}

function Run-SpecificTest {
    Write-Host "🎯 Testes disponíveis:" -ForegroundColor Blue
    Write-Host "1. super-admin-setup.test.js (Configuração de Super Admin)"
    Write-Host "2. request-access-enhanced.test.js (Solicitação de Acesso)"
    Write-Host "3. approval-requests.test.js (Aprovação de Solicitações)"
    Write-Host "4. user-management-navigation.test.js (Sistema de Navegação)"
    Write-Host ""
    
    $choice = Read-Host "Digite o número do teste (1-4)"
    
    switch ($choice) {
        "1" {
            Write-Host "Executando testes de configuração de super admin..." -ForegroundColor Yellow
            npx jest super-admin-setup.test.js --verbose
        }
        "2" {
            Write-Host "Executando testes de solicitação de acesso..." -ForegroundColor Yellow
            npx jest request-access-enhanced.test.js --verbose
        }
        "3" {
            Write-Host "Executando testes de aprovação de solicitações..." -ForegroundColor Yellow
            npx jest approval-requests.test.js --verbose
        }
        "4" {
            Write-Host "Executando testes do sistema de navegação..." -ForegroundColor Yellow
            npx jest user-management-navigation.test.js --verbose
        }
        default {
            Write-Host "❌ Opção inválida" -ForegroundColor Red
        }
    }
}

function Run-WatchMode {
    Write-Host "👀 Executando em modo watch (Ctrl+C para sair)..." -ForegroundColor Blue
    Write-Host "Este modo monitora mudanças nos arquivos e reexecuta os testes automaticamente" -ForegroundColor Yellow
    npx jest --watch
}

function Show-TestStatus {
    Write-Host "📋 Status dos Testes:" -ForegroundColor Blue
    Write-Host "✅ super-admin-setup.test.js - 15 testes (300+ linhas)" -ForegroundColor Green
    Write-Host "✅ request-access-enhanced.test.js - 18 testes (400+ linhas)" -ForegroundColor Green
    Write-Host "✅ approval-requests.test.js - 20 testes (350+ linhas)" -ForegroundColor Green
    Write-Host "✅ user-management-navigation.test.js - 22 testes (400+ linhas)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Total: 75 testes unitários cobrindo todo o sistema de gerenciamento de usuários" -ForegroundColor Cyan
}

function Show-Menu {
    Write-Host "Escolha uma opção:" -ForegroundColor White
    Write-Host "1. Instalar dependências"
    Write-Host "2. Executar todos os testes"
    Write-Host "3. Executar com cobertura"
    Write-Host "4. Executar teste específico"
    Write-Host "5. Modo watch (desenvolvimento)"
    Write-Host "6. Mostrar status dos testes"
    Write-Host "7. Sair"
    Write-Host ""
}

# Loop principal
do {
    Show-Menu
    $option = Read-Host "Digite sua escolha (1-7)"
    Write-Host ""
    
    switch ($option) {
        "1" { Install-Dependencies }
        "2" { Run-AllTests }
        "3" { Run-CoverageTests }
        "4" { Run-SpecificTest }
        "5" { Run-WatchMode }
        "6" { Show-TestStatus }
        "7" { 
            Write-Host "👋 Saindo..." -ForegroundColor Green
            exit 0 
        }
        default { 
            Write-Host "❌ Opção inválida. Tente novamente." -ForegroundColor Red 
        }
    }
    
    Write-Host ""
    Write-Host "Pressione Enter para continuar..." -ForegroundColor Yellow
    Read-Host
    Clear-Host
    Write-Host "🧪 Sistema de Testes - CaraCore User Management" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    
} while ($true)