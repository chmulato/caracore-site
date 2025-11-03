# Implementação - Fase 1 Parte 1: Backend OAuth 2.1 + OIDC

**Data Início:** 30/10/2025 
**Duração:** Dias 1-3 (30/10 - 01/11) 
**Responsável:** Backend Developer

## Objetivo

Implementar e validar os endpoints OAuth 2.1 + OIDC no backend Python/Azure com PKCE obrigatório.

## Status Atual do Backend

### Já Implementado:
- `/health` - Health check
- `/oauth/google/token` - Troca de código Google (POST)
- `/oauth/microsoft/token` - Troca de código Microsoft (POST)
- Validação básica de ID tokens
- Cache de JWKS
- CORS configurado

### Necessário Adicionar/Melhorar:

#### 1. **Endpoints Novos Necessários:**
- [ ] `/auth/login` - Iniciar fluxo OAuth
- [ ] `/auth/callback` - Callback unificado
- [ ] `/auth/token/refresh` - Refresh token rotation
- [ ] `/auth/logout` - Logout e revogação
- [ ] `/auth/validate` - Validar token/sessão

#### 2. **Melhorias em Endpoints Existentes:**
- [ ] Validação PKCE obrigatória em `/oauth/google/token`
- [ ] Validação PKCE obrigatória em `/oauth/microsoft/token`
- [ ] Validação robusta de issuer, audience, expiração
- [ ] Logs de auditoria para todos os endpoints

## Plano de Implementação

### **DIA 1 (30/10)** - Estrutura e PKCE

#### Tarefas:
1. [ ] Criar módulo `auth_manager.py` para centralizar lógica OAuth
2. [ ] Implementar validação PKCE (code_verifier + code_challenge)
3. [ ] Adicionar validação obrigatória de PKCE nos endpoints existentes
4. [ ] Criar estrutura de sessão segura
5. [ ] Implementar logs de auditoria

#### Arquivos a Criar/Modificar:
- `backend/auth_manager.py` (novo)
- `backend/app.py` (modificar endpoints existentes)
- `backend/requirements.txt` (verificar dependências)

---

### **DIA 2 (31/10)** - Novos Endpoints

#### Tarefas:
1. [ ] Implementar `/auth/token/refresh` com token rotation
2. [ ] Implementar `/auth/validate` para validação de sessão
3. [ ] Implementar `/auth/logout` com revogação de tokens
4. [ ] Adicionar rate limiting básico
5. [ ] Implementar proteção CSRF

#### Arquivos a Criar/Modificar:
- `backend/app.py` (novos endpoints)
- `backend/rate_limiter.py` (novo)
- `backend/csrf_protection.py` (novo)

---

### **DIA 3 (01/11)** - Testes e Validação

#### Tarefas:
1. [ ] Criar testes unitários para validação PKCE
2. [ ] Criar testes de integração para fluxo OAuth completo
3. [ ] Validar todos os critérios de segurança
4. [ ] Documentar endpoints e exemplos de uso
5. [ ] Deploy em ambiente de staging

#### Arquivos a Criar:
- `backend/tests/test_auth.py` (novo)
- `backend/tests/test_pkce.py` (novo)
- `backend/API_DOCUMENTATION.md` (novo)

---

## Checklist Detalhado

### **Validação PKCE Obrigatória**
- [ ] Validar presença de `code_verifier` no request
- [ ] Validar formato do `code_verifier` (43-128 caracteres)
- [ ] Calcular SHA256 do `code_verifier`
- [ ] Comparar com `code_challenge` original
- [ ] Rejeitar requisições sem PKCE válido

### **Validação de Tokens (Robusta)**
- [ ] Validar `iss` (issuer) - Google/Microsoft esperado
- [ ] Validar `aud` (audience) - Client ID correto
- [ ] Validar `exp` (expiration) - Token não expirado
- [ ] Validar `iat` (issued at) - Tempo de emissão válido
- [ ] Validar assinatura JWT com JWKS
- [ ] Validar `nonce` quando presente

### **Refresh Token Rotation**
- [ ] Invalidar refresh token anterior ao emitir novo
- [ ] Armazenar hash de tokens ativos
- [ ] Detectar reutilização de refresh token (ataque)
- [ ] Revogar família de tokens se detectado reuso

### **Segurança Adicional**
- [ ] Rate limiting por IP (max 10 req/min por endpoint)
- [ ] CSRF token validation
- [ ] Input sanitization
- [ ] Logging de eventos de segurança
- [ ] Detecção de tentativas suspeitas

---

## Exemplo de Código - Validação PKCE

```python
import hashlib
import base64

def validate_pkce(code_verifier: str, code_challenge: str, method: str = "S256") -> bool:
 """
 Valida PKCE conforme OAuth 2.1
 
 Args:
 code_verifier: Código enviado pelo cliente
 code_challenge: Desafio original armazenado
 method: Método usado (S256 obrigatório)
 
 Returns:
 True se válido, False caso contrário
 """
 if not code_verifier or len(code_verifier) < 43 or len(code_verifier) > 128:
 return False
 
 if method != "S256":
 return False # OAuth 2.1 requer S256
 
 # Calcular SHA256 e converter para base64url
 sha256 = hashlib.sha256(code_verifier.encode('ascii')).digest()
 calculated_challenge = base64.urlsafe_b64encode(sha256).decode('ascii').rstrip('=')
 
 return calculated_challenge == code_challenge
```

---

## Métricas de Sucesso

- 100% dos endpoints OAuth usam PKCE obrigatório
- Validação de tokens implementada com todos os checks
- Rate limiting funcional em todos os endpoints de auth
- Logs de auditoria capturando todos os eventos
- Testes unitários com cobertura > 80%
- Documentação completa dos endpoints

---

## Próximos Passos

Após conclusão desta parte:
1. Integração frontend (Parte 2)
2. Implementação do controle de sessão (Item 2)
3. Configuração de segurança HTTP (Item 8)

---

**Atualizado:** 30/10/2025 
**Próxima Revisão:** 31/10/2025