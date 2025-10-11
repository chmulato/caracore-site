# Arquitetura Simplificada do Deploy

Este guia descreve a proposta de arquitetura enxuta para manter o site institucional, o backend de OAuth e o processo de publicação com o mínimo de esforço. A explicação usa linguagem direta para facilitar a comunicação com quem não é técnico.

## 1. Visão geral

- **Site estático (HTML/CSS/JS)**: conteúdos públicos e páginas institucionais. Pode ficar hospedado em serviços de arquivos estáticos como GitHub Pages, Azure Static Web Apps ou até um bucket simples de armazenamento. Não guarda segredos.
- **Backend Python (`server.py`)**: pequena API que conversa com o Google para trocar o "código de autorização" pelo "token". É a única parte que precisa guardar segredos (client secret do Google). Fica no Azure App Service Linux.
- **Autenticação**: o usuário clica em "Entrar com Google" (ou Microsoft). O front-end recebe um código temporário e envia para o backend. O backend fala com o Google, devolve o token e pronto.

Essa separação garante que o deploy do site estático seja rápido e barato, enquanto o backend fica em um serviço separado com mais segurança.

## 2. Componentes principais

| Peça | Hospedagem sugerida | Motivação |
|------|---------------------|-----------|
| Site público (`index.html`, `js/`, `images/`, etc.) | GitHub Pages ou Azure Static Web Apps | Hospedagem gratuita/baixa, CDN automática, HTTPS pronto |
| Backend `/oauth/google/token` (`server.py`, `config.py`, `requirements.txt`) | Azure App Service (Linux, Python 3.11) | Suporta segredos, escalável, integra com Azure Monitor |
| Segredos do Google (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`) | App Settings do Azure App Service | Ficam protegidos do lado do servidor |
| Deploy automações | GitHub Actions | Um fluxo diferente para o front (estático) e outro para o backend |

> Em produção, `js/config.js` detecta o ambiente e aponta o fluxo de troca de token para `https://caracore-backend.azurewebsites.net`. Em homologação/local, o mesmo script usa o backend local (`server.py`). O comportamento pode ser sobrescrito configurando `window.CARA_CORE_CONFIG_OVERRIDE` antes de carregar os scripts OIDC.

> O arquivo `secure/auth-standalone.js` armazena o provedor de login escolhido (Google/Entra) entre redirecionamentos para garantir que o callback utilize a mesma authority. Se alternar provedores no mesmo navegador, use o botão apropriado da UI ou limpe `sessionStorage`/`localStorage`.

## 3. Fluxo de autenticação

1. O visitante acessa o site estático.
2. Ao clicar em "Entrar", o navegador abre o login do provedor (Google ou Microsoft).
3. Depois do login, o provedor devolve um código temporário ao navegador.
4. O navegador envia esse código para o backend `server.py` hospedado no Azure.
5. O backend troca o código por um token real com o Google e devolve ao navegador apenas as informações mínimas do usuário.

## 4. Fluxo de deploy

### 4.1 Site estático

- Continuar versionando os arquivos na branch principal.
- Configurar publicação automática para um host estático compatível com repositório privado (ex.: Azure Static Web Apps, Azure Storage Static Website ou GitHub Pages em conta paga).
- Qualquer alteração em HTML/CSS/JS sobe em minutos, sem tocar no backend.

### 4.2 Backend Python

- O script `deploy_to_azure.py` empacota somente o backend (já configurado para isso).
- O workflow do GitHub Actions permanece manual ou só é acionado quando há mudanças na pasta raiz/backend.
- Os segredos do Google ficam no App Service; não entram no pacote nem no repositório.

## 5. Benefícios

- **Menos risco**: os segredos ficam isolados no backend protegido.
- **Deploy mais rápido**: alterações visuais vão direto para o host estático; só mexemos no App Service quando o backend muda.
- **Custos menores**: site público pode usar planos gratuitos, e o App Service pode ficar em tier básico.
- **Escalabilidade simples**: se o tráfego crescer, basta aumentar plano do App Service ou colocar CDN no estático.

## 6. Passo a passo recomendado

1. **Hospedar o site estático**
   - Criar um Azure Static Web App (ou Azure Storage Static Website, se preferir algo ainda mais simples).
   - Conectar o serviço ao repositório privado via GitHub App ou usar um workflow que faça upload dos arquivos estáticos.
   - Configurar domínio customizado e HTTPS se necessário.
2. **Publicar o backend no App Service**
   - Rodar `python deploy_to_azure.py` com `az login` ou credenciais de Service Principal.
   - Definir `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` e demais variáveis no App Service.
   - Validar o endpoint `https://<app-name>.azurewebsites.net/oauth/google/token` com um login de teste.
3. **Ajustar o front-end**
   - Atualizar `js/config.js` (ou equivalente) para apontar para o App Service.
   - Revisar as Redirect URIs no Google/Microsoft para refletir o domínio público.
4. **Automatizar deploys**
   - Configurar um workflow do GitHub Actions para o site estático (gatilho em `main`).
   - Manter o workflow manual do backend chamando `deploy_to_azure.py`, com approvals se desejar.
5. **Manter segredos e monitoramento**
   - Atualizar segredos diretamente no App Service ou integrar com Azure Key Vault.
   - Habilitar logs e alertas (Azure Monitor) para acompanhar erros e performance.

## 7. Próximos passos sugeridos

1. Escolher o host definitivo do site estático.
2. Ajustar links do site para apontar para o backend publicado no Azure.
3. Configurar os workflows do GitHub Actions separados (front e backend).
4. Documentar como atualizar os segredos no App Service sem refazer o deploy.

Com essa arquitetura, o dia a dia de manutenção fica mais simples: edições de conteúdo vão para o host estático, e alterações na lógica de autenticação usam o script de deploy minimalista para o backend.
