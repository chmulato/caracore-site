# Arquivos de Referência para Ambientes Alternativos

Este diretório contém arquivos de configuração que não são necessários para a implantação no GitHub Pages, mas podem ser úteis para implantações alternativas ou como referência para entender como o sistema foi configurado anteriormente.

## web.config

O arquivo `web.config` é específico para servidores web IIS (Internet Information Services) da Microsoft. No contexto do projeto Cara Core, ele era usado para:

1. **Proxy Reverso**: Redirecionar solicitações de autenticação OIDC para o backend Azure

   ```xml
   <rule name="Google Token Proxy" stopProcessing="true">
       <match url="oauth/google/token" />
       <action type="Rewrite" url="https://caracore-backend.azurewebsites.net/oauth/google/token" logRewrittenUrl="true" />
   </rule>
   ```

2. **Configuração CORS**: Adicionar cabeçalhos CORS às respostas para permitir solicitações cross-origin

   ```xml
   <rule name="Add CORS" preCondition="IsHTML">
       <match serverVariable="RESPONSE_Access-Control-Allow-Origin" pattern=".*" />
       <action type="Rewrite" value="*" />
   </rule>
   ```

### Quando usar este arquivo?

Este arquivo é útil em cenários como:

- **Hospedagem em Azure Web Apps**: Se você decidir hospedar o frontend em Azure Web Apps (que usa IIS)
- **Servidores Windows com IIS**: Em ambientes corporativos com servidores Windows
- **Desenvolvimento local com IIS Express**: Durante o desenvolvimento com Visual Studio

### Por que não é necessário no GitHub Pages?

O GitHub Pages:

- Executa em servidores Unix/Linux com servidores web como Nginx ou Apache, não IIS
- Oferece apenas hospedagem estática sem capacidade de processamento do lado do servidor
- Não suporta reescrita de URL ou configuração de cabeçalhos personalizados do lado do servidor

### Alternativa implementada

Em vez de depender deste arquivo, o código JavaScript foi modificado para apontar diretamente para o backend Azure:

```javascript
googleTokenEndpoint: 'https://caracore-backend.azurewebsites.net/oauth/google/token',
microsoftTokenEndpoint: 'https://caracore-backend.azurewebsites.net/oauth/microsoft/token'
```

E o backend foi configurado para aceitar solicitações CORS do domínio personalizado.

## Como usar este arquivo em outros ambientes

Para usar este arquivo em um ambiente IIS:

1. Copie-o de volta para o diretório raiz do projeto
2. Ajuste os URLs conforme necessário para o ambiente específico
3. Implante o site em um servidor executando IIS