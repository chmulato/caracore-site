#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para validar alterações recentes no backend
Valida: endpoint de status, IDs de solicitação, consentimento LGPD
"""
import json
import sys
import os
from pathlib import Path

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    os.system('chcp 65001 > nul 2>&1')
    sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

# Caminho do arquivo de dados
DATA_DIR = Path(__file__).parent / 'data'
AUTHORIZED_USERS_FILE = DATA_DIR / 'authorized_users.json'

def validar_alteracoes():
    """Validar alterações implementadas"""
    print("=" * 60)
    print("VALIDACAO DE ALTERACOES RECENTES")
    print("=" * 60)
    
    # Verificar se o arquivo existe
    if not AUTHORIZED_USERS_FILE.exists():
        print("\n[ERRO] Arquivo nao encontrado: {AUTHORIZED_USERS_FILE}")
        return False
    
    try:
        with open(AUTHORIZED_USERS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"\n[ERRO] Erro ao ler arquivo: {e}")
        return False
    
    print(f"\nArquivo: {AUTHORIZED_USERS_FILE}")
    print(f"Ultima atualizacao: {data.get('updated_at', 'N/A')}")
    
    # Validar 1: Solicitações pendentes têm ID
    print("\n" + "=" * 60)
    print("VALIDACAO 1: IDs em Solicitações Pendentes")
    print("=" * 60)
    
    pending_requests = data.get('pending_requests', [])
    print(f"\nTotal de solicitacoes pendentes: {len(pending_requests)}")
    
    if len(pending_requests) == 0:
        print("[AVISO] Nenhuma solicitacao pendente para validar")
    else:
        todas_com_id = True
        todas_com_lgpd = True
        
        for i, req in enumerate(pending_requests, 1):
            tem_id = 'id' in req and req['id']
            tem_lgpd = 'lgpd_consent' in req or 'lgpd_consent_timestamp' in req
            
            status_id = "[OK]" if tem_id else "[FALTA]"
            status_lgpd = "[OK]" if tem_lgpd else "[FALTA]"
            
            print(f"\n[{i}] {req.get('email', 'N/A')}")
            print(f"    ID: {status_id} {req.get('id', 'Nao possui')}")
            print(f"    LGPD: {status_lgpd} Consentimento: {req.get('lgpd_consent', 'Nao registrado')}")
            
            if not tem_id:
                todas_com_id = False
            if not tem_lgpd:
                todas_com_lgpd = False
        
        print(f"\n[RESULTADO]")
        print(f"   IDs presentes: {'SIM' if todas_com_id else 'NAO'}")
        print(f"   LGPD presente: {'SIM' if todas_com_lgpd else 'NAO'}")
    
    # Validar 2: Usuários aprovados têm dados LGPD
    print("\n" + "=" * 60)
    print("VALIDACAO 2: Dados LGPD em Usuarios Aprovados")
    print("=" * 60)
    
    users = data.get('users', [])
    print(f"\nTotal de usuarios: {len(users)}")
    
    if len(users) == 0:
        print("[AVISO] Nenhum usuario para validar")
    else:
        usuarios_com_lgpd = 0
        usuarios_sem_lgpd = 0
        
        for user in users:
            tem_lgpd = 'lgpd_consent' in user or 'lgpd_compliant' in user
            
            if tem_lgpd:
                usuarios_com_lgpd += 1
                print(f"\n[OK] {user.get('email', 'N/A')}")
                print(f"    LGPD Consent: {user.get('lgpd_consent', 'N/A')}")
                print(f"    LGPD Timestamp: {user.get('lgpd_consent_timestamp', 'N/A')}")
                print(f"    LGPD Compliant: {user.get('lgpd_compliant', 'N/A')}")
                print(f"    Data Purpose: {user.get('data_purpose', 'N/A')}")
            else:
                usuarios_sem_lgpd += 1
                print(f"\n[FALTA] {user.get('email', 'N/A')} - Sem dados LGPD")
        
        print(f"\n[RESULTADO]")
        print(f"   Usuarios com LGPD: {usuarios_com_lgpd}/{len(users)}")
        print(f"   Usuarios sem LGPD: {usuarios_sem_lgpd}/{len(users)}")
        
        if usuarios_sem_lgpd > 0:
            print(f"\n[AVISO] {usuarios_sem_lgpd} usuario(s) antigo(s) sem dados LGPD")
            print("   Estes sao usuarios criados antes da implementacao LGPD")
    
    # Validar 3: Estrutura de dados
    print("\n" + "=" * 60)
    print("VALIDACAO 3: Estrutura de Dados")
    print("=" * 60)
    
    campos_obrigatorios = ['version', 'users', 'pending_requests']
    estrutura_ok = True
    
    for campo in campos_obrigatorios:
        if campo in data:
            print(f"[OK] Campo '{campo}' presente")
        else:
            print(f"[ERRO] Campo '{campo}' ausente")
            estrutura_ok = False
    
    # Validar 4: Verificar se há solicitações com email específico
    if len(sys.argv) > 1:
        email = sys.argv[1].lower().strip()
        print("\n" + "=" * 60)
        print(f"VALIDACAO 4: Buscar Solicitacao para {email}")
        print("=" * 60)
        
        encontrada = False
        for req in pending_requests:
            if req.get('email', '').lower() == email:
                encontrada = True
                print(f"\n[OK] Solicitacao encontrada!")
                print(f"    ID: {req.get('id', 'N/A')}")
                print(f"    Nome: {req.get('name', 'N/A')}")
                print(f"    Status: {req.get('status', 'N/A')}")
                print(f"    LGPD Consent: {req.get('lgpd_consent', 'N/A')}")
                print(f"    LGPD Timestamp: {req.get('lgpd_consent_timestamp', 'N/A')}")
                print(f"\nDados completos:")
                print(json.dumps(req, indent=2, ensure_ascii=False))
                break
        
        if not encontrada:
            print(f"\n[AVISO] Nenhuma solicitacao encontrada para {email}")
            
            # Verificar se já está autorizado
            for user in users:
                if user.get('email', '').lower() == email:
                    print(f"[INFO] Este email ja esta autorizado")
                    print(f"    Role: {user.get('role', 'N/A')}")
                    print(f"    Status: {user.get('status', 'N/A')}")
                    print(f"    LGPD Compliant: {user.get('lgpd_compliant', 'N/A')}")
                    break
    
    # Resumo final
    print("\n" + "=" * 60)
    print("RESUMO DA VALIDACAO")
    print("=" * 60)
    print(f"   Estrutura OK: {'SIM' if estrutura_ok else 'NAO'}")
    print(f"   Solicitacoes pendentes: {len(pending_requests)}")
    print(f"   Usuarios autorizados: {len(users)}")
    print(f"   Usuarios com LGPD: {usuarios_com_lgpd if len(users) > 0 else 0}")
    print("=" * 60)
    
    return estrutura_ok

if __name__ == "__main__":
    validar_alteracoes()

