#!/bin/sh
set -eu

# Apply migrations before the API starts. Compose waits for the database
# healthcheck, so a short retry loop is enough for slower hosts.
attempt=1
max_attempts=30
while ! python -m alembic upgrade head; do
    if [ "$attempt" -ge "$max_attempts" ]; then
        echo "Migrations failed after ${max_attempts} attempts" >&2
        exit 1
    fi
    echo "Migrations failed (attempt ${attempt}/${max_attempts}); retrying in 2s" >&2
    attempt=$((attempt + 1))
    sleep 2
done

exec "$@"
