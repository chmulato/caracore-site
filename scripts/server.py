import http.server
import socketserver
import os
import json
import uuid
import shutil
import logging
import urllib.request
import urllib.parse
import urllib.error
import subprocess
import shlex
import time
import atexit
import mimetypes
from datetime import datetime, timezone, timedelta

# Porta padrão (use a variável de ambiente PORT se desejar)
PORT = int(os.getenv("PORT", "8000"))
# Diretório raiz do site (pasta onde este arquivo está)
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
LOG_DIR = os.path.join(PROJECT_ROOT, 'backend', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)
LOG_RETENTION_DAYS = int(os.getenv("LOG_RETENTION_DAYS", "60"))

COMPOSE_FILE = os.path.join(PROJECT_ROOT, 'docker', 'docker-compose.yml')
DOCKER_BACKEND_SERVICE = os.getenv('DOCKER_BACKEND_SERVICE', 'backend')
AUTO_START_DOCKER_BACKEND = os.getenv('AUTO_START_DOCKER_BACKEND', '1').strip().lower() not in {'0', 'false', 'no'}
BACKEND_HEALTH_URL = os.getenv('BACKEND_HEALTH_URL', 'http://localhost:5051/health')
_docker_started_here = False

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_OAUTH_CLIENT_SECRET")
GOOGLE_TOKEN_URL = os.getenv("GOOGLE_OAUTH_TOKEN_URL", "https://oauth2.googleapis.com/token")

AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
AZURE_SCOPE = os.getenv("AZURE_SCOPE", "openid profile email")
AZURE_TOKEN_ENDPOINT_TEMPLATE = os.getenv(
    "AZURE_TOKEN_ENDPOINT",
    "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
)

# Server runtime log (human readable) for debugging startup and request errors
RUNTIME_LOG_DIR = os.path.join(PROJECT_ROOT, 'log')
os.makedirs(RUNTIME_LOG_DIR, exist_ok=True)
RUNTIME_LOG_PATH = os.path.join(RUNTIME_LOG_DIR, 'server.log')

LOG_DOWNLOAD_SOURCES = {
    'runtime': {
        'label': 'Logs do servidor e frontend',
        'directory': RUNTIME_LOG_DIR
    },
    'backend': {
        'label': 'Logs do proxy de tokens',
        'directory': LOG_DIR
    }
}

# Configure basic logging (console + file)
logger = logging.getLogger('cara-core-server')
logger.setLevel(logging.INFO)
if not logger.handlers:
    fh = logging.FileHandler(RUNTIME_LOG_PATH, encoding='utf-8')
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
    logger.addHandler(fh)
    logger.addHandler(ch)


def _compose_command() -> list[str]:
    custom = os.getenv('DOCKER_COMPOSE_COMMAND')
    if custom:
        try:
            return shlex.split(custom)
        except ValueError:
            logger.warning('Não foi possível interpretar DOCKER_COMPOSE_COMMAND, usando padrão "docker compose".')
    return ['docker', 'compose']


def _run_compose(args: list[str]) -> subprocess.CompletedProcess | None:
    base_cmd = _compose_command()
    cmd = base_cmd + ['-f', COMPOSE_FILE] + args
    logger.debug('Executando comando Docker: %s', ' '.join(cmd))
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        if result.stdout:
            logger.debug(result.stdout.strip())
        if result.stderr:
            logger.debug(result.stderr.strip())
        return result
    except FileNotFoundError:
        logger.error('Docker não encontrado. Instale Docker Desktop ou ajuste DOCKER_COMPOSE_COMMAND.')
    except subprocess.CalledProcessError as exc:
        output = exc.stderr or exc.stdout or ''
        if output:
            output = output.strip()
        logger.error('Comando Docker falhou (%s). Saída: %s', exc.returncode, output)
    return None


def _resolve_azure_token_endpoint(tenant_override: str | None = None) -> str:
    tenant_value = (tenant_override or AZURE_TENANT_ID or 'common').strip() or 'common'
    template = AZURE_TOKEN_ENDPOINT_TEMPLATE or ''
    if '{tenant}' in template:
        try:
            return template.format(tenant=tenant_value)
        except Exception:
            pass
    if template:
        return template
    return f"https://login.microsoftonline.com/{tenant_value}/oauth2/v2.0/token"


