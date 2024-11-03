#!/bin/sh
set -e

export DATABASE_PORT=5433

docker compose -f docker-compose.test.yml up db-test -d

echo "Waiting for db-test to be healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' postgres-test)" = "healthy" ]; do
    sleep 0.5
done

echo 'PostgreSQL is ready'

npx prisma migrate deploy

npx prisma generate

node --experimental-vm-modules --no-warnings node_modules/jest/bin/jest.js

docker compose -f docker-compose.test.yml down db-test -v

exec "$@"