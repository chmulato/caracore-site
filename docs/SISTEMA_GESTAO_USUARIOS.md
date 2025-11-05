# Sistema de Gestão de Usuários - CaraCore

Este documento descreve o sistema completo de gestão de usuários implementado no CaraCore, incluindo as novas telas HTML criadas e a centralização dos recursos CSS e JavaScript.

## Estrutura de Arquivos

### Telas HTML

- **`super-admin-setup.html`** - Configuração inicial do Super Administrador
- **`request-access-enhanced.html`** - Solicitação de acesso aprimorada 
- **`approval-requests.html`** - Aprovação de solicitações (Admins)
- **`admin-users.html`** - Gerenciamento de usuários (existente, aprimorado)

### Arquivos CSS Centralizados

- **`super-admin-setup.css`** - Estilos para configuração inicial
- **`request-access-enhanced.css`** - Estilos para solicitação de acesso
- **`approval-requests.css`** - Estilos para aprovação de solicitações

### Arquivos JavaScript Centralizados

- **`super-admin-setup.js`** - Lógica de configuração inicial
- **`request-access-enhanced.js`** - Lógica de solicitação de acesso
- **`approval-manager.js`** - Gerenciamento de aprovações
- **`user-management-navigation.js`** - Sistema de navegação integrado

## Funcionalidades Implementadas

### 1. Configuração Inicial do Super Administrador

**Arquivo:** `super-admin-setup.html`

- **Propósito:** Primeira configuração do sistema com criação do Super Admin
- **Acesso:** Apenas quando não há Super Admin configurado
- **Funcionalidades:**
 - Verificação automática de status do Super Admin
 - Autenticação via Google ou Microsoft
 - Configuração automática de permissões
 - Redirecionamento para painel administrativo

### 2. Solicitação de Acesso Aprimorada

**Arquivo:** `request-access-enhanced.html`

- **Propósito:** Interface moderna para solicitação de acesso ao sistema
- **Acesso:** Usuários autenticados sem permissões
- **Funcionalidades:**
 - Formulário detalhado com validação
 - Seleção de nível de acesso (Visualizador, Editor, Administrador)
 - Informações de departamento e supervisor
 - Sistema de urgência da solicitação
 - Justificativa obrigatória
 - Notificação de status da solicitação

### 3. Aprovação de Solicitações

**Arquivo:** `approval-requests.html`

- **Propósito:** Painel administrativo para gestão de solicitações
- **Acesso:** Administradores e Super Administradores
- **Funcionalidades:**
 - Dashboard com estatísticas em tempo real
 - Sistema de filtros avançados (status, urgência, nível, busca)
 - Visualização detalhada de solicitações
 - Aprovação/rejeição com motivo
 - Interface responsiva com cards informativos
 - Modais para detalhes e confirmações

### 4. Sistema de Navegação Integrado

**Arquivo:** `user-management-navigation.js`

- **Propósito:** Navegação contextual baseada em permissões
- **Funcionalidades:**
 - Menu dinâmico baseado no papel do usuário
 - Badge de notificação para solicitações pendentes
 - Indicação de página ativa
 - Atualização automática de contadores
 - Design responsivo

## Estrutura de Permissões

### Super Administrador

- Acesso completo a todas as funcionalidades
- Configuração inicial do sistema
- Gerenciamento de outros administradores
- Aprovação de solicitações críticas

### Administrador

- Gerenciamento de usuários do seu nível
- Aprovação de solicitações padrão
- Visualização de relatórios administrativos

### Editor

- Acesso de edição a conteúdos
- Solicitação de permissões adicionais

### Visualizador

- Acesso apenas de leitura
- Solicitação de permissões superiores

## Integração com Sistema Existente

### Configuração de Autenticação

O sistema de gestão de usuários integra-se com as configurações OAuth através dos arquivos JSON em `/secure/config/`:

#### Fluxo de Autenticação no Sistema de Gestão

1. **Super Admin Setup** (`super-admin-setup.html`):
 - Carrega configurações do `google.json` ou `entra.json`
 - Utiliza as `redirect_uri` configuradas para callback
 - Valida tokens usando os endpoints de `jwks_uri`

