# Pendências do Projeto Cara Core

## Sistema de Autenticação (OIDC)

### Melhorias Críticas
- [x] Implementar tratamento de erro mais detalhado para falhas de autenticação
- [x] Adicionar timeout para evitar espera infinita caso a autenticação falhe silenciosamente
- [x] Implementar mecanismo de retry para reconexão em caso de falhas temporárias
- [ ] Revisar tratamento de redirecionamentos em diferentes ambientes (localhost, produção, file://)

### Otimizações
- [ ] Minificar arquivos CSS e JS para melhorar performance em produção
- [ ] Implementar carregamento lazy de recursos não críticos
- [ ] Adicionar cache eficiente para configs de autenticação
- [ ] Otimizar tempo de carregamento da página inicial

### Funcionalidades Futuras
- [ ] Adicionar suporte para mais provedores OIDC além de Google e Microsoft
- [ ] Implementar modo offline com armazenamento local seguro
- [ ] Criar interface para gerenciamento de sessões ativas
- [ ] Implementar sistema de notificação para expiração de sessão

## Interface do Usuário

### Melhorias Críticas
- [ ] Corrigir responsividade em dispositivos móveis (especialmente em telas pequenas)
- [ ] Resolver problemas de acessibilidade (contraste, navegação por teclado)
- [x] Garantir feedback visual claro durante estados de carregamento

### Otimizações
- [ ] Refatorar CSS para melhor organização (talvez usando metodologia BEM)
- [ ] Criar variantes de tema (claro/escuro) com suporte a preferências do sistema
- [ ] Reduzir dependências externas não essenciais

### Funcionalidades Futuras
- [ ] Implementar dashboard de usuário após login
- [ ] Adicionar personalização de perfil
- [ ] Criar área de configurações de conta

## Infraestrutura

### Melhorias Críticas
- [ ] Configurar CI/CD robusto para automação de deploys
- [ ] Implementar monitoramento de erros em produção
- [ ] Reforçar segurança contra ataques comuns (XSS, CSRF)

### Otimizações
- [ ] Refinar processo de build para otimização de assets
- [ ] Implementar CDN para conteúdo estático
- [ ] Configurar cache HTTP apropriado

### Funcionalidades Futuras
- [ ] Implementar analytics para acompanhamento de uso
- [ ] Criar sistema de logs centralizado
- [ ] Implementar feature flags para lançamentos controlados

## Documentação

### Melhorias Críticas
- [x] Documentar processo de autenticação completo
- [ ] Criar guia de configuração detalhado para novos ambientes
- [x] Documentar estrutura e organização do código

### Otimizações
- [ ] Criar documentação de API com exemplos
- [ ] Adicionar comentários em partes complexas do código
- [ ] Documentar processo de deploy e rollback

### Funcionalidades Futuras
- [ ] Criar wiki interna para documentação colaborativa
- [ ] Implementar sistema de documentação automática
- [ ] Criar tutoriais em vídeo para novos desenvolvedores

## Testes

### Melhorias Críticas
- [x] Implementar testes unitários para funções críticas
- [x] Criar testes de integração para fluxos de autenticação
- [ ] Implementar testes E2E para simulação de usuários reais

### Otimizações
- [ ] Configurar ambiente de teste automatizado
- [ ] Implementar cobertura de código
- [ ] Criar fixtures e mocks para testes mais rápidos

### Funcionalidades Futuras
- [ ] Implementar testes de performance
- [ ] Criar testes de acessibilidade automatizados
- [ ] Implementar testes de segurança automatizados

## Correções Recentes

### Sistema de Tratamento de Erros e Timeouts (Implementado em 12/10/2025)
- [x] Implementação de detecção de timeout para redirecionamento (30s) e respostas do servidor (15s)
- [x] Sistema de categorização e tratamento de erros com mensagens amigáveis
- [x] Mecanismo automático de retry para falhas recuperáveis (até 2 tentativas)
- [x] Feedback visual aprimorado durante estados de autenticação
- [x] Documentação detalhada do sistema em `/docs/SISTEMA-TIMEOUT-ERROS.md`

### Problema com Botões de Login (Resolvido em 11/10/2025)
- [x] Extrair CSS inline para arquivo separado
- [x] Extrair JavaScript inline para arquivos modulares
- [x] Corrigir problema de origem (origin) para autenticação via file://
- [x] Garantir que os botões de login não fiquem em estado "travado"
- [x] Ajustar configurações de log para ambiente de produção