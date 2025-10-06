"""
validate_oidc_endpoints.py

Lightweight validator for Google and Microsoft (Entra) OIDC endpoints.

Checks performed:
- Fetch provider .well-known/openid-configuration and assert required fields
- Build an authorization request URL using provided client_id and redirect_uri and perform a GET (without following redirects)
- Inspect response status, Location header and body for common error patterns (redirect_uri_mismatch, AADSTS errors, etc.)

Usage (defaults are set to the values from your logs):
  python scripts/validate_oidc_endpoints.py

Or pass custom values:
  python scripts/validate_oidc_endpoints.py --base-url https://www.caracore.com.br --redirect-path /secure/index.html \
      --google-client 1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu --microsoft-client ***AZURE_SECRET_REDACTED***

This script requires Python 3.7+. It uses the `requests` library if available; otherwise falls back to urllib.

"""
from __future__ import annotations
import argparse
import sys
import json
import random
import string
import time
from typing import Optional

try:
    import requests
    REQUESTS_AVAILABLE = True
except Exception:
    import urllib.request as urllib_request
    import urllib.parse as urllib_parse
    from urllib.error import HTTPError, URLError
    REQUESTS_AVAILABLE = False


def random_state(n=8):
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(n))


def fetch_json(url: str, timeout: int = 10) -> Optional[dict]:
    print(f"Fetching: {url}")
    try:
        if REQUESTS_AVAILABLE:
            r = requests.get(url, timeout=timeout)
            r.raise_for_status()
            return r.json()
        else:
            with urllib_request.urlopen(url, timeout=timeout) as fh:
                body = fh.read()
                return json.loads(body.decode('utf-8'))
    except Exception as e:
        print(f"  ERROR fetching JSON: {e}")
        return None


def perform_auth_request(auth_url: str, params: dict, timeout: int = 10):
    q = '&'.join(f"{k}={requests.utils.requote_uri(str(v))}" if REQUESTS_AVAILABLE else f"{urllib_parse.quote(k)}={urllib_parse.quote(str(v))}" for k, v in params.items())
    url = auth_url + ('?' if '?' not in auth_url else '&') + q
    print(f"Auth request URL: {auth_url}\n  params: {params}")

    try:
        if REQUESTS_AVAILABLE:
            # Do not follow redirects so we can inspect Location and status
            r = requests.get(url, allow_redirects=False, timeout=timeout)
            loc = r.headers.get('Location')
            return r.status_code, loc, r.text[:4000]
        else:
            req = urllib_request.Request(url)
            opener = urllib_request.build_opener()
            response = opener.open(req, timeout=timeout)
            # If provider returned a redirect (302), urllib will follow it by default; we can inspect the final URL
            final_url = response.geturl()
            body = response.read().decode('utf-8', errors='replace')[:4000]
            return 200, final_url, body
    except Exception as e:
        # Some providers respond with HTTPError on 4xx; capture body
        if REQUESTS_AVAILABLE and isinstance(e, requests.exceptions.HTTPError):
            r = e.response
            try:
                body = r.text[:4000]
            except Exception:
                body = '<no-body>'
            return getattr(r, 'status_code', None), r.headers.get('Location'), body
        elif not REQUESTS_AVAILABLE and isinstance(e, HTTPError):
            body = e.read().decode('utf-8', errors='replace')[:4000]
            return e.code, None, body
        else:
            return None, None, f'EXCEPTION: {e}'