2. **Solicitação de Acesso** (`request-access-enhanced.html`):
 - Verifica autenticação usando `userinfo_endpoint`
 - Obtém dados do usuário (nome, email, avatar) via scope `profile email`
 - Utiliza `client_id` para validação de origem

3. **Aprovação de Solicitações** (`approval-requests.html`):
 - Requer autenticação de nível admin via claims JWT
 - Utiliza `authority` para validação de tokens
 - Implementa logout via `post_logout_redirect_uri`

#### Personalização por Ambiente

**Arquivo de configuração para cada ambiente:**

```javascript
// Desenvolvimento Local
{
 "redirect_uri": "http://localhost:8000/secure/callback.html",
 "post_logout_redirect_uri": "http://localhost:8000/secure/logout.html"
}

// Produção
{
 "redirect_uri": "https://seu-dominio.com/secure/callback.html", 
 "post_logout_redirect_uri": "https://seu-dominio.com/secure/logout.html"
}
```

#### Validação de Configuração

O sistema inclui validação automática das configurações JSON:

```javascript
// Verificação de configuração obrigatória
function validateConfig(config) {
 const required = ['client_id', 'redirect_uri', 'authority'];
 return required.every(field => config[field]);
}

// Carregamento com fallback
async function loadOAuthConfig(provider) {
 try {
 const response = await fetch(`/secure/config/${provider}.json`);
 const config = await response.json();
 
 if (!validateConfig(config)) {
 throw new Error(`Configuração ${provider} inválida`);
 }
 
 return config;
 } catch (error) {
 console.error(`Erro ao carregar configuração ${provider}:`, error);
 throw error;
 }
}
```

### Mapeamento de Funcionalidades por JSON

#### Google OAuth (`google.json`)
- **Escopo Principal**: `openid profile email`
- **Uso no Sistema**: 
 - Autenticação básica de usuários
 - Obtenção de foto de perfil via Google Photos API
 - Verificação de email verificado (`email_verified`)
 - Claims: `sub`, `name`, `email`, `picture`

#### Microsoft Entra ID (`entra.json`) 
- **Escopo Principal**: `openid profile email User.Read`
- **Uso no Sistema**:
 - Autenticação corporativa/organizacional
 - Integração com Microsoft Graph
 - Verificação de grupos/roles organizacionais
 - Claims: `oid`, `preferred_username`, `name`, `email`

#### Configuração Dinâmica por Tela

**Super Admin Setup** utiliza configuração específica:
```javascript
// Configuração para setup inicial
const setupConfig = {
 ...baseConfig,
 scope: 'openid profile email User.ReadWrite.All', // Permissões admin
 prompt: 'admin_consent' // Consentimento administrativo
};
```

**Request Access** utiliza configuração padrão:
```javascript
// Configuração para usuários normais
const userConfig = {
 ...baseConfig,
 scope: 'openid profile email',
 prompt: 'select_account' // Seleção de conta
};
```

### Gerenciamento de Estado de Configuração

O sistema mantém estado das configurações ativas:

```javascript
class ConfigManager {
 constructor() {
 this.activeConfig = null;
 this.provider = null;
 }
 
 async initialize(provider) {
 this.activeConfig = await loadOAuthConfig(provider);
 this.provider = provider;
 localStorage.setItem('oauth_provider', provider);
 return this.activeConfig;
 }
 
 getRedirectUri() {
 return this.activeConfig?.redirect_uri;
 }
 
 getClientId() {
 return this.activeConfig?.client_id;
 }
 
 // Troca dinâmica de provider
 async switchProvider(newProvider) {
 await this.initialize(newProvider);
 window.location.reload(); // Recarrega para aplicar nova config
 }
}
```

```javascript
// Verificação de status do Super Admin
GET /api/admin/super-admin-status

// Informações do usuário atual
GET /api/user/info

// Envio de solicitação de acesso
POST /api/access-request

// Listagem de solicitações (Admins)
GET /api/admin/access-requests

// Contagem de solicitações pendentes
GET /api/admin/access-requests/count

// Aprovação de solicitação
POST /api/admin/access-requests/{id}/approve

// Rejeição de solicitação
POST /api/admin/access-requests/{id}/reject
```

### Autenticação

- OAuth 2.1 + OIDC com Google e Microsoft
- JWT tokens para autorização
- Sistema de roles baseado em claims
- Redirecionamento contextual pós-autenticação

