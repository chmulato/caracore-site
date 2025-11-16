# Obter Client Secret do Azure AD

## Status Atual

✅ `AZURE_CLIENT_ID` - Configurado  
✅ `AZURE_TENANT_ID` - Configurado  
❌ `AZURE_CLIENT_SECRET` - **FALTANDO**

## Passo a Passo para Obter o Client Secret

### 1. Acesse o Portal Azure

```
https://portal.azure.com
```

### 2. Navegue até Azure Active Directory

- Procure por: **Azure Active Directory**
- Ou acesse diretamente: https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview

### 3. Vá para App registrations

- No menu lateral, clique em: **App registrations**
- Ou acesse: https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps

### 4. Encontre o App Registration

- Procure pelo app com Client ID: `8ef17663-438f-4777-99ca-c5ad5b2a2993`
- Ou procure pelo nome: **Cara Core OAuth** (ou nome similar)
- **Clique no app** para abrir

### 5. Vá para Certificates & secrets

- No menu lateral esquerdo, clique em: **Certificates & secrets**
- Ou acesse diretamente a seção de secrets

### 6. Verificar Secrets Existentes

**Se já existe um secret ativo:**

- Verifique a coluna **Expires** para ver se está expirado
- Se estiver próximo do vencimento ou expirado, crie um novo
- **⚠️ IMPORTANTE:** Você **NÃO PODE** ver o valor de um secret existente
- Se não souber o valor do secret existente, **crie um novo**

### 7. Criar Novo Client Secret

**Se não existe ou precisa criar novo:**

1. Clique no botão **+ New client secret** (no topo da página)

2. Preencha o formulário:
   - **Description:** Digite uma descrição (ex: "Production Secret - Nov 2025")
   - **Expires:** Escolha o período de expiração:
     - **Recomendado:** 24 meses (para produção)
     - Ou escolha conforme sua política de segurança

3. Clique em **Add**

4. **⚠️ CRÍTICO - LEIA COM ATENÇÃO:**
   - Após criar, o secret será exibido **APENAS UMA VEZ**
   - **COPIE O VALOR IMEDIATAMENTE** (coluna "Value")
   - O valor será algo como: `abc123~XYZ789...` (uma string longa)
   - **Se você fechar a página sem copiar, NÃO poderá ver novamente!**
   - Você precisará criar um novo secret

5. **Copie o valor completo:**
   - Selecione todo o texto na coluna "Value"
   - Copie (Ctrl+C)
   - Cole em um editor de texto temporário para verificar

### 8. Configurar no App Service

Agora que você tem o Client Secret, configure no App Service:

1. **Volte para o App Service:**
   - Acesse: [https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/configuration]

2. **Encontre ou adicione a variável:**
   - Procure por `AZURE_CLIENT_SECRET` na lista
   - Se não existir, clique em **+ New application setting**

3. **Configure:**
   - **Name:** `AZURE_CLIENT_SECRET`
   - **Value:** Cole o valor do secret que você copiou
   - **Deployment slot setting:** Deixe desmarcado

4. **Salve:**
   - Clique em **Save** no topo da página
   - Aguarde a confirmação: "Application settings updated successfully"
   - O App Service será **reiniciado automaticamente**

### 9. Verificar Configuração

Aguarde 1-2 minutos para o App Service reiniciar, depois execute:

```bash
python scripts/diagnose_microsoft_oauth_simple.py
```

**Resultado esperado:**

```json
{
  "status": "ok",
  "microsoft_oauth": {
    "all_required_configured": true,
    "required_variables": {
      "AZURE_CLIENT_ID": {"configured": true, "status": "ok"},
      "AZURE_CLIENT_SECRET": {"configured": true, "status": "ok"},
      "AZURE_TENANT_ID": {"configured": true, "status": "ok"}
    }
  }
}
```

## Dicas Importantes

### ⚠️ Segurança

- **NUNCA** commite o Client Secret no código
- **NUNCA** compartilhe o Client Secret publicamente
- Mantenha o secret seguro e acessível apenas para administradores
- Se o secret vazar, **revogue imediatamente** e crie um novo

### 📝 Gerenciamento de Secrets

- **Documente** quando o secret foi criado e quando expira
- **Configure alertas** para lembrar antes do vencimento
- **Tenha um processo** para renovar secrets antes de expirar
- Considere usar **Azure Key Vault** para produção (opcional)

### 🔄 Rotação de Secrets

- Rotacione secrets periodicamente (ex: a cada 6-12 meses)
- Quando criar um novo secret:
  1. Configure o novo secret no App Service
  2. Aguarde alguns dias para garantir que está funcionando
  3. Revogue o secret antigo no Azure AD

## Troubleshooting

### Problema: Secret não funciona após configurar

**Possíveis causas:**
1. Secret foi copiado incorretamente (espaços extras, caracteres faltando)
2. App Service não reiniciou após salvar
3. Secret expirou

**Solução:**
1. Verifique se copiou o valor completo (sem espaços no início/fim)
2. Reinicie manualmente o App Service
3. Crie um novo secret se necessário

### Problema: Não consigo ver o secret após criar

**Causa:** O secret só é exibido uma vez após criação

**Solução:**
- Crie um novo secret
- Desta vez, copie imediatamente após criar

### Problema: Secret expirou

**Sintoma:** Erro 500 mesmo com secret configurado

**Solução:**
1. Verifique a data de expiração no Azure AD
2. Crie um novo secret
3. Atualize no App Service

## Links Rápidos

- **App Registrations:** https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps
- **App Service Configuration:** https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/configuration
- **Endpoint de Diagnóstico:** https://caracore-backend-docker.azurewebsites.net/health/oauth/microsoft

## Checklist

- [ ] Acessei Azure AD → App registrations
- [ ] Encontrei o app com Client ID `8ef17663-438f-4777-99ca-c5ad5b2a2993`
- [ ] Fui para Certificates & secrets
- [ ] Criei um novo client secret
- [ ] **Copiei o valor imediatamente** (antes de fechar a página)
- [ ] Acessei App Service → Configuration
- [ ] Adicionei/Atualizei `AZURE_CLIENT_SECRET` com o valor copiado
- [ ] Cliquei em **Save**
- [ ] Aguardei 1-2 minutos para reinicialização
- [ ] Executei diagnóstico: `python scripts/diagnose_microsoft_oauth_simple.py`
- [ ] Verifiquei que todas as variáveis estão configuradas
- [ ] Testei login Microsoft no site

---

**Próximo passo:** Após configurar o `AZURE_CLIENT_SECRET`, o erro 500 deve ser resolvido e o login Microsoft deve funcionar! 🎉

