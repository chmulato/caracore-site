# Índice de Documentação - CaraCore

**Última Atualização:** 01/11/2025

Este documento serve como índice central para toda a documentação do projeto CaraCore.

---

## 📋 Documentação Essencial

### Guias Operacionais

| Documento | Descrição | Status |
|-----------|-----------|--------|
| [AZURE_DEPLOY.md](./AZURE_DEPLOY.md) | Guia completo de deploy e rollback no Azure | ✅ Atualizado |
| [VERSOES.md](./VERSOES.md) | Versões de todas as dependências (Python, Flask, etc.) | ✅ Atualizado |

### Documentação por Fase

| Fase | Status | Documentação |
|------|--------|--------------|
| **Fase 1** | ✅ 100% | [OAuth 2.1 + OIDC](./fases/fase-1/) |
| **Fase 2** | ✅ 100% | [Logout e Segurança](./fases/fase-2/) |
| **Fase 3** | 🟢 90% | [Auditoria e Backend](./fases/fase-3/) |
| **Fase 4** | ⚪ 0% | [Monitoramento](./fases/fase-4/) |

### Status e Pendências

| Documento | Descrição | Última Atualização |
|-----------|-----------|-------------------|
| [pendencias/STATUS-ATUAL.md](./pendencias/STATUS-ATUAL.md) | Status completo do projeto | 01/11/2025 |

---

## 🚀 Quick Start

### Para Desenvolvedores

1. **Clone o repositório**

   ```bash
   git clone https://github.com/chmulato/cara-core.git
   cd cara-core
   ```

2. **Leia a documentação de deploy**
   - [AZURE_DEPLOY.md](./AZURE_DEPLOY.md) - Como fazer deploy
   - [VERSOES.md](./VERSOES.md) - Versões das dependências

3. **Configure o ambiente local**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Para Deploy

**Deploy Automatizado:**

```powershell
python scripts/deploy_production.py
```

**Rollback em Emergência:**

```powershell
python scripts/rollback.py --latest
```

---

## 📁 Estrutura de Documentação

```text
docs/
├── INDEX.md                          # Este arquivo (índice central)
├── AZURE_DEPLOY.md                   # Guia de deploy e operações
├── VERSOES.md                        # Versões de dependências
│
├── fases/                            # Documentação por fase
│   ├── fase-1/                       # OAuth 2.1 + OIDC
│   ├── fase-2/                       # Logout e Segurança
│   ├── fase-3/                       # Auditoria e Backend
│   └── fase-4/                       # Monitoramento (futuro)
│
└── pendencias/                       # Status e pendências
    └── STATUS-ATUAL.md               # Status detalhado do projeto
```

---

## 🔧 Troubleshooting Comum

### 1. Backend não responde (Timeout)

**Problema:** `https://caracore-backend.azurewebsites.net/health` não responde

**Causas:**

- `WEBSITES_PORT` não configurado
- Startup command incorreto
- Variáveis de ambiente ausentes

**Solução:**

```powershell
# 1. Configurar porta
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore --settings WEBSITES_PORT=8000

# 2. Verificar startup command
az webapp config set --name caracore-backend --resource-group rg-caracore --startup-file "gunicorn --bind=0.0.0.0:$PORT --timeout 600 app:app"

# 3. Restart
az webapp restart --name caracore-backend --resource-group rg-caracore
```

