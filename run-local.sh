#!/bin/bash

# Script para executar o projeto localmente (sem Docker)
# Útil quando o Docker Desktop não está disponível

echo "🚀 Executando CompreFácil localmente (modo desenvolvimento)"
echo "========================================================"

# Verificar dependências
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado! Instale em: https://nodejs.org/"
    exit 1
fi

# Criar arquivos .env se não existirem
echo "🔧 Configurando variáveis de ambiente..."

if [ ! -f "payment-service/.env" ]; then
    cp payment-service/.env.example payment-service/.env
    echo "✅ Arquivo .env criado para Payment Service"
fi

if [ ! -f "notification-service/.env" ]; then
    cp notification-service/.env.example notification-service/.env
    echo "✅ Arquivo .env criado para Notification Service"
fi

# Função para executar serviço em background
run_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3
    
    echo "🚀 Iniciando $service_name na porta $port..."
    cd $service_dir
    
    # Verificar se as dependências estão instaladas
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependências do $service_name..."
        npm install
    fi
    
    # Executar o serviço
    npm start &
    local service_pid=$!
    echo "✅ $service_name iniciado (PID: $service_pid)"
    
    cd ..
    return $service_pid
}

echo ""
echo "⚠️  AVISO: Para funcionamento completo, você precisa de:"
echo "   - PostgreSQL rodando na porta 5432"
echo "   - RabbitMQ rodando na porta 5672"
echo "   - Ou use Docker Desktop: docker compose up --build"
echo ""

# Perguntar se deve continuar
read -p "Continuar mesmo assim? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Execução cancelada"
    exit 1
fi

echo ""
echo "🏃 Iniciando serviços..."

# Executar Payment Service
run_service "Payment Service" "payment-service" "3001"
PAYMENT_PID=$!

# Aguardar um pouco
sleep 2

# Executar Notification Service  
run_service "Notification Service" "notification-service" "3002"
NOTIFICATION_PID=$!

echo ""
echo "🎉 Serviços iniciados!"
echo ""
echo "📊 Status dos serviços:"
echo "   • Payment Service: http://localhost:3001/health"
echo "   • Notification Service: http://localhost:3002/health"
echo ""
echo "🔧 Para testar:"
echo "   • Use o arquivo api-tests.http no VS Code"
echo "   • Execute: curl http://localhost:3001/health"
echo ""
echo "⏹️  Para parar os serviços:"
echo "   • Pressione Ctrl+C ou execute: pkill -f 'node src/server.js'"
echo ""

# Aguardar input do usuário para manter os serviços rodando
echo "💡 Pressione Ctrl+C para parar todos os serviços..."
trap 'echo "🛑 Parando serviços..."; kill $PAYMENT_PID $NOTIFICATION_PID 2>/dev/null; exit 0' INT

# Manter o script rodando
wait
