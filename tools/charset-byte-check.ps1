# Utilitário legado. Para validação de encoding use:
#   python tools/validate_encoding.py site
# Para depurar offset em bytes do <meta charset>, use um editor hex ou:
#   python -c "from pathlib import Path; b=Path(r'index.html').read_bytes(); print(b.find(b'charset'))"
