#!/bin/bash
# Script para verificar se o armazenamento persistente está funcionando
# Uso: ./scripts/verify_persistent_storage.sh

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

RESOURCE_GROUP="rg-caracore"
WEB_APP_NAME="caracore-backend-docker"

echo "=========================================="
echo "Verificação de Armazenamento Persistente"
echo "=========================================="
echo ""

# Verificar se Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo -e "${RED}[ERRO] Azure CLI não está instalado${NC}"
    exit 1
fi

# Verificar configuração de montagem
echo -e "${YELLOW}[1] Verificando configuração de montagem...${NC}"
MOUNTS=$(az webapp config storage-account list \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --output json)

if echo "$MOUNTS" | grep -q "/home/data"; then
    echo -e "${GREEN}[OK] Montagem /home/data configurada${NC}"
    echo "$MOUNTS" | jq '.[] | select(.mountPath == "/home/data")'
else
    echo -e "${RED}[ERRO] Montagem /home/data não encontrada${NC}"
    echo "Execute: ./scripts/configure_azure_files.sh"
    exit 1
fi
echo ""

# Verificar logs do Web App
echo -e "${YELLOW}[2] Verificando logs recentes...${NC}"
echo "Buscando mensagem: 'Detectado ambiente Azure - usando /home/data'"
echo ""

# Obter logs recentes
LOG_LINES=$(az webapp log tail \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --output tsv 2>/dev/null | head -100 || echo "")

if echo "$LOG_LINES" | grep -q "Detectado ambiente Azure - usando /home/data"; then
    echo -e "${GREEN}[OK] Logs confirmam uso de /home/data${NC}"
    echo "$LOG_LINES" | grep -i "home/data" | head -5
else
    echo -e "${YELLOW}[AVISO] Mensagem não encontrada nos logs recentes${NC}"
    echo "Isso pode significar:"
    echo "  - O Web App ainda não foi reiniciado após a configuração"
    echo "  - Os logs ainda não foram atualizados"
    echo ""
    echo "Verifique manualmente:"
    echo "  az webapp log tail --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME"
fi
echo ""

# Verificar via SSH (se disponível)
echo -e "${YELLOW}[3] Verificando via SSH (opcional)...${NC}"
echo "Para verificar manualmente via SSH:"
echo "  1. Azure Portal > App Services > $WEB_APP_NAME > SSH"
echo "  2. Execute: ls -la /home/data/"
echo "  3. Execute: cat /home/data/authorized_users.json"
echo ""

echo -e "${GREEN}=========================================="
echo "Verificação concluída"
echo "==========================================${NC}"

