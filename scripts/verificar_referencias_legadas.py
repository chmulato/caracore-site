"""
🔍 VERIFICAÇÃO FINAL - REFERÊNCIAS LEGADAS
=========================================

Script para verificar se ainda existem referências aos recursos removidos
em toda a documentação e código.
"""

import os
import re

def verificar_referencias_legadas():
    """Verifica referências aos recursos removidos"""
    
    print("🔍 VERIFICAÇÃO FINAL - REFERÊNCIAS LEGADAS")
    print("=" * 50)
    print()
    
    # Recursos removidos para buscar
    recursos_removidos = [
        "api-caracore.azurewebsites.net",
        "kv-api-caracore", 
        "plan-caracore"
    ]
    
    # Diretórios para verificar
    diretorios = [
        "docs",
        "scripts", 
        "secure/testes",
        "."  # arquivos na raiz
    ]
    
    referencias_encontradas = []
    
    for diretorio in diretorios:
        if not os.path.exists(diretorio):
            continue
            
        print(f"📁 Verificando: {diretorio}/")
        
        # Listar arquivos
        if diretorio == ".":
            arquivos = [f for f in os.listdir(".") if f.endswith(('.md', '.py', '.js', '.html', '.txt'))]
        else:
            arquivos = []
            for root, dirs, files in os.walk(diretorio):
                for file in files:
                    if file.endswith(('.md', '.py', '.js', '.html', '.txt')):
                        arquivos.append(os.path.join(root, file))
        
        # Verificar cada arquivo
        for arquivo in arquivos:
            if diretorio == ".":
                caminho_arquivo = arquivo
            else:
                caminho_arquivo = arquivo
                
            try:
                with open(caminho_arquivo, 'r', encoding='utf-8', errors='ignore') as f:
                    conteudo = f.read()
                    
                for recurso in recursos_removidos:
                    if recurso in conteudo:
                        # Contar ocorrências
                        ocorrencias = conteudo.count(recurso)
                        referencias_encontradas.append({
                            'arquivo': caminho_arquivo,
                            'recurso': recurso,
                            'ocorrencias': ocorrencias
                        })
                        
            except Exception as e:
                print(f"   ⚠️ Erro lendo {caminho_arquivo}: {e}")
    
    print()
    print("📊 RESULTADO DA VERIFICAÇÃO")
    print("-" * 35)
    
    if not referencias_encontradas:
        print("✅ NENHUMA REFERÊNCIA LEGADA ENCONTRADA!")
        print("   Todos os recursos removidos foram limpos da documentação.")
        return True
    
    print(f"❌ ENCONTRADAS {len(referencias_encontradas)} REFERÊNCIAS LEGADAS:")
    print()
    
    # Agrupar por arquivo
    referencias_por_arquivo = {}
    for ref in referencias_encontradas:
        arquivo = ref['arquivo']
        if arquivo not in referencias_por_arquivo:
            referencias_por_arquivo[arquivo] = []
        referencias_por_arquivo[arquivo].append(ref)
    
    for arquivo, refs in referencias_por_arquivo.items():
        print(f"📄 {arquivo}:")
        for ref in refs:
            print(f"   - {ref['recurso']}: {ref['ocorrencias']} ocorrência(s)")
        print()
    
    print("🔧 AÇÕES RECOMENDADAS:")
    print("1. Atualizar os arquivos listados acima")
    print("2. Substituir referências legadas pelos novos recursos")
    print("3. Executar este script novamente para verificar")
    
    return False

def listar_arquivos_atualizados():
    """Lista arquivos que foram atualizados hoje"""
    
    print("\n📝 ARQUIVOS DE DOCUMENTAÇÃO ATUALIZADOS")
    print("-" * 45)
    
    arquivos_atualizados = [
        "docs/ARQUITETURA.md",
        "docs/DEPLOY.md", 
        "docs/PROJECT-CHECKLIST.md",
        "ATUALIZACAO-DOCUMENTACAO.md",
        "RELATORIO-REMOCAO-RECURSOS.md"
    ]
    
    for arquivo in arquivos_atualizados:
        if os.path.exists(arquivo):
            print(f"✅ {arquivo}")
        else:
            print(f"⚠️ {arquivo} (não encontrado)")

if __name__ == "__main__":
    resultado = verificar_referencias_legadas()
    listar_arquivos_atualizados()
    
    print(f"\n{'✅ VERIFICAÇÃO COMPLETA!' if resultado else '⚠️ PENDÊNCIAS ENCONTRADAS!'}")