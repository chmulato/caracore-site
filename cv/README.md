# Currículo Interativo de Christian V. U. Mulato

Bem-vindo ao repositório do meu currículo interativo. Este projeto apresenta minha carreira de uma forma moderna e estratégica, com foco na minha experiência mais recente e relevante, ao mesmo tempo que oferece acesso ao meu histórico completo de forma controlada.

O site foi desenvolvido para ser uma apresentação profissional dinâmica e é monitorado com o Google Analytics para fins de auditoria e análise de acessos.

## Funcionalidades Principais

- **Currículo Focado:** A página principal exibe um resumo da minha carreira com foco nos últimos 8 anos de experiência, disponível em Português, Inglês e Italiano.
- **Currículo Completo "Secreto":** Um currículo detalhado com toda a minha trajetória profissional está disponível em Português. Para outros idiomas, utilize as ferramentas de tradução do navegador. O acesso é precedido por um aviso de que a sessão está sendo monitorada.
- **Multi-idioma:** O conteúdo principal do site e o currículo de 8 anos podem ser visualizados em Português, Inglês e Italiano.
- **Download de PDF:** É possível baixar uma versão em PDF do currículo, que inclui uma marca d'água "CONFIDENCIAL" (traduzida para o idioma selecionado) em todas as páginas.
- **Ícone Personalizado:** O site utiliza um ícone de estrela (favicon) para identificação visual.
- **Servidor Local com Logs:** O projeto inclui um servidor Python simples com logs detalhados para facilitar a execução e o desenvolvimento.

## Como Executar o Projeto

Para visualizar o site, é necessário iniciar o servidor local. Siga os passos abaixo:

1.  Abra um terminal (cmd, PowerShell, etc.).
2.  Navegue até a pasta raiz do projeto:
    ```bash
    cd c:\dev\cv
    ```
3.  Execute o servidor Python:
    ```bash
    python server.py
    ```
4.  Abra seu navegador e acesse o seguinte endereço:
    ```
    http://localhost:8000
    ```

O terminal onde o servidor está rodando exibirá logs de acesso, o que é útil para depuração. Para parar o servidor, pressione `Ctrl+C` no terminal.

## Estrutura de Pastas

A estrutura do projeto foi reorganizada para maior clareza:

- **/public/**: Contém todos os arquivos do site (HTML, CSS, JS, imagens, etc.).
  - **/public/new/**: Contém os arquivos Markdown dos currículos.
- **/source/**: Arquivos de origem, como o currículo master e artigos.
- **/resumes/**: Versões de currículos em outros formatos.
- **/applications/**: Cartas de apresentação e outros documentos de candidatura.
- **/archive/**: Arquivos antigos e não utilizados.
- `server.py`: O script do servidor local.
- `README.md`: Este arquivo.

## Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript
- **Servidor:** Python (`http.server`)
- **Bibliotecas JavaScript:**
  - `html2pdf.js`: Para a geração de PDFs.
  - `marked.js`: Para converter o conteúdo dos currículos de Markdown para HTML.

## Contato

- **LinkedIn:** [https://www.linkedin.com/in/chmulato](https://www.linkedin.com/in/chmulato)
- **Email:** chmulato@hotmail.com