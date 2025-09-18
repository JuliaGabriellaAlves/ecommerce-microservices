class NotificationService {
    constructor() {
        this.notifications = []; // Array para armazenar histórico de notificações
        this.initializeWithSampleData();
    }

    initializeWithSampleData() {
        // Adicionar algumas notificações de exemplo
        this.notifications = [
            {
                id: 1,
                type: 'email',
                recipient: 'usuario@exemplo.com',
                subject: 'Pagamento Confirmado',
                message: 'Seu pagamento de R$ 150,00 foi processado com sucesso!',
                status: 'sent',
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
            },
            {
                id: 2,
                type: 'sms',
                recipient: '+5511999999999',
                message: 'Transação aprovada: R$ 75,50 no cartão final 1234',
                status: 'sent',
                timestamp: new Date(Date.now() - 1800000).toISOString() // 30 min atrás
            },
            {
                id: 3,
                type: 'push',
                recipient: 'user_device_123',
                subject: 'Nova promoção!',
                message: 'Desconto de 20% em todos os produtos até sexta-feira!',
                status: 'sent',
                timestamp: new Date(Date.now() - 900000).toISOString() // 15 min atrás
            }
        ];
    }

    async sendTransactionReceivedNotification(transaction) {
        try {
            const notification = {
                id: this.generateNotificationId(),
                type: 'transaction_received',
                user_id: transaction.user_id,
                transaction_id: transaction.id,
                title: '💳 Pagamento Recebido',
                message: `Seu pagamento de R$ ${transaction.amount.toFixed(2)} foi recebido e está sendo processado.`,
                details: {
                    amount: transaction.amount,
                    payment_method: this.formatPaymentMethod(transaction.payment_method),
                    description: transaction.description
                },
                timestamp: new Date().toISOString(),
                status: 'sent'
            };

            // Simular envio de notificação
            await this.simulateNotificationSending(notification);

            // Armazenar no histórico
            this.notifications.push(notification);

            console.log(`🔔 Notificação enviada [${notification.type}]:`, notification.message);
            return notification;

        } catch (error) {
            console.error('Erro ao enviar notificação de pagamento recebido:', error);
            throw error;
        }
    }

    async sendTransactionConfirmedNotification(transaction) {
        try {
            const notification = {
                id: this.generateNotificationId(),
                type: 'transaction_confirmed',
                user_id: transaction.user_id,
                transaction_id: transaction.id,
                title: '✅ Pagamento Confirmado',
                message: `Seu pagamento de R$ ${transaction.amount.toFixed(2)} foi processado com sucesso!`,
                details: {
                    amount: transaction.amount,
                    payment_method: this.formatPaymentMethod(transaction.payment_method),
                    description: transaction.description,
                    confirmed_at: transaction.updated_at
                },
                timestamp: new Date().toISOString(),
                status: 'sent'
            };

            // Simular envio de notificação
            await this.simulateNotificationSending(notification);

            // Armazenar no histórico
            this.notifications.push(notification);

            console.log(`🔔 Notificação enviada [${notification.type}]:`, notification.message);
            return notification;

        } catch (error) {
            console.error('Erro ao enviar notificação de pagamento confirmado:', error);
            throw error;
        }
    }

    async sendTransactionFailedNotification(transaction) {
        try {
            const notification = {
                id: this.generateNotificationId(),
                type: 'transaction_failed',
                user_id: transaction.user_id,
                transaction_id: transaction.id,
                title: '❌ Falha no Pagamento',
                message: `Houve um problema com seu pagamento de R$ ${transaction.amount.toFixed(2)}. Entre em contato conosco.`,
                details: {
                    amount: transaction.amount,
                    payment_method: this.formatPaymentMethod(transaction.payment_method),
                    description: transaction.description,
                    failed_at: transaction.updated_at
                },
                timestamp: new Date().toISOString(),
                status: 'sent'
            };

            // Simular envio de notificação
            await this.simulateNotificationSending(notification);

            // Armazenar no histórico
            this.notifications.push(notification);

            console.log(`🔔 Notificação enviada [${notification.type}]:`, notification.message);
            return notification;

        } catch (error) {
            console.error('Erro ao enviar notificação de pagamento falhado:', error);
            throw error;
        }
    }

    async sendNotification(notificationData) {
        try {
            const notification = {
                id: this.generateNotificationId(),
                type: notificationData.type,
                recipient: notificationData.recipient,
                subject: notificationData.subject || 'Notificação CompreFácil',
                message: notificationData.message,
                priority: notificationData.priority || 'normal',
                status: 'sent',
                timestamp: new Date().toISOString()
            };

            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

            // Armazenar no histórico
            this.notifications.unshift(notification); // Adicionar no início da lista

            console.log(`🔔 Notificação ${notification.type} enviada para:`, notification.recipient);
            return notification;

        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            throw error;
        }
    }

    async simulateNotificationSending(notification) {
        // Simular delay de envio (email, SMS, push notification, etc.)
        const delay = Math.random() * 1000 + 500; // 500ms a 1.5s
        await new Promise(resolve => setTimeout(resolve, delay));

        // Simular diferentes canais de notificação
        const channels = this.getNotificationChannels(notification.type);
        
        for (const channel of channels) {
            console.log(`📤 Enviando via ${channel}: ${notification.title}`);
        }
    }

    getNotificationHistory(limit = 10) {
        return this.notifications.slice(0, limit);
    }

    getNotificationChannels(type) {
        switch (type) {
            case 'transaction_received':
                return ['email', 'push']; // Notificação discreta
            case 'transaction_confirmed':
                return ['email', 'sms', 'push']; // Confirmação importante
            case 'transaction_failed':
                return ['email', 'sms', 'push']; // Alerta crítico
            default:
                return ['push'];
        }
    }

    formatPaymentMethod(method) {
        const methods = {
            'cartao_credito': 'Cartão de Crédito',
            'cartao_debito': 'Cartão de Débito',
            'pix': 'PIX',
            'boleto': 'Boleto Bancário'
        };
        return methods[method] || method;
    }

    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Métodos para consulta do histórico
    getAllNotifications() {
        return this.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getNotificationsByUser(userId) {
        return this.notifications
            .filter(n => n.user_id === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getNotificationsByTransaction(transactionId) {
        return this.notifications
            .filter(n => n.transaction_id === transactionId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getNotificationStats() {
        const total = this.notifications.length;
        const byType = this.notifications.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            by_type: byType,
            last_24h: this.notifications.filter(n => 
                Date.now() - new Date(n.timestamp).getTime() < 24 * 60 * 60 * 1000
            ).length
        };
    }
}

module.exports = new NotificationService();
