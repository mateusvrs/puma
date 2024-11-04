#!/bin/sh
set -e

is_port_available() {
    nc -z localhost "$1" 2>/dev/null
    return $?
}

for port in $(seq 3001 9892); do
    if ! is_port_available "$port"; then
        echo "Running tests on port $port"
        DATABASE_PORT=5433 PORT="$port" node --experimental-vm-modules --no-warnings node_modules/jest/bin/jest.js --silent
        exit 0
    fi
done

echo "No available port found to run the tests"

exec "$@"