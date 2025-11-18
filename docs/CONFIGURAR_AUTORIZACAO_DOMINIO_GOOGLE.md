# Configurar Autorização de Domínio - Google

## 📋 Resumo

Este documento explica como configurar quais domínios de email são autorizados para fazer login com Google OAuth no sistema.

---

## 🔧 Configuração

### **Variável de Ambiente**

A autorização de domínio é configurada através da variável de ambiente `GOOGLE_ALLOWED_DOMAINS` no backend.

**Localização:** Backend (Flask)

**Formato:** Lista de domínios separados por vírgula (case-insensitive)

---

## 📝 Como Configurar

### **1. Desenvolvimento Local**

**Arquivo:** `docker/backend.env` (criar a partir de `docker/backend.env.sample`)

```bash
# Lista de domínios Google autorizados (minúsculos, separados por vírgula)
# Deixe em branco para aceitar qualquer domínio
GOOGLE_ALLOWED_DOMAINS=caracore.com.br
```

**Exemplos:**

```bash
# Apenas domínio corporativo
GOOGLE_ALLOWED_DOMAINS=caracore.com.br

# Múltiplos domínios (separados por vírgula)
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com

# Aceitar qualquer domínio (deixar vazio)
GOOGLE_ALLOWED_DOMAINS=

# Apenas Gmail pessoal
GOOGLE_ALLOWED_DOMAINS=gmail.com,googlemail.com
```

---

### **2. Produção (Azure App Service)**

**Onde:** Azure Portal → App Service → Configuration → Application Settings

**Passos:**

1. Acesse o Azure Portal
2. Navegue até o App Service do backend
3. Vá em **Configuration** → **Application settings**
4. Adicione ou edite a variável:
   - **Name:** `GOOGLE_ALLOWED_DOMAINS`
   - **Value:** `caracore.com.br` (ou lista de domínios separados por vírgula)
5. Clique em **Save**

**Exemplo via Azure CLI:**
```bash
az webapp config appsettings set \
  --resource-group <resource-group> \
  --name <app-service-name> \
  --settings GOOGLE_ALLOWED_DOMAINS="caracore.com.br,gmail.com"
```

---

## 🔍 Como Funciona

### **1. Leitura da Configuração**

**Arquivo:** `backend/app.py` (linha 489-512)

```python
# Ler variável de ambiente
google_allowed_domains_env = os.getenv("GOOGLE_ALLOWED_DOMAINS", "")

# Processar lista (separar por vírgula, remover espaços, converter para minúsculas)
google_allowed_domains_list = [
    entry.strip().lower() 
    for entry in google_allowed_domains_env.split(",") 
    if entry.strip()
]

# Se lista vazia, None = aceitar qualquer domínio
google_allowed_domains = google_allowed_domains_list or None
```

**Comportamento:**
- ✅ Se `GOOGLE_ALLOWED_DOMAINS` estiver vazio ou não definida → **Aceita qualquer domínio**
- ✅ Se `GOOGLE_ALLOWED_DOMAINS` tiver valores → **Apenas esses domínios são aceitos**

---

### **2. Validação do Domínio**

**Arquivo:** `backend/app.py` (linha 334-380)

**Função:** `validate_google_id_token()`

```python
def validate_google_id_token(
    token: str,
    audience: str,
    *,
    allowed_domains: Optional[list[str]] = None,  # Lista de domínios permitidos
    expected_nonce: Optional[str] = None,
    access_token: Optional[str] = None,
) -> Dict[str, Any]:
    # ... validações básicas ...
    
    if allowed_domains:
        # Para contas corporativas, usar o claim 'hd' (hosted domain)
        # Para contas pessoais (gmail.com), o 'hd' está vazio, então usar o domínio do email
        hd_claim = (claims_dict.get("hd") or "").lower()
        email_claim = (claims_dict.get("email") or "").lower()
        
        # Extrair domínio do email se hd estiver vazio
        domain_to_check = hd_claim
        if not domain_to_check and email_claim and "@" in email_claim:
            domain_to_check = email_claim.split("@")[1].lower()
        
        # Validar se domínio está na lista permitida
        if not domain_to_check or domain_to_check not in allowed_domains:
            raise IDTokenValidationError(
                "unauthorized_domain",
                f"Domínio {domain_to_check or '<vazio>'} não autorizado para login Google",
            )
    
    return claims_dict
```

