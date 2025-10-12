# Sistema de Autenticação OIDC - Guia para Desenvolvedores

Este guia contém informações importantes para desenvolvedores que trabalham no sistema de autenticação OIDC do projeto Cara Core.

## Estrutura de Arquivos

### Arquivos Principais

- **`/secure/index.html`** - Página principal com interface de autenticação
- **`/secure/css/styles.css`** - Estilos específicos para a área segura
- **`/secure/js/main.js`** - Lógica principal de autenticação
- **`/secure/js/nav.js`** - Controle de navegação responsiva
- **`/secure/origin-fix.js`** - Correção para protocolo file://
- **`/secure/auth-standalone.js`** - Funções auxiliares para autenticação
- **`/secure/dynamic-config.js`** - Configurações dinâmicas para provedores OIDC
- **`/secure/logger.js`** - Sistema de log para debugging

### Bibliotecas Externas

- **`oidc-client-ts`** (v2.2.5) - Carregada via CDN para manipulação do fluxo OIDC

## Fluxo de Autenticação

1. **Inicialização:**
   - `index.html` carrega recursos necessários
   - `origin-fix.js` define o origin correto quando necessário
   - `main.js` inicializa listeners para botões de login

2. **Processo de Login:**
   - Usuário clica em botão de provedor (Google/Microsoft)
   - `main.js` inicia o fluxo de autenticação com o provedor escolhido
   - Redirecionamento para página de login do provedor
   - Após autenticação, redirecionamento para callback configurado
   - Validação do token e extração de informações do usuário
   - Exibição do estado autenticado

3. **Logout:**
   - Usuário clica em logout
   - Limpeza de tokens e estado
   - Redirecionamento para página inicial

## Como Trabalhar com o Código

### Ambiente de Desenvolvimento

1. **Setup Inicial:**

   ```bash
   # Clone o repositório
   git clone https://github.com/usuario/site-cara-core.git
   cd site-cara-core
   
   # Se necessário, instale dependências
   npm install
   ```

2. **Servidor Local:**

   ```bash
   # Inicie o servidor Python
   python server.py
   # Acesse http://localhost:8000
   ```

### Modificando o Código

1. **Estilos:**
   - Modifique `/secure/css/styles.css` para alterações de aparência
   - Mantenha a compatibilidade com navegadores mais antigos

2. **JavaScript:**
   - Lógica de autenticação: `/secure/js/main.js`
   - Navegação: `/secure/js/nav.js`
   - Evite modificar `/secure/auth-standalone.js` diretamente

3. **Configurações:**
   - Ajuste de provedores: `/secure/dynamic-config.js`
   - Configure URIs de redirecionamento adequadamente

### Testes

1. **Teste de Login:**

   ```bash
   python scripts/test_oidc_login.py --headless
   ```

2. **Verificação de URIs:**
   - Use a ferramenta de diagnóstico embutida:

   ```bash
   python scripts/diagnose-redirect-uri.py
   ```

3. **Teste Manual:**
   - Teste em diversos navegadores
   - Verifique modo privado/anônimo
   - Teste em dispositivos móveis

## Troubleshooting

### Problemas Comuns

1. **Botões de Login Não Funcionam:**
   - Verifique console do navegador para erros
   - Certifique-se que `origin-fix.js` está carregado antes de `main.js`
   - Verifique se o CSS não está bloqueando cliques (pointer-events)

2. **Erro de Redirecionamento:**
   - Verifique se as URIs estão configuradas no console do provedor
   - Certifique-se que `dynamic-config.js` tem as URIs corretas
   - Verifique se o protocolo (http/https/file) está sendo tratado corretamente

3. **Tokens Inválidos:**
   - Verifique a data/hora do sistema
   - Confira se a validação está considerando `iss`, `aud`, `exp`
   - Verifique logs para detalhes do erro

### Ferramentas de Diagnóstico

- Use o console do navegador para ver logs detalhados
- Ative o modo debug em `logger.js`
- Use a página admin de logs para visualizar histórico

## Documentação Adicional

- [PENDENCIAS.md](/docs/pendencias/PENDENCIAS.md) - Lista de tarefas pendentes
- [CHECKLIST-SEGURANCA-OIDC.md](/docs/pendencias/CHECKLIST-SEGURANCA-OIDC.md) - Checklist de segurança
- [CORRECOES-AUTENTICACAO.md](/docs/pendencias/CORRECOES-AUTENTICACAO.md) - Histórico de correções
- [STATUS-ATUAL.md](/docs/STATUS-ATUAL.md) - Status atual da implementação
- [PROXIMOS-PASSOS.md](/docs/PROXIMOS-PASSOS.md) - Próximas etapas recomendadas
