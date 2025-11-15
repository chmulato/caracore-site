# Autenticacao OIDC &ndash; Cara Core

Este documento descreve a implementacao do fluxo OpenID Connect (OIDC) utilizado na area segura do site **caracore.com.br**. O ambiente suporta login com **Google Identity** e **Microsoft Entra ID** utilizando o fluxo Authorization Code com PKCE, apropriado para aplicacoes estaticas.

## Estrutura da pasta /secure

```text
secure/
├── index.html        # Tela de consentimento e escolha do provedor
├── restrita.html     # Conteudo protegido; exige sessao valida
├── logout.html       # Mensagem de encerramento e limpeza local
├── callback.html     # Processamento de callback OAuth
├── js/
│   ├── auth.js       # Modulo central de autenticacao (window.CaraCoreOIDC)
│   ├── token-manager.js  # Gerenciamento de sessões e refresh tokens (Fase 7)
│   └── [outros arquivos JS]
├── config/
│   ├── google.json   # Parametros do Google Identity
│   └── entra.json    # Parametros do Microsoft Entra ID
└── css/
    └── [arquivos de estilo]
```

Arquivos auxiliares antigos permanecem na pasta para referencia historica, mas o fluxo oficial considera apenas os itens listados acima.

## Fluxo de autenticacao

