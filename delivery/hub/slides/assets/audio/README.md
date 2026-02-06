# Áudio — Narrações Tia Sócia (opcional)

Para que o player de narração funcione em cada slide, coloque os arquivos MP3 nesta pasta com o seguinte padrão de nome:

- `slide_01_naracao_natural.mp3` (Slide 1)
- `slide_02_naracao_natural.mp3` (Slide 2)
- …
- `slide_21_naracao_natural.mp3` (Slide 21)

O script `apresentacao-tia-socia.js` carrega o áudio correspondente ao slide atual. Se o arquivo não existir, a mensagem "Áudio não disponível" é exibida e o usuário pode usar o botão **Ler texto** para a narração em texto.

Formato recomendado: MP3, mono ou estéreo, taxa de bits 128 kbps ou superior.