def _wait_for_backend_ready(timeout_seconds: int = 45) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(BACKEND_HEALTH_URL, timeout=3) as resp:
                status_code = resp.getcode()
        except Exception:
            time.sleep(1)
            continue

        if status_code == 200:
            logger.info('Backend Docker disponível em %s', BACKEND_HEALTH_URL)
            return True
        time.sleep(1)

    logger.warning('Tempo esgotado aguardando backend Docker responder em %s', BACKEND_HEALTH_URL)
    return False


def _ensure_backend_container() -> bool:
    global _docker_started_here

    if not AUTO_START_DOCKER_BACKEND:
        logger.info('AUTO_START_DOCKER_BACKEND desativado; não iniciaremos o backend Docker automaticamente.')
        return False

    if not os.path.exists(COMPOSE_FILE):
        logger.warning('Arquivo docker-compose não encontrado em %s; pulando inicialização do backend Docker.', COMPOSE_FILE)
        return False

    logger.info('Inicializando backend Docker (serviço "%s").', DOCKER_BACKEND_SERVICE)
    result = _run_compose(['up', '-d', DOCKER_BACKEND_SERVICE])
    if result is None:
        logger.error('Não foi possível iniciar o backend Docker. Continuando sem proxy OAuth local.')
        return False

    _docker_started_here = True
    _wait_for_backend_ready()
    return True


def _stop_backend_container():
    if not _docker_started_here:
        return

    logger.info('Encerrando backend Docker iniciado por este processo...')
    _run_compose(['down', '--remove-orphans'])


atexit.register(_stop_backend_container)


def _purge_caches(root: str) -> int:
    """Remove __pycache__ folders and .pyc files under root.
    Returns number of items removed. Skips if NO_CACHE_PURGE is set.
    """
    if os.environ.get('NO_CACHE_PURGE'):
        return 0
    removed = 0
    for base, dirs, files in os.walk(root):
        # delete __pycache__ dirs
        if '__pycache__' in dirs:
            d = os.path.join(base, '__pycache__')
            try:
                shutil.rmtree(d, ignore_errors=True)
                removed += 1
            except Exception:
                pass
        # delete .pyc files
        for fn in files:
            if fn.endswith('.pyc'):
                fp = os.path.join(base, fn)
                try:
                    os.remove(fp)
                    removed += 1
                except Exception:
                    pass
    return removed

# (moved up)

ALLOWED_LOG_FIELDS = {
    "ts",
    "event",
    "request_id",
    "session_id",  # will be set from cookie
    "user_pseudo_id",
    "idp_iss",
    "flow",
    "status",
    "error_code",
    "latency_ms",
    "http_status",
}


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _sanitize_log_payload(data: dict) -> dict:
    if not isinstance(data, dict):
        return {}
    out = {}
    for k in ALLOWED_LOG_FIELDS:
        if k in data:
            out[k] = data[k]
    # normalize
    if 'ts' in out:
        try:
            datetime.fromisoformat(str(out['ts']).replace('Z', '+00:00'))
        except Exception:
            out.pop('ts', None)
    if 'request_id' in out:
        try:
            uuid.UUID(str(out['request_id']))
        except Exception:
            out.pop('request_id', None)
    out.pop('session_id', None)
    if 'user_pseudo_id' in out:
        v = str(out['user_pseudo_id']).lower()
        if not (len(v) == 64 and all(c in '0123456789abcdef' for c in v)):
            out.pop('user_pseudo_id', None)
    if 'status' in out:
        s = str(out['status']).lower()
        if s not in {'ok', 'error'}:
            out['status'] = 'ok'
    return out


def _write_log_line(record: dict):
    day_name = datetime.now(timezone.utc).strftime('%Y-%m-%d') + '.jsonl'
    file_path = os.path.join(LOG_DIR, day_name)
    with open(file_path, 'a', encoding='utf-8') as f:
        json.dump(record, f, ensure_ascii=False)
        f.write('\n')


def _cleanup_old_logs():
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(days=LOG_RETENTION_DAYS)
        for name in os.listdir(LOG_DIR):
            if not name.endswith('.jsonl'):
                continue
            base = name[:-6]  # strip .jsonl
            try:
                dt = datetime.fromisoformat(base).replace(tzinfo=timezone.utc)
                if dt < cutoff:
                    os.remove(os.path.join(LOG_DIR, name))
            except Exception:
                continue
    except Exception:
        pass


class NoCacheRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Servir a partir do diretório raiz do projeto
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def end_headers(self):
        # Evita cache durante desenvolvimento
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        message = format % args
        # Write to both console and runtime file logger for diagnostics
        entry = f"{self.address_string()} - {message}"
        print(f'[{timestamp}] {entry}')
        try:
            logger.info(entry)
        except Exception:
            pass

    def _set_cors_headers(self):
        origin = self.headers.get('Origin')
        if origin and origin.startswith('http://'):
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
            self.send_header('Access-Control-Allow-Credentials', 'true')

    def do_OPTIONS(self):
        # Preflight for JSON endpoints during development
        if self.path in ('/logs', '/oauth/google/token', '/oauth/microsoft/token'):
            self.send_response(204)
            self._set_cors_headers()
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.end_headers()
            return
        # Default OPTIONS response
        self.send_response(204)
        self.send_header('Allow', 'GET, HEAD, OPTIONS')
        self.end_headers()
        return

    def do_POST(self):
        if self.path == '/oauth/google/token':
            self._handle_google_token()
            return
        if self.path == '/oauth/microsoft/token':
            self._handle_microsoft_token()
            return
        if self.path != '/logs':
            # Unknown endpoint - return 404
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"error","message":"not found"}')
            return
        try:
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length)
            try:
                body = json.loads(raw.decode('utf-8')) if raw else {}
            except Exception:
                body = {}
            rec = _sanitize_log_payload(body)
            rec.setdefault('ts', _now_iso())
            rec.setdefault('event', 'client.event')
            rec.setdefault('flow', 'authorization_code_pkce')
            rec.setdefault('status', 'ok')
            if 'request_id' not in rec:
                rec['request_id'] = str(uuid.uuid4())

            # cookie sid
            cookies = self.headers.get('Cookie', '')
            sid = None
            for part in cookies.split(';'):
                if part.strip().startswith('sid='):
                    sid = part.strip().split('=', 1)[1]
                    break
            if not sid:
                sid = str(uuid.uuid4())
            rec['session_id'] = sid

            _write_log_line(rec)
            _cleanup_old_logs()

            payload = json.dumps({"status": "ok", "request_id": rec['request_id']}).encode('utf-8')
            self.send_response(202)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            # HttpOnly cookie; SimpleHTTPRequestHandler lacks direct helper for HttpOnly flag, set manually
            # Secure is omitted for local HTTP; in prod behind HTTPS, serve via a proper backend.
            self.send_header('Set-Cookie', f'sid={sid}; Path=/; HttpOnly; SameSite=Strict')
            self.end_headers()
            self.wfile.write(payload)
        except Exception:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"error"}')

    def _handle_google_token(self):
        origin = self.headers.get('Origin')

        def _reply(status_code: int, payload: dict):
            self.send_response(status_code)
            if origin:
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
                self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode('utf-8'))

        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            _reply(503, {
                "status": "error",
                "error": "server_not_configured",
                "message": "Google OAuth client credentials are not configured on the server."
            })
            return

        try:
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length)
            body = json.loads(raw.decode('utf-8')) if raw else {}
        except Exception:
            _reply(400, {"status": "error", "error": "invalid_json"})
            return

        code = str(body.get('code') or '').strip()
        code_verifier = str(body.get('code_verifier') or '').strip()
        redirect_uri = str(body.get('redirect_uri') or '').strip()

        if not code or not code_verifier or not redirect_uri:
            _reply(400, {
                "status": "error",
                "error": "missing_parameters",
                "message": "Required fields: code, code_verifier, redirect_uri"
            })
            return

        data = urllib.parse.urlencode({
            'grant_type': 'authorization_code',
            'code': code,
            'code_verifier': code_verifier,
            'redirect_uri': redirect_uri,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
        }).encode('utf-8')

        req = urllib.request.Request(
            GOOGLE_TOKEN_URL,
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                payload = resp.read().decode('utf-8') or '{}'
                try:
                    parsed = json.loads(payload)
                    if not isinstance(parsed, dict):
                        parsed = {"data": parsed}
                except Exception:
                    parsed = {"raw": payload}
                parsed.setdefault('status', 'ok')
                _reply(resp.getcode(), parsed)
        except urllib.error.HTTPError as err:
            try:
                err_body = err.read().decode('utf-8')
                parsed_err = json.loads(err_body)
                if not isinstance(parsed_err, dict):
                    parsed_err = {"error": "http_error", "details": parsed_err}
            except Exception:
                parsed_err = {"error": "http_error", "message": err.reason}
            parsed_err.setdefault('status', 'error')
            if 'http_status' not in parsed_err:
                parsed_err['http_status'] = str(err.code)
            _reply(err.code, parsed_err)
        except Exception as exc:
            _reply(502, {
                "status": "error",
                "error": "exchange_failed",
                "message": str(exc)
            })

    def _handle_microsoft_token(self):
        origin = self.headers.get('Origin')

        def _reply(status_code: int, payload: dict):
            self.send_response(status_code)
            if origin:
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
                self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode('utf-8'))

        if not AZURE_CLIENT_ID or not AZURE_CLIENT_SECRET:
            _reply(503, {
                "status": "error",
                "error": "server_not_configured",
                "message": "Microsoft Entra ID credentials are not configured on the server."
            })
            return

        try:
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length)
            body = json.loads(raw.decode('utf-8')) if raw else {}
        except Exception:
            _reply(400, {"status": "error", "error": "invalid_json"})
            return

        code = str(body.get('code') or '').strip()
        code_verifier = str(body.get('code_verifier') or '').strip()
        redirect_uri = str(body.get('redirect_uri') or '').strip()
        grant_type = str(body.get('grant_type') or 'authorization_code').strip() or 'authorization_code'
        scope = str(body.get('scope') or AZURE_SCOPE or '').strip()
        tenant_override = str(body.get('tenant') or '').strip()

        if not code or not code_verifier:
            _reply(400, {
                "status": "error",
                "error": "missing_parameters",
                "message": "Required fields: code, code_verifier"
            })
            return

        tenant_value = tenant_override or AZURE_TENANT_ID or 'common'
        token_endpoint = _resolve_azure_token_endpoint(tenant_override)

        payload = {
            'client_id': AZURE_CLIENT_ID,
            'client_secret': AZURE_CLIENT_SECRET,
            'code': code,
            'code_verifier': code_verifier,
            'grant_type': grant_type,
        }
        if redirect_uri:
            payload['redirect_uri'] = redirect_uri
        if scope:
            payload['scope'] = scope

        logger.info(
            '[Step5] Iniciando troca de token com Microsoft (tenant=%s, scope=%s, redirect_uri=%s)',
            tenant_value,
            scope or '<none>',
            redirect_uri or '<none>'
        )

        data = urllib.parse.urlencode(payload).encode('utf-8')
        req = urllib.request.Request(
            token_endpoint,
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body_bytes = resp.read()
                try:
                    parsed = json.loads(body_bytes.decode('utf-8') or '{}')
                    if not isinstance(parsed, dict):
                        parsed = {"data": parsed}
                except Exception:
                    parsed = {"raw": body_bytes.decode('utf-8', errors='replace')}
                parsed.setdefault('status', 'ok')
                _reply(resp.getcode(), parsed)
                if resp.getcode() == 200:
                    logger.info('[Step5] Troca Microsoft concluída com sucesso (scope=%s)', parsed.get('scope'))
                else:
                    logger.warning(
                        '[Step5] Microsoft retornou status %s - error=%s description=%s',
                        resp.getcode(),
                        parsed.get('error'),
                        parsed.get('error_description')
                    )
        except urllib.error.HTTPError as err:
            try:
                err_body = err.read().decode('utf-8')
                parsed_err = json.loads(err_body)
                if not isinstance(parsed_err, dict):
                    parsed_err = {"error": "http_error", "details": parsed_err}
            except Exception:
                parsed_err = {"error": "http_error", "message": err.reason}
            parsed_err.setdefault('status', 'error')
            if 'http_status' not in parsed_err:
                parsed_err['http_status'] = str(err.code)
            logger.warning(
                '[Step5] Microsoft retornou erro HTTP %s - error=%s description=%s',
                err.code,
                parsed_err.get('error'),
                parsed_err.get('error_description')
            )
            _reply(err.code, parsed_err)
        except Exception as exc:
            logger.error('Falha ao trocar token com Microsoft: %s', exc)
            _reply(502, {
                "status": "error",
                "error": "exchange_failed",
                "message": str(exc)
            })

    def _resolve_log_category(self, category: str):
        if not category:
            return None
        entry = LOG_DOWNLOAD_SOURCES.get(category)
        if not entry:
            return None
        directory = entry.get('directory')
        if not directory or not os.path.isdir(directory):
            return None
        return entry

    def _serve_log_index(self):
        payload = {
            'generatedAt': _now_iso(),
            'categories': []
        }

        for key, meta in LOG_DOWNLOAD_SOURCES.items():
            directory = meta.get('directory')
            files = []
            if directory and os.path.isdir(directory):
                for name in sorted(os.listdir(directory)):
                    full = os.path.join(directory, name)
                    if not os.path.isfile(full):
                        continue
                    if not name.lower().endswith(('.log', '.json', '.jsonl', '.txt')):
                        continue
                    try:
                        stat = os.stat(full)
                        files.append({
                            'name': name,
                            'size': stat.st_size,
                            'modified': datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
                            'downloadUrl': f"/logs?category={urllib.parse.quote(key)}&file={urllib.parse.quote(name)}"
                        })
                    except Exception:
                        continue
                files.sort(key=lambda item: item['modified'], reverse=True)

            payload['categories'].append({
                'key': key,
                'label': meta.get('label', key),
                'files': files
            })

        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _serve_log_file(self, category: str, filename: str):
        entry = self._resolve_log_category(category)
        if not entry or not filename:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"error","message":"log_not_found"}')
            return

        safe_name = os.path.basename(filename)
        if safe_name != filename:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"error","message":"invalid_filename"}')
            return

        directory = entry['directory']
        path = os.path.join(directory, safe_name)
        if not os.path.isfile(path):
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"error","message":"log_not_found"}')
            return

        try:
            mime, _ = mimetypes.guess_type(path)
            if not mime:
                mime = 'application/octet-stream'
            size = os.path.getsize(path)
            with open(path, 'rb') as f:
                self.send_response(200)
                self._set_cors_headers()
                self.send_header('Content-Type', mime)
                self.send_header('Content-Disposition', f'attachment; filename="{safe_name}"')
                self.send_header('Content-Length', str(size))
                self.end_headers()
                shutil.copyfileobj(f, self.wfile)
        except Exception as exc:
            logger.error('Falha ao servir log %s/%s: %s', category, filename, exc)
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"error","message":"download_failed"}')

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/logs':
            query = urllib.parse.parse_qs(parsed.query)
            file_param = query.get('file', [None])[0]
            category = query.get('category', ['runtime'])[0]
            if file_param:
                self._serve_log_file(category, file_param)
            else:
                self._serve_log_index()
            return

        super().do_GET()


