# Troubleshooting e FAQ - Fase 6

**Data:** 04/11/2025  
**VersÃ£o:** 1.0

---

## â“ PERGUNTAS FREQUENTES

### Q1: Por que a Fase 6 Ã© necessÃ¡ria se o sistema jÃ¡ estÃ¡ funcionando?

**R:** O sistema estÃ¡ funcionando corretamente, mas os testes automatizados identificaram 5 vulnerabilidades de seguranÃ§a que precisam ser corrigidas:

- Qualquer usuÃ¡rio autenticado pode acessar Ã¡reas administrativas (falta autorizaÃ§Ã£o)
- RequisiÃ§Ãµes sem token nÃ£o sÃ£o rejeitadas adequadamente
- Tokens invÃ¡lidos sÃ£o aceitos em alguns casos
- Credenciais invÃ¡lidas nÃ£o sÃ£o rejeitadas corretamente

A Fase 6 resolve esses problemas, elevando a seguranÃ§a de 77.3% para mais de 90%.

### Q2: Qual Ã© o risco de quebrar o sistema atual?

**R:** O risco Ã© baixo, pois:

- As modificaÃ§Ãµes sÃ£o incrementais e testadas
- Mantemos backup de todos os arquivos modificados
- Executamos testes apÃ³s cada mudanÃ§a
- As funcionalidades existentes continuam funcionando

### Q3: Quanto tempo leva para implementar?

**R:** Estimativa de 2.5 dias Ãºteis:

- Item 1 (AutorizaÃ§Ã£o): 2 dias
- Item 2 (ProteÃ§Ã£o): 1 dia  
- Item 3 (ValidaÃ§Ã£o): 0.5 dia

---

## ðŸ”§ PROBLEMAS COMUNS E SOLUÃ‡Ã•ES

### Problema 1: Middleware bloqueia usuÃ¡rios legÃ­timos

**Sintomas:**
- UsuÃ¡rio super admin nÃ£o consegue acessar painÃ©is
- Erro 403 Forbidden inesperado

**DiagnÃ³stico:**
```bash
# Verificar se email estÃ¡ na lista autorizada
python -c "
import json
with open('backend/data/authorized_users.json') as f:
    data = json.load(f)
    print('Super admins:', data['super_admins'])
"
```

**SoluÃ§Ã£o:**
1. Verificar se `suporte@caracore.com.br` estÃ¡ na lista de super_admins
2. Verificar se a funÃ§Ã£o `extract_email_from_token()` estÃ¡ retornando o email correto
3. Verificar logs do backend para detalhes do erro

### Problema 2: Testes continuam falhando apÃ³s implementaÃ§Ã£o

**Sintomas:**
- Taxa de sucesso nÃ£o aumenta apÃ³s implementar Item 1
- Testes especÃ­ficos ainda falham

**DiagnÃ³stico:**
```bash
# Executar apenas teste especÃ­fico
cd d:\dev\site\cara-core
python scripts\teste_api_fase_5.py --verbose
```

**SoluÃ§Ã£o:**
1. Revisar logs detalhados do teste
2. Verificar se middleware foi aplicado nos endpoints corretos
3. Testar manualmente com Postman/curl
4. Verificar se arquivo JSON existe e estÃ¡ acessÃ­vel

### Problema 3: Performance degradada apÃ³s middleware

**Sintomas:**
- Resposta dos endpoints mais lenta
- Timeout em algumas requisiÃ§Ãµes

**DiagnÃ³stico:**
```python
# Adicionar logs de tempo no middleware
import time
start_time = time.time()
# ... cÃ³digo do middleware ...
print(f"Authorization check took: {time.time() - start_time:.3f}s")
```

**SoluÃ§Ã£o:**
1. Implementar cache para validaÃ§Ã£o de autorizaÃ§Ã£o
2. Otimizar leitura do arquivo JSON
3. Considerar carregar dados em memÃ³ria na inicializaÃ§Ã£o

### Problema 4: Token JWT invÃ¡lido ainda Ã© aceito

**Sintomas:**
- Teste "Invalid Token Protection" continua falhando
- Sistema aceita tokens malformados

**DiagnÃ³stico:**
```python
# Testar validaÃ§Ã£o JWT manualmente
import jwt
try:
    decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
    print("Token vÃ¡lido:", decoded)
except jwt.InvalidTokenError as e:
    print("Token invÃ¡lido:", str(e))
```

