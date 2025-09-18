const { Pool } = require('pg');

class DatabaseService {
    constructor() {
        this.pool = null;
    }

    async initialize() {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'comprefacil_db',
            user: process.env.DB_USER || 'comprefacil_user',
            password: process.env.DB_PASSWORD || 'comprefacil_password',
            max: 20, // máximo de conexões no pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };

        this.pool = new Pool(config);

        // Testar conexão
        try {
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('✅ Teste de conexão com PostgreSQL bem-sucedido');
        } catch (error) {
            console.error('❌ Erro ao conectar com PostgreSQL:', error);
            throw error;
        }
    }

    async query(text, params) {
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`Query executada em ${duration}ms:`, text.substring(0, 50));
            return res;
        } catch (error) {
            console.error('Erro na query:', error);
            throw error;
        }
    }

    async getClient() {
        return await this.pool.connect();
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Conexão com PostgreSQL fechada');
        }
    }

    // Métodos específicos para transações
    async createTransaction(transactionData) {
        const query = `
            INSERT INTO transactions (user_id, amount, payment_method, description, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [
            transactionData.user_id,
            transactionData.amount,
            transactionData.payment_method,
            transactionData.description,
            'PENDENTE'
        ];

        const result = await this.query(query, values);
        return result.rows[0];
    }

    async updateTransactionStatus(transactionId, status) {
        const query = `
            UPDATE transactions 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await this.query(query, [status, transactionId]);
        return result.rows[0];
    }

    async getTransaction(transactionId) {
        const query = 'SELECT * FROM transactions WHERE id = $1';
        const result = await this.query(query, [transactionId]);
        return result.rows[0];
    }

    async getTransactionsByUser(userId) {
        const query = `
            SELECT * FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await this.query(query, [userId]);
        return result.rows;
    }

    async getAllTransactions(limit = 50, offset = 0) {
        const query = `
            SELECT * FROM transactions 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;
        const result = await this.query(query, [limit, offset]);
        return result.rows;
    }
}

module.exports = new DatabaseService();
