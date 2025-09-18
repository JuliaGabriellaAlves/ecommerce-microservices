const DatabaseService = require('../services/DatabaseService');
const MessageService = require('../services/MessageService');

class PaymentService {
    
    async processPayment(paymentData) {
        try {
            // 1. Salvar transação como PENDENTE no banco
            const transaction = await DatabaseService.createTransaction(paymentData);
            console.log('💾 Transação criada:', transaction.id);

            // 2. Enviar mensagem de transação recebida
            await MessageService.publishTransactionReceived(transaction);

            // 3. Simular processamento do pagamento (async)
            this.processPaymentAsync(transaction);

            return {
                success: true,
                transaction,
                message: 'Pagamento recebido e sendo processado'
            };

        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            throw new Error('Falha ao processar pagamento');
        }
    }

    async processPaymentAsync(transaction) {
        try {
            // Simular delay de processamento (2-5 segundos)
            const delay = Math.random() * 3000 + 2000;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Simular sucesso/falha (90% sucesso)
            const isSuccess = Math.random() > 0.1;

            if (isSuccess) {
                // Atualizar status para SUCESSO
                const updatedTransaction = await DatabaseService.updateTransactionStatus(
                    transaction.id, 
                    'SUCESSO'
                );

                // Enviar mensagem de confirmação
                await MessageService.publishTransactionConfirmed(updatedTransaction);
                console.log('✅ Pagamento processado com sucesso:', transaction.id);

            } else {
                // Atualizar status para FALHA
                const updatedTransaction = await DatabaseService.updateTransactionStatus(
                    transaction.id, 
                    'FALHA'
                );

                // Enviar mensagem de falha
                await MessageService.publishTransactionFailed(updatedTransaction);
                console.log('❌ Pagamento falhou:', transaction.id);
            }

        } catch (error) {
            console.error('Erro no processamento assíncrono:', error);
            
            try {
                // Em caso de erro, marcar como FALHA
                const updatedTransaction = await DatabaseService.updateTransactionStatus(
                    transaction.id, 
                    'FALHA'
                );
                await MessageService.publishTransactionFailed(updatedTransaction);
            } catch (updateError) {
                console.error('Erro ao atualizar status de falha:', updateError);
            }
        }
    }

    async getTransaction(transactionId) {
        try {
            const transaction = await DatabaseService.getTransaction(transactionId);
            if (!transaction) {
                throw new Error('Transação não encontrada');
            }
            return transaction;
        } catch (error) {
            console.error('Erro ao buscar transação:', error);
            throw error;
        }
    }

    async getTransactionsByUser(userId) {
        try {
            return await DatabaseService.getTransactionsByUser(userId);
        } catch (error) {
            console.error('Erro ao buscar transações do usuário:', error);
            throw error;
        }
    }

    async getAllTransactions(page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            return await DatabaseService.getAllTransactions(limit, offset);
        } catch (error) {
            console.error('Erro ao buscar todas as transações:', error);
            throw error;
        }
    }

    async getTransactionHistory(limit = 10) {
        try {
            const transactions = await DatabaseService.getAllTransactions(limit, 0);
            return transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                payment_method: t.payment_method,
                status: t.status,
                created_at: t.created_at,
                updated_at: t.updated_at
            }));
        } catch (error) {
            console.error('Erro ao buscar histórico de transações:', error);
            // Retornar dados de exemplo se não conseguir acessar o banco
            return [
                {
                    id: 1,
                    amount: 100.00,
                    payment_method: 'cartao_credito',
                    status: 'SUCESSO',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 2,
                    amount: 250.50,
                    payment_method: 'pix',
                    status: 'PENDENTE',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
        }
    }

    validatePaymentData(data) {
        const errors = [];

        if (!data.user_id || !Number.isInteger(data.user_id) || data.user_id <= 0) {
            errors.push('user_id deve ser um número inteiro positivo');
        }

        if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
            errors.push('amount deve ser um número positivo');
        }

        if (!data.payment_method || typeof data.payment_method !== 'string') {
            errors.push('payment_method é obrigatório');
        }

        const validPaymentMethods = ['cartao_credito', 'cartao_debito', 'pix', 'boleto'];
        if (data.payment_method && !validPaymentMethods.includes(data.payment_method)) {
            errors.push('payment_method deve ser um dos seguintes: ' + validPaymentMethods.join(', '));
        }

        if (data.amount && data.amount > 10000) {
            errors.push('amount não pode ser superior a R$ 10.000,00');
        }

        return errors;
    }
}

module.exports = new PaymentService();
