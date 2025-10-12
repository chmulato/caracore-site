# Checklist de Segurança OIDC

Este documento fornece uma lista de verificação de segurança para implementações OIDC (OpenID Connect) no projeto Cara Core.

## Configuração de Segurança

### Configurações Gerais

- [ ] Utilizar HTTPS em todos os endpoints
- [ ] Configurar cabeçalhos de segurança HTTP apropriados (HSTS, X-Content-Type-Options, etc.)
- [ ] Implementar proteção contra CSRF em endpoints sensíveis
- [ ] Configurar CORS adequadamente para permitir apenas origens confiáveis
- [ ] Desabilitar cache para respostas contendo informações sensíveis
- [ ] Utilizar configuração segura para cookies (HttpOnly, Secure, SameSite)

### Configuração do Cliente OIDC

- [ ] Armazenar client_secrets de forma segura (variáveis de ambiente, cofre de secrets)
- [ ] Implementar validação de nonce para prevenir ataques de replay
- [ ] Validar corretamente os tokens recebidos (assinatura, expiração, audiência, emissor)
- [ ] Utilizar escopos mínimos necessários para a operação
- [ ] Implementar mecanismo seguro de armazenamento de tokens (não utilizar localStorage para tokens de acesso)
- [ ] Configurar timeout apropriado para sessões inativas
- [ ] Implementar renovação segura de tokens expirados

### Configuração do Provedor OIDC

- [ ] Verificar se o provedor suporta práticas seguras (rotação de chaves, revogação de tokens)
- [ ] Configurar redirect_uris válidos e específicos
- [ ] Utilizar response_type apropriado para o fluxo (code para authorization code flow)
- [ ] Implementar PKCE (Proof Key for Code Exchange) quando possível
- [ ] Verificar se o provedor oferece suporte a autenticação multifator

## Fluxos de Autenticação

### Fluxo de Login

- [ ] Validar estado após redirecionamentos para prevenir CSRF
- [ ] Verificar nonce para prevenir ataques de repetição
- [ ] Implementar tratamento apropriado de erros (sem expor informações sensíveis)
- [ ] Utilizar TLS para todas as comunicações
- [ ] Não passar tokens sensíveis pela URL
- [ ] Limitar número de tentativas de login para prevenir brute force

### Fluxo de Logout

- [ ] Implementar logout em todos os sistemas (SSO)
- [ ] Revogar tokens ativos durante logout quando possível
- [ ] Limpar dados de sessão no cliente
- [ ] Redirecionar para página segura após logout
- [ ] Implementar logout silencioso para expiração de sessão

## Gerenciamento de Tokens

### Tokens de Acesso

- [ ] Armazenar tokens de acesso apenas em memória ou cookies HttpOnly
- [ ] Nunca expor tokens de acesso no frontend
- [ ] Implementar validação adequada de tokens antes de uso
- [ ] Verificar claims necessários (aud, exp, iss)
- [ ] Limitar tempo de vida dos tokens de acesso

### Tokens de ID

- [ ] Validar assinatura dos tokens de ID
- [ ] Verificar claims (nonce, aud, exp, iss, etc.)
- [ ] Não utilizar tokens de ID para autorização (apenas para autenticação)
- [ ] Proteger informações do usuário contidas no token

### Refresh Tokens

- [ ] Armazenar refresh tokens de forma segura (cookies HttpOnly com flags Secure e SameSite)
- [ ] Implementar rotação de refresh tokens
- [ ] Implementar detecção de possível comprometimento de refresh tokens
- [ ] Limitar tempo de vida de refresh tokens e forçar reautenticação periódica

## Monitoramento e Auditoria

- [ ] Registrar todas as tentativas de login (sucesso e falha)
- [ ] Implementar alertas para tentativas suspeitas de login
- [ ] Monitorar uso anormal de tokens
- [ ] Registrar eventos de revogação e rotação de tokens
- [ ] Implementar logging adequado sem expor informações sensíveis
- [ ] Manter histórico de dispositivos autenticados

## Testes de Segurança

- [ ] Realizar testes de penetração no fluxo de autenticação
- [ ] Verificar vulnerabilidades comuns (OWASP Top 10)
- [ ] Testar comportamento com tokens inválidos/expirados
- [ ] Verificar comportamento em cenários de rede adversos
- [ ] Testar com diferentes navegadores e configurações
- [ ] Verificar recuperação adequada de falhas

## Compliance e Privacidade

- [ ] Verificar conformidade com LGPD/GDPR
- [ ] Implementar consentimento para coleta de informações do usuário
- [ ] Fornecer mecanismo para usuários acessarem/excluírem seus dados
- [ ] Documentar todas as informações coletadas e seu uso
- [ ] Implementar políticas de retenção de dados adequadas

---

## Atualizações e Verificações

| Data | Verificado por | Observações |
|------|---------------|-------------|
| 11/10/2025 | Equipe Cara Core | Checklist inicial criado |
|  |  |  |
|  |  |  |

---

**Observação**: Esta lista deve ser revisada a cada 3 meses ou após mudanças significativas na implementação OIDC.