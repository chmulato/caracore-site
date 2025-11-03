# Configuração de Execução dos Testes

## Scripts de Execução

### Executar todos os testes
```bash
# A partir do diretório raiz do projeto
cd secure/testes
npx jest
```

### Executar com cobertura
```bash
npx jest --coverage
```

### Executar teste específico
```bash
# Por arquivo
npx jest super-admin-setup.test.js

# Por padrão de nome
npx jest --testNamePattern="aprovação"
```

### Executar em modo watch (desenvolvimento)
```bash
npx jest --watch
```

## Configuração Jest

```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/test-setup.js"],
  "testMatch": ["**/*.test.js"],
  "testTimeout": 10000
}
```

## Dependências Necessárias

Para executar os testes, instale:

```bash
npm install --save-dev jest jest-environment-jsdom
```

## Status dos Testes

✅ **super-admin-setup.test.js** - 15 testes (300+ linhas)
✅ **request-access-enhanced.test.js** - 18 testes (400+ linhas) 
✅ **approval-requests.test.js** - 20 testes (350+ linhas)
✅ **user-management-navigation.test.js** - 22 testes (400+ linhas)

**Total**: 75 testes unitários cobrindo todo o sistema de gerenciamento de usuários.