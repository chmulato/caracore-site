"""
Teste do endpoint /api/admin/logs
"""
import requests
import json

def test_admin_logs():
    base_url = "http://127.0.0.1:5051"
    
    print("=" * 60)
    print("TESTE: Endpoint /api/admin/logs")
    print("=" * 60)
    
    # Teste 1: Buscar logs de hoje
    print("\n[1] Buscando logs de 2025-10-31 (limit=5)...")
    try:
        response = requests.get(
            f"{base_url}/api/admin/logs",
            params={"date": "2025-10-31", "limit": 5}
        )
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Total de logs: {data.get('total')}")
            print(f"Logs retornados: {len(data.get('logs', []))}")
            print(f"Data: {data.get('date')}")
            print(f"Has more: {data.get('has_more')}")
            
            if data.get('logs'):
                print("\nPrimeiro log:")
                first_log = data['logs'][0]
                print(json.dumps(first_log, indent=2, ensure_ascii=False))
        else:
            print(f"Erro: {response.text}")
    except Exception as e:
        print(f"Erro na requisição: {e}")
    
    # Teste 2: Filtrar por event_type
    print("\n" + "=" * 60)
    print("[2] Filtrando por event_type=login...")
    try:
        response = requests.get(
            f"{base_url}/api/admin/logs",
            params={"date": "2025-10-31", "event_type": "login", "limit": 10}
        )
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Total de logs (filtrados): {len(data.get('logs', []))}")
            for log in data.get('logs', []):
                print(f"  - {log.get('timestamp')}: {log.get('message')}")
        else:
            print(f"Erro: {response.text}")
    except Exception as e:
        print(f"Erro na requisição: {e}")
    
    # Teste 3: Paginação
    print("\n" + "=" * 60)
    print("[3] Testando paginação (offset=5, limit=3)...")
    try:
        response = requests.get(
            f"{base_url}/api/admin/logs",
            params={"date": "2025-10-31", "offset": 5, "limit": 3}
        )
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Logs retornados: {len(data.get('logs', []))}")
            print(f"Offset: {data.get('offset')}")
            print(f"Limit: {data.get('limit')}")
            print(f"Total: {data.get('total')}")
        else:
            print(f"Erro: {response.text}")
    except Exception as e:
        print(f"Erro na requisição: {e}")
    
    # Teste 4: Health check detalhado
    print("\n" + "=" * 60)
    print("[4] Testando /health/detailed...")
    try:
        response = requests.get(f"{base_url}/health/detailed")
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Status geral: {data.get('status')}")
            print(f"Checks realizados: {len(data.get('checks', []))}")
            for check in data.get('checks', []):
                status_icon = "✅" if check.get('status') == 'healthy' else "⚠️" if check.get('status') == 'degraded' else "❌"
                print(f"  {status_icon} {check.get('name')}: {check.get('message')}")
        else:
            print(f"Erro: {response.text}")
    except Exception as e:
        print(f"Erro na requisição: {e}")
    
    print("\n" + "=" * 60)
    print("TESTES CONCLUÍDOS")
    print("=" * 60)
    print("\n📊 Acesse o dashboard em: http://localhost:8080/secure/admin-logs.html")
    print("\n")

if __name__ == "__main__":
    test_admin_logs()
