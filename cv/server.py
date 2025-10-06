import http.server
import socketserver
import os
from datetime import datetime

# Define a porta em que o servidor irá rodar
PORT = 8000

# Define o diretório que contém os arquivos do site (HTML, CSS, JS)
WEB_DIR = 'public'

# Cria um manipulador de requisições customizado para melhorar o log
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # O diretório de onde os arquivos serão servidos é passado aqui
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def log_message(self, format, *args):
        # Formata a mensagem de log para ser mais informativa
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        message = format % args
        print(f'[{timestamp}] {self.address_string()} - {message}')

# Configura o manipulador para servir os arquivos
Handler = CustomHandler

httpd = None
try:
    # Garante que o servidor rode a partir do diretório raiz do projeto
    project_root = os.path.abspath(os.path.dirname(__file__))
    os.chdir(project_root)

    # Cria o servidor
    httpd = socketserver.TCPServer(("", PORT), Handler)

    print(f"\n--- Servidor Local Iniciado ---")
    print(f"Pasta raiz do projeto: {project_root}")
    print(f"Servindo conteúdo da pasta: '{WEB_DIR}'")
    print(f"Seu perfil está rodando em: http://localhost:{PORT}")
    print(f"Pressione Ctrl+C para parar o servidor.")
    print(f"---------------------------------")
    
    # Inicia o loop do servidor
    httpd.serve_forever()

except KeyboardInterrupt:
    print("\n--- Recebido comando para desligar. Finalizando o servidor... ---")

except Exception as e:
    print(f"\n--- Ocorreu um erro inesperado: {e} ---")

finally:
    if httpd:
        # Garante que o servidor seja sempre fechado
        httpd.server_close()
    print("--- Servidor finalizado com sucesso. ---")
import http.server
import socketserver
import os

PORT = 8000
WEB_DIR = 'public'

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    try:
        os.chdir(WEB_DIR)
    except FileNotFoundError:
        print(f"Erro: O diretório '{WEB_DIR}' não foi encontrado.")
        exit(1)

    Handler = NoCacheHTTPRequestHandler
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"--- Servidor rodando em http://localhost:{PORT} ---")
            print("Pressione Ctrl+C para parar o servidor.")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor finalizado pelo usuário.")
    except Exception as e:
        print(f"Erro ao iniciar o servidor: {e}")

if __name__ == "__main__":
    main()
