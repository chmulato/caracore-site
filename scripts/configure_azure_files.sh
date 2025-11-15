#!/bin/bash
# Script para configurar Azure Files para persistência de dados
# Uso: ./scripts/configure_azure_files.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Configuração de Azure Files - CaraCore"
echo "=========================================="
echo ""

# Variáveis (ajustar conforme necessário)
RESOURCE_GROUP="rg-caracore"
STORAGE_ACCOUNT_NAME="caracoredata"
FILE_SHARE_NAME="caracore-data"
WEB_APP_NAME="caracore-backend-docker"
MOUNT_PATH="/home/data"
MOUNT_NAME="data-storage"

# Verificar se Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo -e "${RED}[ERRO] Azure CLI não está instalado${NC}"
    echo "Instale em: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Verificar login
echo -e "${YELLOW}[INFO] Verificando login no Azure...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}[INFO] Fazendo login no Azure...${NC}"
    az login
fi

ACCOUNT=$(az account show --query name -o tsv)
echo -e "${GREEN}[OK] Logado como: $ACCOUNT${NC}"
echo ""

# Passo 1: Verificar/Criar Storage Account
echo -e "${YELLOW}[PASSO 1] Verificando Storage Account...${NC}"
if az storage account show --name $STORAGE_ACCOUNT_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${GREEN}[OK] Storage Account '$STORAGE_ACCOUNT_NAME' já existe${NC}"
else
    echo -e "${YELLOW}[INFO] Criando Storage Account '$STORAGE_ACCOUNT_NAME'...${NC}"
    az storage account create \
        --name $STORAGE_ACCOUNT_NAME \
        --resource-group $RESOURCE_GROUP \
        --location brazilsouth \
        --sku Standard_LRS \
        --kind StorageV2
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK] Storage Account criado com sucesso${NC}"
    else
        echo -e "${RED}[ERRO] Falha ao criar Storage Account${NC}"
        exit 1
    fi
fi
echo ""

# Passo 2: Verificar/Criar File Share
echo -e "${YELLOW}[PASSO 2] Verificando File Share...${NC}"
STORAGE_KEY=$(az storage account keys list \
    --resource-group $RESOURCE_GROUP \
    --account-name $STORAGE_ACCOUNT_NAME \
    --query "[0].value" \
    --output tsv)

if az storage share show \
    --name $FILE_SHARE_NAME \
    --account-name $STORAGE_ACCOUNT_NAME \
    --account-key $STORAGE_KEY &> /dev/null; then
    echo -e "${GREEN}[OK] File Share '$FILE_SHARE_NAME' já existe${NC}"
else
    echo -e "${YELLOW}[INFO] Criando File Share '$FILE_SHARE_NAME'...${NC}"
    az storage share create \
        --name $FILE_SHARE_NAME \
        --account-name $STORAGE_ACCOUNT_NAME \
        --account-key $STORAGE_KEY \
        --quota 5
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK] File Share criado com sucesso${NC}"
    else
        echo -e "${RED}[ERRO] Falha ao criar File Share${NC}"
        exit 1
    fi
fi
echo ""

# Passo 3: Configurar montagem no Web App
echo -e "${YELLOW}[PASSO 3] Configurando montagem no Web App...${NC}"

# Verificar se já existe montagem
EXISTING_MOUNT=$(az webapp config storage-account list \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --query "[?name=='$MOUNT_NAME'].name" \
    --output tsv)

if [ ! -z "$EXISTING_MOUNT" ]; then
    echo -e "${YELLOW}[INFO] Montagem '$MOUNT_NAME' já existe. Atualizando...${NC}"
    az webapp config storage-account update \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --custom-id $MOUNT_NAME \
        --storage-type AzureFiles \
        --account-name $STORAGE_ACCOUNT_NAME \
        --share-name $FILE_SHARE_NAME \
        --access-key $STORAGE_KEY \
        --mount-path $MOUNT_PATH
else
    echo -e "${YELLOW}[INFO] Criando nova montagem...${NC}"
    az webapp config storage-account add \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --custom-id $MOUNT_NAME \
        --storage-type AzureFiles \
        --account-name $STORAGE_ACCOUNT_NAME \
        --share-name $FILE_SHARE_NAME \
        --access-key $STORAGE_KEY \
        --mount-path $MOUNT_PATH
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK] Montagem configurada com sucesso${NC}"
else
    echo -e "${RED}[ERRO] Falha ao configurar montagem${NC}"
    exit 1
fi
echo ""

# Passo 4: Verificar configuração
echo -e "${YELLOW}[PASSO 4] Verificando configuração...${NC}"
az webapp config storage-account list \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --output table

echo ""
echo -e "${GREEN}=========================================="
echo "Configuração concluída com sucesso!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}[IMPORTANTE]${NC}"
echo "1. O Web App será reiniciado automaticamente"
echo "2. Após o reinício, verifique os logs para confirmar:"
echo "   'Detectado ambiente Azure - usando /home/data para persistência'"
echo "3. Se houver dados existentes, execute o script de migração:"
echo "   python backend/migrate_to_persistent_storage.py"
echo ""