def main():
    purged = _purge_caches(PROJECT_ROOT)
    backend_started = _ensure_backend_container()
    if backend_started:
        logger.info('Backend Docker iniciado com sucesso para testes locais.')
    else:
        logger.info('Prosseguindo sem backend Docker iniciado automaticamente.')
    # Ensure vendor artifacts (e.g., msal-browser) are present
    try:
        from config import ensure_msal_vendor
        ok_vendor, info_vendor = ensure_msal_vendor()
    except Exception as e:
        ok_vendor, info_vendor = False, {"error": f"ensure_msal_vendor failed: {e}"}
    handler_class = NoCacheRequestHandler
    try:
        with socketserver.ThreadingTCPServer(("", PORT), handler_class) as httpd:
            logger.info("--- Servidor Local Iniciado ---")
            logger.info(f"Pasta raiz do projeto: {PROJECT_ROOT}")
            if purged:
                logger.info(f"Caches Python limpos: {purged} itens removidos")
            else:
                logger.info("Caches Python limpos: nenhum item removido (ou limpeza desativada)")
            # Vendor status line
            vendor_src = (info_vendor.get('source') or 'existing' if info_vendor.get('size') else 'n/a') if isinstance(info_vendor, dict) else 'n/a'
            logger.info(f"Vendor MSAL: ok={ok_vendor} path={getattr(info_vendor, 'get', lambda *_: None)('path') if isinstance(info_vendor, dict) else 'n/a'} source={vendor_src} error={(info_vendor.get('error') if isinstance(info_vendor, dict) else None)}")
            logger.info(f"Abra: http://localhost:{PORT}/index.html")
            logger.info("Pressione Ctrl+C para parar o servidor.")
            logger.info("---------------------------------")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                logger.info("\n--- Encerrando servidor... ---")
            finally:
                httpd.server_close()
                logger.info("--- Servidor finalizado com sucesso. ---")
    except OSError as e:
        if getattr(e, 'winerror', None) == 10048 or 'address already in use' in str(e).lower():
            logger.error(f"\n[ERRO] Porta {PORT} já está em uso por outro processo.")
            try:
                import subprocess, time, sys
                # Use netstat to find PIDs listening on the port
                out = subprocess.check_output(['netstat', '-ano'], encoding='utf-8', errors='ignore')
                pids = set()
                for line in out.splitlines():
                    parts = line.split()
                    if len(parts) >= 5 and parts[0].upper().startswith('TCP'):
                        local = parts[1]
                        pid = parts[-1]
                        state = parts[3].upper() if len(parts) > 3 else ''
                        if local.endswith(f':{PORT}') and state == 'LISTENING':
                            pids.add(pid)
                if pids:
                    logger.info(f'PIDs detectados na porta {PORT}: {pids}')
                    # If running interactively, ask user to confirm killing python processes
                    interactive = sys.stdin and sys.stdin.isatty()
                    if interactive:
                        try:
                            resp = input(f"Deseja finalizar os processos Python que estão ouvindo na porta {PORT}? (y/N): ")
                        except Exception:
                            resp = 'n'
                        if resp.strip().lower() == 'y':
                            for pid in list(pids):
                                try:
                                    tl = subprocess.check_output(['tasklist', '/FI', f'PID eq {pid}'], encoding='utf-8', errors='ignore')
                                    if 'python' in tl.lower():
                                        logger.info(f'Terminando PID {pid}...')
                                        subprocess.check_call(['taskkill', '/PID', pid, '/F'])
                                        time.sleep(0.5)
                                    else:
                                        logger.info(f'PID {pid} não é python, pulando')
                                except Exception as ex:
                                    logger.warning(f'Falha ao terminar PID {pid}: {ex}')
                            logger.info('Re-tentando iniciar o servidor após encerrar processos...')
                            with socketserver.ThreadingTCPServer(("", PORT), handler_class) as httpd:
                                logger.info('Servidor iniciado após encerrar processos.')
                                httpd.serve_forever()
                            return
                    else:
                        # Non-interactive session: fall back to AUTO_FREE_PORT behavior if requested
                        logger.info('Sessão não interativa detectada; usando AUTO_FREE_PORT se habilitado.')
                    # Fallback to AUTO_FREE_PORT behavior if explicitly enabled
                    if os.name == 'nt' and os.environ.get('AUTO_FREE_PORT') == '1':
                        logger.info('Tentando liberar automaticamente os PIDs python (AUTO_FREE_PORT=1)')
                        for pid in list(pids):
                            try:
                                tl = subprocess.check_output(['tasklist', '/FI', f'PID eq {pid}'], encoding='utf-8', errors='ignore')
                                if 'python' in tl.lower():
                                    logger.info(f'Tentando finalizar PID {pid}...')
                                    try:
                                        subprocess.check_call(['taskkill', '/PID', pid, '/F'])
                                        time.sleep(0.5)
                                    except subprocess.CalledProcessError as tkex:
                                        logger.warning(f'Falha ao taskkill PID {pid}: {tkex}')
                                else:
                                    logger.info(f'PID {pid} não parece ser python, pulando')
                            except Exception as ex:
                                logger.warning(f'Erro ao verificar/terminar PID {pid}: {ex}')
                        # After attempting to free, retry once
                        logger.info('Re-tentando iniciar o servidor após liberar porta...')
                        try:
                            with socketserver.ThreadingTCPServer(("", PORT), handler_class) as httpd:
                                logger.info('Servidor iniciado após liberar porta.')
                                httpd.serve_forever()
                            return
                        except Exception as ex:
                            logger.error(f'Falha ao reiniciar servidor após liberar porta: {ex}')
                else:
                    logger.info('Nenhum PID listening detectado via netstat.')
            except Exception as ex:
                logger.error(f'Erro ao tentar detectar/processar PIDs na porta: {ex}')
            logger.error("Para liberar a porta manualmente, execute:")
            logger.error(f"  netstat -ano | findstr :{PORT}")
            logger.error("  taskkill /PID <PID> /F")
            logger.error("Ou altere a variável PORT no server.py para uma porta livre.")
        else:
            logger.error(f"[ERRO] Falha ao iniciar o servidor: {e}")


if __name__ == "__main__":
    main()
