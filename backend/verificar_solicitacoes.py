#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar solicitações de acesso pendentes no backend
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

def verificar_solicitacoes():
    """Verificar solicitações pendentes no arquivo JSON"""
    print("=" * 60)
    print("VERIFICAÇÃO DE SOLICITAÇÕES DE ACESSO")
    print("=" * 60)
    
    # Verificar se o arquivo existe
    if not AUTHORIZED_USERS_FILE.exists():
        print(f"\n[ERRO] Arquivo não encontrado: {AUTHORIZED_USERS_FILE}")
        print("   O arquivo de dados não existe ainda.")
        return
    
    # Ler o arquivo
    try:
        with open(AUTHORIZED_USERS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"\n[ERRO] Erro ao ler JSON: {e}")
        return
    except Exception as e:
        print(f"\n[ERRO] Erro ao abrir arquivo: {e}")
        return
    
    # Informações gerais
    print(f"\nArquivo: {AUTHORIZED_USERS_FILE}")
    print(f"Última atualização: {data.get('updated_at', 'N/A')}")
    print(f"Versão: {data.get('version', 'N/A')}")
    
    # Usuários autorizados
    users = data.get('users', [])
    print(f"\nUsuários autorizados: {len(users)}")
    for user in users:
        status = "[ATIVO]" if user.get('status') == 'active' else "[INATIVO]"
        print(f"   {status} {user.get('email')} ({user.get('role')})")
    
    # Solicitações pendentes
    pending_requests = data.get('pending_requests', [])
    print(f"\nSolicitações pendentes: {len(pending_requests)}")
    
    if len(pending_requests) == 0:
        print("   [AVISO] Nenhuma solicitação pendente encontrada.")
    else:
        print("\n   Detalhes das solicitações:")
        for i, request in enumerate(pending_requests, 1):
            print(f"\n   [{i}] Solicitação:")
            print(f"       Email: {request.get('email', 'N/A')}")
            print(f"       Nome: {request.get('name', 'N/A')}")
            print(f"       Provedor: {request.get('provider', 'N/A')}")
            print(f"       Status: {request.get('status', 'N/A')}")
            print(f"       Solicitado em: {request.get('requested_at', 'N/A')}")
            if request.get('message'):
                message = request.get('message', '')[:100]
                print(f"       Mensagem: {message}...")
    
    # Log de auditoria (últimas 5 entradas relacionadas a solicitações)
    audit_log = data.get('audit_log', [])
    access_requests_logs = [
        log for log in audit_log 
        if 'access_requested' in log.get('action', '').lower() or 
           'request' in log.get('action', '').lower()
    ]
    
    if access_requests_logs:
        print(f"\nLogs de solicitações (últimas 5):")
        for log in access_requests_logs[-5:]:
            print(f"   • {log.get('timestamp', 'N/A')}: {log.get('action', 'N/A')}")
            print(f"     {log.get('details', 'N/A')}")
    
    # Resumo
    print("\n" + "=" * 60)
    print("RESUMO:")
    print(f"   Total de usuários: {len(users)}")
    print(f"   Solicitações pendentes: {len(pending_requests)}")
    print(f"   Entradas no log: {len(audit_log)}")
    print("=" * 60)
    
    # Verificar por email específico (se fornecido)
    if len(sys.argv) > 1:
        email = sys.argv[1].lower().strip()
        print(f"\nBuscando solicitação para: {email}")
        
        found = False
        for request in pending_requests:
            if request.get('email', '').lower() == email:
                print(f"\n[OK] Solicitação encontrada!")
                print(json.dumps(request, indent=2, ensure_ascii=False))
                found = True
                break
        
        if not found:
            print(f"[ERRO] Nenhuma solicitação encontrada para {email}")
            
            # Verificar se já está autorizado
            for user in users:
                if user.get('email', '').lower() == email:
                    print(f"[INFO] Este email já está autorizado como {user.get('role')}")
                    break

if __name__ == "__main__":
    verificar_solicitacoes()

