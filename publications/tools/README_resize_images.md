# Redimensionamento de imagens para artigos

Este repositório contém instruções e um script opcional para redimensionar imagens ao padrão desejado para LinkedIn e para os artigos do site.

## Padrões
- LinkedIn paisagem: 1920 x 1080 (16:9)
- Miniatura do artigo (site): 1200 x 675 (16:9)

## Recomendações
- Evite esticar a imagem: use background com gradiente e centralize a arte existente.
- Se a imagem original não for 16:9 (ex.: 1024 x 857), use letterboxing (faixas laterais ou top/bottom) com cores do branding (#667eea/#764ba2) ou fundo claro (#f8fafc).

## Script Python (opcional)

Requerimentos: Python 3.9+ e Pillow

```python
from PIL import Image, ImageOps
from pathlib import Path

SRC = Path(r"c:/dev/site/cara-core/publications/articles/assets/img/article_48_01.png")
DEST = SRC.with_name("article_48_01_1920x1080.png")
TARGET_W, TARGET_H = 1920, 1080
BG_COLOR = (102, 126, 234)  # #667eea

img = Image.open(SRC).convert("RGBA")
orig_w, orig_h = img.size

# Caixa 16:9 com background
canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (*BG_COLOR, 255))

# Ajuste para caber mantendo proporção
img_fit = ImageOps.contain(img, (TARGET_W, TARGET_H))

# Centraliza
x = (TARGET_W - img_fit.width) // 2
y = (TARGET_H - img_fit.height) // 2
canvas.paste(img_fit, (x, y), img_fit)

# (Opcional) adicionar overlay sutil para contrastar texto
# from PIL import ImageDraw
# overlay = Image.new("RGBA", (TARGET_W, TARGET_H), (0,0,0,50))
# canvas = Image.alpha_composite(canvas, overlay)

canvas.convert("RGB").save(DEST, format="PNG", optimize=True)
print(f"Salvo: {DEST}")
```

## Dica
Após gerar a versão 1920x1080, atualize a referência no HTML se desejar usar a nova imagem para o artigo ou para o compartilhamento em redes sociais.