#### Configurações OAuth (secure/config/)

O sistema utiliza arquivos JSON para configurar os provedores de autenticação:

**`secure/config/google.json`** - Configuração Google OAuth
```json
{
 "authority": "https://accounts.google.com",
 "client_id": "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
 "redirect_uri": "http://localhost:8000/secure/callback.html",
 "response_type": "code",
 "scope": "openid profile email",
 "post_logout_redirect_uri": "http://localhost:8000/secure/logout.html",
 "metadata": {
 "issuer": "https://accounts.google.com",
 "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
 "token_endpoint": "https://oauth2.googleapis.com/token",
 "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
 "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs"
 }
}
```

**`secure/config/entra.json`** - Configuração Microsoft Entra ID
```json
{
 "authority": "https://login.microsoftonline.com/consumers/v2.0",
 "client_id": "8ef17663-438f-4777-99ca-c5ad5b2a2993",
 "redirect_uri": "http://localhost:8000/secure/callback.html",
 "response_type": "code",
 "scope": "openid profile email",
 "post_logout_redirect_uri": "http://localhost:8000/secure/logout.html",
 "metadata": {
 "issuer": "https://login.microsoftonline.com/consumers/v2.0",
 "authorization_endpoint": "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
 "token_endpoint": "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
 "userinfo_endpoint": "https://graph.microsoft.com/oidc/userinfo",
 "jwks_uri": "https://login.microsoftonline.com/consumers/discovery/v2.0/keys"
 }
}
```

#### Carregamento Dinâmico de Configurações

O sistema carrega dinamicamente as configurações OAuth através do arquivo `auth.js`:

```javascript
const CONFIG_PATH = {
 google: "/secure/config/google.json",
 entra: "/secure/config/entra.json"
};

// Carregamento automático baseado no provedor escolhido
const configResponse = await fetch(`/secure/config/${provider}.json`);
const config = await configResponse.json();
```

#### Ambiente de Desenvolvimento vs Produção

- **Desenvolvimento:** URLs `localhost:8000` para redirect_uri
- **Produção:** URLs devem ser atualizadas para domínio real
- **Segurança:** PKCE obrigatório, requer contexto HTTPS em produção

## Fluxo de Trabalho

### 1. Configuração Inicial

1. Primeiro acesso ao sistema → `super-admin-setup.html`
2. Usuário se autentica via OAuth
3. Sistema configura automaticamente como Super Admin
4. Redirecionamento para painel administrativo

### 2. Solicitação de Acesso

1. Usuário autenticado sem permissões → `request-access-enhanced.html`
2. Preenchimento do formulário detalhado
3. Envio da solicitação via API
4. Notificação de confirmação

### 3. Processo de Aprovação

1. Admin acessa `approval-requests.html`
2. Visualiza dashboard com estatísticas
3. Filtra e analisa solicitações
4. Aprova/rejeita com justificativa
5. Usuário recebe notificação automática

## Melhorias Implementadas

### Organização de Código

- **CSS centralizado:** Todos os estilos movidos para `/secure/css/`
- **JavaScript modular:** Lógica separada em `/secure/js/`
- **Remoção de estilos inline:** Cumprimento de boas práticas
- **Classes semânticas:** Nomenclatura consistente e significativa

### Acessibilidade

- Labels associados a elementos de formulário
- Títulos descritivos em elementos select
- Estrutura semântica apropriada
- Contraste adequado de cores

### Responsividade

- Design mobile-first
- Grid layouts flexíveis
- Componentes adaptativos
- Navegação otimizada para dispositivos móveis

### Segurança

- Validação client-side e server-side
- Sanitização de inputs
- Autorização baseada em roles
- Tokens JWT com expiração

## Manutenção e Extensibilidade

### Adição de Novas Funcionalidades

1. Criar novos arquivos CSS/JS na estrutura centralizada
2. Implementar APIs necessárias no backend
3. Atualizar sistema de navegação com novos itens
4. Adicionar documentação apropriada

### Monitoramento

- Logs de auditoria para ações administrativas
- Métricas de uso das funcionalidades
- Alertas para solicitações urgentes
- Relatórios de atividade administrativa

Este sistema fornece uma base sólida e extensível para gestão completa de usuários no CaraCore, mantendo altos padrões de segurança, usabilidade e organização de código.