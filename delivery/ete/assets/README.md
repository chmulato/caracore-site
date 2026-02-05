# Assets da pasta web/

Estrutura de CSS, JS e imagens usadas pelas páginas dentro de `web/`.

## Estrutura

```
web/assets/
├── css/          # Folhas de estilo por página ou compartilhadas
│   └── laboratorio.css   # Laboratório Campo Largo: Ouro 4.0
├── js/           # Scripts (compartilhados ou por página)
│   └── main.js
├── img/          # Imagens específicas das páginas web (ex.: IFPR)
│   └── ifpr.png
└── README.md     # Este arquivo
```

## Uso nas páginas

- **CSS:** `<link href="assets/css/laboratorio.css" rel="stylesheet">` (caminho relativo à página em `web/`).
- **JS:** `<script src="assets/js/main.js"></script>` (quando necessário).
- **Imagens:** `assets/img/nome.png` para arquivos nesta pasta.

## Imagens em outros lugares

As páginas **index.html**, **index_v2.html** e **artigo_ete_v3.html** usam imagens do repositório em `../assets/images/` (aulas, artigos). Esses arquivos continuam na raiz do projeto em `assets/images/`; não são duplicados aqui.