def analyze_response(provider_name: str, status: Optional[int], location: Optional[str], body: str, verbose: bool = False):
    """Return (ok:bool, problems:list, details:list).

    Heuristics used:
    - OK when response is a 3xx and Location header points to known provider sign-in domains
      (accounts.google.com, login.microsoftonline.com, login.live.com).
    - Problem when location or body contains known error tokens (redirect_uri_mismatch, aadsts, AADSTS50011, invalid_request)
    - If HTTP 4xx and no sign-in redirect, consider it a problem.
    """
    problems = []
    details = []

    details.append(f"status={status}")
    if location:
        details.append(f"Location: {location}")

    low = (body or '').lower()

    # Detect explicit error patterns
    if 'redirect_uri_mismatch' in low or 'redirect_uri is not in the list' in low:
        problems.append('redirect_uri_mismatch')
    if 'error=redirect_uri_mismatch' in (location or '').lower():
        problems.append('redirect_uri_mismatch_in_location')
    if 'aadsts' in low:
        problems.append('aadsts_error_in_body')
    if 'invalid_request' in low and 'redirect' in low:
        problems.append('invalid_request_related_to_redirect')

    # Check Location for sign-in domains (explicit allow list)
    ok = False
    if location and status and 300 <= int(status) < 400:
        loc = location.lower()
        if any(domain in loc for domain in ('accounts.google.com', 'consent.google', 'login.microsoftonline.com', 'login.live.com', 'login.windows.net')):
            ok = True
            details.append('Redirect appears to point to provider sign-in (good)')

    # If HTTP 4xx without redirect -> problem
    if status and (400 <= int(status) < 500) and not ok:
        problems.append(f'HTTP_{status}_no_signin_redirect')

    if verbose:
        details.append(f'body-snippet={low[:300]}')

    return ok, problems, details


def check_provider(name: str, openid_config_url: str, client_id: str, redirect_uri: str, verbose: bool = False):
    print('\n' + '=' * 70)
    print(f'Checking {name}')
    config = fetch_json(openid_config_url)
    if not config:
        print('  FAIL: Could not fetch openid-configuration')
        return {'provider': name, 'ok': False, 'errors': ['openid_fetch_failed']}

    needed = ['authorization_endpoint', 'issuer']
    missing = [k for k in needed if k not in config]
    if missing:
        print('  FAIL: missing fields in openid-configuration:', missing)
        return {'provider': name, 'ok': False, 'errors': ['openid_missing_fields']}

    auth_endpoint = config['authorization_endpoint']
    print('  openid issuer:', config.get('issuer'))
    print('  authorization_endpoint:', auth_endpoint)

    params = {
        'client_id': client_id,
        'response_type': 'code',
        'scope': 'openid email profile',
        'redirect_uri': redirect_uri,
        'state': random_state(),
        'prompt': 'select_account',
    }

    status, location, body = perform_auth_request(auth_endpoint, params)
    ok, problems, details = analyze_response(name, status, location, body, verbose=verbose)

    print('  Details:')
    for d in details:
        print('   -', d)
    if problems:
        print('  Problems found:')
        for p in problems:
            print('   -', p)
    else:
        print('  No immediate problems detected')

    result_ok = ok and not problems
    return {
        'provider': name,
        'ok': result_ok,
        'problems': problems,
        'details': details,
        'raw_status': status,
        'location': location,
    }


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument('--base-url', default='https://www.caracore.com.br', help='Site base URL')
    p.add_argument('--redirect-path', default='/secure/index.html', help='Redirect path from site root')
    p.add_argument('--google-client', default='1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu', help='Google client id')
    p.add_argument('--microsoft-client', default='***AZURE_SECRET_REDACTED***', help='Microsoft client id')
    p.add_argument('--timeout', type=int, default=10)
    p.add_argument('--verbose', action='store_true', help='Print body snippets and verbose details')
    args = p.parse_args(argv)

    redirect_uri = args.base_url.rstrip('/') + args.redirect_path
    print('\nOIDC Endpoint Validator')
    print('  target redirect_uri:', redirect_uri)

    providers = [
        ('Google', 'https://accounts.google.com/.well-known/openid-configuration', args.google_client),
        ('Microsoft (consumers)', 'https://login.microsoftonline.com/consumers/v2.0/.well-known/openid-configuration', args.microsoft_client),
    ]

    results = []
    for name, openid_url, client in providers:
        res = check_provider(name, openid_url, client, redirect_uri, verbose=args.verbose)
        results.append(res)
        # small pause to be polite
        time.sleep(0.5)

    print('\n' + '=' * 70)
    print('Summary:')
    for r in results:
        status = 'OK' if r.get('ok') else 'FAIL'
        print(f" - {r['provider']}: {status}")
        if not r.get('ok'):
            for p in r.get('problems', []) or []:
                print('    *', p)

    # Exit code non-zero if any provider failed
    any_failed = any(not r.get('ok') for r in results)
    sys.exit(1 if any_failed else 0)


if __name__ == '__main__':
    main()
