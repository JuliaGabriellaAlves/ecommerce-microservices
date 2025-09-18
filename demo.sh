#!/bin/bash

# Script de demonstração do sistema CompreFácil
# Este script simula o uso completo do sistema de e-commerce

echo "🛒 CompreFácil - Demonstração do Sistema de E-commerce"
echo "======================================================"
echo ""

# Verificar se os serviços estão rodando
echo "🔍 Verificando se os serviços estão online..."

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $name está online"
        return 0
    else
        echo "❌ $name não está respondendo"
        return 1
    fi
}

# Testar health checks
test_endpoint "http://localhost:3001/health" "Payment Service"
test_endpoint "http://localhost:3002/health" "Notification Service"

echo ""
echo "📊 Testando fluxo completo do sistema..."
echo ""

# Criar uma transação de exemplo
echo "1️⃣ Criando pagamento..."
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "amount": 99.99,
    "payment_method": "cartao_credito",
    "description": "Compra de demonstração - Produto XYZ"
  }')

if [ $? -eq 0 ]; then
    echo "✅ Pagamento criado com sucesso!"
    echo "📄 Resposta: $PAYMENT_RESPONSE"
else
    echo "❌ Erro ao criar pagamento"
    exit 1
fi

echo ""
echo "2️⃣ Aguardando processamento..."
sleep 3

echo ""
echo "3️⃣ Verificando notificações..."
NOTIFICATIONS=$(curl -s http://localhost:3002/api/notifications/user/1)

if [ $? -eq 0 ]; then
    echo "✅ Notificações recuperadas:"
    echo "📄 $NOTIFICATIONS"
else
    echo "❌ Erro ao recuperar notificações"
fi

echo ""
echo "4️⃣ Verificando estatísticas..."
STATS=$(curl -s http://localhost:3002/api/notifications/stats)

if [ $? -eq 0 ]; then
    echo "✅ Estatísticas:"
    echo "📊 $STATS"
else
    echo "❌ Erro ao recuperar estatísticas"
fi

echo ""
echo "🎉 Demonstração concluída!"
echo ""
echo "🔗 URLs úteis:"
echo "   • Payment Service: http://localhost:3001"
echo "   • Notification Service: http://localhost:3002"
echo "   • RabbitMQ Management: http://localhost:15672"
echo "   • Teste com arquivo: api-tests.http"
