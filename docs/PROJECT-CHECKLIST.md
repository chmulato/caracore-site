# Checklist de Pendências do Projeto Cara Core

Este checklist resume o que ainda falta ser feito para manter o ambiente Cara Core saudável. Marque as caixas completadas durante as rotinas de manutenção ou antes de um novo deploy.

## ✅ Infraestrutura Azure

- [ ] **Resource Group / Assinatura**
  - [ ] `rg-caracore` existe na assinatura correta (`0b4b8df3-aeef-4af4-8d4f-914a6e81ec4c`).
  - [ ] Não há recursos órfãos vinculados a grupos antigos ou regiões incorretas.
- [ ] **App Service Plan**
  - [ ] `caracore-plan` está ativo, no SKU esperado (ex.: F1) e na região `brazilsouth`.
- [ ] **Web App Cara Core Backend**
  - [ ] `caracore-backend` existe e está em estado `Running`.
  - [ ] HTTPS obrigatório ativado (`https_only = true`).
  - [ ] Runtime Linux Python configurado (`PYTHON|3.11`).
- [ ] **Managed Identity**
  - [ ] Identidade gerenciada do Web App habilitada (se necessário para futuras integrações).

## ✅ Configuração de Aplicação (App Settings)

- [ ] `FLASK_ENV=production`.
- [ ] `LOG_LEVEL=INFO` (ajuste conforme necessário).
- [ ] `GOOGLE_CLIENT_ID=1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com`.
- [ ] `GOOGLE_CLIENT_SECRET=***REMOVED***` (valor direto no App Service).
- [ ] `ORIGIN_ALLOWED=https://www.caracore.com.br`.
- [ ] `OAUTH_REDIRECT_URI=https://www.caracore.com.br/secure/callback.html`.
- [ ] `APP_SECRET_KEY` configurado com valor seguro.
- [ ] Após cada mudança, o Web App foi reiniciado.

## ✅ Artefato e Deploy

- [ ] `backend.zip` atualizado com a versão mais recente do código.
- [ ] Dependências bundladas em `backend/.python_packages` (se aplicável).
- [ ] `python -m compileall backend/app.py` executado antes do pacote final (garante que não há erros de sintaxe).
- [ ] Deploy realizado via `deploy_to_azure.py` sem erros (`--bundle-backend-deps --overwrite --restart`).
- [ ] Logs de deploy revisados (`log/deploy_*.log`).
- [ ] Logs de execução revisados (`log/log_api_caracore.log`) após o deploy para garantir ausência de erros em runtime.

## ✅ Health Checks e Testes

- [ ] `python checklist_infra.py` executado com sucesso (adaptado para nova arquitetura).
- [ ] Health endpoint `https://caracore-backend.azurewebsites.net/health` responde 200 em menos de 10s.
- [ ] `python teste_end_point_azure.py --base-url https://caracore-backend.azurewebsites.net` concluído sem falhas.
- [ ] Testes locais (`python teste.py` e `python teste_end_point_local.py`) rodaram antes de subir alterações críticas.

## ✅ Documentação & Automação

- [ ] README e `docs/DEPLOY.md` revisados após mudanças significativas.
- [ ] Checklist atualizado conforme novos requisitos surgirem.
- [ ] Pipeline de CI/CD (quando criado) contempla: checklist ➜ build ➜ deploy ➜ smoke tests.
- [ ] Alertas de custo e disponibilidade configurados no Azure (Cost Management, Monitor).

---

## Notas Rápidas

- O backend usa configuração direta via App Service Settings, sem dependência de Key Vault.
- O backend usa um helper próprio (`post_form`) baseado em `urllib`; não há dependência do pacote `requests` em produção. Caso volte a usar bibliotecas externas, lembre-se de bundlar novamente em `.python_packages`.
- Para atualizar segredos manualmente:

  ```powershell
  az webapp config appsettings set `
    --name caracore-backend `
    --resource-group rg-caracore `
    --settings "GOOGLE_CLIENT_SECRET=<seu-segredo>"
  ```

- Para verificar configurações atuais:

  ```powershell
  az webapp config appsettings list `
    --name caracore-backend `
    --resource-group rg-caracore `
    --query "[?name=='GOOGLE_CLIENT_SECRET']"
  ```

- Lembre-se de reiniciar o Web App após atualizar App Settings:

  ```powershell
  az webapp restart --resource-group rg-caracore --name caracore-backend
  ```

## Histórico de Atualizações

- 2025-10-11 — Migração para nova arquitetura: `caracore-backend` substituiu `api-caracore`, Key Vault removido, configuração via App Service Settings direta.
- 2025-10-01 — Segredo `GOOGLE-CLIENT-SECRET` renovado via `infra_to_azure.py`, Web App reiniciado e checklist de infraestrutura executado com todos os itens OK.
- 2025-10-03 — Código do backend trocou `requests` por helper `urllib`, pacote recompilado, deploy completo (`--overwrite`) e smoke tests no Azure passaram (11/11).
