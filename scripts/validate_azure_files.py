"""validate_azure_files.py

Validação em Python da configuração Azure Files e montagem no App Service
Usa a CLI `az` (requer `az login`) e produz um relatório JSON resumido.

Uso:
  python scripts/validate_azure_files.py \
    --app-name caracore-backend-docker \
    --resource-group rg-caracore \
    --storage-account caracorefilesacct \
    --share-name cara-core-fileshare \
    --mount-path /home/site/wwwroot/data

Saída: JSON impresso em stdout e código de saída 0 (ok) ou 2 (falha parcial) ou 3 (erro crítico)
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
from typing import Any, Dict, Optional
from datetime import datetime, timezone


def run_az(cmd: list) -> Optional[Any]:
    # Locate az executable once (supports Windows where az may be az.cmd)
    az_exec = shutil.which("az") or shutil.which("az.cmd") or shutil.which("az.exe")
    if not az_exec:
        # Keep consistent JSON error reporting to stderr so caller can capture it
        print(json.dumps({"error": "az CLI not found. Ensure Azure CLI is installed and 'az' is on PATH."}, indent=2), file=sys.stderr)
        return None
    try:
        res = subprocess.run([az_exec] + cmd + ["-o", "json"], capture_output=True, check=False)
    except Exception as e:
        print(json.dumps({"error": "failed to execute az", "exception": str(e)}), file=sys.stderr)
        return None
    if res.returncode != 0:
        # try to include stderr
        err = res.stderr.decode('utf-8', errors='replace').strip()
        print(json.dumps({"az_error": err, "cmd": "{0} {1}".format(az_exec, " ".join(cmd))}), file=sys.stderr)
        return None
    try:
        return json.loads(res.stdout.decode('utf-8') or 'null')
    except json.JSONDecodeError:
        return None


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--app-name', help='App Service name')
    p.add_argument('--resource-group', help='Resource group')
    p.add_argument('--storage-account', help='Storage account name')
    p.add_argument('--share-name', help='File share name')
    p.add_argument('--mount-path', default='/home/site/wwwroot/data', help='Mount path (default: /home/site/wwwroot/data)')
    p.add_argument('--use-env', action='store_true', help='Read defaults from environment variables AZ_APP_NAME, AZ_RESOURCE_GROUP, AZ_STORAGE_ACCOUNT, AZ_SHARE_NAME, AZ_MOUNT_PATH')
    p.add_argument('--save-report', help='Optional path to save JSON report')
    args = p.parse_args()

    report: Dict[str, Any] = {
        'app': args.app_name,
        'resource_group': args.resource_group,
        'storage_account': args.storage_account,
        'share_name': args.share_name,
        'mount_path': args.mount_path,
        'results': {},
        'overall_status': 'unknown'
    }

    # If flags missing and --use-env set (or any required param missing), try to read from environment
    if (not args.app_name or not args.resource_group or not args.storage_account or not args.share_name) and args.use_env:
        env_map = {
            'app_name': os.environ.get('AZ_APP_NAME') or os.environ.get('AZ_APP'),
            'resource_group': os.environ.get('AZ_RESOURCE_GROUP') or os.environ.get('AZ_RG'),
            'storage_account': os.environ.get('AZ_STORAGE_ACCOUNT') or os.environ.get('AZ_SA'),
            'share_name': os.environ.get('AZ_SHARE_NAME') or os.environ.get('AZ_SHARE'),
            'mount_path': os.environ.get('AZ_MOUNT_PATH') or os.environ.get('AZ_MOUNT')
        }
        for key, val in env_map.items():
            if val:
                setattr(args, key, val)
        # update report fields
        report.update({
            'app': args.app_name,
            'resource_group': args.resource_group,
            'storage_account': args.storage_account,
            'share_name': args.share_name,
            'mount_path': args.mount_path
        })

    # If still missing required parameters, exit with usage message
    missing = [n for n in ('app_name', 'resource_group', 'storage_account', 'share_name') if not getattr(args, n)]
    if missing:
        print(json.dumps({'error': 'missing required parameters', 'missing': missing}, ensure_ascii=False), file=sys.stderr)
        p.print_help()
        sys.exit(1)

    # 1) Storage account
    sa = run_az(['storage', 'account', 'show', '--name', args.storage_account, '--resource-group', args.resource_group])
    if sa is None:
        report['results']['storage_account'] = {'ok': False, 'error': 'not found or az error'}
        report['overall_status'] = 'fail'
        print(json.dumps(report, indent=2, ensure_ascii=False))
        sys.exit(3)
    report['results']['storage_account'] = {'ok': True, 'id': sa.get('id'), 'name': sa.get('name'), 'location': sa.get('location')}

    # 2) Get account key
    key = run_az(['storage', 'account', 'keys', 'list', '--account-name', args.storage_account, '--resource-group', args.resource_group])
    if key is None or not isinstance(key, list) or len(key) == 0:
        report['results']['account_key'] = {'ok': False, 'error': 'could not retrieve key'}
    else:
        report['results']['account_key'] = {'ok': True, 'key_name': key[0].get('keyName') if isinstance(key[0], dict) else None}
        account_key_value = key[0].get('value') if isinstance(key[0], dict) else None

    # 3) List file shares
    fileshares = None
    if 'account_key_value' in locals() and account_key_value:
        fileshares = run_az(['storage', 'share', 'list', '--account-name', args.storage_account, '--account-key', account_key_value])
        if fileshares is None:
            report['results']['file_shares'] = {'ok': False, 'error': 'failed to list shares with key'}
        else:
            report['results']['file_shares'] = {'ok': True, 'count': len(fileshares), 'names': [s.get('name') for s in fileshares]}
    else:
        report['results']['file_shares'] = {'ok': False, 'error': 'no account key available'}

    # 4) List files in share root
    if 'account_key_value' in locals() and account_key_value:
        try:
            share_files = run_az(['storage', 'file', 'list', '--share-name', args.share_name, '--account-name', args.storage_account, '--account-key', account_key_value, '--path', '/'])
            if share_files is None:
                report['results']['share_root'] = {'ok': False, 'error': 'failed to list files in share'}
            else:
                report['results']['share_root'] = {'ok': True, 'count': len(share_files), 'entries': [ { 'name': e.get('name'), 'isDirectory': e.get('isDirectory', False) } for e in share_files ]}
        except Exception as e:
            report['results']['share_root'] = {'ok': False, 'error': str(e)}
    else:
        report['results']['share_root'] = {'ok': False, 'error': 'no account key available'}

    # 5) App Service storage mounts
    mounts = run_az(['webapp', 'config', 'storage-account', 'list', '--name', args.app_name, '--resource-group', args.resource_group])
    if mounts is None:
        report['results']['app_mounts'] = {'ok': False, 'error': 'failed to list mounts or none configured'}
    else:
        report['results']['app_mounts'] = {'ok': True, 'mounts': mounts}

    # 6) App settings
    appsettings = run_az(['webapp', 'config', 'appsettings', 'list', '--name', args.app_name, '--resource-group', args.resource_group])
    if appsettings is None:
        report['results']['app_settings'] = {'ok': False, 'error': 'failed to read app settings'}
    else:
        # try to find WEBSITES_ENABLE_APP_SERVICE_STORAGE
        ws = next((it for it in appsettings if it.get('name') == 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'), None)
        report['results']['app_settings'] = {'ok': True, 'has_WEBSITES_ENABLE_APP_SERVICE_STORAGE': bool(ws), 'value': ws.get('value') if ws else None}

    # 7) Managed identity and role assignments
    identity = run_az(['webapp', 'identity', 'show', '--name', args.app_name, '--resource-group', args.resource_group])
    if identity is None:
        report['results']['managed_identity'] = {'ok': False, 'error': 'failed to read identity or not assigned'}
    else:
        principal_id = identity.get('principalId')
        report['results']['managed_identity'] = {'ok': True, 'principalId': principal_id}
        if principal_id and sa.get('id'):
            ra = run_az(['role', 'assignment', 'list', '--assignee', principal_id, '--scope', sa.get('id')])
            if ra is None:
                report['results']['role_assignments'] = {'ok': False, 'error': 'failed to list role assignments'}
            else:
                report['results']['role_assignments'] = {'ok': True, 'assignments': ra}
        else:
            report['results']['role_assignments'] = {'ok': False, 'error': 'missing principalId or storage account id'}

    # 8) Final judgement
    # Evaluate minimal pass conditions: storage account exists, share exists in list, mounts exist or app settings enable mounts, and crypto key accessible is optional
    passed = True
    if not report['results'].get('storage_account', {}).get('ok'):
        passed = False
    if not report['results'].get('file_shares', {}).get('ok'):
        passed = False
    # If mounts not ok, warn but not fail
    if not report['results'].get('app_mounts', {}).get('ok'):
        report['results']['mounts_note'] = 'No mounts reported for the App Service. Verify via Portal or set WEBSITES_ENABLE_APP_SERVICE_STORAGE=true.'
        passed = False

    report['overall_status'] = 'ok' if passed else 'fail'

    output = json.dumps(report, indent=2, ensure_ascii=False)
    print(output)

    # Optionally save report
    if args.save_report:
        try:
            report_path = args.save_report
            # expand timestamp token if present
            # use timezone-aware UTC datetime
            ts = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
            if '{ts}' in report_path:
                report_path = report_path.replace('{ts}', ts)
            else:
                # append timestamp before extension
                base, ext = os.path.splitext(report_path)
                report_path = f"{base}_{ts}{ext}"
            # ensure directory exists
            os.makedirs(os.path.dirname(report_path), exist_ok=True)
            with open(report_path, 'w', encoding='utf-8') as fh:
                fh.write(output)
            print(f"Saved report to: {report_path}")
        except Exception as e:
            print(json.dumps({'error': 'failed to save report', 'exception': str(e)}), file=sys.stderr)

    sys.exit(0 if passed else 2)


if __name__ == '__main__':
    main()
