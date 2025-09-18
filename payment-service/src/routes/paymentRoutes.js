const express = require('express');
const PaymentService = require('../services/PaymentService');
const router = express.Router();

// GET /api/payments/test - Endpoint de teste
router.get('/test', (req, res) => {
    res.json({
        message: '✅ Payment Service está funcionando!',
        service: 'payment-service',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/payments/test - Este endpoint',
            'POST /api/payments/process - Processar pagamento',
            'GET /api/payments/history - Histórico de pagamentos',
            'GET /api/payments/:id - Buscar pagamento por ID'
        ]
    });
});

// GET /api/payments/history - Histórico de pagamentos
router.get('/history', async (req, res) => {
    try {
        const transactions = await PaymentService.getTransactionHistory();
        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar histórico',
            message: error.message
        });
    }
});

// POST /api/payments/process - Processar pagamento (alias para compatibilidade)
router.post('/process', async (req, res) => {
    try {
        const paymentData = req.body;

        // Validar dados de entrada
        const validationErrors = PaymentService.validatePaymentData(paymentData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationErrors
            });
        }

        // Processar pagamento
        const result = await PaymentService.processPayment(paymentData);

        res.status(201).json({
            success: true,
            data: result.transaction,
            message: result.message
        });

    } catch (error) {
        console.error('Erro na rota de pagamento:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// POST /api/payments - Criar novo pagamento
router.post('/', async (req, res) => {
    try {
        const paymentData = req.body;

        // Validar dados de entrada
        const validationErrors = PaymentService.validatePaymentData(paymentData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationErrors
            });
        }

        // Processar pagamento
        const result = await PaymentService.processPayment(paymentData);

        res.status(201).json({
            success: true,
            data: result.transaction,
            message: result.message
        });

    } catch (error) {
        console.error('Erro na rota de pagamento:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/payments/:id - Buscar pagamento por ID
router.get('/:id', async (req, res) => {
    try {
        const transactionId = parseInt(req.params.id);

        if (isNaN(transactionId)) {
            return res.status(400).json({
                error: 'ID de transação inválido'
            });
        }

        const transaction = await PaymentService.getTransaction(transactionId);

        res.json({
            success: true,
            data: transaction
        });

    } catch (error) {
        if (error.message === 'Transação não encontrada') {
            return res.status(404).json({
                error: 'Transação não encontrada'
            });
        }

        console.error('Erro ao buscar transação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/payments/user/:userId - Buscar pagamentos por usuário
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                error: 'ID de usuário inválido'
            });
        }

        const transactions = await PaymentService.getTransactionsByUser(userId);

        res.json({
            success: true,
            data: transactions,
            count: transactions.length
        });

    } catch (error) {
        console.error('Erro ao buscar transações do usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/payments - Buscar todos os pagamentos (com paginação)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'Parâmetros de paginação inválidos',
                details: 'page deve ser >= 1 e limit deve estar entre 1 e 100'
            });
        }

        const transactions = await PaymentService.getAllTransactions(page, limit);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                count: transactions.length
            }
        });

    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

module.exports = router;
