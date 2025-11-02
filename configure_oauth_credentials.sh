#!/bin/bash

# Script para configurar variáveis de ambiente OAuth no Azure Web App
# Este script solicita as credenciais de forma interativa e não as armazena no código

echo "=== Configuração de Credenciais OAuth para CaraCore Backend ==="
echo ""
echo "ATENÇÃO: Este script configurará credenciais sensíveis no Azure."
echo "Certifique-se de ter as credenciais OAuth corretas antes de continuar."
echo ""

read -p "Deseja continuar? (s/N): " confirm
if [[ $confirm != [sS] ]]; then
    echo "Operação cancelada."
    exit 0
fi

echo ""
echo "=== Configuração Google OAuth ==="
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -s -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

echo ""
echo "=== Configuração Microsoft Entra ID ==="
read -p "Azure Client ID: " AZURE_CLIENT_ID
read -s -p "Azure Client Secret: " AZURE_CLIENT_SECRET
echo ""
read -p "Azure Tenant ID: " AZURE_TENANT_ID

echo ""
echo "=== Aplicando configurações no Azure Web App ==="

# Configurar Google OAuth
echo "Configurando Google OAuth..."
az webapp config appsettings set \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --settings \
    GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
    GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
  --output none

if [ $? -eq 0 ]; then
    echo "✅ Google OAuth configurado com sucesso"
else
    echo "❌ Erro ao configurar Google OAuth"
    exit 1
fi

# Configurar Microsoft Entra ID
echo "Configurando Microsoft Entra ID..."
az webapp config appsettings set \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --settings \
    AZURE_CLIENT_ID="$AZURE_CLIENT_ID" \
    AZURE_CLIENT_SECRET="$AZURE_CLIENT_SECRET" \
    AZURE_TENANT_ID="$AZURE_TENANT_ID" \
  --output none

if [ $? -eq 0 ]; then
    echo "✅ Microsoft Entra ID configurado com sucesso"
else
    echo "❌ Erro ao configurar Microsoft Entra ID"
    exit 1
fi

echo ""
echo "=== Configuração Concluída ==="
echo "✅ Todas as credenciais OAuth foram configuradas no Azure Web App"
echo "🔒 As credenciais estão seguras nas variáveis de ambiente do Azure"
echo ""
echo "Para testar a aplicação:"
echo "curl https://caracore-backend-docker.azurewebsites.net/health"
echo ""
echo "Endpoint da aplicação: https://caracore-backend-docker.azurewebsites.net"

# Limpar variáveis locais por segurança
unset GOOGLE_CLIENT_ID
unset GOOGLE_CLIENT_SECRET
unset AZURE_CLIENT_ID
unset AZURE_CLIENT_SECRET
unset AZURE_TENANT_ID

echo ""
echo "🔐 Variáveis locais limpas por segurança."