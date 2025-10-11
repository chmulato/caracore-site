"""
🔑 CONFIGURAR GOOGLE CLIENT SECRET - AZURE
==========================================

Para obter o GOOGLE_CLIENT_SECRET:
1. Acesse: https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Busque: 1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com
4. Clique no ícone 'olho' para ver o secret

Cole o valor aqui e pressione Enter:
"""

import subprocess
import sys

def configurar_google_secret():
    """Configura o Google Client Secret no Azure App Service"""
    
    print("🔑 CONFIGURAR GOOGLE CLIENT SECRET")
    print("=" * 50)
    print()
    print("Para obter o GOOGLE_CLIENT_SECRET:")
    print("1. Acesse: https://console.cloud.google.com/")
    print("2. APIs & Services → Credentials")
    print("3. Busque: 1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com")
    print("4. Clique no ícone 'olho' para ver o secret")
    print()
    
    # Solicitar Client Secret
    client_secret = input("Cole o GOOGLE_CLIENT_SECRET aqui: ").strip()
    
    if not client_secret:
        print("❌ Client Secret é obrigatório!")
        return False
        
    if not client_secret.startswith('GOCSPX-'):
        print("⚠️ Aviso: Client Secret deve começar com 'GOCSPX-'")
        if input("Continuar mesmo assim? (s/N): ").lower() != 's':
            return False
    
    print(f"\n🚀 Configurando GOOGLE_CLIENT_SECRET no Azure...")
    
    # Configurar no Azure App Service
    cmd = [
        'az', 'webapp', 'config', 'appsettings', 'set',
        '--name', 'caracore-backend',
        '--resource-group', 'rg-caracore',
        '--settings', f'GOOGLE_CLIENT_SECRET={client_secret}'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("✅ GOOGLE_CLIENT_SECRET configurado com sucesso!")
        
        # Testar endpoint
        print("\n🧪 Testando endpoint /health...")
        test_cmd = ['curl', '-s', 'https://caracore-backend.azurewebsites.net/health']
        test_result = subprocess.run(test_cmd, capture_output=True, text=True)
        
        if test_result.returncode == 0:
            print("✅ Backend respondendo!")
            print(f"Response: {test_result.stdout}")
        else:
            print("⚠️ Backend pode estar reiniciando...")
            
        print("\n✅ CONFIGURAÇÃO COMPLETA!")
        print("\nPróximos passos:")
        print("1. Aguarde ~2 minutos para reinicialização completa")
        print("2. Teste login Google em: https://www.caracore.com.br")
        print("3. Verifique logs se necessário: az webapp log tail --name caracore-backend --resource-group rg-caracore")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro configurando: {e}")
        print(f"Stderr: {e.stderr}")
        return False

if __name__ == "__main__":
    if configurar_google_secret():
        print("\n🎉 Google OAuth configurado com sucesso!")
    else:
        print("\n❌ Falha na configuração")
        sys.exit(1)