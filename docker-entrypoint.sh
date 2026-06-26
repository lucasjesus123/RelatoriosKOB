#!/bin/sh
set -e

# Aguarda o Postgres aceitar conexões antes de migrar.
echo "[entrypoint] Aguardando o banco de dados..."
until node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => c.end()).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "[entrypoint] Banco indisponível, tentando de novo em 2s..."
  sleep 2
done

echo "[entrypoint] Aplicando migrações..."
npx prisma migrate deploy

echo "[entrypoint] Rodando seed (idempotente)..."
npx prisma db seed || echo "[entrypoint] Seed falhou ou já aplicado — seguindo."

echo "[entrypoint] Iniciando aplicação..."
exec npm run start
