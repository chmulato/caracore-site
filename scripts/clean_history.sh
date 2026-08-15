#!/usr/bin/env bash
# Script para limpar histórico com git-filter-repo
# USO (execute localmente, não no repositório remoto):
# 1) Instale: python -m pip install git-filter-repo
# 2) Clone espelho: git clone --mirror <repo-url> repo.git
# 3) Copie este script para dentro de repo.git
# 4) Execute: ./clean_history.sh

set -euo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <repo-mirror-dir>"
  echo "Example: $0 repo.git"
  exit 1
fi

REPO_DIR="$1"
REPLACE_RULES="replace-rules.txt"

cd "$REPO_DIR"

# Exemplo de remoção de caminhos sensíveis
git filter-repo \
  --invert-paths \
  --paths README.md \
  --paths README_CH.md \
  --paths secrets.txt \
  --paths backend/.env \
  --paths secure/config/google.json \
  --paths secure/config/entra.json \
  --refs --tag-rename '':'removed-by-filter'

# Aplicar substituições de texto (substituir valores encontrados por REDACTED)
if [ -f "$REPLACE_RULES" ]; then
  git filter-repo --replace-text "$REPLACE_RULES"
else
  echo "Aviso: $REPLACE_RULES não encontrado. Só a remoção de paths foi executada."
fi

# Limpeza final
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Histórico limpo. Verifique refs e testes locais antes de pushar." 

echo "Para push do mirror limpo: git remote add cleaned <new-repo-url> && git push --mirror cleaned"