**Lógica de Validação:**

1. **Contas Corporativas (Google Workspace):**
   - Usa o claim `hd` (hosted domain) do ID token
   - Exemplo: `hd: "caracore.com.br"`

2. **Contas Pessoais (Gmail):**
   - O claim `hd` está vazio
   - Extrai domínio do email (`email` claim)
   - Exemplo: `email: "usuario@gmail.com"` → domínio: `gmail.com`

3. **Validação:**
   - Se `allowed_domains` estiver definido, verifica se o domínio está na lista
   - Se não estiver, lança erro `unauthorized_domain`

---

### **3. Uso no Endpoint OAuth**

**Arquivo:** `backend/app.py` (linha 1080-1097)

**Endpoint:** `POST /oauth/google/token`

```python
@app.route("/oauth/google/token", methods=["POST"])
def oauth_google_token():
    # ... processar código OAuth ...
    
    # Validar ID token
    allowed_domains = google_allowed_domains or None
    claims = validate_google_id_token(
        body["id_token"],
        client_id,
        allowed_domains=allowed_domains,  # Passar lista de domínios permitidos
        expected_nonce=payload.get("nonce"),
        access_token=body.get("access_token"),
    )
    
    # Se validação passar, retornar tokens
    # Se falhar, retornar erro 403 (Forbidden)
```

**Resposta de Erro:**
```json
{
  "error": "unauthorized_domain",
  "error_description": "Domínio gmail.com não autorizado para login Google"
}
```

---

## 📊 Exemplos de Configuração

### **Exemplo 1: Apenas Domínio Corporativo**

```bash
GOOGLE_ALLOWED_DOMAINS=caracore.com.br
```

**Resultado:**
- ✅ `usuario@caracore.com.br` → **Aceito**
- ❌ `usuario@gmail.com` → **Rejeitado** (403 Forbidden)
- ❌ `usuario@outro.com.br` → **Rejeitado** (403 Forbidden)

---

### **Exemplo 2: Múltiplos Domínios**

```bash
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com,googlemail.com
```

**Resultado:**
- ✅ `usuario@caracore.com.br` → **Aceito**
- ✅ `usuario@gmail.com` → **Aceito**
- ✅ `usuario@googlemail.com` → **Aceito**
- ❌ `usuario@outro.com.br` → **Rejeitado** (403 Forbidden)

---

### **Exemplo 3: Aceitar Qualquer Domínio**

```bash
GOOGLE_ALLOWED_DOMAINS=
```

ou

```bash
# Variável não definida
```

**Resultado:**
- ✅ `usuario@caracore.com.br` → **Aceito**
- ✅ `usuario@gmail.com` → **Aceito**
- ✅ `usuario@qualquer.com.br` → **Aceito**

---

## 🔄 Comportamento no Frontend

### **Tratamento de Erro `unauthorized_domain`**

**Arquivo:** `secure/js/oidc-callback-google.js`

Quando o backend retorna erro `unauthorized_domain`:

1. Frontend detecta erro 403
2. Extrai email do erro ou de outras fontes
3. Verifica se usuário está autorizado no backend
4. Se autorizado mas domínio não permitido:
   - ✅ **Redireciona para reautenticação** com mensagem específica
   - ❌ **NÃO cria sessão mínima** (comportamento antigo removido)

**Código:**
```javascript
// secure/js/oidc-callback-google.js
if (response.status === 403 && errorData.error === 'unauthorized_domain') {
    // Verificar se usuário está autorizado
    const authResult = await window.authChecker.checkAuthorization(userEmail, 'google', false);
    
    if (authResult && authResult.authorized) {
        // Usuário autorizado, mas domínio não permitido
        const errorMessage = encodeURIComponent(
            'Seu domínio de email não está autorizado para login Google. ' +
            'Por favor, use uma conta @caracore.com.br ou faça login novamente.'
        );
        const redirectUrl = `/secure/index.html?email=${encodeURIComponent(userEmail)}&provider=google&error=auth_failed&message=${errorMessage}&reason=unauthorized_domain`;
        
        window.location.href = redirectUrl;
    }
}
```

