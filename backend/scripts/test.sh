#!/bin/sh
set -e

export DATABASE_PORT=5433

docker compose -f docker-compose.test.yml -p puma-api-test up -d

echo "Waiting for db-test to be healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' postgres-test)" = "healthy" ]; do
    sleep 0.5
done
echo 'PostgreSQL is ready'

echo "Running migrations..."
npx prisma migrate deploy
npx prisma generate

echo "Running tests..."
PORT=3001 node --experimental-vm-modules --no-warnings node_modules/jest/bin/jest.js --silent

exec "$@"