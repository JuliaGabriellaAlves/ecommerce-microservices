const express = require('express');
const NotificationService = require('../services/NotificationService');
const router = express.Router();

// GET /api/notifications/test - Endpoint de teste
router.get('/test', (req, res) => {
    res.json({
        message: '✅ Notification Service está funcionando!',
        service: 'notification-service',
        timestamp: new Date().toISOString(),
        types: ['email', 'sms', 'push', 'in-app'],
        endpoints: [
            'GET /api/notifications/test - Este endpoint',
            'POST /api/notifications/send - Enviar notificação',
            'GET /api/notifications/history - Histórico de notificações'
        ]
    });
});

// GET /api/notifications/history - Histórico de notificações
router.get('/history', (req, res) => {
    try {
        const notifications = NotificationService.getNotificationHistory();
        res.json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar histórico',
            message: error.message
        });
    }
});

// POST /api/notifications/send - Enviar notificação
router.post('/send', async (req, res) => {
    try {
        const notificationData = req.body;
        
        // Validar dados
        if (!notificationData.type || !notificationData.recipient || !notificationData.message) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: 'type, recipient e message são obrigatórios'
            });
        }

        const result = await NotificationService.sendNotification(notificationData);
        
        res.status(201).json({
            success: true,
            data: result,
            message: 'Notificação enviada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        res.status(500).json({
            error: 'Erro ao enviar notificação',
            message: error.message
        });
    }
});

// GET /api/notifications - Buscar todas as notificações
router.get('/', (req, res) => {
    try {
        const notifications = NotificationService.getAllNotifications();
        
        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/notifications/user/:userId - Buscar notificações por usuário
router.get('/user/:userId', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                error: 'ID de usuário inválido'
            });
        }

        const notifications = NotificationService.getNotificationsByUser(userId);
        
        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (error) {
        console.error('Erro ao buscar notificações do usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/notifications/transaction/:transactionId - Buscar notificações por transação
router.get('/transaction/:transactionId', (req, res) => {
    try {
        const transactionId = parseInt(req.params.transactionId);

        if (isNaN(transactionId)) {
            return res.status(400).json({
                error: 'ID de transação inválido'
            });
        }

        const notifications = NotificationService.getNotificationsByTransaction(transactionId);
        
        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (error) {
        console.error('Erro ao buscar notificações da transação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/notifications/stats - Estatísticas de notificações
router.get('/stats', (req, res) => {
    try {
        const stats = NotificationService.getNotificationStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

module.exports = router;
