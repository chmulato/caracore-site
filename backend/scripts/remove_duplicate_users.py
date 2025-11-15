#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para Remover Usuários Duplicados

Remove duplicatas mantendo apenas a primeira ocorrência de cada email.
Preserva a entrada mais recente (com base em approved_at ou created_at).

Uso:
    python scripts/remove_duplicate_users.py
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Adicionar diretório backend ao path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Importar módulos do backend
try:
    from authorization import AUTHORIZED_USERS_FILE, DATA_DIR
except ImportError:
    # Fallback para caminho local
    DATA_DIR = backend_dir / 'data'
    AUTHORIZED_USERS_FILE = DATA_DIR / 'authorized_users.json'

def remove_duplicates():
    """Remover usuários duplicados mantendo apenas a primeira ocorrência"""
    print("=" * 60)
    print("REMOVER USUÁRIOS DUPLICADOS")
    print("=" * 60)
    
    # Verificar se arquivo existe
    if not os.path.exists(AUTHORIZED_USERS_FILE):
        print(f"\n[ERRO] Arquivo não encontrado: {AUTHORIZED_USERS_FILE}")
        return False
    
    # Ler dados
    try:
        with open(AUTHORIZED_USERS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"\n[ERRO] Erro ao ler arquivo: {e}")
        return False
    
    users = data.get('users', [])
    initial_count = len(users)
    
    if initial_count == 0:
        print("\n[INFO] Nenhum usuário encontrado.")
        return True
    
    print(f"\n[INFO] Total de usuários antes: {initial_count}")
    
    # Agrupar por email (case-insensitive)
    email_groups = defaultdict(list)
    for i, user in enumerate(users):
        email_lower = user.get('email', '').lower()
        email_groups[email_lower].append((i, user))
    
    # Identificar duplicatas
    duplicates_found = []
    for email_lower, user_list in email_groups.items():
        if len(user_list) > 1:
            duplicates_found.append((email_lower, user_list))
    
    if not duplicates_found:
        print("\n[OK] Nenhuma duplicata encontrada!")
        return True
    
    print(f"\n[INFO] Encontradas {len(duplicates_found)} duplicatas:")
    for email_lower, user_list in duplicates_found:
        print(f"   - {email_lower}: {len(user_list)} ocorrências")
    
    # Remover duplicatas (manter a primeira ocorrência, ou a mais recente se houver approved_at)
    indices_to_remove = []
    for email_lower, user_list in duplicates_found:
        # Ordenar por approved_at ou created_at (mais recente primeiro)
        user_list.sort(key=lambda x: (
            x[1].get('approved_at', '') or x[1].get('created_at', ''),
        ), reverse=True)
        
        # Manter o primeiro (mais recente) e marcar os outros para remoção
        for i, (idx, user) in enumerate(user_list[1:], 1):
            indices_to_remove.append(idx)
            print(f"   [REMOVER] {user.get('email')} (índice {idx})")
    
    # Remover duplicatas (em ordem reversa para não afetar índices)
    indices_to_remove.sort(reverse=True)
    for idx in indices_to_remove:
        removed_user = users.pop(idx)
        print(f"   [REMOVIDO] {removed_user.get('email')}")
    
    # Atualizar dados
    data['users'] = users
    data['updated_at'] = datetime.utcnow().isoformat()
    
    # Adicionar ao log de auditoria
    if 'audit_log' not in data:
        data['audit_log'] = []
    
    data['audit_log'].append({
        "timestamp": datetime.utcnow().isoformat(),
        "action": "duplicates_removed",
        "details": f"Removidas {len(indices_to_remove)} duplicatas. Total antes: {initial_count}, depois: {len(users)}",
        "user": "system"
    })
    
    # Fazer backup
    backup_file = DATA_DIR / 'backups' / f'authorized_users_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    backup_file.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"\n[INFO] Backup criado: {backup_file}")
    except Exception as e:
        print(f"\n[AVISO] Erro ao criar backup: {e}")
    
    # Salvar dados atualizados
    try:
        with open(AUTHORIZED_USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        final_count = len(users)
        removed_count = initial_count - final_count
        
        print(f"\n[OK] Duplicatas removidas com sucesso!")
        print(f"   - Antes: {initial_count} usuários")
        print(f"   - Depois: {final_count} usuários")
        print(f"   - Removidos: {removed_count} duplicatas")
        
        return True
        
    except Exception as e:
        print(f"\n[ERRO] Erro ao salvar arquivo: {e}")
        return False

if __name__ == '__main__':
    success = remove_duplicates()
    sys.exit(0 if success else 1)

