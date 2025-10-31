"""
Validação do Dashboard de Auditoria - Fase 3
Testa os endpoints novos no Azure
"""
import requests
import json

AZURE_BASE_URL = "https://caracore-backend.azurewebsites.net"

def test_health_detailed():
    """Testa o endpoint /health/detailed"""
    print("\n" + "="*70)
    print("1️⃣  TESTE: /health/detailed")
    print("="*70)
    
    try:
        response = requests.get(f"{AZURE_BASE_URL}/health/detailed", timeout=10)
        print(f"✅ Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            status = data.get('status', 'unknown')
            
            status_emoji = {
                'healthy': '🟢',
                'degraded': '🟡',
                'unhealthy': '🔴'
            }.get(status, '❓')
            
            print(f"{status_emoji} Status Geral: {status.upper()}")
            print(f"\n📋 Checks realizados:")
            
            checks = data.get('checks', {})
            for check_name, check_data in checks.items():
                if isinstance(check_data, dict):
                    check_status = check_data.get('status', 'unknown')
                    emoji = '✅' if check_status == 'ok' else '⚠️' if check_status == 'degraded' else '❌'
                    print(f"  {emoji} {check_name}: {check_status}")
            
            return True
        else:
            print(f"❌ Erro: {response.status_code} - {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False


def test_admin_logs():
    """Testa o endpoint /api/admin/logs"""
    print("\n" + "="*70)
    print("2️⃣  TESTE: /api/admin/logs")
    print("="*70)
    
    try:
        # Teste básico
        response = requests.get(
            f"{AZURE_BASE_URL}/api/admin/logs",
            params={"date": "2025-10-31", "limit": 5},
            timeout=10
        )
        print(f"✅ Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            total = data.get('total', 0)
            logs_returned = len(data.get('logs', []))
            
            print(f"📊 Total de logs: {total}")
            print(f"📄 Logs retornados: {logs_returned}")
            print(f"📅 Data: {data.get('date')}")
            print(f"⏭️  Has more: {data.get('has_more')}")
            
            if logs_returned > 0:
                print(f"\n📝 Tipos de eventos encontrados:")
                event_types = {}
                for log in data.get('logs', []):
                    event_type = log.get('event_type', 'unknown')
                    level = log.get('level', 'info')
                    event_types[event_type] = event_types.get(event_type, 0) + 1
                    
                    # Emoji por nível
                    level_emoji = {
                        'info': 'ℹ️',
                        'warning': '⚠️',
                        'error': '❌',
                        'success': '✅'
                    }.get(level, '📌')
                    
                for event_type, count in event_types.items():
                    print(f"  • {event_type}: {count}")
                
                # Mostrar primeiro log
                print(f"\n🔍 Exemplo de log:")
                first_log = data['logs'][0]
                print(f"  Timestamp: {first_log.get('timestamp')}")
                print(f"  Event Type: {first_log.get('event_type')}")
                print(f"  Message: {first_log.get('message')}")
                print(f"  Provider: {first_log.get('provider', 'N/A')}")
                print(f"  User: {first_log.get('user_email', 'N/A')}")
            
            return True
        else:
            print(f"❌ Erro: {response.status_code} - {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False


def test_filters():
    """Testa filtros do endpoint"""
    print("\n" + "="*70)
    print("3️⃣  TESTE: Filtros")
    print("="*70)
    
    try:
        # Teste com filtro de event_type
        response = requests.get(
            f"{AZURE_BASE_URL}/api/admin/logs",
            params={
                "date": "2025-10-31",
                "event_type": "login",
                "limit": 10
            },
            timeout=10
        )
        
        print(f"✅ Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            logs = data.get('logs', [])
            
            print(f"🔍 Filtro: event_type=login")
            print(f"📄 Logs retornados: {len(logs)}")
            
            # Verificar se todos são login
            all_login = all(log.get('event_type') == 'login' for log in logs)
            if all_login:
                print(f"✅ Todos os logs são do tipo 'login'")
            else:
                print(f"⚠️  Alguns logs não são do tipo 'login'")
            
            return all_login
        else:
            print(f"❌ Erro: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False


def test_pagination():
    """Testa paginação"""
    print("\n" + "="*70)
    print("4️⃣  TESTE: Paginação")
    print("="*70)
    
    try:
        # Página 1
        response1 = requests.get(
            f"{AZURE_BASE_URL}/api/admin/logs",
            params={"date": "2025-10-31", "limit": 5, "offset": 0},
            timeout=10
        )
        
        # Página 2
        response2 = requests.get(
            f"{AZURE_BASE_URL}/api/admin/logs",
            params={"date": "2025-10-31", "limit": 5, "offset": 5},
            timeout=10
        )
        
        if response1.ok and response2.ok:
            data1 = response1.json()
            data2 = response2.json()
            
            logs1 = data1.get('logs', [])
            logs2 = data2.get('logs', [])
            
            print(f"📄 Página 1 (offset=0): {len(logs1)} logs")
            print(f"📄 Página 2 (offset=5): {len(logs2)} logs")
            
            # Verificar se são diferentes
            if logs1 and logs2:
                first_log_p1 = logs1[0].get('timestamp')
                first_log_p2 = logs2[0].get('timestamp')
                
                if first_log_p1 != first_log_p2:
                    print(f"✅ Paginação funcionando (logs diferentes)")
                    return True
                else:
                    print(f"⚠️  Logs parecem iguais")
                    return False
            else:
                print(f"⚠️  Não há logs suficientes para testar paginação")
                return False
        else:
            print(f"❌ Erro nas requisições")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False


def main():
    """Executa todos os testes"""
    print("\n" + "🎯"*35)
    print("   VALIDAÇÃO DO DASHBOARD DE AUDITORIA - FASE 3")
    print("🎯"*35)
    
    results = {
        'health_detailed': test_health_detailed(),
        'admin_logs': test_admin_logs(),
        'filters': test_filters(),
        'pagination': test_pagination()
    }
    
    print("\n" + "="*70)
    print("📊 RESUMO DOS TESTES")
    print("="*70)
    
    total = len(results)
    passed = sum(1 for result in results.values() if result)
    
    for test_name, result in results.items():
        emoji = "✅" if result else "❌"
        print(f"{emoji} {test_name}: {'PASSOU' if result else 'FALHOU'}")
    
    print(f"\n🎯 Total: {passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("\n📊 Dashboard disponível em:")
        print("   https://www.caracore.com.br/secure/admin-logs.html")
        print("   (após merge e publicação)")
    else:
        print(f"\n⚠️  {total - passed} teste(s) falharam")
    
    print("\n" + "="*70 + "\n")


if __name__ == "__main__":
    main()
