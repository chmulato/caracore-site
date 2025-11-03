#!/bin/bash

# Script para executar testes do sistema de gerenciamento de usuários
# Uso: ./run-tests.sh [opcoes]

echo "🧪 Sistema de Testes - CaraCore User Management"
echo "=============================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js para continuar."
    exit 1
fi

# Verificar se Jest está instalado
if ! command -v npx &> /dev/null; then
    echo "❌ npx não encontrado. Instale npm/Node.js para continuar."
    exit 1
fi

# Navegar para o diretório de testes
cd "$(dirname "$0")"

echo "📁 Diretório atual: $(pwd)"
echo ""

# Verificar se existe package.json local
if [ ! -f "package.json" ]; then
    echo "⚠️  package.json não encontrado. Criando configuração básica..."
    cat > package.json << 'EOF'
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
  }
}
EOF
fi

# Função para instalar dependências
install_deps() {
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas"
    echo ""
}

# Função para executar todos os testes
run_all_tests() {
    echo "🚀 Executando todos os testes..."
    npx jest --verbose
}

# Função para executar com cobertura
run_coverage() {
    echo "📊 Executando testes com cobertura..."
    npx jest --coverage
}

# Função para executar teste específico
run_specific_test() {
    echo "🎯 Testes disponíveis:"
    echo "1. super-admin-setup.test.js"
    echo "2. request-access-enhanced.test.js"
    echo "3. approval-requests.test.js"
    echo "4. user-management-navigation.test.js"
    echo ""
    read -p "Digite o número do teste (1-4): " choice
    
    case $choice in
        1) npx jest super-admin-setup.test.js --verbose ;;
        2) npx jest request-access-enhanced.test.js --verbose ;;
        3) npx jest approval-requests.test.js --verbose ;;
        4) npx jest user-management-navigation.test.js --verbose ;;
        *) echo "❌ Opção inválida" ;;
    esac
}

# Função para executar em modo watch
run_watch_mode() {
    echo "👀 Executando em modo watch (Ctrl+C para sair)..."
    npx jest --watch
}

# Menu principal
show_menu() {
    echo "Escolha uma opção:"
    echo "1. Instalar dependências"
    echo "2. Executar todos os testes"
    echo "3. Executar com cobertura"
    echo "4. Executar teste específico"
    echo "5. Modo watch (desenvolvimento)"
    echo "6. Sair"
    echo ""
}

# Loop principal
while true; do
    show_menu
    read -p "Digite sua escolha (1-6): " option
    echo ""
    
    case $option in
        1) install_deps ;;
        2) run_all_tests ;;
        3) run_coverage ;;
        4) run_specific_test ;;
        5) run_watch_mode ;;
        6) echo "👋 Saindo..."; exit 0 ;;
        *) echo "❌ Opção inválida. Tente novamente." ;;
    esac
    
    echo ""
    echo "Pressione Enter para continuar..."
    read
    echo ""
done