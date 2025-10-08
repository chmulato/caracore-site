# Configuração Entra ID - Contas Pessoais Apenas

## Resumo
O portal da Área 51 está configurado **exclusivamente** para contas pessoais da Microsoft (MSA - Microsoft Account), **não** para contas corporativas/organizacionais.

## Configuração Atual

### 1. Endpoint Authority
```json
{
  "authority": "https://login.microsoftonline.com/consumers/v2.0"
}
```

### 2. Explicação dos Endpoints

| Endpoint | Descrição | Suporte |
|----------|-----------|---------|
| `/consumers/v2.0` | **✅ ATUAL** - Apenas contas pessoais (@outlook.com, @hotmail.com, @live.com) | Contas Pessoais |
| `/common/v2.0` | ❌ - Contas pessoais E corporativas | Ambas |
| `/organizations/v2.0` | ❌ - Apenas contas corporativas/organizacionais | Contas Corporativas |
| `/[tenant-id]/v2.0` | ❌ - Apenas usuários de um tenant específico | Tenant Específico |

## Arquivos de Configuração

### 1. Configuração Principal
- **Arquivo**: `js/config.js`
- **Linha**: `authority: "https://login.microsoftonline.com/consumers/v2.0"`
- **Status**: ✅ Correto

### 2. Configuração da Área Segura
- **Arquivo**: `secure/config/entra.json`
- **Conteúdo**: Endpoint `/consumers/v2.0`
- **Status**: ✅ Correto

## Testes Implementados

### 1. Validação de Endpoints
Os testes unitários verificam que:
- ✅ `/consumers/v2.0` é aceito como válido
- ❌ `/common/v2.0` é rejeitado em modo restrito
- ❌ `/organizations/v2.0` é rejeitado em modo restrito

### 2. Arquivos de Teste
- `secure/testes/test-config-validation.js` - Valida configurações
- `secure/testes/test-entra-auth.js` - Testa autenticação Entra ID
- `secure/testes/test-dual-auth.js` - Testa autenticação dual

## Comportamento Esperado

### ✅ Contas Aceitas
- @outlook.com
- @hotmail.com  
- @live.com
- @msn.com
- Outras contas pessoais Microsoft

### ❌ Contas Rejeitadas
- @empresa.com (contas corporativas)
- @organization.onmicrosoft.com (Azure AD organizacional)
- Contas de trabalho/escola

## Validação

Para confirmar que apenas contas pessoais são aceitas:

1. **Execute os testes unitários**:
   ```bash
   python executar_ut_secure.py
   ```

2. **Verifique o teste de autenticação**:
   - Teste: "should reject organizational authority"
   - Resultado esperado: ✅ PASS

3. **Teste manual**:
   - Tente fazer login com conta corporativa
   - Resultado esperado: Erro de autorização

## Data de Verificação
- **Data**: ${new Date().toISOString().split('T')[0]}
- **Configuração**: Confirmada para contas pessoais apenas
- **Status**: ✅ Operacional

---

**Nota**: Esta configuração garante que apenas usuários com contas pessoais da Microsoft possam acessar a Área 51, mantendo a segurança e o controle de acesso conforme especificado.