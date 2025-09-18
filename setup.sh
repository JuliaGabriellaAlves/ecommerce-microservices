#!/bin/bash

# Script para configurar e executar o projeto CompreFácil localmente
# Este script instala as dependências e configura o ambiente de desenvolvimento

echo "🚀 Configurando projeto CompreFácil - Sistema de Microsserviços"
echo "=============================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "📥 Por favor, instale Node.js em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar dependências do Payment Service
echo ""
echo "📦 Instalando dependências do Payment Service..."
cd payment-service
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do Payment Service"
    exit 1
fi
echo "✅ Dependências do Payment Service instaladas"

# Instalar dependências do Notification Service
echo ""
echo "📦 Instalando dependências do Notification Service..."
cd ../notification-service
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do Notification Service"
    exit 1
fi
echo "✅ Dependências do Notification Service instaladas"

cd ..

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Para usar Docker (recomendado):"
echo "   - Instale Docker Desktop: https://docs.docker.com/get-docker/"
echo "   - Execute: docker compose up --build"
echo ""
echo "2. Para executar localmente:"
echo "   - Instale PostgreSQL e RabbitMQ"
echo "   - Configure as variáveis de ambiente"
echo "   - Execute cada serviço em terminais separados"
echo ""
echo "🔧 Comandos úteis:"
echo "   - Testar APIs: Use o arquivo api-tests.http no VS Code"
echo "   - Ver logs: docker compose logs -f"
echo "   - Parar serviços: docker compose down"
