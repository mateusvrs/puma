#!/bin/sh
set -e

# Copy .env.example file to .env
cp .env.example .env

exec "$@"