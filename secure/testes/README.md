# Testes Unitários - Área Secure OIDC

Este diretório contém os testes unitários para o sistema de autenticação OIDC da área restrita (Área 51) do CaraCore.

## � Estrutura dos Testes

### Arquivos de Teste

- **`test-framework.js`** - Framework customizado para testes JavaScript
- **`test-config-validation.js`** - Validação de configurações OIDC
- **`test-jwt-validation.js`** - Validação de tokens JWT
- **`test-error-handling.js`** - Tratamento de erros e cenários de falha
- **`test-google-auth.js`** - Autenticação Google OAuth
- **`test-entra-auth.js`** - Autenticação Microsoft Entra ID
- **`test-dual-auth.js`** - Integração dual (Google + Entra)
- **`test-runner.html`** - Interface web para execução dos testes

### Executores

- **`executar_ut_secure.py`** (na raiz) - Script Python para executar testes
- **`package.json`** - Configuração Node.js para testes
- **`run-tests.js`** - Script Node.js alternativo

## 🚀 Como Executar

### Opção 1: Script Python (Recomendado)

```bash
# Executar com interface web (abre navegador)
python executar_ut_secure.py

# Executar em modo headless (sem navegador)
python executar_ut_secure.py --headless

# Executar com logs detalhados
python executar_ut_secure.py --verbose

# Executar e salvar relatório em arquivo
python executar_ut_secure.py --headless --output

# Usar porta específica
python executar_ut_secure.py --port 9000

# Ver todas as opções
python executar_ut_secure.py --help
```

### Opção 2: Interface Web Manual

```bash
# Iniciar servidor HTTP
cd secure/testes
python -m http.server 8080

# Abrir no navegador
http://localhost:8080/test-runner.html
```

### Opção 3: Node.js

```bash
# Na raiz do projeto
npm test

# Ou no diretório de testes
cd secure/testes
npm test
```

## 📊 Tipos de Teste

### 1. Framework de Testes (`test-framework.js`)
- ✅ Classe TestFramework
- ✅ Sistema de assertions (Expect)
- ✅ Helpers para mocks
- ✅ Suporte para testes async
- ✅ Runner global

### 2. Validação de Configurações (`test-config-validation.js`)
- ✅ URLs de redirect válidas/inválidas
- ✅ Validação de Client IDs
- ✅ Authorities corretas
- ✅ Response types seguros
- ✅ Detecção de ambiente
- ✅ Storage disponível
- ✅ Configurações de segurança

### 3. Validação JWT (`test-jwt-validation.js`)
- ✅ Estrutura de token (3 partes)
- ✅ Claims obrigatórios
- ✅ Validação de issuer
- ✅ Validação de audience
- ✅ Verificação de expiração
- ✅ Claims de perfil
- ✅ Manipulação segura de tokens

### 4. Tratamento de Erros (`test-error-handling.js`)
- ✅ Erros de configuração
- ✅ Erros de autorização (access_denied, etc.)
- ✅ Erros de token (invalid_grant, etc.)
- ✅ Erros de rede (timeout, 5xx, etc.)
- ✅ Erros de storage
- ✅ Erros de popup/janela
- ✅ Recuperação de erros
- ✅ Logging sanitizado

### 5. Autenticação Google (`test-google-auth.js`)
- ✅ Configuração OAuth correta
- ✅ URL de autorização
- ✅ Callback com parâmetros
- ✅ Token exchange
- ✅ Validação de tokens
- ✅ Integração com backend

### 6. Autenticação Entra ID (`test-entra-auth.js`)
- ✅ Configuração Entra correta
- ✅ Authority URLs
- ✅ Tenant configuration
- ✅ AADSTS error handling
- ✅ Session state
- ✅ Consent flow

### 7. Integração Dual (`test-dual-auth.js`)
- ✅ Configuração dual
- ✅ Seleção de provedor
- ✅ Alternância entre provedores
- ✅ Estado independente
- ✅ Detecção de conflicts
- ✅ Roteamento correto

## 📈 Relatórios

### Execução Manual (Web)
- Interface visual com resultados em tempo real
- Contadores de pass/fail por categoria
- Resumo total consolidado
- Logs detalhados de erros

### Execução Headless
- Resultados coletados via Selenium
- Arquivo JSON com estatísticas completas
- Taxa de sucesso calculada
- Timestamp de execução

### Formato do Relatório JSON
```json
{
  "timestamp": "2025-10-05T22:17:41.123Z",
  "tests": {
    "framework": { "total": 5, "pass": 5, "fail": 0 },
    "config": { "total": 17, "pass": 17, "fail": 0 },
    "jwt": { "total": 23, "pass": 23, "fail": 0 },
    "error": { "total": 24, "pass": 24, "fail": 0 },
    "google": { "total": 8, "pass": 8, "fail": 0 },
    "entra": { "total": 9, "pass": 9, "fail": 0 },
    "dual": { "total": 10, "pass": 10, "fail": 0 }
  },
  "summary": {
    "total": 96,
    "pass": 96,
    "fail": 0,
    "success_rate": 100.0
  }
}
```

