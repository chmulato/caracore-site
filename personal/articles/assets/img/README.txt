================================================================================
IMAGENS DO BLOG (Christian Mulato) — convenção única
================================================================================
Pasta: personal/articles/assets/img/

LÓGICA DOS NOMES
----------------
1) Hero e imagens do corpo do artigo (exceto autor e ícone do site):
   YYYY_MM_DD_IMAGE_NNN.png
   - YYYY_MM_DD = data de publicação do artigo (os primeiros 10 caracteres do nome
     do ficheiro HTML do artigo, ex.: 2026_04_03_alem_da_lente....html → 2026_04_03).
   - NNN = sequência: 001 hero principal, 002 secundária, etc.

2) Páginas de série (*_index.html):
   Cada cartão usa a imagem do episódio correspondente (mesma regra: data do HTML
   daquele episódio), não a data da página índice.

3) Ficheiros partilhados (não seguem data do artigo):
   - foto_chri.jpg — avatar do autor
   - favicon.ico — ícone do site

4) og:image (Open Graph) deve repetir o mesmo URL do hero (001) quando existir.

IGUALAR FICHEIROS NO DISCO
--------------------------
1) Script automático (só pares seguros, mesmo conteúdo com nome antigo):
   caracore-site/tools/equalize_article_images.ps1
   Log: sala/regis/MANIFEST_EQUALIZACAO_IMAGENS.txt

2) Artigo 2025_12_09 (e imagem 002): se os PNG ainda estiverem com nome
   2026_02_05_IMAGE_*.png, renomeie para 2025_12_09_IMAGE_001.png e _002.png.

3) Artigo 2025_12_10: hero deve ser 2025_12_10_IMAGE_001.png; se só existir
   2025_12_09_IMAGE_001.png e for o mesmo visual, copie para o nome 2025_12_10.

Validação: tools/validate_article_images.ps1
           → sala/regis/VALIDACAO_IMAGENS_RETRO_BLOG.txt

================================================================================
