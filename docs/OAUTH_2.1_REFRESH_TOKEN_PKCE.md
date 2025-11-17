# OAuth 2.1: Refresh Token e PKCE

## 📋 Resumo

**Pergunta:** O refresh token segue o PKCE do OAuth 2.1?

**Resposta:** **NÃO**. Segundo a especificação OAuth 2.1, o PKCE **não é necessário** para refresh tokens.

---

## 🔐 OAuth 2.1 e PKCE

### PKCE no Authorization Code Flow (Obrigatório)

No OAuth 2.1, o **PKCE (Proof Key for Code Exchange) é obrigatório** para o **Authorization Code Flow inicial**:

```
1. Cliente gera code_verifier e code_challenge
2. Cliente solicita authorization code (com code_challenge)
3. Cliente troca authorization code por tokens (com code_verifier)
   ✅ PKCE obrigatório nesta etapa
```

### PKCE no Refresh Token Flow (NÃO necessário)

Para **refresh tokens**, o PKCE **não é necessário** porque:

1. ✅ **Refresh token já foi obtido com PKCE**: O refresh token foi obtido após uma autenticação inicial que já usou PKCE
2. ✅ **Refresh token é um secret**: O refresh token em si já prova a identidade do cliente
3. ✅ **Refresh Token Rotation**: OAuth 2.1 recomenda rotação de refresh tokens, fornecendo segurança adicional

---

## 🔄 Implementação Atual

### Backend - Endpoint `/auth/token/refresh`

```python
@app.route("/auth/token/refresh", methods=["POST"])
def refresh_token():
    """
    Endpoint para refresh token rotation (OAuth 2.1)
    
    Aceita refresh_token e retorna novo access_token + novo refresh_token
    """
    # ❌ NÃO valida PKCE (correto segundo OAuth 2.1)
    # ✅ Valida apenas refresh_token e provider
    # ✅ Implementa refresh token rotation
```

**Request:**
```json
{
  "refresh_token": "1//0eWzCyAzVKwXUCgYIAR...",
  "provider": "google"  // ou "microsoft"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "id_token": "eyJ...",
  "refresh_token": "1//0eWzCyAzVKwXUCgYIAR...",  // Novo refresh token (rotação)
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Backend - Endpoint `/auth/session/refresh`

```python
@app.route("/auth/session/refresh", methods=["POST"])
def refresh_session():
    """
    Endpoint para renovar tokens de uma sessão (Fase 7)
    
    Usa session_id em vez de refresh_token diretamente
    """
    # ❌ NÃO valida PKCE (correto segundo OAuth 2.1)
    # ✅ Valida apenas session_id
    # ✅ SessionManager gerencia refresh tokens internamente
```

**Request:**
```json
{
  "session_id": "sess_abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJ...",
  "id_token": "eyJ...",
  "expires_in": 3600,
  "expires_at": "2025-11-15T17:00:00Z"
}
```

### Frontend - TokenManager

```javascript
async refreshToken() {
    // ❌ NÃO envia code_verifier (correto segundo OAuth 2.1)
    // ✅ Envia apenas session_id
    const response = await fetch(`${baseUrl}/auth/session/refresh`, {
        method: 'POST',
        body: JSON.stringify({
            session_id: this.sessionId
            // code_verifier NÃO é necessário
        })
    });
}
```

---

## ✅ Conformidade com OAuth 2.1

### Requisitos OAuth 2.1 para Refresh Tokens

| Requisito | Status | Implementação |
|-----------|--------|---------------|
| PKCE no Authorization Code Flow inicial | ✅ Obrigatório | ✅ Implementado |
| PKCE no Refresh Token Flow | ❌ NÃO necessário | ✅ Não implementado (correto) |
| Refresh Token Rotation | ✅ Recomendado | ✅ Implementado |
| HTTPS obrigatório | ✅ Obrigatório | ✅ Implementado |
| Validação de refresh_token | ✅ Obrigatório | ✅ Implementado |

---

## 🔒 Segurança

### Por que PKCE não é necessário no Refresh?

1. **Refresh token já foi obtido com PKCE**: O refresh token foi emitido após autenticação inicial que já validou PKCE
2. **Refresh token é um secret**: O próprio refresh token serve como prova de identidade
3. **Refresh Token Rotation**: A rotação de refresh tokens (emitir novo e invalidar antigo) reduz o risco de comprometimento

### Proteções Implementadas

1. ✅ **HTTPS obrigatório**: Todas as requisições de refresh usam HTTPS
2. ✅ **Rate limiting**: Endpoints de refresh têm rate limiting
3. ✅ **Refresh Token Rotation**: Novo refresh token emitido a cada renovação
4. ✅ **Validação de sessão**: `session_id` é validado antes de renovar tokens
5. ✅ **Auditoria**: Logs de todas as tentativas de refresh

---

## 📚 Referências

- [OAuth 2.1 Specification](https://oauth.net/2.1/)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [OAuth 2.1 vs OAuth 2.0](https://workos.com/blog/oauth-2-1-vs-oauth-2-0)

---

## 🎯 Conclusão

**A implementação atual está CORRETA segundo OAuth 2.1:**

- ✅ PKCE é usado no Authorization Code Flow inicial
- ✅ PKCE NÃO é usado no Refresh Token Flow (conforme especificação)
- ✅ Refresh Token Rotation está implementado
- ✅ Todas as proteções de segurança estão em vigor

**Não é necessário adicionar validação de PKCE nos endpoints de refresh token.**

