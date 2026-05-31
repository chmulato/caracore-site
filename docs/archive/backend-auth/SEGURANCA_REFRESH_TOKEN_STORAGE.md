# Segurança do Armazenamento de Refresh Tokens

## 📋 Resumo

**Pergunta:** O refresh token está sendo armazenado com segurança no backend?

**Resposta:** **SIM**. O sistema implementa múltiplas camadas de segurança seguindo as melhores práticas de OAuth 2.1 e criptografia.

---

## 🔐 Medidas de Segurança Implementadas

### 1. ✅ Criptografia AES-256-CBC

**Implementação:** `backend/crypto_manager.py`

- **Algoritmo**: AES-256-CBC (Advanced Encryption Standard, 256 bits)
- **Padding**: PKCS7
- **IV único**: Cada token é criptografado com um Initialization Vector (IV) único e aleatório
- **Chave**: Armazenada em variável de ambiente `TOKEN_ENCRYPTION_KEY` (32 bytes, base64-encoded)

```python
# Exemplo de criptografia
encrypted_data = {
    'encrypted': 'base64_encoded_ciphertext',
    'iv': 'base64_encoded_iv'  # Único para cada token
}
```

**Segurança:**
- ✅ Mesmo token criptografado duas vezes produz resultados diferentes (IV único)
- ✅ Chave nunca armazenada no código ou em arquivos
- ✅ Criptografia simétrica de alta segurança (AES-256)

---

### 2. ✅ Armazenamento Seguro

**Implementação:** `backend/token_storage.py`

**Localização:**
- **Produção (Azure)**: `/home/site/wwwroot/data/user_sessions.json`
- **Local**: `backend/data/user_sessions.json`
- **Configurável**: Via variável de ambiente `SESSION_DATA_FILE`

**Estrutura do arquivo:**
```json
{
  "version": "1.0",
  "encryption_algorithm": "AES-256-CBC",
  "sessions": {
    "sess_abc123...": {
      "refresh_token_encrypted": "base64_encrypted_token",
      "encryption_iv": "base64_iv",
      "status": "active",
      "expires_at": "2025-11-18T00:00:00Z",
      ...
    }
  }
}
```

**Características:**
- ✅ Tokens **nunca** armazenados em texto plano
- ✅ Apenas dados criptografados são persistidos
- ✅ Metadata separada dos dados sensíveis

---

### 3. ✅ File Locking (Concorrência)

**Implementação:** `backend/token_storage.py`

- **Linux/Mac**: `fcntl` (shared locks para leitura, exclusive locks para escrita)
- **Windows**: `msvcrt` (locking alternativo)
- **Proteção**: Evita corrupção de dados em acesso concorrente

```python
# Leitura com shared lock
fcntl.flock(f.fileno(), fcntl.LOCK_SH)

# Escrita com exclusive lock
fcntl.flock(f.fileno(), fcntl.LOCK_EX)
```

**Benefícios:**
- ✅ Previne race conditions
- ✅ Garante integridade dos dados
- ✅ Suporta múltiplas requisições simultâneas

---

### 4. ✅ Backup Automático

**Implementação:** `backend/token_storage.py`

- **Quando**: Antes de cada modificação (criar, atualizar, revogar sessão)
- **Localização**: `backups/user_sessions_backup_YYYYMMDD_HHMMSS.json`
- **Retenção**: Mantém últimos 10 backups, remove os mais antigos
- **Restauração**: Automática em caso de corrupção do arquivo principal

**Benefícios:**
- ✅ Recuperação em caso de corrupção
- ✅ Histórico de alterações
- ✅ Proteção contra perda de dados

---

### 5. ✅ Validação de Session IDs

**Implementação:** `backend/crypto_manager.py`

**Formato:**
```
sess_{uuid32}_{timestamp10}_{salt16}
```

**Validação:**
- ✅ Prefixo `sess_` obrigatório
- ✅ UUID v4 sem hífens (32 caracteres)
- ✅ Timestamp Unix (10 dígitos)
- ✅ Salt hexadecimal (16 caracteres)

**Exemplo:**
```
sess_655fca65b25349f7a0f3552c4bcdf48e_1763422069_d42878dfa478fd41
```

**Segurança:**
- ✅ Session IDs únicos e não previsíveis
- ✅ Validação antes de qualquer operação
- ✅ Previne ataques de enumeração

---

### 6. ✅ Expiração e Limpeza Automática

**Implementação:** `backend/token_storage.py` e `backend/session_manager.py`

**Expiração:**
- **Sessão**: 24 horas (configurável via `SESSION_TIMEOUT_HOURS`)
- **Access Token**: Conforme retornado pelo provider (geralmente 1 hora)
- **Refresh Token**: Conforme política do provider

**Limpeza:**
- ✅ Sessões expiradas são marcadas como `expired`
- ✅ Sessões revogadas são removidas após 1 hora
- ✅ Limpeza automática via `cleanup_expired()`

**Benefícios:**
- ✅ Reduz superfície de ataque
- ✅ Libera espaço de armazenamento
- ✅ Mantém apenas sessões ativas

---

### 7. ✅ Limite de Sessões por Usuário

**Implementação:** `backend/session_manager.py`

- **Padrão**: 5 sessões por usuário (configurável via `MAX_SESSIONS_PER_USER`)
- **Comportamento**: Ao exceder, a sessão mais antiga é automaticamente revogada

**Benefícios:**
- ✅ Previne abuso (múltiplas sessões simultâneas)
- ✅ Força logout de dispositivos antigos
- ✅ Melhora segurança geral

---

### 8. ✅ Refresh Token Rotation (OAuth 2.1)

**Implementação:** `backend/session_manager.py`

