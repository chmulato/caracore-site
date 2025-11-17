#!/bin/bash
# Script para copiar favicon.ico para a raiz do projeto
# Necessário para GitHub Pages que não suporta redirecionamentos de servidor

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FAVICON_SOURCE="$PROJECT_ROOT/images/favicon.ico"
FAVICON_DEST="$PROJECT_ROOT/favicon.ico"

if [ ! -f "$FAVICON_SOURCE" ]; then
    echo "❌ Erro: favicon.ico não encontrado em $FAVICON_SOURCE"
    exit 1
fi

# Copiar favicon para a raiz
cp "$FAVICON_SOURCE" "$FAVICON_DEST"

if [ -f "$FAVICON_DEST" ]; then
    echo "✅ Favicon copiado com sucesso para $FAVICON_DEST"
else
    echo "❌ Erro ao copiar favicon"
    exit 1
fi

