# syntax=docker/dockerfile:1
FROM python:3.11-bullseye

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=utf-8 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /workspace

# Dependências de sistema necessárias para compilar wheels e acessar endpoints HTTPS
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copia código e requisitos básicos (substituídos por volume em desenvolvimento)
COPY backend /workspace/backend
COPY requirements.txt /workspace/requirements.txt
COPY docker/docker-entrypoint.sh /opt/cara-core/entrypoint.sh

RUN chmod +x /opt/cara-core/entrypoint.sh \
    && mkdir -p /workspace/backend/.python_packages/lib/site-packages

ENTRYPOINT ["/opt/cara-core/entrypoint.sh"]
CMD ["gunicorn", "--chdir", "backend", "app:app"]