**SoluÃ§Ã£o:**
1. Verificar se secret_key estÃ¡ correto
2. Verificar se algoritmo de decodificaÃ§Ã£o estÃ¡ correto
3. Implementar validaÃ§Ã£o de expiraÃ§Ã£o
4. Verificar se header Authorization estÃ¡ sendo processado corretamente

---

## ðŸš¨ CENÃRIOS DE EMERGÃŠNCIA

### CenÃ¡rio 1: Sistema inacessÃ­vel apÃ³s deploy

**AÃ§Ã£o Imediata:**
1. Reverter para versÃ£o anterior:
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

### CenÃ¡rio 2: Super admin bloqueado

**AÃ§Ã£o Imediata:**
1. Acessar backend via SSH/console
2. Verificar arquivo `authorized_users.json`
3. Adicionar email manualmente se necessÃ¡rio:
```json
{
  "super_admins": ["suporte@caracore.com.br"]
}
```

### CenÃ¡rio 3: Testes param de funcionar

**AÃ§Ã£o Imediata:**
1. Verificar se backend estÃ¡ online:
```bash
curl https://caracore-backend-docker.azurewebsites.net/test-deploy
```

2. Verificar se senha do teste estÃ¡ correta em `secrets.txt`
3. Executar teste local com logs verbose

---

## ðŸ“‹ CHECKLIST DE VERIFICAÃ‡ÃƒO

### Antes da ImplementaÃ§Ã£o
- [ ] Backup dos arquivos que serÃ£o modificados
- [ ] Ambiente de desenvolvimento configurado
- [ ] Testes automatizados funcionando
- [ ] DocumentaÃ§Ã£o da versÃ£o atual

### Durante a ImplementaÃ§Ã£o
- [ ] Commits incrementais apÃ³s cada mudanÃ§a
- [ ] Testes manuais apÃ³s cada funcionalidade
- [ ] Logs detalhados das operaÃ§Ãµes
- [ ] ValidaÃ§Ã£o de cada endpoint modificado

### ApÃ³s a ImplementaÃ§Ã£o
- [ ] Executar teste completo `teste_api_fase_5.py`
- [ ] Verificar taxa de sucesso >90%
- [ ] Testar manualmente todas as funcionalidades
- [ ] Deploy para produÃ§Ã£o
- [ ] Monitorar logs por 24h

---

## ðŸ” COMANDOS ÃšTEIS

### ValidaÃ§Ã£o do Sistema
```bash
# Executar todos os testes
python scripts\teste_api_fase_5.py

# Testar endpoint especÃ­fico
curl -X POST https://caracore-backend-docker.azurewebsites.net/api/admin/users \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json"

# Verificar estrutura do arquivo de autorizaÃ§Ã£o
python -c "
import json
with open('backend/data/authorized_users.json') as f:
    data = json.load(f)
    print(json.dumps(data, indent=2))
"
```

### Debug do Backend
```bash
# Logs do Azure (se aplicÃ¡vel)
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore

# Teste local
cd backend
python app.py
```

### VerificaÃ§Ã£o de Token
```python
# Script para testar token JWT
import jwt
import json

token = "YOUR_TOKEN_HERE"
secret = "YOUR_SECRET_HERE"

try:
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
    print("Token vÃ¡lido!")
    print(json.dumps(decoded, indent=2))
except jwt.ExpiredSignatureError:
    print("Token expirado")
except jwt.InvalidTokenError as e:
    print(f"Token invÃ¡lido: {e}")
```

---

## ðŸ“ž SUPORTE

### Contatos
- **Email:** suporte@caracore.com.br
- **GitHub Issues:** https://caracore.com.br/

### InformaÃ§Ãµes para Suporte
Ao reportar um problema, inclua:

1. **DescriÃ§Ã£o do problema**
2. **Passos para reproduzir**
3. **Output do teste automatizado**
4. **Logs do backend (se disponÃ­vel)**
5. **Timestamp do erro**
6. **VersÃ£o/commit do cÃ³digo**

### Logs Ãšteis
- Teste automatizado: `test_report_fase5_*.json`
- Backend: logs do Azure Web App
- Frontend: console do navegador (F12)

---

**Ãšltima AtualizaÃ§Ã£o:** 04/11/2025  
**VersÃ£o do Documento:** 1.0  
**ResponsÃ¡vel:** Equipe Cara Core
