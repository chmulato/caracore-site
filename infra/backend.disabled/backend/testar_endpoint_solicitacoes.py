#!/usr/bin/env python3
"""
Script para testar o endpoint de solicitações via API
"""
import requests
import json
import sys

def testar_endpoint_solicitacoes():
    """Testar endpoint GET /api/admin/access-requests"""
    
    # Configuração
    base_url = "https://caracore-backend-docker.azurewebsites.net"
    if len(sys.argv) > 1 and sys.argv[1] == "local":
        base_url = "http://localhost:5051"
    
    endpoint = f"{base_url}/api/admin/access-requests"
    
    print("=" * 60)
    print("TESTE: Endpoint /api/admin/access-requests")
    print("=" * 60)
    print(f"\nURL: {endpoint}")
    
    # Solicitar token do usuário
    print("\n[ATENCAO] Este endpoint requer autenticação de admin/super_admin")
    print("   Você precisa fornecer um token JWT válido.")
    print("\n   Opções:")
    print("   1. Obter token via login super admin em /secure/super-admin-setup.html")
    print("   2. Usar o token do localStorage do navegador")
    print("   3. Verificar diretamente o arquivo JSON com verificar_solicitacoes.py")
    
    token = input("\n   Digite o token JWT (ou pressione Enter para pular): ").strip()
    
    if not token:
        print("\n[ERRO] Token não fornecido. Use verificar_solicitacoes.py para verificar diretamente o arquivo.")
        return
    
    # Fazer requisição
    print(f"\nFazendo requisição GET para {endpoint}...")
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(endpoint, headers=headers, timeout=10)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print(f"[OK] Sucesso!")
            print(f"\nTotal de solicitações: {data.get('total', 0)}")
            
            requests_list = data.get('requests', [])
            if len(requests_list) == 0:
                print("\n[AVISO] Nenhuma solicitação encontrada.")
            else:
                print(f"\nSolicitações encontradas ({len(requests_list)}):")
                for i, req in enumerate(requests_list, 1):
                    print(f"\n   [{i}] {req.get('email', 'N/A')}")
                    print(f"       Nome: {req.get('name', 'N/A')}")
                    print(f"       Status: {req.get('status', 'N/A')}")
                    print(f"       Solicitado em: {req.get('requested_at', 'N/A')}")
            
            print("\nResposta completa:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
        else:
            print(f"[ERRO] Erro na requisição!")
            print(f"   Status: {response.status_code}")
            print(f"   Resposta: {response.text}")
            
            if response.status_code == 401:
                print("\n[DICA] Token inválido ou expirado. Faça login novamente.")
            elif response.status_code == 403:
                print("\n[DICA] Você não tem permissão de admin. Use uma conta de super_admin.")
                
    except requests.exceptions.RequestException as e:
        print(f"\n[ERRO] Erro na requisição: {e}")
    except Exception as e:
        print(f"\n[ERRO] Erro inesperado: {e}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    testar_endpoint_solicitacoes()

