#!/bin/sh
set -e

if [ ! -f .env ]; then
  echo ".env not found. Please create it from .env.example"
  exit 1
fi

php artisan config:clear || true
php artisan cache:clear || true

# Generate key only if empty
if ! grep -q "^APP_KEY=base64:" .env; then
  php artisan key:generate
fi

exec php artisan serve --host=0.0.0.0 --port=8000