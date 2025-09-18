const amqp = require('amqplib');

class MessageService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.exchangeName = 'comprefacil_exchange';
    }

    async initialize() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://comprefacil_user:comprefacil_password@localhost:5672';
            
            // Conectar ao RabbitMQ
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();

            // Criar exchange
            await this.channel.assertExchange(this.exchangeName, 'topic', {
                durable: true
            });

            // Configurar filas
            await this.setupQueues();

            console.log('✅ MessageService inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar MessageService:', error);
            throw error;
        }
    }

    async setupQueues() {
        // Fila para notificações de transação recebida
        await this.channel.assertQueue('transaction_received', {
            durable: true
        });
        await this.channel.bindQueue('transaction_received', this.exchangeName, 'payment.transaction.received');

        // Fila para notificações de transação confirmada
        await this.channel.assertQueue('transaction_confirmed', {
            durable: true
        });
        await this.channel.bindQueue('transaction_confirmed', this.exchangeName, 'payment.transaction.confirmed');

        // Fila para notificações de transação falhada
        await this.channel.assertQueue('transaction_failed', {
            durable: true
        });
        await this.channel.bindQueue('transaction_failed', this.exchangeName, 'payment.transaction.failed');
    }

    async publishTransactionReceived(transactionData) {
        const message = {
            event: 'transaction_received',
            data: transactionData,
            timestamp: new Date().toISOString(),
            service: 'payment-service'
        };

        await this.channel.publish(
            this.exchangeName,
            'payment.transaction.received',
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        console.log('📤 Mensagem publicada: transaction_received', transactionData.id);
    }

    async publishTransactionConfirmed(transactionData) {
        const message = {
            event: 'transaction_confirmed',
            data: transactionData,
            timestamp: new Date().toISOString(),
            service: 'payment-service'
        };

        await this.channel.publish(
            this.exchangeName,
            'payment.transaction.confirmed',
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        console.log('📤 Mensagem publicada: transaction_confirmed', transactionData.id);
    }

    async publishTransactionFailed(transactionData) {
        const message = {
            event: 'transaction_failed',
            data: transactionData,
            timestamp: new Date().toISOString(),
            service: 'payment-service'
        };

        await this.channel.publish(
            this.exchangeName,
            'payment.transaction.failed',
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        console.log('📤 Mensagem publicada: transaction_failed', transactionData.id);
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('Conexão com RabbitMQ fechada');
        } catch (error) {
            console.error('Erro ao fechar conexão com RabbitMQ:', error);
        }
    }
}

module.exports = new MessageService();
