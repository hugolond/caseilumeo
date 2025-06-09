#!/bin/sh

echo "⏳ Aguardando o banco ficar disponível..."
sleep 5

echo "✅ Banco disponível! Rodando migrations..."
npx prisma db push

echo "🚀 Iniciando o servidor..."
exec go run main.go
