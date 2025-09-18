const amqp = require('amqplib');
const NotificationService = require('./NotificationService');

class MessageConsumerService {
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

            // Configurar prefetch para processar uma mensagem por vez
            this.channel.prefetch(1);

            // Iniciar consumers
            await this.startConsumers();

            console.log('✅ MessageConsumerService inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar MessageConsumerService:', error);
            throw error;
        }
    }

    async startConsumers() {
        // Consumer para transações recebidas
        await this.channel.consume('transaction_received', async (message) => {
            if (message) {
                try {
                    const data = JSON.parse(message.content.toString());
                    console.log('📥 Mensagem recebida: transaction_received', data.data.id);
                    
                    await NotificationService.sendTransactionReceivedNotification(data.data);
                    
                    this.channel.ack(message);
                } catch (error) {
                    console.error('Erro ao processar transaction_received:', error);
                    this.channel.nack(message, false, false); // Rejeitar e não reenviar
                }
            }
        });

        // Consumer para transações confirmadas
        await this.channel.consume('transaction_confirmed', async (message) => {
            if (message) {
                try {
                    const data = JSON.parse(message.content.toString());
                    console.log('📥 Mensagem recebida: transaction_confirmed', data.data.id);
                    
                    await NotificationService.sendTransactionConfirmedNotification(data.data);
                    
                    this.channel.ack(message);
                } catch (error) {
                    console.error('Erro ao processar transaction_confirmed:', error);
                    this.channel.nack(message, false, false); // Rejeitar e não reenviar
                }
            }
        });

        // Consumer para transações falhadas
        await this.channel.consume('transaction_failed', async (message) => {
            if (message) {
                try {
                    const data = JSON.parse(message.content.toString());
                    console.log('📥 Mensagem recebida: transaction_failed', data.data.id);
                    
                    await NotificationService.sendTransactionFailedNotification(data.data);
                    
                    this.channel.ack(message);
                } catch (error) {
                    console.error('Erro ao processar transaction_failed:', error);
                    this.channel.nack(message, false, false); // Rejeitar e não reenviar
                }
            }
        });
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

module.exports = new MessageConsumerService();