1. O usuario acessa [https://www.caracore.com.br/secure/index.html].
2. O script auth.js inicializa o UserManager da biblioteca oidc-client-ts, armazenada localmente em js/vendor/oidc-client-ts.js.
3. Ao clicar em **Autorizar com Google** ou **Autorizar com Microsoft**, a pagina chama CaraCoreOIDC.login(provider) e redireciona para o provedor selecionado.
4. Depois do consentimento, o provedor devolve o usuario para index.html com os parametros code e state.
5. CaraCoreOIDC.handleSigninCallback() troca o code pelo token utilizando o fluxo Authorization Code com PKCE (o oidc-client-ts gera e valida o code_verifier nos bastidores).
6. O perfil e o access token sao armazenados em sessionStorage; a pessoa e enviada para restrita.html.
7. restrita.html executa CaraCoreOIDC.requireAuth() e so libera o conteudo se o token estiver valido.
8. logout.html remove tokens locais (logoutLocal) e apresenta a confirmacao. Caso o signoutRedirect tenha sido concluido, o provedor redireciona para essa mesma pagina.

### Fluxo com Refresh Tokens (Fase 7)

A partir da Fase 7, o sistema implementa renovacao automatica de tokens:

1. Apos login bem-sucedido, o backend cria uma sessao e retorna um `session_id`.
2. O `token-manager.js` armazena o `session_id` e gerencia a renovacao automatica.
3. Antes do access token expirar (5 minutos antes), o TokenManager renova automaticamente.
4. O refresh token e armazenado de forma criptografada no backend.
5. Em caso de falha na renovacao, o usuario e redirecionado para login.

## Configuracao dos provedores

### Google Identity Platform (secure/config/google.json)

```json
{
  "authority": "https://accounts.google.com",
  "client_id": "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
  "redirect_uri": "https://www.caracore.com.br/secure/index.html",
  "post_logout_redirect_uri": "https://www.caracore.com.br/secure/logout.html",
  "response_type": "code",
  "scope": "openid profile email",
  "automaticSilentRenew": true,
  "loadUserInfo": true
}
```

No Google Cloud Console:

1. Acesse **APIs & Services &gt; Credentials**.
2. Crie um **OAuth 2.0 Client ID** do tipo *Web application*.
3. Preencha as URIs de redirecionamento com:
   - [https://www.caracore.com.br/secure/index.html]
4. Publique o dominio em **OAuth consent screen** e aprove os escopos openid, profile, email.

### Microsoft Entra ID (secure/config/entra.json)

```json
{
  "authority": "https://login.microsoftonline.com/189c46ad-e437-48bd-bc87-050ef735c2c7/v2.0",
  "client_id": "8ef17663-438f-4777-99ca-c5ad5b2a2993",
  "redirect_uri": "https://www.caracore.com.br/secure/index.html",
  "post_logout_redirect_uri": "https://www.caracore.com.br/secure/logout.html",
  "response_type": "code",
  "scope": "openid profile email",
  "automaticSilentRenew": true,
  "loadUserInfo": true
}
```

No portal Azure:

1. Registre um novo aplicativo em **Azure Active Directory &gt; App registrations**.
2. Informe [https://www.caracore.com.br/secure/index.html] como **Redirect URI** (tipo *Single-page application*).
3. Permita contas organizacionais e, se necessario, contas pessoais conforme o publico desejado.
4. Em **Token configuration**, inclua email e profile se ainda nao estiverem presentes.
5. Em **Authentication**, defina a URL de logout [https://www.caracore.com.br/secure/logout.html] (Front-channel ou Post logout redirect URI).

## Protecao de segredos

- Os valores client_secret **nao podem** aparecer no frontend. Guarde-os como *secrets* no GitHub e injete-os apenas em fluxos automatizados (por exemplo, GitHub Actions) ou no backend.
- O deploy estatico deve consumir apenas client_id, authority, redirect_uri e scope.
- Atualize os arquivos JSON em tempo de build se precisar alternar entre ambiente de teste e producao.

## ATUALIZAÇÃO 15/11/2025 — Fase 7: Sistema de Refresh Tokens

Em 15/11/2025 foi iniciada a implementacao da Fase 7, que adiciona renovacao automatica de tokens:

### Novidades da Fase 7

- **Token Manager JavaScript**: `secure/js/token-manager.js` gerencia sessoes e renovacao automatica
- **Endpoints REST**: Novos endpoints para criacao, renovacao e revogacao de sessoes
- **Armazenamento Seguro**: Refresh tokens criptografados no backend (AES-256-CBC)
- **Renovacao Automatica**: Tokens renovados 5 minutos antes de expirar
- **Auditoria**: Logs completos de operacoes de sessao

### Configuracao Necessaria

Para habilitar a Fase 7, configure as seguintes variaveis de ambiente no Azure App Service:

- `TOKEN_ENCRYPTION_KEY` (obrigatorio) - Chave de criptografia AES-256
- `SESSION_TIMEOUT_HOURS` (opcional, default: 24)
- `MAX_SESSIONS_PER_USER` (opcional, default: 5)
- `CLEANUP_INTERVAL_HOURS` (opcional, default: 6)
- `AUDIT_LOG_RETENTION_DAYS` (opcional, default: 90)

**Script de configuracao:** `python scripts/configure_fase7_azure.py`

**Documentacao completa:** `docs/fases/fase-7/README.md`

### ATUALIZAÇÃO 01/11/2025 — Correções e recomendações importantes

Em 01/11/2025 aplicamos correções críticas em produção e atualizamos o processo de configuração no repositório. Resumo das mudanças relevantes para a `Área 51`:

- CORS: Corrigido problema de *preflight* (OPTIONS) no backend. Se o dashboard de auditoria não carregar, verifique se o endpoint `/api/admin/logs` tem handler OPTIONS e devolve 204.
- Azure App Service: Obrigatório configurar `WEBSITES_PORT=8000` e usar `--bind=0.0.0.0:$PORT` no startup command do Gunicorn. Sem isso o Azure pode não rotear requisições para o processo WSGI.
- Script de automação: `scripts/configure_azure_all_settings.ps1` foi criado para injetar todas as variáveis de ambiente no App Service a partir de um arquivo local `secrets.txt` (que deve ser gitignored).
- Template de secrets: `secrets.txt.template` introduzido no repositório com todas as chaves/variáveis necessárias (use-o como referência, não contenha valores reais).

Passos rápidos de verificação (úteis para o time):

1. Testar preflight CORS (deve retornar 204):

```powershell
curl -X OPTIONS https://caracore-backend-docker.azurewebsites.net/api/admin/logs -I
```

2. Verificar `WEBSITES_PORT` no App Settings:

```powershell
az webapp config appsettings list --name caracore-backend --resource-group rg-caracore --query "[?name=='WEBSITES_PORT']"
```

3. Confirmar startup command usa `$PORT` dinâmico:

```powershell
az webapp config set --name caracore-backend --resource-group rg-caracore --startup-file "gunicorn --bind=0.0.0.0:`$PORT --timeout 600 app:app"
```

4. Usar o script de configuração (local):

```powershell
# Preencha secrets.txt com as variáveis (use secrets.txt.template como referência)
.\scripts\configure_azure_all_settings.ps1
```

Recomendações de segurança rápidas:

- Nunca commitar `secrets.txt` (o repositório já contém `secrets.txt.template`).
- Se algum secret for comprometido, rotacione-o imediatamente no provedor e atualize as App Settings do Azure.
- Registre cada rotação em changelog interno e atualize `docs/pendencias/STATUS-ATUAL.md` com a data da rotação.

## Desenvolvimento local

Para testar em [http://localhost], crie variantes dos arquivos de configuracao (ex.: google.local.json) com URIs de redirecionamento locais e sirva o site via HTTPS (o PKCE requer contexto seguro). Em seguida, troque o caminho no script ou utilize um mecanismo de build que copie o arquivo correto para config/google.json antes do deploy.

## Metodos expostos por window.CaraCoreOIDC

- init(provider?): carrega o provedor (default: ultimo utilizado ou google).
- login(provider): inicia o fluxo Authorization Code com PKCE.
- handleSigninCallback(provider?): processa o retorno do provedor.
- getUser(provider?): retorna o usuario atual ou url se expirado.
- isAuthenticated(provider?): indica se ha sessao valida.
- equireAuth(options): valida a sessao; redireciona para index.html se necessario.
- logout(provider?): executa o sign-out remoto e limpa o cache local.
- logoutLocal(provider?): remove apenas os dados locais.
- getCurrentProvider(): devolve o provedor atualmente persistido.
- getCachedProfile(): resumo do perfil armazenado em sessionStorage.

Esses metodos podem ser reutilizados em paginas adicionais dentro de /secure/.

## Token Manager (Fase 7)

O `token-manager.js` gerencia sessoes e renovacao automatica de tokens:

### Funcionalidades

- Armazenamento seguro de `session_id` no localStorage
- Renovacao automatica de access tokens (5 minutos antes de expirar)
- Monitoramento de expiração de tokens
- Integracao com sistema OAuth existente
- Revogacao de sessao no logout

### Metodos Principais

- `initSession(sessionData)`: Inicializa sessao apos login
- `refreshToken()`: Renova access token automaticamente
- `getAccessToken()`: Retorna access token atual
- `logout()`: Revoga sessao e limpa dados locais
- `scheduleRefresh()`: Agenda proxima renovacao

### Integracao

O TokenManager e automaticamente inicializado apos login bem-sucedido. Ele monitora a expiracao dos tokens e renova automaticamente, melhorando a experiencia do usuario ao evitar reautenticacoes frequentes.

**Documentacao completa:** `docs/fases/fase-7/README.md`

## Checklist ao publicar

- [ ] Confirmar que redirect_uri e post_logout_redirect_uri estao aprovados nos provedores.
- [ ] Publicar os arquivos google.json e entra.json com client_id corretos para producao.
- [ ] Garantir HTTPS em [www.caracore.com.br] (requisito do PKCE).
- [ ] Validar o fluxo completo (login, acesso restrito, logout) para cada provedor em ambiente real.
- [ ] Auditar os logs de erro do provedor para identificar tentativas de login nao autorizadas.
- [ ] Configurar variaveis de ambiente da Fase 7 no Azure App Service (se aplicavel).
- [ ] Validar renovacao automatica de tokens em producao.

---

**Ultima Atualizacao:** 15/11/2025  
**Documentacao Fase 7:** `docs/fases/fase-7/README.md`