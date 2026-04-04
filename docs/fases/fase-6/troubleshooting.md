# Troubleshooting e FAQ - Fase 6

**Data:** 04/11/2025  
**Versão:** 1.0

---

## ❓ PERGUNTAS FREQUENTES

### Q1: Por que a Fase 6 é necessária se o sistema já está funcionando?

**R:** O sistema está funcionando corretamente, mas os testes automatizados identificaram 5 vulnerabilidades de segurança que precisam ser corrigidas:

- Qualquer usuário autenticado pode acessar áreas administrativas (falta autorização)
- Requisições sem token não são rejeitadas adequadamente
- Tokens inválidos são aceitos em alguns casos
- Credenciais inválidas não são rejeitadas corretamente

A Fase 6 resolve esses problemas, elevando a segurança de 77.3% para mais de 90%.

### Q2: Qual é o risco de quebrar o sistema atual?

**R:** O risco é baixo, pois:

- As modificações são incrementais e testadas
- Mantemos backup de todos os arquivos modificados
- Executamos testes após cada mudança
- As funcionalidades existentes continuam funcionando

### Q3: Quanto tempo leva para implementar?

**R:** Estimativa de 2.5 dias úteis:

- Item 1 (Autorização): 2 dias
- Item 2 (Proteção): 1 dia  
- Item 3 (Validação): 0.5 dia

---

## 🔧 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: Middleware bloqueia usuários legítimos

**Sintomas:**
- Usuário super admin não consegue acessar painéis
- Erro 403 Forbidden inesperado

**Diagnóstico:**
```bash
# Verificar se email está na lista autorizada
python -c "
import json
with open('backend/data/authorized_users.json') as f:
    data = json.load(f)
    print('Super admins:', data['super_admins'])
"
```

**Solução:**
1. Verificar se `suporte@caracore.com.br` está na lista de super_admins
2. Verificar se a função `extract_email_from_token()` está retornando o email correto
3. Verificar logs do backend para detalhes do erro

### Problema 2: Testes continuam falhando após implementação

**Sintomas:**
- Taxa de sucesso não aumenta após implementar Item 1
- Testes específicos ainda falham

**Diagnóstico:**
```bash
# Executar apenas teste específico
cd d:\dev\site\cara-core
python scripts\teste_api_fase_5.py --verbose
```

**Solução:**
1. Revisar logs detalhados do teste
2. Verificar se middleware foi aplicado nos endpoints corretos
3. Testar manualmente com Postman/curl
4. Verificar se arquivo JSON existe e está acessível

### Problema 3: Performance degradada após middleware

**Sintomas:**
- Resposta dos endpoints mais lenta
- Timeout em algumas requisições

**Diagnóstico:**
```python
# Adicionar logs de tempo no middleware
import time
start_time = time.time()
# ... código do middleware ...
print(f"Authorization check took: {time.time() - start_time:.3f}s")
```

**Solução:**
1. Implementar cache para validação de autorização
2. Otimizar leitura do arquivo JSON
3. Considerar carregar dados em memória na inicialização

### Problema 4: Token JWT inválido ainda é aceito

**Sintomas:**
- Teste "Invalid Token Protection" continua falhando
- Sistema aceita tokens malformados

**Diagnóstico:**
```python
# Testar validação JWT manualmente
import jwt
try:
    decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
    print("Token válido:", decoded)
except jwt.InvalidTokenError as e:
    print("Token inválido:", str(e))
```

**Solução:**
1. Verificar se secret_key está correto
2. Verificar se algoritmo de decodificação está correto
3. Implementar validação de expiração
4. Verificar se header Authorization está sendo processado corretamente

---

## 🚨 CENÁRIOS DE EMERGÊNCIA

### Cenário 1: Sistema inacessível após deploy

**Ação Imediata:**
1. Reverter para versão anterior:
```bash
git revert HEAD
git push origin main
```

2. Redeployar backend:
```bash
# Seguir procedimento de deploy manual
```

3. Investigar logs:
```bash
# Acessar logs do Azure Web App
```

### Cenário 2: Super admin bloqueado

**Ação Imediata:**
1. Acessar backend via SSH/console
2. Verificar arquivo `authorized_users.json`
3. Adicionar email manualmente se necessário:
```json
{
  "super_admins": ["suporte@caracore.com.br"]
}
```

### Cenário 3: Testes param de funcionar

**Ação Imediata:**
1. Verificar se backend está online:
```bash
curl https://caracore-backend-docker.azurewebsites.net/test-deploy
```

2. Verificar se senha do teste está correta em `secrets.txt`
3. Executar teste local com logs verbose

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### Antes da Implementação
- [ ] Backup dos arquivos que serão modificados
- [ ] Ambiente de desenvolvimento configurado
- [ ] Testes automatizados funcionando
- [ ] Documentação da versão atual

### Durante a Implementação
- [ ] Commits incrementais após cada mudança
- [ ] Testes manuais após cada funcionalidade
- [ ] Logs detalhados das operações
- [ ] Validação de cada endpoint modificado

### Após a Implementação
- [ ] Executar teste completo `teste_api_fase_5.py`
- [ ] Verificar taxa de sucesso >90%
- [ ] Testar manualmente todas as funcionalidades
- [ ] Deploy para produção
- [ ] Monitorar logs por 24h

---

## 🔍 COMANDOS ÚTEIS

### Validação do Sistema
```bash
# Executar todos os testes
python scripts\teste_api_fase_5.py

# Testar endpoint específico
curl -X POST https://caracore-backend-docker.azurewebsites.net/api/admin/users \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json"

# Verificar estrutura do arquivo de autorização
python -c "
import json
with open('backend/data/authorized_users.json') as f:
    data = json.load(f)
    print(json.dumps(data, indent=2))
"
```

### Debug do Backend
```bash
# Logs do Azure (se aplicável)
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore

# Teste local
cd backend
python app.py
```

### Verificação de Token
```python
# Script para testar token JWT
import jwt
import json

token = "YOUR_TOKEN_HERE"
secret = "YOUR_SECRET_HERE"

try:
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
    print("Token válido!")
    print(json.dumps(decoded, indent=2))
except jwt.ExpiredSignatureError:
    print("Token expirado")
except jwt.InvalidTokenError as e:
    print(f"Token inválido: {e}")
```

---

## 📞 SUPORTE

### Contatos
- **Email:** suporte@caracore.com.br
- **GitHub Issues:** https://caracore.com.br/

### Informações para Suporte
Ao reportar um problema, inclua:

1. **Descrição do problema**
2. **Passos para reproduzir**
3. **Output do teste automatizado**
4. **Logs do backend (se disponível)**
5. **Timestamp do erro**
6. **Versão/commit do código**

### Logs Úteis
- Teste automatizado: `test_report_fase5_*.json`
- Backend: logs do Azure Web App
- Frontend: console do navegador (F12)

---

**Última Atualização:** 04/11/2025  
**Versão do Documento:** 1.0  
**Responsável:** Equipe Cara Core