## 🔧 Dependências

### Para Execução Básica
- Python 3.6+
- Navegador web moderno

### Para Modo Headless
```bash
pip install selenium
```

### Para Node.js (Opcional)
```bash
npm install
```

## 🛡️ Segurança

Os testes validam aspectos críticos de segurança:

- **Autenticação**: Fluxos OIDC corretos
- **Autorização**: Validação de tokens
- **CSRF**: Proteção via state parameter
- **XSS**: Sanitização de dados
- **HTTPS**: Obrigatório em produção
- **Storage**: Uso seguro de localStorage/sessionStorage

## 🐛 Troubleshooting

### Problema: Porta ocupada
```bash
# Use porta diferente
python executar_ut_secure.py --port 9000
```

### Problema: Selenium não instalado
```bash
pip install selenium
```

### Problema: Arquivos não encontrados
- Verifique se está executando da raiz do projeto
- Confirme que o diretório `secure/testes` existe

### Problema: Testes falhando
- Execute com `--verbose` para logs detalhados
- Verifique console do navegador
- Confirme configurações OIDC

## 📝 Contribuindo

Para adicionar novos testes:

1. Crie arquivo `test-nova-funcionalidade.js`
2. Use o framework existente (`describe`, `it`, `expect`)
3. Adicione ao `test-runner.html`
4. Atualize script Python se necessário
5. Documente no README

## 📄 Licença

Parte do projeto CaraCore - Sistema de Autenticação OIDC
## 🚀 Como Executar os Testes

### Método 1: Via Servidor HTTP Local

```bash
# Navegar para o diretório de testes
cd C:\dev\site_oidc\site-cara-core\secure\testes

# Iniciar servidor HTTP
python -m http.server 8080

# Abrir no navegador
http://localhost:8080/test-runner.html
```

### Método 2: Via VS Code Live Server

1. Instalar extensão Live Server no VS Code
2. Abrir `test-runner.html`
3. Clicar em "Go Live"

## 🧪 Categorias de Teste

### 1. Framework de Testes (test-framework.js)
- ✅ Validação da classe TestFramework
- ✅ Sistema de assertions (Expect)
- ✅ Suporte a mocks e helpers
- ✅ Suporte a testes assíncronos
- ✅ Runner global de testes

### 2. Validação de Configurações (test-config-validation.js)
- ✅ URLs de redirect válidas/inválidas
- ✅ Validação de scopes OIDC
- ✅ Formato de Client IDs (Google/Entra)
- ✅ Validação de authorities
- ✅ Response types seguros
- ✅ Detecção de ambiente (dev/prod)
- ✅ Disponibilidade de storage
- ✅ Validação de segurança (HTTPS/CORS)

### 3. Validação de JWT (test-jwt-validation.js)
- ✅ Estrutura básica do JWT (3 partes)
- ✅ Validação base64url
- ✅ Claims obrigatórios do ID Token
- ✅ Validação de issuer (Google/Entra)
- ✅ Validação de audience
- ✅ Verificação de expiração
- ✅ Claims de perfil (email, nome)
- ✅ Armazenamento seguro de tokens
- ✅ Renovação de tokens
- ✅ Validação de segurança
- ✅ Decodificação de JWT
- ✅ Integração com provedores

### 4. Tratamento de Erros (test-error-handling.js)
- ✅ Erros de configuração inválida
- ✅ Erros de autorização (access_denied, invalid_request)
- ✅ Erros de token (invalid_grant, expiração)
- ✅ Erros de rede (timeout, 500, 401)
- ✅ Erros de storage (quota, indisponibilidade)
- ✅ Erros de popup/janela
- ✅ Recuperação após erros
- ✅ Logging seguro de erros

### 5. Autenticação Google (test-google-auth.js)
- ✅ Configuração específica do Google
- ✅ URL de autorização
- ✅ Callback e parâmetros
- ✅ Troca de tokens
- ✅ Integração com backend
- ✅ Tratamento de erros específicos

### 6. Autenticação Microsoft Entra (test-entra-auth.js)
- ✅ Configuração específica do Entra ID
- ✅ Authority URLs corretas
- ✅ Configuração de tenant
- ✅ Tratamento de erros AADSTS
- ✅ Validação de session state
- ✅ Fluxo de consent
- ✅ Logout flow
- ✅ Integração com backend

### 7. Integração Dual (test-dual-auth.js)
- ✅ Configuração simultânea de provedores
- ✅ Seleção de provedor
- ✅ Alternância entre provedores
- ✅ Estado independente por provedor
- ✅ Detecção de authority mismatch
- ✅ Roteamento de backend
- ✅ Interface dual
- ✅ Fluxos completos
- ✅ Detecção de conflitos

## 📊 Estatísticas de Cobertura

