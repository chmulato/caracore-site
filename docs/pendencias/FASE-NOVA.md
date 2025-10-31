
# FASE NOVA — Orientações para Desenvolvimento de Acesso à Área Restrita

Este documento orienta o que precisa ser desenvolvido para garantir o acesso seguro às páginas HTML da pasta `secure/`, especialmente `secure/estrita.html`, `secure/index.html`, `secure/callback.html` e `secure/privado/historia.html`, atendendo todos os critérios de aceite definidos em [`CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md`](CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md), sem alterar o layout HTML ou o CSS global do site.

---

## Objetivo

Viabilizar autenticação e controle de acesso conforme requisitos de segurança (OAuth 2.1 + OIDC) para todas as páginas da área segura (`/secure/`), mantendo a experiência visual e estrutura do site intactas.

## Páginas em Escopo

### Páginas Principais:
- **`secure/index.html`** - Página de login/entrada da área restrita
- **`secure/estrita.html`** - Conteúdo protegido principal  
- **`secure/callback.html`** - Página de callback OAuth
- **`secure/logout.html`** - Página de logout
- **`secure/privado/historia.html`** - Conteúdo adicional protegido

### Arquivos de Suporte:
- Scripts JS existentes (`auth.js`, `auth-standalone.js`, etc.)
- CSS específico da área segura
- Configurações e logs

## Critérios e Restrições

- **Não alterar o layout HTML existente das páginas.**
- **Não modificar o CSS global ou arquivos de estilo do site.**
- **Todas as melhorias devem ser feitas via scripts, backend ou configuração.**

## O que precisa ser desenvolvido

### 1. Autenticação OAuth 2.1 + OIDC

- Implementar fluxo Authorization Code + PKCE obrigatório.
- Garantir que o login só seja possível via provedores autorizados (Google, Microsoft, etc.).
- Validar tokens no backend (issuer, audience, expiração).
- Atender todos os requisitos de PKCE, escopos mínimos, validação robusta e HTTPS obrigatório conforme critérios de aceite.

### 2. Controle de Sessão

- Exigir autenticação válida para acessar `estrita.html`.
- Redirecionar para login se não houver sessão válida.
- Implementar expiração automática de sessão/token.
- Implementar refresh token rotation conforme OAuth 2.1.

### 3. Consentimento e Fluxos Seguros

- Consentimento do usuário deve ser claro e registrado.
- Remover fluxos inseguros (Implicit Flow, Resource Owner Password Credentials).

### 4. Logout Seguro

- Implementar logout local e federado (OIDC logout endpoint, se disponível).
- Limpar storage/tokens após logout.

### 5. Mensagens e Feedback

- Exibir status de autenticação, erros e expiração de sessão via JavaScript (sem alterar HTML/CSS base).
- Usar modals, popups ou elementos dinâmicos criados via JS, se necessário.
- Implementar mensagens de feedback para falhas de autenticação, expiração de token e erros de rede.
- Garantir acessibilidade nas mensagens de feedback (ARIA labels, contraste adequado).

### 6. Auditoria e Registro de Eventos

- Implementar registro de eventos relevantes de autenticação e acesso (login, logout, falhas, expiração de sessão) no backend.
- Garantir que os logs estejam protegidos e acessíveis apenas para administradores.
- Registrar data, hora, usuário, IP e tipo de evento para cada ação relevante.
- Utilizar mecanismos seguros de armazenamento e rotação de logs conforme boas práticas.

### 7. Atualização do Back-end Python no Azure

- O back-end Python hospedado no Azure deve ser mantido atualizado e compatível com a imagem oficial do Azure App Service.
- Validar e documentar a versão do Python utilizada no deploy.
- Garantir que todas as dependências (ex: `requests`, `authlib`, etc.) estejam compatíveis com a imagem base do Azure.
- Testar o deploy em ambiente de staging antes de produção.
- Atualizar documentação técnica sempre que houver mudança na imagem ou versão do Python.

### 8. Segurança e Proteção de Dados

- Implementar cabeçalhos de segurança HTTP (CSP, HSTS, X-Frame-Options, etc.).
- Garantir que todos os endpoints de autenticação utilizem HTTPS exclusivamente.
- Implementar rate limiting para prevenir ataques de força bruta.
- Validar e sanitizar todas as entradas de dados no backend.
- Proteger contra ataques CSRF utilizando tokens adequados.

### 9. Testes e Validação

- Criar testes automatizados para fluxos de autenticação OAuth 2.1 + OIDC.
- Validar compatibilidade com diferentes navegadores (Chrome, Firefox, Safari, Edge).
- Testar cenários de falha (token expirado, provedor indisponível, rede lenta).
- Implementar testes de integração com provedores de identidade configurados.
- Documentar casos de teste e resultados esperados.

### 10. Monitoramento e Alertas

- Configurar monitoramento de disponibilidade dos endpoints de autenticação.
- Implementar alertas para falhas de autenticação em massa ou comportamento suspeito.
- Monitorar métricas de performance (tempo de resposta, taxa de sucesso).
- Configurar dashboards para acompanhamento de uso e saúde do sistema.
- Implementar notificações automáticas para eventos críticos de segurança.

### 11. Documentação e Entrega

- Criar documentação técnica detalhada do sistema de autenticação implementado.
- Documentar procedimentos de configuração de novos provedores de identidade.
- Criar guia de troubleshooting para problemas comuns de autenticação.
- Documentar arquitetura de segurança e fluxos de dados implementados.
- Preparar manual de operação para administradores do sistema.

### 12. Manutenção e Suporte

- Estabelecer procedimentos de backup para configurações de autenticação.
- Criar plano de recuperação de desastres para falhas do sistema de autenticação.
- Definir cronograma de atualizações de segurança e dependências.
- Implementar versionamento adequado para rollback em caso de problemas.
- Estabelecer canais de suporte para usuários com problemas de acesso.


## Observações

- Toda lógica de autenticação, sessão e feedback deve ser implementada via scripts JS ou backend.
- Não modificar o HTML estrutural nem os arquivos CSS do site.
- Este documento complementa e referencia os critérios de aceite definidos em [`CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md`](CRITERIOS-DE-ACEITE-OAUTH_2.1-OIDC.md).
- Revisar este documento a cada nova fase ou atualização de requisitos.
- Todos os itens devem ser implementados de forma incremental, priorizando segurança e estabilidade.
- Manter comunicação constante com a equipe durante todas as fases de desenvolvimento.
- Validar cada implementação antes de prosseguir para o próximo item.

## Cronograma Sugerido

1. **Fase 1 (Semanas 1-2):** Itens 1, 2 e 8 (Autenticação básica e segurança)
2. **Fase 2 (Semanas 3-4):** Itens 3, 4 e 5 (Consentimento, logout e feedback)
3. **Fase 3 (Semanas 5-6):** Itens 6, 7 e 9 (Auditoria, backend e testes)
4. **Fase 4 (Semanas 7-8):** Itens 10, 11 e 12 (Monitoramento, documentação e manutenção)

---

**Responsável técnico:**

- Equipe de Desenvolvimento da Cara Core Informática
- Campo Largo, quinta-feira, 30 de outubro de 2025.
