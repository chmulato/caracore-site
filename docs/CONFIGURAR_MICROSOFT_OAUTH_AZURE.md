# Configurar Microsoft OAuth no Azure App Service

## Problema Identificado

O diagnóstico confirmou que as seguintes variáveis estão **FALTANDO** no Azure App Service:

- ❌ `AZURE_CLIENT_ID`
- ❌ `AZURE_CLIENT_SECRET`
- ❌ `AZURE_TENANT_ID`

## Solução: Configurar Variáveis no Azure App Service

### Método 1: Portal Azure (Recomendado - Mais Fácil)

1.**Acesse o Portal Azure:**

```text
https://portal.azure.com
```

2.**Navegue até o App Service:**

- Procure por: **App Services**
- Clique em: **caracore-backend-docker**

3.**Vá para Configuration:**

- No menu lateral esquerdo, clique em: **Configuration**
- Ou acesse diretamente:

 ```text
 https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/configuration
 ```

4.**Adicione as variáveis:**

- Clique em **+ New application setting** para cada variável:

**[Variável 1: AZURE_CLIENT_ID**

- **Name:** `AZURE_CLIENT_ID`
- **Value:** `8ef17663-438f-4777-99ca-c5ad5b2a2993` (verifique qual está configurado no frontend)
- **Deployment slot setting:** Deixe desmarcado (a menos que use slots)

**⚠️ NOTA:** Verifique qual Client ID está sendo usado no frontend. Pode ser:

- `8ef17663-438f-4777-99ca-c5ad5b2a2993` (usado no código frontend)
- `ac886d42-bd01-4cf0-9a3b-6014384670dc` (mencionado no secrets.txt.template)

Use o mesmo Client ID que está configurado no App Registration do Azure AD.

**[Variável 2: AZURE_CLIENT_SECRET**

- **Name:** `AZURE_CLIENT_SECRET`
- **Value:** `<obtenha no Azure AD - veja instruções abaixo>`
- **Deployment slot setting:** Deixe desmarcado

**[Variável 3: AZURE_TENANT_ID**

- **Name:** `AZURE_TENANT_ID`
- **Value:** `consumers` (para contas pessoais Microsoft - hotmail.com, outlook.com)
- **Deployment slot setting:** Deixe desmarcado

5.**Salve as alterações:**

- Clique em **Save** no topo da página
- Aguarde a confirmação: "Application settings updated successfully"
- O App Service será **reiniciado automaticamente**

6.**Verifique:**

- Aguarde 1-2 minutos para o App Service reiniciar
- Execute novamente o diagnóstico:

```bash
python scripts/diagnose_microsoft_oauth_simple.py
```

---

### Método 2: Azure CLI (Se tiver instalado)

Se você tiver Azure CLI instalado e autenticado:

```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings \
    AZURE_CLIENT_ID="8ef17663-438f-4777-99ca-c5ad5b2a2993" \
    AZURE_CLIENT_SECRET="<seu-client-secret>" \
    AZURE_TENANT_ID="189c46ad-e437-48bd-bc87-050ef735c2c7"
```

**⚠️ IMPORTANTE:** Substitua `<seu-client-secret>` pelo valor real obtido no Azure AD.

---

## Obter Client Secret do Azure AD

### Passo a Passo:

1.**Acesse o Portal Azure:**

```text
https://portal.azure.com
```

2.**Navegue até Azure Active Directory:**

- Procure por: **Azure Active Directory**
- Ou acesse diretamente: **[https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview]**

3.**Vá para App registrations:**

- No menu lateral, clique em: **App registrations**
- Ou acesse: **[https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps]**

4.**Encontre o App Registration:**

- Procure pelo app: **Cara Core OAuth** ou similar
- Ou procure pelo Client ID: `8ef17663-438f-4777-99ca-c5ad5b2a2993`
- Clique no app

5.**Vá para Certificates & secrets:**

- No menu lateral, clique em: **Certificates & secrets**
- Ou acesse diretamente a seção de secrets

6.**Verificar/Criar Client Secret:**
   
**[Se já existe um secret ativo]:**

- Verifique se não está expirado
- Se estiver próximo do vencimento, crie um novo
- **⚠️ IMPORTANTE:** Você não pode ver o valor de um secret existente
- Se não souber o valor, crie um novo

**Se não existe ou precisa criar novo:**

- Clique em **+ New client secret**
- **Description:** Digite uma descrição (ex: "Production Secret - Nov 2025")
- **Expires:** Escolha o período de expiração (recomendado: 24 meses)
- Clique em **Add**
- **⚠️ CRÍTICO:** Copie o **Value** imediatamente! Ele só será exibido uma vez.
- Este é o valor que você usará para `AZURE_CLIENT_SECRET`

7.**Copie o Client Secret:**

- Copie o valor completo do secret
- Cole no campo `AZURE_CLIENT_SECRET` no App Service Configuration

---

## Valores das Variáveis

Com base no `secrets.txt.template`:

| Variável | Valor |
|----------|-------|
| `AZURE_CLIENT_ID` | `8ef17663-438f-4777-99ca-c5ad5b2a2993` (ou verifique no Azure AD) |
| `AZURE_CLIENT_SECRET` | `<obtenha no Azure AD - veja acima>` |
| `AZURE_TENANT_ID` | `consumers` (recomendado para contas pessoais) |

**Nota:** O `AZURE_TENANT_ID` pode ser:

- `consumers` (Apenas contas pessoais - **RECOMENDADO** para hotmail.com, outlook.com)
- `common` (Contas pessoais + corporativas - mais flexível)
- `organizations` (Apenas contas corporativas)
- Tenant ID específico (ex: `189c46ad-e437-48bd-bc87-050ef735c2c7`)

**Para o caso de uso atual (contas pessoais Microsoft), use `consumers`.**

---

## Verificação Pós-Configuração

### 1. Aguardar Reinicialização

Após salvar as configurações, aguarde 1-2 minutos para o App Service reiniciar.

### 2. Executar Diagnóstico Novamente

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

### 3. Testar Login Microsoft

Após configurar, teste o login:

1. Acesse: [https://www.caracore.com.br/secure/index.html]
2. Clique em "Continuar com Microsoft"
3. Deve funcionar sem erro 500

---

## Troubleshooting

### Problema: Secret Expirado

**Sintoma:** Erro 500 mesmo com variáveis configuradas

**Solução:**

1. Crie um novo Client Secret no Azure AD
2. Atualize `AZURE_CLIENT_SECRET` no App Service
3. Aguarde reinicialização

### Problema: Client ID Incorreto

**Sintoma:** Erro ao trocar código por token

**Solução:**

1. Verifique se o Client ID está correto no App Registration
2. Verifique se o Redirect URI está configurado no Azure AD:
   - Deve ser: `https://www.caracore.com.br/secure/callback.html`
3. Verifique se o Redirect URI no App Service corresponde ao configurado no Azure AD

### Problema: Tenant ID Incorreto

**Sintoma:** Erro de tenant mismatch

**Solução:**

- Para contas pessoais Microsoft, use `consumers` (recomendado)
- Para contas pessoais + corporativas, use `common`
- Para contas corporativas apenas, use o Tenant ID específico
- Verifique o Tenant ID no App Registration → Overview

### Problema: App Service não reinicia

**Sintoma:** Mudanças não são aplicadas

**Solução:**

1. Verifique se clicou em **Save** após adicionar as variáveis
2. Aguarde alguns minutos
3. Reinicie manualmente o App Service:
   - Portal Azure → App Service → Overview → **Restart**

---

## Links Úteis

- **Portal Azure - App Service Configuration:**
  [https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/configuration]

- **Portal Azure - App Registrations:**
  [https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps]

- **Logs do App Service:**
  [https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/logStream]

- **Endpoint de Diagnóstico:**
  [https://caracore-backend-docker.azurewebsites.net/health/oauth/microsoft]

---

## Checklist Final

- [ ] Acessei o Portal Azure
- [ ] Naveguei até App Service → Configuration
- [ ] Adicionei `AZURE_CLIENT_ID` = `8ef17663-438f-4777-99ca-c5ad5b2a2993`
- [ ] Obtive `AZURE_CLIENT_SECRET` do Azure AD
- [ ] Adicionei `AZURE_CLIENT_SECRET` no App Service
- [ ] Adicionei `AZURE_TENANT_ID` = `189c46ad-e437-48bd-bc87-050ef735c2c7` (ou `common`)
- [ ] Cliquei em **Save**
- [ ] Aguardei 1-2 minutos para reinicialização
- [ ] Executei diagnóstico novamente: `python scripts/diagnose_microsoft_oauth_simple.py`
- [ ] Verifiquei que todas as variáveis estão configuradas
- [ ] Testei login Microsoft no site

---

## Próximos Passos

Após configurar as variáveis:

1. ✅ Execute o diagnóstico para confirmar
2. ✅ Teste o login Microsoft
3. ✅ Verifique os logs se houver problemas
4. ✅ Documente o Client Secret em local seguro (não no código!)

**⚠️ IMPORTANTE:** Nunca commite o `AZURE_CLIENT_SECRET` no repositório. Ele deve estar apenas no Azure App Service Configuration.

