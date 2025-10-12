# Sistema de Tratamento de Erros e Timeouts - Cara Core Authentication

## Visão Geral

Este documento descreve o sistema de tratamento de erros e timeouts implementado para o fluxo de autenticação OIDC da Cara Core. O sistema é projetado para lidar com diversos cenários de falha que podem ocorrer durante o processo de autenticação, melhorando a experiência do usuário e fornecendo mecanismos de recuperação automática.

## Componentes

O sistema é composto por três componentes principais:

1. **Error Handler (error-handler.js)**
   - Gerencia erros e timeouts
   - Categoriza erros para tratamento apropriado
   - Implementa mecanismos de recuperação automática
   - Fornece mensagens amigáveis para o usuário

2. **UI Feedback (ui-feedback.js)**
   - Gerencia estados visuais da interface
   - Atualiza elementos da UI com base no estado da autenticação
   - Fornece feedback visual durante o processo
   - Exibe mensagens de erro e sucesso

3. **Auth States CSS (auth-states.css)**
   - Define estilos para diferentes estados de autenticação
   - Fornece efeitos visuais para feedback do usuário
   - Gerencia transições entre estados

## Estados de Autenticação

O sistema define os seguintes estados de autenticação:

- **idle**: Estado inicial, aguardando ação do usuário
- **loading**: Carregando componentes e verificando autenticação
- **authenticating**: Processando autenticação após clique em um botão de provedor
- **redirecting**: Redirecionando para o provedor de identidade
- **success**: Autenticação bem-sucedida
- **error**: Erro durante o processo de autenticação
- **timeout**: Timeout durante o processo de autenticação

## Mecanismo de Timeouts

O sistema implementa dois tipos principais de timeouts:

1. **Timeout de Redirecionamento**:  
   - Detecta quando o redirecionamento para o provedor não ocorre em tempo hábil
   - Configurável (padrão: 30 segundos)
   - Inicia tentativas automáticas de recuperação

2. **Timeout de Resposta do Servidor**:
   - Detecta quando o servidor não responde em tempo hábil
   - Configurável (padrão: 15 segundos)
   - Inicia tentativas automáticas de recuperação

## Estratégia de Recuperação Automática

O sistema implementa uma estratégia de recuperação em etapas:

1. Quando um timeout ou erro recuperável é detectado, o sistema:
   - Incrementa um contador de tentativas
   - Fornece feedback visual ao usuário
   - Espera um intervalo configurável (padrão: 2 segundos)
   - Tenta novamente automaticamente

2. O número máximo de tentativas automáticas é configurável (padrão: 2)

3. Se as tentativas automáticas falharem:
   - O sistema exibe uma mensagem de erro detalhada
   - Fornece opções para o usuário tentar manualmente

## Categorização de Erros

O sistema categoriza erros em:

- **Timeout**: Problemas de tempo limite de espera
- **Network**: Problemas de conectividade de rede
- **Authentication**: Falhas no processo de autenticação
- **Authorization**: Problemas de permissão/acesso
- **Configuration**: Problemas de configuração
- **Unknown**: Erros não classificados

## Como Usar

### Integração Básica

Os componentes já estão integrados ao sistema de autenticação existente. Não é necessária nenhuma configuração adicional para o funcionamento básico.

### Personalização de Timeouts

Para ajustar os valores de timeout, modifique as configurações no início do arquivo `error-handler.js`:

```javascript
this.config = {
  redirectTimeout: 30000, // 30 segundos
  serverResponseTimeout: 15000, // 15 segundos
  maxAutoRetries: 2,
  retryInterval: 2000, // 2 segundos
  ...
}
```

### Personalização de Mensagens de Erro

Para personalizar as mensagens de erro exibidas aos usuários, modifique a função `getFriendlyErrorMessage` em `error-handler.js`.

## Debugging

O sistema registra detalhes extensivos durante o processo de autenticação. Para depuração:

1. Abra o console do navegador (F12)
2. Verifique mensagens de log com prefixos:
   - `✅` para operações bem-sucedidas
   - `🔵` para operações em andamento
   - `🕒` para timeouts detectados
   - `🔄` para tentativas de recuperação
   - `🔴` para erros

## Considerações de Segurança

O sistema foi projetado para melhorar a experiência do usuário sem comprometer a segurança:

- Não armazena ou expõe dados sensíveis
- Não interfere no fluxo de segurança do OIDC
- Não implementa "bypasses" de segurança
- Apenas melhora a detecção e recuperação de erros

## Limitações Conhecidas

- O sistema não pode recuperar de erros do lado do servidor de autorização
- Alguns navegadores podem bloquear tentativas automáticas como parte de políticas anti-popup
- Em conexões muito lentas, os timeouts podem precisar de ajuste

## Testes e Validação

O sistema foi testado em diversos cenários:

- Conexão lenta/instável
- Bloqueio de cookies de terceiros
- Bloqueio temporário de redirecionamento
- Erros comuns do OIDC

## Próximos Passos

- Implementar detecção inteligente de problemas de cookies de terceiros
- Aprimorar o sistema de retry para conexões particularmente lentas
- Adicionar feedback visual mais detalhado durante o processo de autenticação