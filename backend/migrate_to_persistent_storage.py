#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Migração para Armazenamento Persistente

Migra dados de /app/data para /home/data (Azure Files mount)
Execute este script uma vez após configurar o Azure Files mount.

Uso:
    python migrate_to_persistent_storage.py
"""

import json
import shutil
import os
import sys
from pathlib import Path
from datetime import datetime

# Caminhos
OLD_DATA_DIR = Path('/app/data')
NEW_DATA_DIR = Path('/home/data')
OLD_AUTHORIZED_USERS = OLD_DATA_DIR / 'authorized_users.json'
NEW_AUTHORIZED_USERS = NEW_DATA_DIR / 'authorized_users.json'
OLD_BACKUP_DIR = OLD_DATA_DIR / 'backups'
NEW_BACKUP_DIR = NEW_DATA_DIR / 'backups'

def migrate_data():
    """Migrar dados do diretório antigo para o novo"""
    print("=" * 60)
    print("MIGRAÇÃO PARA ARMAZENAMENTO PERSISTENTE")
    print("=" * 60)
    
    # Verificar se o diretório de destino existe
    if not NEW_DATA_DIR.exists():
        print(f"\n[ERRO] Diretório de destino não encontrado: {NEW_DATA_DIR}")
        print("   Configure o Azure Files mount primeiro!")
        print("   Veja: docs/AZURE_PERSISTENT_STORAGE.md")
        return False
    
    # Verificar se já existe dados no destino
    if NEW_AUTHORIZED_USERS.exists():
        print(f"\n[AVISO] Arquivo já existe no destino: {NEW_AUTHORIZED_USERS}")
        resposta = input("   Deseja sobrescrever? (s/N): ").strip().lower()
        if resposta != 's':
            print("   Migração cancelada.")
            return False
    
    # Verificar se existe dados no origem
    if not OLD_AUTHORIZED_USERS.exists():
        print(f"\n[AVISO] Nenhum dado encontrado em: {OLD_AUTHORIZED_USERS}")
        print("   Nada para migrar.")
        return True
    
    try:
        # Criar diretórios de destino
        NEW_DATA_DIR.mkdir(parents=True, exist_ok=True)
        NEW_BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
        # Ler dados antigos
        print(f"\n[INFO] Lendo dados de: {OLD_AUTHORIZED_USERS}")
        with open(OLD_AUTHORIZED_USERS, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validar dados
        if not isinstance(data, dict):
            print("[ERRO] Dados inválidos no arquivo JSON")
            return False
        
        # Contar itens
        users_count = len(data.get('users', []))
        pending_count = len(data.get('pending_requests', []))
        print(f"[INFO] Encontrados: {users_count} usuários, {pending_count} solicitações pendentes")
        
        # Salvar no novo local
        print(f"[INFO] Salvando em: {NEW_AUTHORIZED_USERS}")
        with open(NEW_AUTHORIZED_USERS, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Migrar backups se existirem
        if OLD_BACKUP_DIR.exists():
            backups = list(OLD_BACKUP_DIR.glob('*.json'))
            if backups:
                print(f"[INFO] Migrando {len(backups)} arquivos de backup...")
                for backup_file in backups:
                    dest_file = NEW_BACKUP_DIR / backup_file.name
                    shutil.copy2(backup_file, dest_file)
                    print(f"   Migrado: {backup_file.name}")
        
        # Atualizar timestamp
        data['updated_at'] = datetime.utcnow().isoformat() + 'Z'
        data['migrated_at'] = datetime.utcnow().isoformat() + 'Z'
        data['migration_note'] = 'Migrado para armazenamento persistente Azure Files'
        
        # Salvar novamente com metadata atualizada
        with open(NEW_AUTHORIZED_USERS, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print("\n[OK] Migração concluída com sucesso!")
        print(f"   Arquivo salvo em: {NEW_AUTHORIZED_USERS}")
        print("\n[IMPORTANTE] Após verificar que tudo está funcionando:")
        print("   1. Reinicie o Web App")
        print("   2. Verifique se os dados estão sendo lidos de /home/data")
        print("   3. Os dados antigos em /app/data podem ser removidos")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"\n[ERRO] Erro ao decodificar JSON: {e}")
        return False
    except Exception as e:
        print(f"\n[ERRO] Erro durante migração: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = migrate_data()
    sys.exit(0 if success else 1)

