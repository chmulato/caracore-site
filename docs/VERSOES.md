# Versões de Dependências - CaraCore

**Data:** 01 de novembro de 2025  
**Branch:** fase-01  
**Ambiente:** Produção (Azure App Service B1)

---

## 🐍 Python

- **Versão Local (Dev):** Python 3.13.7
- **Versão Azure (Prod):** Python 3.11.13 (Azure App Service runtime)
- **Recomendado:** Python 3.11+ (compatibilidade OAuth 2.1 / OIDC)

### Como atualizar Python local:

```powershell
# Windows - via python.org ou winget
winget install Python.Python.3.11

# Verificar versão
python --version
```

---

## 📦 Dependências Backend (requirements.txt)

### Framework Web

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **Flask** | 3.0.3 | Framework web principal |
| **Werkzeug** | 3.0.4 | WSGI toolkit (dependência do Flask) |
| **gunicorn** | 23.0.0 | WSGI HTTP server (produção) |

### OAuth 2.1 / OIDC

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **Authlib** | 1.3.1 | OAuth 2.1 / OIDC client library |
| **cryptography** | 43.0.3 | Criptografia (dependência Authlib) |
| **cffi** | 1.17.1 | C Foreign Function Interface (dep. cryptography) |

### HTTP & Networking

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **requests** | 2.32.3 | HTTP client para APIs externas |
| **urllib3** | 2.2.3 | HTTP client (dependência requests) |
| **certifi** | 2024.8.30 | Certificados SSL/TLS |
| **charset-normalizer** | 3.4.0 | Detecção de charset (dep. requests) |
| **idna** | 3.10 | Internacionalização de domínios |

### Desenvolvimento

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **python-dotenv** | 1.0.1 | Carregar variáveis .env (dev only) |

---

## 🌐 Frontend

### JavaScript (Vanilla)

- **html2pdf.js** | 0.10.1 | Geração de PDFs do dashboard
- **ES6+** | Nativo | JavaScript moderno (async/await, modules)

### CSS

- **CSS3** | Nativo | Estilos modernos (Grid, Flexbox, Variables)

---

## ☁️ Azure

### Serviços

| Serviço | SKU/Versão | Propósito |
|---------|------------|-----------|
| **Azure App Service** | B1 (Basic) | Hospedagem backend Python |
| **Azure CLI** | 2.65+ | Gerenciamento via CLI |
| **GitHub Pages** | - | Hospedagem frontend estático |

### Runtime

- **App Service Stack:** Python 3.11
- **Startup Command:** `gunicorn --bind=0.0.0.0:$PORT --timeout 600 app:app`
- **WEBSITES_PORT:** 8000 (obrigatório para B1)

---

## 🔧 Ferramentas de Desenvolvimento

### Git & GitHub

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **Git** | 2.47+ | Controle de versão |
| **GitHub CLI (gh)** | 2.82.1 | Automação GitHub |

### PowerShell

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **PowerShell** | 5.1+ / 7+ | Scripts de automação |
| **Azure CLI** | 2.65+ | Deploy e config Azure |

---

## 📝 Como Atualizar Dependências

### Backend (Python)

```powershell
# 1. Atualizar requirements.txt manualmente
# Editar: backend/requirements.txt

# 2. Reinstalar dependências
cd backend
pip install -r requirements.txt --upgrade

# 3. Testar localmente
python app.py

# 4. Verificar versões instaladas
pip list --format=freeze

# 5. Commit e deploy
git add requirements.txt
git commit -m "chore: Atualizar dependências Python"
git push origin fase-01
```

### Azure Runtime

```powershell
# Verificar runtimes disponíveis
az webapp list-runtimes --os linux

# Atualizar runtime no Azure
az webapp config set \
  --name caracore-backend \
  --resource-group rg-caracore \
  --linux-fx-version "PYTHON|3.11"
```

---

## ⚠️ Avisos de Segurança

### Vulnerabilidades Conhecidas (CVEs)

**Status:** ✅ Todas as dependências atualizadas e sem CVEs críticos

Para verificar vulnerabilidades:

```powershell
# Instalar safety
pip install safety

# Verificar vulnerabilidades
safety check -r backend/requirements.txt
```

### Política de Atualização

1. **Atualizações de Segurança:** Imediatas (dentro de 24h)
2. **Atualizações Minor (x.Y.z):** Mensais
3. **Atualizações Major (X.y.z):** Revisar breaking changes, planejar

---

## 🔄 Histórico de Atualizações

| Data | Versão | Mudanças | Commit |
|------|--------|----------|--------|
| 01/11/2025 | Inicial | Configuração inicial do projeto | - |

---

## 📚 Referências

- **Flask:** [https://flask.palletsprojects.com/]
- **Authlib:** [https://docs.authlib.org/]
- **Gunicorn:** [https://docs.gunicorn.org/]
- **Azure App Service:** [https://learn.microsoft.com/azure/app-service/]
- **Python Security:** [https://pyup.io/]
