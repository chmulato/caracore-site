# Memória de configuração MCP — DeepSeek direto e NVIDIA NIM

**Data:** 22/10/2026  
**Escopo:** configuração local no workspace `D:\onedrive\dev`.  
**Segredos:** nenhum token ou valor de chave deve ser registrado neste documento, no repositório ou em capturas de tela.

## Estado da configuração

O workspace tem dois servidores MCP independentes em `.vscode/mcp.json`:

| Servidor MCP | Provedor efetivo | Endpoint | Modelo | Ferramentas |
|---|---|---|---|---|
| `nvidia-deepseek` | NVIDIA NIM | `https://integrate.api.nvidia.com/v1/chat/completions` | `deepseek-ai/deepseek-v4.1-flash` | `deepseek_chat` |
| `deepseek-direct` | API oficial DeepSeek | `https://api.deepseek.com/chat/completions` | `deepseek-flash` | `deepseek_direct_chat`, `deepseek_direct_reasoning` |

Arquivos:

- Configuração MCP: `.vscode/mcp.json`
- Servidor NVIDIA: `.agents/deepseek-mcp-server.js`
- Servidor DeepSeek direto: `.agents/deepseek-api-mcp-server.js`

As duas configurações coexistem; a NVIDIA mantém a ferramenta `deepseek_chat`. O servidor DeepSeek direto usa outro nome de servidor, ferramentas próprias e entrada de segredo VS Code `${input:deepseek-api-key}`. Não trocar as credenciais entre provedores.

## Credenciais e segurança

- `NVIDIA_API_KEY`: variável de usuário do Windows, configurada pelo proprietário. O valor não foi lido nem armazenado na memória.
- `DEEPSEEK_API_KEY`: não estava presente no ambiente PowerShell de validação. A chave da API oficial DeepSeek deve ser inserida no prompt de entrada protegido do VS Code quando o servidor `deepseek-direct` for iniciado.
- A chave com prefixo `nvapi-` pertence à NVIDIA; a chave/ID NVIDIA não autentica na API oficial DeepSeek.
- A configuração MCP não contém o valor de nenhuma chave. Nunca inserir tokens nos arquivos, logs, mensagens ou screenshots.

## Verificações e pendências

- JSON de `.vscode/mcp.json` válido.
- `node --check` aprovado nos dois servidores.
- Testes locais com `fetch` simulado aprovaram endpoint, modelo, cabeçalhos de autorização, payloads de chat/raciocínio e descoberta das ferramentas para o servidor DeepSeek direto. Nenhuma chamada real DeepSeek foi feita nesta configuração.
- Uma chamada de teste à NVIDIA NIM com `deepseek-ai/deepseek-v4.1-flash` expirou após até 180 segundos, sem resposta HTTP. A conectividade e a validade da chave NVIDIA para inferência não foram confirmadas; timeout não prova que a chave seja inválida nem que o serviço esteja indisponível.
- O servidor MCP NVIDIA iniciou e anunciou `deepseek_chat` anteriormente; o estado atual de execução deve ser confirmado no VS Code.
- O Cline configurado anteriormente para DeepSeek direto mostrou erro de autenticação com a credencial então configurada. Isso é separado destes servidores MCP e não comprova o estado de autenticação deles.

## Retomada

1. No VS Code, abrir `.vscode/mcp.json` e iniciar `deepseek-direct`.
2. Quando solicitado, inserir a chave secreta da API oficial DeepSeek no campo protegido; não enviar a chave ao chat.
3. Confirmar que `deepseek_direct_chat` aparece e fazer um teste curto, ciente de que pode haver cobrança/uso.
4. Para NVIDIA, iniciar `nvidia-deepseek` e testar `deepseek_chat`; investigar a chamada que expirou antes de concluir que há conectividade.
5. Manter a separação de provedores e não alterar `NVIDIA_API_KEY` para tentar autenticar a API DeepSeek.
