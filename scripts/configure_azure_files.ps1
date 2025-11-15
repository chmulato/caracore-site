# Script PowerShell para configurar Azure Files para persistência de dados
# Uso: .\scripts\configure_azure_files.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Configuração de Azure Files - CaraCore" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Variáveis (ajustar conforme necessário)
$RESOURCE_GROUP = "rg-caracore"
$STORAGE_ACCOUNT_NAME = "caracoredata"
$FILE_SHARE_NAME = "caracore-data"
$WEB_APP_NAME = "caracore-backend-docker"
$MOUNT_PATH = "/home/data"
$MOUNT_NAME = "data-storage"

# Verificar se Azure CLI está instalado
try {
    $azVersion = az --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI não encontrado"
    }
} catch {
    Write-Host "[ERRO] Azure CLI não está instalado" -ForegroundColor Red
    Write-Host "Instale em: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Verificar login
Write-Host "[INFO] Verificando login no Azure..." -ForegroundColor Yellow
try {
    $account = az account show --query name -o tsv 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[INFO] Fazendo login no Azure..." -ForegroundColor Yellow
        az login
        $account = az account show --query name -o tsv
    }
    Write-Host "[OK] Logado como: $account" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Falha ao verificar login" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Passo 1: Verificar/Criar Storage Account
Write-Host "[PASSO 1] Verificando Storage Account..." -ForegroundColor Yellow
try {
    $storageExists = az storage account show --name $STORAGE_ACCOUNT_NAME --resource-group $RESOURCE_GROUP 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Storage Account '$STORAGE_ACCOUNT_NAME' já existe" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Criando Storage Account '$STORAGE_ACCOUNT_NAME'..." -ForegroundColor Yellow
        az storage account create `
            --name $STORAGE_ACCOUNT_NAME `
            --resource-group $RESOURCE_GROUP `
            --location brazilsouth `
            --sku Standard_LRS `
            --kind StorageV2
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Storage Account criado com sucesso" -ForegroundColor Green
        } else {
            throw "Falha ao criar Storage Account"
        }
    }
} catch {
    Write-Host "[ERRO] Falha ao verificar/criar Storage Account: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Passo 2: Verificar/Criar File Share
Write-Host "[PASSO 2] Verificando File Share..." -ForegroundColor Yellow
try {
    $STORAGE_KEY = az storage account keys list `
        --resource-group $RESOURCE_GROUP `
        --account-name $STORAGE_ACCOUNT_NAME `
        --query "[0].value" `
        --output tsv
    
    $shareExists = az storage share show `
        --name $FILE_SHARE_NAME `
        --account-name $STORAGE_ACCOUNT_NAME `
        --account-key $STORAGE_KEY 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] File Share '$FILE_SHARE_NAME' já existe" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Criando File Share '$FILE_SHARE_NAME'..." -ForegroundColor Yellow
        az storage share create `
            --name $FILE_SHARE_NAME `
            --account-name $STORAGE_ACCOUNT_NAME `
            --account-key $STORAGE_KEY `
            --quota 5
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] File Share criado com sucesso" -ForegroundColor Green
        } else {
            throw "Falha ao criar File Share"
        }
    }
} catch {
    Write-Host "[ERRO] Falha ao verificar/criar File Share: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Passo 3: Configurar montagem no Web App
Write-Host "[PASSO 3] Configurando montagem no Web App..." -ForegroundColor Yellow
try {
    $existingMount = az webapp config storage-account list `
        --resource-group $RESOURCE_GROUP `
        --name $WEB_APP_NAME `
        --query "[?name=='$MOUNT_NAME'].name" `
        --output tsv
    
    if ($existingMount) {
        Write-Host "[INFO] Montagem '$MOUNT_NAME' já existe. Atualizando..." -ForegroundColor Yellow
        az webapp config storage-account update `
            --resource-group $RESOURCE_GROUP `
            --name $WEB_APP_NAME `
            --custom-id $MOUNT_NAME `
            --storage-type AzureFiles `
            --account-name $STORAGE_ACCOUNT_NAME `
            --share-name $FILE_SHARE_NAME `
            --access-key $STORAGE_KEY `
            --mount-path $MOUNT_PATH
    } else {
        Write-Host "[INFO] Criando nova montagem..." -ForegroundColor Yellow
        az webapp config storage-account add `
            --resource-group $RESOURCE_GROUP `
            --name $WEB_APP_NAME `
            --custom-id $MOUNT_NAME `
            --storage-type AzureFiles `
            --account-name $STORAGE_ACCOUNT_NAME `
            --share-name $FILE_SHARE_NAME `
            --access-key $STORAGE_KEY `
            --mount-path $MOUNT_PATH
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Montagem configurada com sucesso" -ForegroundColor Green
    } else {
        throw "Falha ao configurar montagem"
    }
} catch {
    Write-Host "[ERRO] Falha ao configurar montagem: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Passo 4: Verificar configuração
Write-Host "[PASSO 4] Verificando configuração..." -ForegroundColor Yellow
az webapp config storage-account list `
    --resource-group $RESOURCE_GROUP `
    --name $WEB_APP_NAME `
    --output table

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Configuração concluída com sucesso!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[IMPORTANTE]" -ForegroundColor Yellow
Write-Host "1. O Web App será reiniciado automaticamente"
Write-Host "2. Após o reinício, verifique os logs para confirmar:"
Write-Host "   'Detectado ambiente Azure - usando /home/data para persistência'"
Write-Host "3. Se houver dados existentes, execute o script de migração:"
Write-Host "   python backend/migrate_to_persistent_storage.py"
Write-Host ""