**Documentação:** [AZURE_DEPLOY.md - Troubleshooting](./AZURE_DEPLOY.md#-troubleshooting)

### 2. CORS Error no Dashboard

**Problema:** Dashboard de logs não consegue acessar `/api/admin/logs`

**Causa:** Falta handler OPTIONS para preflight CORS

**Solução:**

```python
# backend/app.py
@app.route('/api/admin/logs', methods=['OPTIONS'])
def admin_logs_options():
    response = make_response('', 204)
    response.headers['Access-Control-Allow-Origin'] = os.getenv('ORIGIN_ALLOWED', 'https://www.caracore.com.br')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response
```

**Documentação:** [AZURE_DEPLOY.md - CORS](./AZURE_DEPLOY.md#3-cors-error-no-dashboard)

### 3. Variáveis de Ambiente Perdidas

**Problema:** Backend retorna erro 500 por falta de variáveis

**Solução:**

```powershell
# Usar script automatizado para configurar todas as 25 variáveis
cd d:\dev\site\cara-core
.\scripts\configure_azure_all_settings.ps1
```

**Documentação:** [AZURE_DEPLOY.md - Variáveis](./AZURE_DEPLOY.md#-variáveis-de-ambiente-secrets)

---

## 🛠️ Scripts de Automação

### Deploy e Operações

| Script | Descrição | Uso |
|--------|-----------|-----|
| `deploy_production.py` | Deploy automatizado com verificações | `python scripts/deploy_production.py` |
| `rollback.py` | Rollback para versão anterior | `python scripts/rollback.py --latest` |
| `configure_azure_all_settings.ps1` | Configura 25 variáveis de ambiente | `.\scripts\configure_azure_all_settings.ps1` |

### Validação e Testes

| Script | Descrição | Uso |
|--------|-----------|-----|
| `backend/validar_dashboard.py` | Testes E2E da Fase 3 | `python backend/validar_dashboard.py` |
| `backend/test_admin_logs.py` | Testes de endpoints de auditoria | `pytest backend/test_admin_logs.py` |

**Documentação completa:** [scripts/README_PY.md](../scripts/README_PY.md)

---

## 🔐 Segurança

### Secrets Management

**Arquivos sensíveis (gitignored):**

- `secrets.txt` - Variáveis de ambiente
- `backend/.env` - Configuração local
- `backend/logs/*.jsonl` - Logs com dados de usuários

**Como configurar secrets:**

1. Copiar template:

   ```bash
   cp secrets.txt.template secrets.txt
   ```

2. Editar com valores reais (nunca commitar!)

3. Configurar no Azure:

   ```powershell
   .\scripts\configure_azure_all_settings.ps1
   ```

**Documentação:** [AZURE_DEPLOY.md - Segurança](./AZURE_DEPLOY.md#-segurança)

---

## 📊 Arquitetura

### Ambientes

| Ambiente | Descrição | URL |
|----------|-----------|-----|
| **Local** | Desenvolvimento e testes | `http://localhost:8000` |
| **Produção** | Azure App Service | `https://caracore-backend.azurewebsites.net` |

**Não há ambiente de staging.** Deploy é feito diretamente para produção com backups automáticos.

### Tecnologias

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| Backend | Python + Flask | 3.11 + 3.0.3 |
| WSGI Server | Gunicorn | 23.0.0 |
| Auth | Authlib (OAuth 2.1 + OIDC) | 1.3.1 |
| Cloud | Azure App Service (B1) | - |
| Frontend | Vanilla JS + CSS3 | - |

**Documentação:** [VERSOES.md](./VERSOES.md)

---

## 📈 Progresso do Projeto

| Fase | Status | Documentação |
|------|--------|--------------|
| Fase 1: OAuth 2.1 + OIDC | ✅ 100% | [fase-1/](./fases/fase-1/) |
| Fase 2: Logout e Segurança | ✅ 100% | [fase-2/](./fases/fase-2/) |
| Fase 3: Auditoria e Backend | 🟢 90% | [fase-3/](./fases/fase-3/) |
| Fase 3 CORE: Scripts e Docs | 🟢 57% | Em andamento |
| Fase 4: Monitoramento | ⚪ 0% | [fase-4/](./fases/fase-4/) |

**Status detalhado:** [pendencias/STATUS-ATUAL.md](./pendencias/STATUS-ATUAL.md)

---

## 🆘 Suporte

### Contatos

- **Desenvolvedor:** Carlos H. Mulato
- **Email:** [seu-email]
- **Repositório:** <https://github.com/chmulato/cara-core>

### Documentação Adicional

- **Azure App Service:** <https://learn.microsoft.com/azure/app-service/>
- **Flask:** <https://flask.palletsprojects.com/>
- **OAuth 2.1:** <https://oauth.net/2.1/>
- **OIDC:** <https://openid.net/connect/>

---

**Dica:** Adicione este arquivo aos favoritos do seu navegador para acesso rápido! 🔖
