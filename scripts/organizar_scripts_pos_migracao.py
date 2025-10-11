"""
🗂️ ORGANIZAÇÃO DOS SCRIPTS - LIMPEZA PÓS-MIGRAÇÃO
================================================

Este script organiza os scripts após a migração, movendo scripts de migração
para uma pasta de arquivo e mantendo apenas os scripts operacionais.
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

def organizar_scripts():
    """Organiza scripts em categorias após migração"""
    
    print("🗂️ ORGANIZAÇÃO DOS SCRIPTS PÓS-MIGRAÇÃO")
    print("=" * 50)
    print()
    
    # Diretórios
    scripts_dir = Path(".")
    arquivo_dir = scripts_dir / "arquivo_migracao_2025_10_11"
    
    # Scripts que devem ser arquivados (relacionados à migração)
    scripts_migracao = [
        "analisar_recursos_legados.py",
        "plano_migracao_recursos.py", 
        "remover_recursos_redundantes.py",
        "configurar_google_secret_azure.py",
        "implantar_backend_azure.py",
        "testar_configuracao_final.py",
        "reconfigurar_azure_vars.ps1"
    ]
    
    # Scripts que devem permanecer (operacionais)
    scripts_operacionais = [
        "checklist_infra.py",
        "infra_to_azure.py", 
        "deploy_to_azure.py",
        "teste_end_point_azure.py",
        "teste_end_point_local.py",
        "teste_keyvault_azure.py",
        "teste_keyvault_simples.py",
        "verificar_configuracao_completa_entra.py",
        "diagnosticar_google_callback.py",
        "verificar_referencias_legadas.py"
    ]
    
    # Scripts deprecados (que referenciam recursos removidos)
    scripts_deprecados = [
        "teste_keyvault_azure.py",  # Key Vault removido
        "teste_keyvault_simples.py"  # Key Vault removido
    ]
    
    print("📋 CATEGORIZAÇÃO DOS SCRIPTS:")
    print("-" * 35)
    print()
    
    print("🗃️ Scripts de migração (para arquivo):")
    for script in scripts_migracao:
        status = "✅" if (scripts_dir / script).exists() else "❌"
        print(f"   {status} {script}")
    
    print()
    print("⚙️ Scripts operacionais (manter):")
    for script in scripts_operacionais:
        if script not in scripts_deprecados:
            status = "✅" if (scripts_dir / script).exists() else "❌"
            print(f"   {status} {script}")
    
    print()
    print("🗑️ Scripts deprecados (remover/arquivar):")
    for script in scripts_deprecados:
        status = "✅" if (scripts_dir / script).exists() else "❌"
        print(f"   {status} {script}")
    
    print()
    
    # Confirmação
    resposta = input("Deseja prosseguir com a organização? (s/N): ")
    if resposta.lower() != 's':
        print("❌ Operação cancelada.")
        return False
    
    # Criar diretório de arquivo
    print(f"\n📁 Criando diretório de arquivo: {arquivo_dir}")
    arquivo_dir.mkdir(exist_ok=True)
    
    # Criar README no diretório de arquivo
    readme_content = f"""# Arquivo de Scripts de Migração

Data da migração: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Contexto
Estes scripts foram utilizados para migrar de:
- `api-caracore.azurewebsites.net` → `caracore-backend.azurewebsites.net`
- `kv-api-caracore` (Key Vault) → App Service Settings diretas
- `plan-caracore` → `caracore-plan`

## Scripts Arquivados
- **analisar_recursos_legados.py** - Análise dos recursos antes da remoção
- **plano_migracao_recursos.py** - Plano de migração segura
- **remover_recursos_redundantes.py** - Execução da remoção
- **implantar_backend_azure.py** - Deploy do novo backend
- **configurar_google_secret_azure.py** - Configuração do Google Client Secret
- **testar_configuracao_final.py** - Testes pós-migração

## Status
✅ Migração concluída com sucesso
✅ Recursos legados removidos
✅ Documentação atualizada
✅ Scripts operacionais funcionando
"""
    
    (arquivo_dir / "README.md").write_text(readme_content, encoding="utf-8")
    
    # Mover scripts de migração
    print("\n🗃️ Arquivando scripts de migração...")
    arquivados = 0
    for script in scripts_migracao:
        script_path = scripts_dir / script
        if script_path.exists():
            dest_path = arquivo_dir / script
            shutil.move(str(script_path), str(dest_path))
            print(f"   ✅ {script} → {dest_path}")
            arquivados += 1
        else:
            print(f"   ⚠️ {script} não encontrado")
    
    # Remover scripts deprecados
    print("\n🗑️ Removendo scripts deprecados...")
    removidos = 0
    for script in scripts_deprecados:
        script_path = scripts_dir / script
        if script_path.exists():
            # Fazer backup antes de remover
            backup_path = arquivo_dir / f"{script}.deprecated"
            shutil.copy2(str(script_path), str(backup_path))
            script_path.unlink()
            print(f"   ✅ {script} removido (backup em {backup_path})")
            removidos += 1
        else:
            print(f"   ⚠️ {script} não encontrado")
    
    print()
    print("✅ ORGANIZAÇÃO CONCLUÍDA!")
    print(f"   📁 Scripts arquivados: {arquivados}")
    print(f"   🗑️ Scripts removidos: {removidos}")
    print(f"   📂 Arquivo em: {arquivo_dir}")
    
    print()
    print("📋 SCRIPTS RESTANTES (OPERACIONAIS):")
    for arquivo in sorted(scripts_dir.glob("*.py")):
        if arquivo.name != __file__.split("/")[-1]:  # Excluir este script
            print(f"   ✅ {arquivo.name}")
    
    return True

if __name__ == "__main__":
    organizar_scripts()