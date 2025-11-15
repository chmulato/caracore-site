# Archive - Scripts Obsoletos

Esta pasta contém scripts Python que foram movidos da pasta `scripts/` por estarem obsoletos.

**Data de Arquivamento:** 15/11/2025

## Scripts Arquivados

### 1. `teste_rapido_fase6.py`

**Status:** OBSOLETO - Fase 6 concluída (14/11/2025)

**Motivo:** Fase 6 (Proteção de Endpoints) foi 100% concluída e validada. Funcionalidade coberta por `scripts/teste.py`.

**Última Referência:** `docs/fases/fase-6/VALIDACAO-PRODUCAO.md`

---

### 2. `teste_api_fase_5.py`

**Status:** OBSOLETO - Fase 5 concluída (04/11/2025)

**Motivo:** Fase 5 (Sistema Admin Completo) foi 100% concluída e validada. Endpoints validados e funcionando em produção. Funcionalidade coberta por `scripts/teste.py`.

**Última Referência:** `docs/fases/fase-5/README.md`

---

### 3. `teste_oidc.py`

**Status:** OBSOLETO - OIDC validado (02/11/2025)

**Motivo:** OAuth 2.1 + OIDC foi completamente implementado e validado nas Fases 1-4. 64 validações automáticas já foram executadas. Sistema em produção funcionando.

**Última Referência:** `scripts/README_PY.md`

---

### 4. `teste_alteracao_senha.py`

**Status:** OBSOLETO - Funcionalidade validada

**Motivo:** Sistema de alteração de senha implementado e testado. Funcionalidade em produção. Testes específicos não são mais necessários.

**Última Referência:** `docs/SISTEMA-ALTERACAO-SENHA.md`

---

### 5. `remove_emojis_docs.py`

**Status:** UTILITÁRIO - Já executado

**Motivo:** Script utilitário para remover emojis de documentação. Já foi executado (emojis removidos). Mantido para referência histórica.

---

## Scripts Ativos (Não Arquivados)

Os seguintes scripts permanecem ativos em `scripts/`:

- ✅ `configure_fase7_azure.py` - Configuração Fase 7 (em desenvolvimento)
- ✅ `generate_encryption_keys.py` - Geração de chaves Fase 7
- ✅ `setup_super_admin.py` - Configuração super admin
- ✅ `server.py` - Servidor de desenvolvimento
- ✅ `teste.py` - Script principal de testes unificados

## Como Usar Scripts Arquivados

Se precisar executar algum script arquivado:

```bash
# Windows
python archive\teste_rapido_fase6.py

# Linux/Mac
python archive/teste_rapido_fase6.py
```

**Nota:** Estes scripts são mantidos apenas para referência histórica. Use `scripts/teste.py` para testes gerais.

---

**Documentação Completa:** `docs/SCRIPTS_OBSOLETOS.md`

