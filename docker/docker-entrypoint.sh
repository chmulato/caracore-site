#!/usr/bin/env bash
set -euo pipefail

TARGET="/workspace/backend/.python_packages/lib/site-packages"
STAMP_FILE="/workspace/backend/.python_packages/.requirements.sha256"
REQUIREMENTS_FILE="/workspace/requirements.txt"
PORT_VALUE="${PORT:-8000}"
FORCE_REINSTALL="${FORCE_PIP_INSTALL:-0}"

if [[ ! -f "${REQUIREMENTS_FILE}" ]]; then
  echo "[entrypoint] requirements.txt não encontrado em ${REQUIREMENTS_FILE}." >&2
  exit 1
fi

mkdir -p "${TARGET}"

current_hash=""
if command -v sha256sum >/dev/null 2>&1; then
  current_hash="$(sha256sum "${REQUIREMENTS_FILE}" | awk '{print $1}')"
fi

installed_hash=""
if [[ -f "${STAMP_FILE}" ]]; then
  installed_hash="$(cat "${STAMP_FILE}")"
fi

need_install=0
if [[ "${FORCE_REINSTALL}" == "1" ]]; then
  echo "[entrypoint] Reinstalação forçada de dependências solicitada."
  need_install=1
elif [[ ! -f "${TARGET}/flask/__init__.py" ]]; then
  echo "[entrypoint] Dependências não encontradas em ${TARGET}." >&2
  need_install=1
elif [[ -n "${current_hash}" && "${current_hash}" != "${installed_hash}" ]]; then
  echo "[entrypoint] requirements.txt mudou desde a última instalação." >&2
  need_install=1
else
  echo "[entrypoint] Dependências já presentes em ${TARGET}."
fi

if [[ ${need_install} -eq 1 ]]; then
  echo "[entrypoint] Instalando dependências em ${TARGET}..."
  rm -rf "${TARGET}"
  mkdir -p "${TARGET}"
  python -m pip install --upgrade pip
  python -m pip install --no-cache-dir --prefer-binary -r "${REQUIREMENTS_FILE}" --target "${TARGET}"
  if [[ -n "${current_hash}" ]]; then
    echo "${current_hash}" > "${STAMP_FILE}"
  fi
fi

export PYTHONPATH="${TARGET}:${PYTHONPATH:-}"
export PORT="${PORT_VALUE}"
export PYTHONIOENCODING="${PYTHONIOENCODING:-utf-8}"

if [[ "$#" -eq 0 ]]; then
  set -- gunicorn --chdir backend app:app
fi

if [[ "$1" == "gunicorn" ]]; then
  has_bind=0
  for arg in "$@"; do
    if [[ "${arg}" == --bind ]] || [[ "${arg}" == --bind=* ]]; then
      has_bind=1
      break
    fi
  done
  if [[ ${has_bind} -eq 0 ]]; then
    set -- "$@" --bind "0.0.0.0:${PORT_VALUE}"
  fi
fi

echo "[entrypoint] Executando comando: $*"
exec "$@"
