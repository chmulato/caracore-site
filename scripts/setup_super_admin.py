#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Configuração do Super Administrador
Gera hash SHA-256 da senha para configuração no Azure App Service

Data: 2025-11-03
"""

import hashlib
import getpass
import secrets
import string

def generate_strong_password(length=16):
    """Gera uma senha forte aleatória"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

def hash_password(password):
    """Gera hash SHA-256 da senha"""
    return hashlib.sha256(password.encode()).hexdigest()

def main():
    print("=" * 80)
    print("CONFIGURAÇÃO DO SUPER ADMINISTRADOR - CaraCore")
    print("=" * 80)
    print()
    print("Este script irá gerar o hash SHA-256 da senha do super administrador")
    print("para ser configurado no Azure App Service.")
    print()
    print("Credenciais do Super Administrador:")
    print("  E-mail: suporte@caracore.com.br")
    print("  URL: https://www.caracore.com.br/secure/super-admin-setup.html")
    print()
    print("-" * 80)
    print()
    
    # Opções
    print("Escolha uma opção:")
    print("1. Digitar minha própria senha")
    print("2. Gerar senha forte automaticamente")
    print()
    
    choice = input("Opção (1 ou 2): ").strip()
    
    if choice == "1":
        # Senha manual
        print()
        password = getpass.getpass("Digite a senha: ")
        password_confirm = getpass.getpass("Confirme a senha: ")
        
        if password != password_confirm:
            print()
            print("[ERRO] As senhas não coincidem!")
            return
        
        if len(password) < 8:
            print()
            print("[ERRO] A senha deve ter pelo menos 8 caracteres!")
            return
            
    elif choice == "2":
        # Senha automática
        password = generate_strong_password(16)
        print()
        print("[OK] Senha forte gerada automaticamente!")
        print()
        print("[ATENCAO] Copie e guarde esta senha em local seguro!")
        print()
        print(f"Senha gerada: {password}")
        print()
        input("Pressione ENTER quando tiver copiado a senha... ")
        
    else:
        print()
        print("[ERRO] Opção inválida!")
        return
    
    # Gerar hash
    password_hash = hash_password(password)
    
    print()
    print("=" * 80)
    print("CONFIGURAÇÃO COMPLETA")
    print("=" * 80)
    print()
    print("[OK] Hash SHA-256 gerado com sucesso!")
    print()
    print("INFORMACOES PARA CONFIGURACAO NO AZURE:")
    print()
    print("-" * 80)
    print("Variável de Ambiente: SUPER_ADMIN_PASSWORD_HASH")
    print("Valor:")
    print(password_hash)
    print("-" * 80)
    print()
    print("PASSOS PARA CONFIGURAR NO AZURE APP SERVICE:")
    print()
    print("1. Acesse o Portal Azure: https://portal.azure.com")
    print("2. Navegue até: caracore-backend (App Service)")
    print("3. Menu lateral: Configuration → Application settings")
    print("4. Clique em: + New application setting")
    print("5. Preencha:")
    print("   - Name: SUPER_ADMIN_PASSWORD_HASH")
    print("   - Value: [cole o hash acima]")
    print("6. Clique em: OK")
    print("7. Clique em: Save (no topo da página)")
    print("8. Aguarde o App Service reiniciar")
    print()
    print("[IMPORTANTE] Também configure JWT_SECRET_KEY se ainda não estiver configurado:")
    print()
    
    # Gerar JWT secret
    jwt_secret = secrets.token_urlsafe(32)
    print("-" * 80)
    print("Variável de Ambiente: JWT_SECRET_KEY")
    print("Valor:")
    print(jwt_secret)
    print("-" * 80)
    print()
    print("[OK] Após configurar, teste o login em:")
    print("   https://www.caracore.com.br/secure/super-admin-setup.html")
    print()
    print("   E-mail: suporte@caracore.com.br")
    print(f"   Senha: {'[a senha digitada]' if choice == '1' else password}")
    print()
    print("=" * 80)
    print()
    
    # Atualizar secrets.txt
    print()
    update = input("Deseja atualizar o arquivo ../secrets.txt automaticamente? (S/n): ").strip().lower()
    
    if update != 'n':
        secrets_file = "../secrets.txt"
        try:
            # Ler arquivo atual
            with open(secrets_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Procurar e atualizar as linhas
            updated = False
            for i, line in enumerate(lines):
                if line.startswith('SUPER_ADMIN_PASSWORD_HASH='):
                    lines[i] = f'SUPER_ADMIN_PASSWORD_HASH={password_hash}\n'
                    updated = True
                elif line.startswith('JWT_SECRET_KEY='):
                    lines[i] = f'JWT_SECRET_KEY={jwt_secret}\n'
                    updated = True
            
            # Se não encontrou, adicionar no final
            if not updated:
                lines.append('\n# Super Administrador (gerado via setup_super_admin.py)\n')
                lines.append(f'SUPER_ADMIN_PASSWORD_HASH={password_hash}\n')
                lines.append(f'JWT_SECRET_KEY={jwt_secret}\n')
            
            # Salvar arquivo
            with open(secrets_file, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            
            print()
            print(f"[OK] Arquivo {secrets_file} atualizado com sucesso!")
            print()
            
        except FileNotFoundError:
            print()
            print(f"[AVISO] Arquivo {secrets_file} não encontrado.")
            print("   Crie o arquivo a partir do template secrets.txt.template")
            print()
        except Exception as e:
            print()
            print(f"[ERRO] Erro ao atualizar {secrets_file}: {str(e)}")
            print()
    
    # Salvar referência adicional
    save_ref = input("Deseja também salvar uma cópia de referência? (s/N): ").strip().lower()
    
    if save_ref == 's':
        filename = "super_admin_config_SECRET.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("CONFIGURAÇÃO DO SUPER ADMINISTRADOR - CaraCore\n")
            f.write("=" * 80 + "\n\n")
            f.write("[ATENCAO] Este arquivo contém informações sensíveis!\n")
            f.write("[ATENCAO] Mantenha em local seguro e NÃO faça commit no Git!\n\n")
            f.write("-" * 80 + "\n")
            f.write("E-mail: suporte@caracore.com.br\n")
            f.write(f"Senha: {password}\n")
            f.write("-" * 80 + "\n\n")
            f.write("AZURE APP SERVICE - Environment Variables:\n\n")
            f.write("SUPER_ADMIN_PASSWORD_HASH\n")
            f.write(f"{password_hash}\n\n")
            f.write("JWT_SECRET_KEY\n")
            f.write(f"{jwt_secret}\n\n")
            f.write("-" * 80 + "\n")
            f.write("URL de Login:\n")
            f.write("https://www.caracore.com.br/secure/super-admin-setup.html\n")
            f.write("-" * 80 + "\n")
        
        print()
        print(f"[OK] Cópia de referência salva em: {filename}")
        print("[ATENCAO] Este arquivo está marcado como SECRET e não será versionado!")
        print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print()
        print()
        print("[CANCELADO] Operação cancelada pelo usuário.")
    except Exception as e:
        print()
        print(f"[ERRO] Erro: {str(e)}")
