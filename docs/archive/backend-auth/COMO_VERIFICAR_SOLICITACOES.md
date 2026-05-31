# Como Verificar Solicitações de Acesso no Backend

Este guia mostra diferentes formas de verificar se as solicitações de primeiro acesso estão sendo gravadas no backend.

## 📋 Métodos de Verificação

### 1. **Verificação Direta do Arquivo JSON** (Mais Simples) ⭐

Use o script Python para verificar diretamente o arquivo de dados:

```bash
# No diretório backend/
python verificar_solicitacoes.py
```

**Ou verificar um email específico:**

```bash
python verificar_solicitacoes.py chmulato@hotmail.com
```

**O que o script mostra:**

- ✅ Total de usuários autorizados
- ✅ Lista de solicitações pendentes
- ✅ Detalhes de cada solicitação (email, nome, data, status)
- ✅ Logs de auditoria relacionados

---

### 2. **Via Endpoint da API** (Requer Autenticação)

Use o script para testar o endpoint via API:

```bash
# Produção
python testar_endpoint_solicitacoes.py

# Local
python testar_endpoint_solicitacoes.py local
```

**Você precisará:**

1. Fazer login como super admin em `/secure/super-admin-setup.html`
2. Copiar o token do localStorage: `super_admin_token`
3. Colar o token quando o script solicitar

---

### 3. **Via Navegador (Console JavaScript)**

Abra o console do navegador (F12) e execute:

```javascript
// Obter token
const token = localStorage.getItem('super_admin_token');

// Fazer requisição
fetch('https://caracore-backend-docker.azurewebsites.net/api/admin/access-requests', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => {
    console.log('Total:', data.total);
    console.log('Solicitações:', data.requests);
});
```

---

### 4. **Verificação Manual do Arquivo JSON**

Abra diretamente o arquivo:

```bash
backend/data/authorized_users.json
```

Procure pela seção `"pending_requests"`:

```json
{
  "pending_requests": [
    {
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "provider": "google",
      "message": "Motivo do acesso...",
      "requested_at": "2025-11-15T08:16:57Z",
      "status": "pending"
    }
  ]
}
```

---

## 🔍 Verificar se uma Solicitação Foi Salva

### Passo a Passo:

1. **Envie uma solicitação de primeiro acesso** através do formulário
2. **Execute o script de verificação:**

```bash
python verificar_solicitacoes.py
```

3.**Verifique se aparece na lista** de `pending_requests`

### Se não aparecer:

1. **Verifique os logs do backend** quando a solicitação é enviada
2. **Verifique se o endpoint `/api/request-access` está funcionando:**
   - Abra o Network tab do navegador
   - Envie uma solicitação
   - Veja se retorna status 201 (Created)
3. **Verifique permissões do arquivo:**
   - O backend precisa ter permissão de escrita no arquivo JSON
   - Verifique se o diretório `backend/data/` existe

---

## 🐛 Debug de Problemas

### Problema: Arquivo vazio ou sem solicitações

**Possíveis causas:**

- ❌ Erro ao salvar (verificar logs do backend)
- ❌ Permissões de arquivo incorretas
- ❌ Endpoint não está sendo chamado corretamente
- ❌ Erro na validação dos dados

**Solução:**

1. Verifique os logs do backend Flask
2. Teste o endpoint manualmente:

```bash
curl -X POST https://caracore-backend-docker.azurewebsites.net/api/request-access \
   -H "Content-Type: application/json" \
   -d '{
      "email": "teste@exemplo.com",
      "name": "Teste",
      "provider": "google",
      "message": "Teste de solicitação"
   }'
```

### Problema: Endpoint retorna 401/403

**Causa:** Token inválido ou sem permissão

**Solução:**

1. Faça login novamente como super admin
2. Verifique se o token não expirou (validade de 24h)
3. Use o script `verificar_solicitacoes.py` que não requer autenticação

---

## 📊 Estrutura do Arquivo de Dados

```json
{
  "version": "1.0",
  "updated_at": "2025-11-15T10:00:00Z",
  "users": [...],           // Usuários autorizados
  "pending_requests": [...], // Solicitações pendentes ⭐
  "settings": {...},
  "audit_log": [...]        // Logs de auditoria
}
```

---

## 💡 Dica Rápida

**Para verificar rapidamente via linha de comando:**

```bash
# Ver todas as solicitações
python verificar_solicitacoes.py

# Verificar email específico
python verificar_solicitacoes.py chmulato@hotmail.com

# Ver apenas o arquivo JSON (Linux/Mac)
cat backend/data/authorized_users.json | python -m json.tool | grep -A 10 "pending_requests"
```

---

## 📝 Exemplo de Saída do Script

```text
============================================================
VERIFICAÇÃO DE SOLICITAÇÕES DE ACESSO
============================================================

📁 Arquivo: backend/data/authorized_users.json
📅 Última atualização: 2025-11-15T10:00:00Z
📊 Versão: 1.0

👥 Usuários autorizados: 2
   ✅ suporte@caracore.com.br (super_admin)
   ✅ admin@caracore.com.br (admin)

📋 Solicitações pendentes: 1

   Detalhes das solicitações:

   [1] Solicitação:
       Email: chmulato@hotmail.com
       Nome: Christian Mulato
       Provedor: google
       Status: pending
       Solicitado em: 2025-11-15T08:16:57Z
       Mensagem: Motivo do acesso: Preciso acessar a documentação...

============================================================
RESUMO:
   Total de usuários: 2
   Solicitações pendentes: 1
   Entradas no log: 5
============================================================
```