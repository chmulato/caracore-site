# Documentação da API - CaraCore Backend

## Swagger/OpenAPI

A documentação completa da API está disponível através do Swagger UI.

### Acessar a Documentação

**Produção:**
- Swagger UI: `https://caracore-backend-docker.azurewebsites.net/api-docs`
- OpenAPI Spec (JSON): `https://caracore-backend-docker.azurewebsites.net/apispec.json`
- OpenAPI Spec (YAML): `https://caracore-backend-docker.azurewebsites.net/swagger.yaml`

**Desenvolvimento Local:**
- Swagger UI: `http://localhost:5051/api-docs`
- OpenAPI Spec (JSON): `http://localhost:5051/apispec.json`
- OpenAPI Spec (YAML): `http://localhost:5051/swagger.yaml`

### Instalação

Para habilitar a documentação Swagger, instale as dependências:

```bash
pip install -r requirements.txt
```

O Flasgger será instalado automaticamente e a documentação estará disponível em `/api-docs`.

### Estrutura da Documentação

A documentação está organizada em tags:

- **Health**: Verificação de saúde do sistema
- **OAuth**: Autenticação OAuth 2.1 (Google e Microsoft)
- **Auth**: Gerenciamento de tokens e sessões
- **Authorization**: Verificação e gestão de autorização de usuários
- **Admin**: Endpoints administrativos (requer autenticação)
- **Access Requests**: Solicitações de acesso ao sistema
- **Super Admin**: Endpoints de super administrador

### Autenticação

A maioria dos endpoints requer autenticação via JWT. No Swagger UI:

1. Clique no botão "Authorize" no topo da página
2. Digite seu token JWT no formato: `Bearer {seu_token}`
3. Clique em "Authorize"

### Arquivo OpenAPI

O arquivo `swagger.yaml` contém a especificação completa OpenAPI 3.0.0 da API e pode ser:

- Importado em ferramentas como Postman, Insomnia, ou outras ferramentas de API
- Usado para gerar clientes SDK em várias linguagens
- Importado em ferramentas de documentação como Redoc, Swagger Editor, etc.

### Exemplos de Uso

#### Testar Endpoints no Swagger UI

1. Acesse `/api-docs`
2. Expanda o endpoint desejado
3. Clique em "Try it out"
4. Preencha os parâmetros necessários
5. Clique em "Execute"
6. Veja a resposta do servidor

#### Importar no Postman

1. Abra o Postman
2. Clique em "Import"
3. Selecione "Link"
4. Cole a URL: `https://caracore-backend-docker.azurewebsites.net/swagger.yaml`
5. Clique em "Continue" e "Import"

#### Gerar Cliente SDK

Use ferramentas como:
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)

Exemplo com OpenAPI Generator:
```bash
openapi-generator generate -i swagger.yaml -g python -o ./client-sdk
```

### Manutenção

Para atualizar a documentação:

1. Edite o arquivo `swagger.yaml` com as mudanças
2. Adicione documentação inline nos endpoints do `app.py` usando docstrings no formato Swagger
3. A documentação será atualizada automaticamente quando o servidor reiniciar

### Notas Importantes

- A documentação é gerada automaticamente a partir dos docstrings dos endpoints
- O arquivo `swagger.yaml` serve como referência completa e pode ser usado para importação em outras ferramentas
- Todos os endpoints que requerem autenticação devem incluir `security: - BearerAuth: []` na documentação

