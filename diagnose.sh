#!/bin/bash

# Script de diagnóstico para identificar problemas no sistema

echo "🔍 Diagnóstico do Sistema CompreFácil"
echo "====================================="
echo ""

# Função para testar comando
test_command() {
    local cmd=$1
    local name=$2
    
    if command -v $cmd &> /dev/null; then
        local version=$($cmd --version 2>/dev/null | head -n1)
        echo "✅ $name: $version"
        return 0
    else
        echo "❌ $name: Não encontrado"
        return 1
    fi
}

# Função para testar porta
test_port() {
    local port=$1
    local name=$2
    
    if lsof -i :$port &> /dev/null; then
        local process=$(lsof -i :$port | tail -n1 | awk '{print $1}')
        echo "⚠️  Porta $port ocupada por: $process"
        return 1
    else
        echo "✅ Porta $port: Livre"
        return 0
    fi
}

# Função para testar URL
test_url() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $name: Respondendo"
        return 0
    else
        echo "❌ $name: Não respondendo"
        return 1
    fi
}

echo "1. 🛠️  Verificando ferramentas instaladas:"
test_command "node" "Node.js"
test_command "npm" "npm"
test_command "docker" "Docker"
test_command "docker-compose" "Docker Compose (v1)"
docker compose version &> /dev/null && echo "✅ Docker Compose (v2): $(docker compose version)"

echo ""
echo "2. 🔌 Verificando portas:"
test_port 3001 "Payment Service"
test_port 3002 "Notification Service"
test_port 5432 "PostgreSQL"
test_port 5672 "RabbitMQ"
test_port 15672 "RabbitMQ Management"

echo ""
echo "3. 🐳 Verificando Docker:"
if docker info &> /dev/null; then
    echo "✅ Docker daemon: Rodando"
    echo "📊 Containers ativos: $(docker ps --format 'table {{.Names}}' | tail -n +2 | wc -l)"
else
    echo "❌ Docker daemon: Não está rodando"
    echo "💡 Solução: Abra o Docker Desktop"
fi

echo ""
echo "4. 📁 Verificando arquivos do projeto:"
files=("docker-compose.yml" "payment-service/package.json" "notification-service/package.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file: Existe"
    else
        echo "❌ $file: Não encontrado"
    fi
done

echo ""
echo "5. 🔗 Testando serviços (se estiverem rodando):"
test_url "http://localhost:3001/health" "Payment Service"
test_url "http://localhost:3002/health" "Notification Service"

echo ""
echo "📋 RESUMO E SOLUÇÕES:"
echo "===================="

if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando"
    echo "   💡 Abra o Docker Desktop e aguarde a inicialização"
    echo "   💡 Ou execute localmente: ./run-local.sh"
fi

if [ ! -f "payment-service/.env" ]; then
    echo "❌ Arquivo .env não encontrado"
    echo "   💡 Execute: cp payment-service/.env.example payment-service/.env"
fi

echo ""
echo "🚀 Comandos para executar:"
echo "   • Docker (recomendado): docker compose up --build"
echo "   • Local (desenvolvimento): ./run-local.sh"
echo "   • Diagnóstico: ./diagnose.sh"