---

## ⚠️ Notas Importantes

### **1. Case-Insensitive**

Os domínios são convertidos para minúsculas antes da comparação:

```bash
GOOGLE_ALLOWED_DOMAINS=Caracore.Com.Br,GMAIL.COM
```

É equivalente a:

```bash
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
```

---

### **2. Espaços em Branco**

Espaços são removidos automaticamente:

```bash
GOOGLE_ALLOWED_DOMAINS=caracore.com.br, gmail.com , googlemail.com
```

É equivalente a:

```bash
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com,googlemail.com
```

---

### **3. Contas Corporativas vs Pessoais**

**Contas Corporativas (Google Workspace):**
- Usam o claim `hd` (hosted domain)
- Exemplo: `hd: "caracore.com.br"`
- Validação usa `hd` diretamente

**Contas Pessoais (Gmail):**
- `hd` está vazio
- Validação extrai domínio do email
- Exemplo: `email: "usuario@gmail.com"` → domínio: `gmail.com`

---

### **4. Logs**

O backend registra os domínios permitidos no log de inicialização:

```
INFO: Google allowed domains restritos a: caracore.com.br, gmail.com
```

Se não houver restrição:
```
# Nenhum log (aceita qualquer domínio)
```

---

## 🔍 Verificar Configuração Atual

### **1. Ver Logs do Backend**

```bash
# Azure App Service
az webapp log tail --name <app-service-name> --resource-group <resource-group>

# Local
docker logs <container-name>
```

Procure por:
```
INFO: Google allowed domains restritos a: <domínios>
```

---

### **2. Testar Login**

1. Tente fazer login com email de domínio **permitido**
   - ✅ Deve funcionar normalmente

2. Tente fazer login com email de domínio **não permitido**
   - ❌ Deve retornar erro 403 (Forbidden)
   - ❌ Mensagem: "Domínio <domínio> não autorizado para login Google"

---

## 🛠️ Troubleshooting

### **Problema: Usuário autorizado mas recebe erro 403**

**Causa:** Domínio do email não está na lista `GOOGLE_ALLOWED_DOMAINS`

**Solução:**
1. Verificar variável de ambiente `GOOGLE_ALLOWED_DOMAINS`
2. Adicionar domínio à lista
3. Reiniciar backend (se necessário)

---

### **Problema: Todos os domínios são aceitos (não deveriam)**

**Causa:** Variável `GOOGLE_ALLOWED_DOMAINS` está vazia ou não definida

**Solução:**
1. Verificar se variável está definida
2. Adicionar domínios permitidos
3. Reiniciar backend

---

### **Problema: Domínio não está sendo validado**

**Causa:** Variável não está sendo lida corretamente

**Solução:**
1. Verificar logs de inicialização do backend
2. Verificar se variável está no formato correto (separada por vírgula)
3. Verificar se backend foi reiniciado após alteração

---

## 📚 Referências

- **Documentação:** `docs/CORRECAO_ERRO_403_GOOGLE_UNAUTHORIZED_DOMAIN.md`
- **Código Backend:** `backend/app.py` (linha 334-380, 489-512, 1080-1097)
- **Código Frontend:** `secure/js/oidc-callback-google.js`

---

## ✅ Resumo Rápido

**Para configurar domínios autorizados:**

1. **Definir variável de ambiente:**
   ```bash
   GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
   ```

2. **Reiniciar backend** (se necessário)

3. **Verificar logs** para confirmar configuração

4. **Testar login** com domínios permitidos e não permitidos

**Formato:**
- Lista separada por vírgula
- Case-insensitive
- Espaços são removidos automaticamente
- Vazio = aceita qualquer domínio