| Módulo | Testes | Status |
|--------|--------|--------|
| Framework | 5 | ✅ Completo |
| Configurações | 17 | ✅ Completo |
| JWT | 23 | ✅ Completo |
| Tratamento de Erros | 24 | ✅ Completo |
| Google Auth | 8 | ✅ Completo |
| Entra Auth | 9 | ✅ Completo |
| Dual Auth | 10 | ✅ Completo |
| **TOTAL** | **96** | **✅ Completo** |

## 🔧 Framework Customizado

### Funcionalidades do Framework

```javascript
// Definir suite de testes
describe('Nome da Suite', () => {
    // Testes individuais
    it('deve fazer algo específico', () => {
        expect(valor).toBe(esperado);
    });
});

// Setup e teardown
beforeEach(() => {
    // Configuração antes de cada teste
});

afterEach(() => {
    // Limpeza após cada teste
});
```

### Assertions Disponíveis

```javascript
expect(value).toBe(expected)                    // Igualdade estrita
expect(value).toEqual(expected)                 // Igualdade de estrutura
expect(value).toBeTruthy()                      // Valor truthy
expect(value).toBeFalsy()                       // Valor falsy
expect(value).toBeUndefined()                   // Undefined
expect(value).toBeDefined()                     // Definido
expect(value).toContain(substring)              // Contém substring/elemento
expect(value).toHaveProperty(property)          // Possui propriedade
expect(value).toBeInstanceOf(Constructor)       // Instância de classe
```

### Helpers Utilitários

```javascript
waitFor(ms)                    // Aguardar tempo específico
createMock(returnValue)        // Criar função mock
```

## 🎯 Objetivos dos Testes

### Segurança
- ✅ Validar configurações seguras
- ✅ Prevenir ataques CSRF
- ✅ Validar tokens corretamente
- ✅ Sanitizar logs sensíveis

### Compatibilidade
- ✅ Funcionar com Google OAuth
- ✅ Funcionar com Microsoft Entra ID
- ✅ Suportar múltiplos ambientes
- ✅ Fallbacks para recursos indisponíveis

### Robustez
- ✅ Tratar todos os tipos de erro
- ✅ Recuperar de falhas temporárias
- ✅ Manter estado consistente
- ✅ Logging adequado para debug

### Usabilidade
- ✅ Interface clara de testes
- ✅ Feedback visual imediato
- ✅ Execução individual ou completa
- ✅ Relatórios detalhados

## 🚨 Cenários de Teste Críticos

### Segurança OIDC
1. **Validação de State (CSRF)** - Previne ataques cross-site
2. **Validação de Issuer** - Evita tokens de fontes maliciosas
3. **Validação de Audience** - Garante tokens para nossa aplicação
4. **Verificação de Expiração** - Evita uso de tokens expirados

### Tratamento de Erros
1. **Configuração Inválida** - Detecta problemas de setup
2. **Falhas de Rede** - Handles de conectividade
3. **Erros de Autorização** - Trata rejeições do usuário
4. **Storage Indisponível** - Fallbacks quando storage falha

### Integração
1. **Múltiplos Provedores** - Google e Entra funcionando juntos
2. **Ambientes Diferentes** - Dev, staging, produção
3. **Browsers Diferentes** - Compatibilidade cross-browser
4. **Dispositivos Móveis** - Responsividade e touch

## 📱 Interface dos Testes

A interface web (`test-runner.html`) oferece:

- **🚀 Execução Global** - Roda todos os testes em sequência
- **🔧 Execução Individual** - Testa módulos específicos
- **📊 Relatórios em Tempo Real** - Feedback visual imediato
- **✅❌ Status Visual** - Verde/vermelho para pass/fail
- **📈 Estatísticas** - Contadores de sucesso/falha
- **🎨 Design Responsivo** - Funciona em desktop e mobile

## 🔄 Processo de CI/CD

Os testes podem ser integrados em pipelines de CI/CD:

```bash
# Executar testes headless (Puppeteer/Playwright)
npm run test:headless

# Gerar relatório de cobertura
npm run test:coverage

# Executar apenas testes críticos
npm run test:critical
```

## 📝 Contribuindo

Para adicionar novos testes:

1. **Criar arquivo de teste** seguindo o padrão `test-*.js`
2. **Incluir no test-runner.html** - adicionar script e painel
3. **Seguir convenções** do framework existente
4. **Documentar cenários** testados
5. **Validar execução** completa

## 🏆 Melhores Práticas

### Organização
- ✅ Um arquivo por categoria de teste
- ✅ Nomes descritivos para testes
- ✅ Agrupamento lógico em suites
- ✅ Setup/teardown consistentes

### Implementação
- ✅ Testes independentes e isolados
- ✅ Mocks para dependências externas
- ✅ Assertions claras e específicas
- ✅ Tratamento de casos extremos

### Manutenção
- ✅ Atualizar testes com mudanças de código
- ✅ Revisar periodicamente a cobertura
- ✅ Refatorar testes duplicados
- ✅ Documentar cenários complexos

---

**🛡️ Área 51 - Sistema de Testes OIDC**  
*Garantindo segurança e confiabilidade na autenticação CaraCore*