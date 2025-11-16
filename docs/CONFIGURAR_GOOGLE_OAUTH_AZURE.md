# Configurar Google OAuth no Azure App Service

## Variáveis Necessárias

O backend precisa das seguintes variáveis de ambiente configuradas no Azure App Service:

### Obrigatórias:

- ✅ `GOOGLE_CLIENT_ID` - Client ID do OAuth no Google Cloud Console
- ✅ `GOOGLE_CLIENT_SECRET` - Client Secret do OAuth

### Opcionais (com valores padrão):

- `GOOGLE_ALLOWED_DOMAINS` - Domínios permitidos (separados por vírgula, ex: "caracore.com.br")

## Diagnóstico

### Verificar Status Atual

Execute o script de diagnóstico:

```bash
python scripts/diagnose_oauth_all.py
```

Ou teste diretamente o endpoint (após deploy):

```bash
curl https://caracore-backend-docker.azurewebsites.net/health/oauth/google
```

## Configuração

### Método 1: Portal Azure (Recomendado)

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

**[Variável 1: GOOGLE_CLIENT_ID**

- **Name:** `GOOGLE_CLIENT_ID`
- **Value:** `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
- **Deployment slot setting:** Deixe desmarcado

**[Variável 2: GOOGLE_CLIENT_SECRET**

- **Name:** `GOOGLE_CLIENT_SECRET`
- **Value:** `<obtenha no Google Cloud Console - veja instruções abaixo>`
- **Deployment slot setting:** Deixe desmarcado

**[Variável 3: GOOGLE_ALLOWED_DOMAINS (Opcional)**

- **Name:** `GOOGLE_ALLOWED_DOMAINS`
- **Value:** `caracore.com.br` (ou deixe vazio para aceitar qualquer domínio)
- **Deployment slot setting:** Deixe desmarcado

5.**Salve as alterações:**

- Clique em **Save** no topo da página
- Aguarde a confirmação: "Application settings updated successfully"
- O App Service será **reiniciado automaticamente**

6.**Verifique:**

- Aguarde 1-2 minutos para o App Service reiniciar
- Execute novamente o diagnóstico:

 ```bash
 python scripts/diagnose_oauth_all.py
 ```

---

### Método 2: Azure CLI (Se tiver instalado)

```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings \
    GOOGLE_CLIENT_ID="1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com" \
    GOOGLE_CLIENT_SECRET="<seu-client-secret>" \
    GOOGLE_ALLOWED_DOMAINS="caracore.com.br"
```

**⚠️ IMPORTANTE:** Substitua `<seu-client-secret>` pelo valor real obtido no Google Cloud Console.

---

## Obter Client Secret do Google Cloud Console

### Passo a Passo:

1.**Acesse o Google Cloud Console:**

```text
https://console.cloud.google.com
```

2.**Navegue até APIs & Services → Credentials:**

- No menu lateral, vá em: **APIs & Services** → **Credentials**
- Ou acesse diretamente:

 ```text
 https://console.cloud.google.com/apis/credentials
 ```

3.**Encontre o OAuth 2.0 Client ID:**

- Procure pelo Client ID: `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu`
- Ou procure pelo nome do projeto/cliente OAuth
- **Clique no cliente** para abrir

4.**Obter/Criar Client Secret:**
   
**[Se já existe um secret:]**

- O Client Secret é exibido na página (mas mascarado)
- Se você não souber o valor, precisará criar um novo
- **⚠️ IMPORTANTE:** Você não pode ver o valor de um secret existente
- Se não souber o valor, crie um novo

**Se não existe ou precisa criar novo:**

- Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
- Ou edite o cliente existente
- Se for criar novo, escolha o tipo: **Web application**
- Configure:

  - **Name:** Nome descritivo (ex: "Cara Core Production")
  - **Authorized redirect URIs:** 
    - `https://www.caracore.com.br/secure/callback.html`

- Clique em **Create**

- **⚠️ CRÍTICO:** Copie o **Client secret** imediatamente!
- Este é o valor que você usará para `GOOGLE_CLIENT_SECRET`

1. **Copie o Client Secret:**
   - Copie o valor completo do secret
   - Cole no campo `GOOGLE_CLIENT_SECRET` no App Service Configuration

---

## Valores das Variáveis

Com base no `secrets.txt.template`:

| Variável | Valor |
|----------|-------|
| `GOOGLE_CLIENT_ID` | `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `<obtenha no Google Cloud Console - veja acima>` |
| `GOOGLE_ALLOWED_DOMAINS` | `caracore.com.br` (opcional) |

---

## Verificação Pós-Configuração

### 1. Aguardar Reinicialização

Após salvar as configurações, aguarde 1-2 minutos para o App Service reiniciar.

### 2. Executar Diagnóstico

```bash
python scripts/diagnose_oauth_all.py
```

**Resultado esperado para Google:**

```json
{
  "status": "ok",
  "google_oauth": {
    "all_required_configured": true,
    "required_variables": {
      "GOOGLE_CLIENT_ID": {"configured": true, "status": "ok"},
      "GOOGLE_CLIENT_SECRET": {"configured": true, "status": "ok"}
    }
  }
}
```

### 3. Testar Login Google

Após configurar, teste o login:

1. Acesse: [https://www.caracore.com.br/secure/index.html]
2. Clique em "Continuar com Google"
3. Deve funcionar sem erro 500

---

## Troubleshooting

### Problema: Secret não funciona após configurar

**Possíveis causas:**

1. Secret foi copiado incorretamente (espaços extras, caracteres faltando)
2. App Service não reiniciou após salvar
3. Redirect URI não está configurado corretamente no Google Cloud Console

**Solução:**

1. Verifique se copiou o valor completo (sem espaços no início/fim)
2. Reinicie manualmente o App Service
3. Verifique se o Redirect URI no Google Cloud Console corresponde ao configurado:
   - Deve ser: `https://www.caracore.com.br/secure/callback.html`

### Problema: Client ID Incorreto

**Sintoma:** Erro ao trocar código por token

**Solução:**

1. Verifique se o Client ID está correto no Google Cloud Console
2. Verifique se o Redirect URI está configurado corretamente
3. Verifique se o Client ID no App Service corresponde ao do Google Cloud Console

### Problema: Erro 500 mesmo com variáveis configuradas

**Sintoma:** Erro 500 no endpoint `/oauth/google/token`

**Solução:**

1. Verifique se as variáveis estão salvas corretamente
2. Verifique os logs do App Service para mais detalhes
3. Execute o diagnóstico para confirmar que as variáveis estão configuradas

---

## Links Úteis

- **Portal Azure - App Service Configuration:**
  [https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/configuration]

- **Google Cloud Console - Credentials:**
  [https://console.cloud.google.com/apis/credentials]

- **Logs do App Service:**
  [https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/logStream]

- **Endpoint de Diagnóstico (após deploy):**
  [https://caracore-backend-docker.azurewebsites.net/health/oauth/google]

---

## Checklist

- [ ] Acessei o Portal Azure
- [ ] Naveguei até App Service → Configuration
- [ ] Adicionei `GOOGLE_CLIENT_ID` = `1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`
- [ ] Obtive `GOOGLE_CLIENT_SECRET` do Google Cloud Console
- [ ] Adicionei `GOOGLE_CLIENT_SECRET` no App Service
- [ ] (Opcional) Adicionei `GOOGLE_ALLOWED_DOMAINS` = `caracore.com.br`
- [ ] Cliquei em **Save**
- [ ] Aguardei 1-2 minutos para reinicialização
- [ ] Executei diagnóstico: `python scripts/diagnose_oauth_all.py`
- [ ] Verifiquei que todas as variáveis estão configuradas
- [ ] Testei login Google no site

---

## Próximos Passos

Após configurar as variáveis:

1. ✅ Execute o diagnóstico para confirmar
2. ✅ Teste o login Google
3. ✅ Verifique os logs se houver problemas
4. ✅ Documente o Client Secret em local seguro (não no código!)

**⚠️ IMPORTANTE:** Nunca commite o `GOOGLE_CLIENT_SECRET` no repositório. Ele deve estar apenas no Azure App Service Configuration.

---

## Comparação: Google vs Microsoft

| Aspecto | Google OAuth | Microsoft OAuth |
|---------|--------------|-----------------|
| **Variáveis obrigatórias** | 2 (CLIENT_ID, CLIENT_SECRET) | 3 (CLIENT_ID, CLIENT_SECRET, TENANT_ID) |
| **Onde obter credenciais** | Google Cloud Console | Azure AD (App Registrations) |
| **Client ID** | `1023942712021-...` | `8ef17663-...` |
| **Endpoint de diagnóstico** | `/health/oauth/google` | `/health/oauth/microsoft` |

Ambos os provedores agora têm endpoints de diagnóstico e scripts de verificação!

