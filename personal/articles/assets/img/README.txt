================================================================================
IMAGENS DO BLOG (Christian Mulato) — convenção única
================================================================================
Pasta: personal/articles/assets/img/

LÓGICA GERAL (artigos avulsos e episódios de série)
--------------------------------------------------
Hero e imagens do corpo (exceto autor e ícone do site):
  YYYY_MM_DD_IMAGE_NNN.png

  YYYY_MM_DD = data de publicação = primeiros 10 caracteres do nome do ficheiro
  HTML desse artigo (ex.: 2026_04_03_....html → 2026_04_03_IMAGE_001.png).

  NNN = 001 hero, 002 secundária, etc.

og:image deve repetir o mesmo ficheiro do hero (001) quando existir.

Ficheiros partilhados (sem data de artigo no nome):
  foto_chri.jpg | favicon.ico


DUAS SÉRIES — EXCEÇÃO À “UMA DATA POR PÁGINA”
---------------------------------------------
Há duas séries com página índice própria. Aí a norma “data no PNG = data no nome
do HTML” não se aplica à página do índice, porque um único HTML lista vários
episódios publicados em datas diferentes.

1) Série “Brasil, SDK e Soberania”
   Índice: 2026_02_15_serie_brasil_sdk_soberania_index.html
   (a data 2026_02_15 é a do índice; os cartões usam a data de cada episódio.)

   Episódios (cada um segue a norma geral no seu próprio HTML):
   serie_brasil_sdk_soberania_ep01 … ep07

2) Série “Protocolo de Lucerna”
   Índice: 2026_04_20_serie_protocolo_lucerna_index.html
   Episódios: protocolo_lucerna_ep01 … ep05, epilogo em HTML próprios.

Regra prática:
- Por episódio: imagens com o mesmo prefixo YYYY_MM_DD que o ficheiro desse
  episódio (como qualquer artigo).
- Na página índice: vários YYYY_MM_DD diferentes nos cartões — esperado;
  o validador (validate_article_images.ps1) não exige igualdade à data do
  nome do índice para ficheiros *_index.html.


IGUALAR FICHEIROS NO DISCO
--------------------------
1) tools/equalize_article_images.ps1
   Log: sala/regis/MANIFEST_EQUALIZACAO_IMAGENS.txt

2) Artigos 2025_12_09 / 2025_12_10: ver notas nas execuções anteriores se ainda
   houver PNG com nomes antigos.

Validação: tools/validate_article_images.ps1
           → sala/regis/VALIDACAO_IMAGENS_RETRO_BLOG.txt

================================================================================
