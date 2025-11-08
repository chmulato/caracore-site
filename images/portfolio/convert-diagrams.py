#!/usr/bin/env python3
"""
Script para converter diagramas Mermaid (.mmd) para PNG
Requer: npm install -g @mermaid-js/mermaid-cli
"""

import os
import subprocess
import sys
from pathlib import Path
from shutil import which


def print_colored(message, color="white"):
    """Imprime mensagem colorida no console"""
    colors = {
        "cyan": "\033[96m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "red": "\033[91m",
        "gray": "\033[90m",
        "white": "\033[97m",
        "reset": "\033[0m"
    }
    
    color_code = colors.get(color.lower(), colors["white"])
    reset = colors["reset"]
    print(f"{color_code}{message}{reset}")


def check_mmdc_installed():
    """Verifica se o Mermaid CLI (mmdc) está instalado"""
    mmdc_path = which("mmdc")
    
    if not mmdc_path:
        print_colored("\nERRO: Mermaid CLI (mmdc) não está instalado!", "red")
        print()
        print_colored("Para instalar, execute:", "yellow")
        print_colored("  npm install -g @mermaid-js/mermaid-cli", "white")
        print()
        print_colored("Ou com Chocolatey:", "yellow")
        print_colored("  choco install mermaid-cli", "white")
        print()
        return None
    
    return mmdc_path


def convert_diagram(input_file, output_file, width=1920, height=1080, 
                    background="white", scale=2):
    """
    Converte um diagrama Mermaid para PNG
    
    Args:
        input_file: Caminho do arquivo .mmd
        output_file: Caminho do arquivo .png de saída
        width: Largura da imagem (padrão: 1920)
        height: Altura da imagem (padrão: 1080)
        background: Cor de fundo (padrão: white)
        scale: Escala de qualidade (padrão: 2)
    
    Returns:
        True se sucesso, False caso contrário
    """
    try:
        # Monta o comando mmdc
        cmd = [
            "mmdc",
            "-i", str(input_file),
            "-o", str(output_file),
            "-w", str(width),
            "-H", str(height),
            "-b", background,
            "-s", str(scale)
        ]
        
        # Executa o comando (shell=True para Windows)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            shell=True
        )
        
        return True
        
    except subprocess.CalledProcessError as e:
        print_colored(f"  ✗ Erro ao executar mmdc: {e.stderr}", "red")
        return False
    except Exception as e:
        print_colored(f"  ✗ Erro: {str(e)}", "red")
        return False


def format_file_size(size_bytes):
    """Formata tamanho do arquivo em KB"""
    return f"{size_bytes / 1024:.2f} KB"


def main():
    """Função principal"""
    print_colored("\n=== Conversor de Diagramas Mermaid para PNG ===", "cyan")
    print()
    
    # Verifica se mmdc está instalado
    mmdc_path = check_mmdc_installed()
    if not mmdc_path:
        return 1
    
    print_colored(f"Mermaid CLI encontrado: {mmdc_path}", "green")
    print()
    
    # Define o diretório dos diagramas
    portfolio_dir = Path(r"D:\dev\site\cara-core\images\portfolio")
    
    # Lista de arquivos para converter
    diagramas = [
        "area51-architecture.mmd",
        "caracore-hub-architecture.mmd",
        "caracore-seed-architecture.mmd",
        "reino-oidc-journey.mmd"
    ]
    
    # Configuração de qualidade para PNG
    width = 1920
    height = 1080
    background_color = "white"
    scale = 2
    
    print_colored("Iniciando conversão dos diagramas...", "cyan")
    print()
    
    # Converte cada diagrama
    converted_files = []
    
    for diagrama in diagramas:
        input_file = portfolio_dir / diagrama
        output_file = input_file.with_suffix('.png')
        
        if not input_file.exists():
            print_colored(f"Arquivo não encontrado: {input_file}", "red")
            print()
            continue
        
        print_colored(f"Convertendo: {diagrama}", "yellow")
        
        success = convert_diagram(
            input_file,
            output_file,
            width=width,
            height=height,
            background=background_color,
            scale=scale
        )
        
        if success and output_file.exists():
            file_size = output_file.stat().st_size
            print_colored(
                f"  ✓ Sucesso! Arquivo gerado: {output_file.name} "
                f"({format_file_size(file_size)})",
                "green"
            )
            converted_files.append(output_file)
        else:
            print_colored("  ✗ Erro ao gerar arquivo PNG", "red")
        
        print()
    
    # Resumo final
    print_colored("=== Conversão Concluída ===", "cyan")
    print()
    print_colored("Os arquivos PNG foram salvos em:", "white")
    print_colored(str(portfolio_dir), "cyan")
    print()
    
    # Lista todos os arquivos PNG no diretório
    print_colored("Arquivos PNG disponíveis:", "white")
    png_files = sorted(portfolio_dir.glob("*.png"))
    
    if png_files:
        for png_file in png_files:
            file_size = png_file.stat().st_size
            status = "✓" if png_file in converted_files else " "
            print_colored(
                f"  {status} {png_file.name} ({format_file_size(file_size)})",
                "gray"
            )
    else:
        print_colored("  Nenhum arquivo PNG encontrado.", "gray")
    
    print()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        print_colored("\nOperação cancelada pelo usuário.", "yellow")
        sys.exit(130)
    except Exception as e:
        print()
        print_colored(f"\nErro inesperado: {str(e)}", "red")
        sys.exit(1)
