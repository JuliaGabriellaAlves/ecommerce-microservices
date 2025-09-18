const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');
const DatabaseService = require('./services/DatabaseService');
const MessageService = require('./services/MessageService');

class PaymentServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeServices();
    }

    initializeMiddlewares() {
        // Segurança
        this.app.use(helmet());
        
        // CORS
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100 // máximo 100 requests por IP por janela
        });
        this.app.use(limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }

    initializeRoutes() {
        // Página de demonstração
        this.app.get('/', (req, res) => {
            res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Service - CompreFácil</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        .service-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .endpoints { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .endpoint { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #007bff; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .result { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <h1>💳 Payment Service - CompreFácil</h1>
        
        <div class="service-info">
            <h3>ℹ️ Informações do Serviço</h3>
            <p><strong>Status:</strong> ✅ Ativo</p>
            <p><strong>Porta:</strong> ${this.port}</p>
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>

        <div class="endpoints">
            <h3>🚀 Endpoints Disponíveis</h3>
            
            <div class="endpoint">
                <strong>GET /health</strong> - Status do serviço
                <button onclick="testEndpoint('/health')">Testar</button>
            </div>
            
            <div class="endpoint">
                <strong>GET /api/payments/test</strong> - Teste de funcionamento
                <button onclick="testEndpoint('/api/payments/test')">Testar</button>
            </div>
            
            <div class="endpoint">
                <strong>POST /api/payments/process</strong> - Processar pagamento
                <button onclick="testPayment()">Testar Pagamento</button>
            </div>
            
            <div class="endpoint">
                <strong>GET /api/payments/history</strong> - Histórico de pagamentos
                <button onclick="testEndpoint('/api/payments/history')">Testar</button>
            </div>
        </div>

        <div id="result" class="result" style="display: none;"></div>
    </div>

    <script>
        async function testEndpoint(path) {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Carregando...';
            
            try {
                const response = await fetch(path);
                const data = await response.json();
                resultDiv.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                resultDiv.textContent = 'Erro: ' + error.message;
            }
        }

        async function testPayment() {
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Processando pagamento de teste...';
            
            try {
                const response = await fetch('/api/payments/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: 100.00,
                        currency: 'BRL',
                        paymentMethod: 'credit_card',
                        customerEmail: 'teste@exemplo.com',
                        description: 'Compra de teste'
                    })
                });
                const data = await response.json();
                resultDiv.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                resultDiv.textContent = 'Erro: ' + error.message;
            }
        }
    </script>
</body>
</html>
            `);
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                service: 'payment-service',
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // API routes
        this.app.use('/api/payments', paymentRoutes);

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint não encontrado',
                path: req.originalUrl,
                method: req.method
            });
        });

        // Error handler
        this.app.use((error, req, res, next) => {
            console.error('Error:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
            });
        });
    }

    async initializeServices() {
        try {
            // Inicializar conexão com o banco
            await DatabaseService.initialize();
            console.log('✅ Conexão com PostgreSQL estabelecida');

            // Inicializar serviço de mensageria
            await MessageService.initialize();
            console.log('✅ Conexão com RabbitMQ estabelecida');

        } catch (error) {
            console.error('❌ Erro ao inicializar serviços:', error);
            process.exit(1);
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`
🚀 Payment Service (CompreFácil) iniciado!
📊 Porta: ${this.port}
🌍 Ambiente: ${process.env.NODE_ENV || 'development'}
🕐 Timestamp: ${new Date().toISOString()}
            `);
        });
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Recebido SIGTERM, desligando graciosamente...');
    await MessageService.close();
    await DatabaseService.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Recebido SIGINT, desligando graciosamente...');
    await MessageService.close();
    await DatabaseService.close();
    process.exit(0);
});

// Iniciar servidor
const server = new PaymentServer();
server.start();
