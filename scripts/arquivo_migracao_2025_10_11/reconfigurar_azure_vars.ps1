#!/bin/bash

echo "🔧 RECONFIGURANDO VARIÁVEIS AZURE APP SERVICE"
echo "=============================================="

# GOOGLE_CLIENT_ID
echo "Configurando GOOGLE_CLIENT_ID..."
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
  --settings "GOOGLE_CLIENT_ID=1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com"

# GOOGLE_CLIENT_SECRET
echo "Configurando GOOGLE_CLIENT_SECRET..."
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
  --settings "GOOGLE_CLIENT_SECRET=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"

# ORIGIN_ALLOWED
echo "Configurando ORIGIN_ALLOWED..."
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
  --settings "ORIGIN_ALLOWED=https://www.caracore.com.br"

# OAUTH_REDIRECT_URI
echo "Configurando OAUTH_REDIRECT_URI..."
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
  --settings "OAUTH_REDIRECT_URI=https://www.caracore.com.br/secure/callback.html"

# SCM_DO_BUILD_DURING_DEPLOYMENT
echo "Configurando SCM_DO_BUILD_DURING_DEPLOYMENT..."
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
  --settings "SCM_DO_BUILD_DURING_DEPLOYMENT=true"

# WEBSITE_RUN_FROM_PACKAGE
echo "Configurando WEBSITE_RUN_FROM_PACKAGE..."
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
  --settings "WEBSITE_RUN_FROM_PACKAGE=0"

# APP_SECRET_KEY  
echo "Configurando APP_SECRET_KEY..."
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
  --settings "APP_SECRET_KEY=aG6qrvXaY5UCTT8f1V-8jPInZ5PDC4jQoMybZY5yEb0"

echo "✅ Todas as variáveis configuradas!"

# Testar
echo "🧪 Testando backend..."
curl -s https://caracore-backend.azurewebsites.net/health

echo "✅ CONFIGURAÇÃO COMPLETA!"