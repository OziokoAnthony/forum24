FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# The app package is copied before installing so setuptools can find every
# subpackage (routers, schemas, services). psycopg binary wheels avoid a compiler.
COPY pyproject.toml ./
COPY app ./app
RUN python -m pip install --upgrade pip \
    && python -m pip install ".[postgres]"

COPY alembic.ini ./
COPY alembic ./alembic
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Run as an unprivileged user; no application files need to be writable.
RUN useradd --create-home --uid 10001 forum24 \
    && chown -R forum24:forum24 /app
USER forum24

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import json,urllib.request,sys; d=json.load(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3)); sys.exit(0 if d.get('status') == 'ok' else 1)"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
