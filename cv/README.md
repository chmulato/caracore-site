# Curriculo Institucional Cara Core

Modulo institucional de apresentacao profissional da Cara Core Informatica para contexto comercial, recrutamento tecnico e relacionamento corporativo.

## Finalidade

Este modulo publica um perfil institucional em formato de avatar corporativo.
O objetivo e apresentar competencias, historico de entrega e posicionamento tecnico sem expor dados pessoais desnecessarios do fundador ou de terceiros.

## Diretriz de privacidade e LGPD

O projeto adota minimizacao de dados e apresentacao institucionalizada.
Os dados exibidos publicamente sao limitados ao necessario para contato corporativo e avaliacao profissional.
Informacoes pessoais diretas foram suprimidas ou substituidas por identidade institucional, em alinhamento com uma postura de privacidade compativel com a LGPD.

Quando ha registro tecnico de acesso para auditoria e seguranca, a coleta deve permanecer minima, agregada e sem perfilamento pessoal indevido.

## Escopo funcional

| Recurso | Descricao |
| --- | --- |
| Resumo institucional multilingue | Apresenta o perfil resumido em Portugues, Ingles e Italiano |
| Perfil institucional completo | Disponibiliza historico ampliado com aviso previo de privacidade |
| Avatar corporativo | Substitui identificacao pessoal nominal por identidade institucional |
| PDF institucional | Permite exportacao controlada do perfil apresentado |
| Servidor local | Suporta execucao local para revisao e homologacao |

## Execucao local

1. Abrir um terminal.
2. Navegar ate a pasta do modulo.
3. Executar o servidor Python.
4. Abrir o navegador em `http://localhost:8000`.

```bash
cd d:\dev\caracore-site\cv
python server.py
```

## Estrutura principal

| Caminho | Conteudo |
| --- | --- |
| `public/` | Paginas HTML, arquivos JSON, assets e scripts do site |
| `public/json/` | Dados estruturados do perfil resumido e completo |
| `public/lang/` | Textos institucionais por idioma |
| `public/js/` | Renderizacao do curriculo e logica de interface |
| `tests/` | Validacao estrutural das paginas HTML |
| `server.py` | Servidor local de apoio ao desenvolvimento |

## Tecnologias adotadas

| Camada | Tecnologia |
| --- | --- |
| Frontend | HTML, CSS e JavaScript |
| Dados | JSON |
| Servidor local | Python com `http.server` |
| Exportacao | `html2pdf.js` |

## Validacao

Para validar rapidamente as paginas HTML do modulo:

```bash
npm run test:cv:html
```

## Contato institucional

Canal institucional recomendado para este modulo: `suporte@caracore.com.br`