- **Comportamento**: Quando o provider retorna novo refresh token, o antigo é substituído
- **Criptografia**: Novo token é criptografado antes de substituir o antigo
- **Validação**: Apenas refresh tokens válidos são aceitos

**Benefícios:**
- ✅ Conformidade com OAuth 2.1
- ✅ Reduz impacto de comprometimento
- ✅ Tokens antigos tornam-se inválidos automaticamente

---

### 9. ✅ Auditoria e Logging

**Implementação:** `backend/token_audit.py`

**Eventos auditados:**
- ✅ Criação de sessão
- ✅ Renovação de tokens
- ✅ Revogação de sessão
- ✅ Tentativas de acesso inválidas

**Informações registradas:**
- ✅ Session ID
- ✅ Email do usuário
- ✅ Provider (Google/Microsoft)
- ✅ IP address
- ✅ User agent
- ✅ Timestamp
- ✅ Status (sucesso/falha)

**Benefícios:**
- ✅ Rastreabilidade completa
- ✅ Detecção de anomalias
- ✅ Compliance e forense

---

### 10. ✅ Validação de Integridade

**Implementação:** `backend/token_storage.py`

- ✅ Validação de estrutura JSON antes de carregar
- ✅ Verificação de campos obrigatórios
- ✅ Validação de formato de dados
- ✅ Restauração automática de backup em caso de corrupção

**Benefícios:**
- ✅ Previne corrupção de dados
- ✅ Recuperação automática
- ✅ Garante consistência

---

## 🔒 Configuração de Segurança

### Variáveis de Ambiente Obrigatórias

```bash
# Chave de criptografia (32 bytes, base64-encoded)
TOKEN_ENCRYPTION_KEY=<chave_base64>

# Configurações opcionais
SESSION_TIMEOUT_HOURS=24          # Expiração de sessão
MAX_SESSIONS_PER_USER=5           # Limite de sessões
SESSION_DATA_FILE=/path/to/file   # Localização do arquivo
```

### Geração de Chave de Criptografia

```bash
# Script fornecido: scripts/generate_encryption_keys.py
python scripts/generate_encryption_keys.py
```

**Saída:**
```
TOKEN_ENCRYPTION_KEY=<chave_gerada>
```

**⚠️ IMPORTANTE:**
- ✅ Chave deve ser mantida em segredo
- ✅ Nunca commitar chave no código
- ✅ Usar Azure Key Vault ou similar em produção
- ✅ Rotacionar chave periodicamente

---

## 📊 Comparação com Boas Práticas

| Boa Prática | Status | Implementação |
|-------------|--------|---------------|
| Criptografia em repouso | ✅ | AES-256-CBC |
| Chave em variável de ambiente | ✅ | `TOKEN_ENCRYPTION_KEY` |
| IV único por token | ✅ | `secrets.token_bytes(16)` |
| File locking | ✅ | `fcntl` / `msvcrt` |
| Backup automático | ✅ | Antes de cada modificação |
| Expiração de sessões | ✅ | 24 horas (configurável) |
| Limite de sessões | ✅ | 5 por usuário (configurável) |
| Refresh Token Rotation | ✅ | OAuth 2.1 compliant |
| Auditoria | ✅ | Logs completos |
| Validação de integridade | ✅ | Validação de estrutura |

---

## 🛡️ Proteções Adicionais

### 1. Isolamento de Dados Sensíveis

- ✅ Refresh tokens **nunca** retornados em respostas de API
- ✅ Apenas `session_id` é exposto ao frontend
- ✅ Descriptografia apenas quando necessário (renovação)

### 2. Validação de Acesso

- ✅ Session IDs validados antes de qualquer operação
- ✅ Verificação de status (`active`, `expired`, `revoked`)
- ✅ Validação de expiração antes de descriptografar

### 3. Tratamento de Erros

- ✅ Erros de descriptografia não expõem dados sensíveis
- ✅ Logs não contêm tokens em texto plano
- ✅ Mensagens de erro genéricas para clientes

---

## ⚠️ Considerações de Segurança

### ✅ Pontos Fortes

1. **Criptografia robusta**: AES-256-CBC é considerado seguro
2. **IV único**: Previne análise de padrões
3. **Chave externa**: Não hardcoded no código
4. **File locking**: Previne corrupção
5. **Backup automático**: Recuperação em caso de falha
6. **Auditoria completa**: Rastreabilidade total

### 🔄 Melhorias Futuras (Opcionais)

1. **Azure Key Vault**: Armazenar chave de criptografia em Key Vault
2. **Database**: Migrar de JSON para banco de dados (PostgreSQL, etc.)
3. **HSM**: Hardware Security Module para chaves
4. **Encryption at rest**: Criptografia adicional do arquivo (LUKS, etc.)
5. **Key rotation**: Rotação automática de chaves de criptografia

---

## 📚 Referências

- [OWASP - Token Storage](https://cheatsheetseries.owasp.org/cheatsheets/Token_Storage_Cheat_Sheet.html)
- [NIST - Encryption Standards](https://csrc.nist.gov/publications/detail/sp/800-175b/rev-1/final)
- [OAuth 2.1 Security Best Practices](https://oauth.net/2.1/)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)

---

## 🎯 Conclusão

**O sistema de armazenamento de refresh tokens está implementado com segurança robusta:**

- ✅ Criptografia AES-256-CBC com IV único
- ✅ Chave armazenada em variável de ambiente
- ✅ File locking para concorrência
- ✅ Backup automático
- ✅ Validação e limpeza automática
- ✅ Auditoria completa
- ✅ Conformidade com OAuth 2.1

**O sistema segue as melhores práticas de segurança e está pronto para uso em produção.**

