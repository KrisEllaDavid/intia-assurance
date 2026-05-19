#!/bin/sh
set -e

echo "==> Synchronisation du schéma..."
npx prisma db push

echo "==> Seed initial (ignoré si données existantes)..."
npx prisma db seed 2>/dev/null || true

echo "==> Démarrage du serveur INTIA..."
node dist/index.js
