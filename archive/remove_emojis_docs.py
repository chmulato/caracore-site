#!/usr/bin/env python3
"""
Remove todos os emojis de arquivos Markdown na pasta docs/
"""
import re
import os
from pathlib import Path

# Lista de emojis comuns a remover
EMOJIS = [
    '✅', '❌', '⚠️', '🎯', '🔍', '🚀', '📝', '📊', '🔐', '⏱️',
    '☁️', '🐳', '🧪', '✓', '×', '➜', '🎉', '💡', '🔒', '📁',
    '📂', '🗂️', '📄', '📋', '📌', '🏗️', '⚙️', '🔧', '🛠️', '🔨',
    '⚡', '💻', '🖥️', '📱', '🌐', '🔗', '📡', '🛡️', '🎨', '🔔'
]

# Padrões de substituição
PATTERNS = {
    # Remove emojis isolados no início de linha ou após ##
    r'^(#{1,6}\s*)([' + ''.join(EMOJIS) + r']+)\s*': r'\1',
    # Remove emojis após ## (títulos)
    r'(#{1,6}.*?)([' + ''.join(EMOJIS) + r']+)(\s*)$': r'\1\3',
    # Remove emojis no meio de texto (lista, parágrafos)
    r'\s*[' + ''.join(EMOJIS) + r']+\s*': ' ',
}

def clean_emoji(text):
    """Remove emojis do texto"""
    for pattern, replacement in PATTERNS.items():
        text = re.sub(pattern, replacement, text, flags=re.MULTILINE)
    
    # Remove emojis isolados
    for emoji in EMOJIS:
        text = text.replace(emoji, '')
    
    # Limpa múltiplos espaços
    text = re.sub(r' {2,}', ' ', text)
    # Limpa linhas vazias múltiplas
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text

def process_file(filepath):
    """Processa um arquivo Markdown"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()
        
        cleaned = clean_emoji(original)
        
        if original != cleaned:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned)
            print(f"✓ Limpo: {filepath}")
            return True
        else:
            print(f"- Sem alterações: {filepath}")
            return False
    except Exception as e:
        print(f"✗ Erro em {filepath}: {e}")
        return False

def main():
    """Processa todos os arquivos .md na pasta docs/"""
    docs_path = Path(__file__).parent.parent / 'docs'
    
    print(f"Processando arquivos Markdown em: {docs_path}")
    print("-" * 60)
    
    md_files = list(docs_path.rglob('*.md'))
    print(f"Encontrados {len(md_files)} arquivos Markdown\n")
    
    modified = 0
    for md_file in sorted(md_files):
        if process_file(md_file):
            modified += 1
    
    print("-" * 60)
    print(f"\nResumo:")
    print(f"  Total de arquivos: {len(md_files)}")
    print(f"  Arquivos modificados: {modified}")
    print(f"  Sem alterações: {len(md_files) - modified}")

if __name__ == '__main__':
    main()
