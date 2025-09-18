# CompreFácil - Sistema de E-commerce com Microsserviços

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## 🏗️ Arquitetura

Este projeto implementa um sistema de e-commerce usando arquitetura de microsserviços, composto por:

- **Payment Service**: Processamento de pagamentos
- **Notification Service**: Sistema de notificações
- **PostgreSQL**: Banco de dados para transações
- **RabbitMQ**: Sistema de mensageria assíncrona
- **Docker**: Containerização e orquestração

## 🚀 Fluxo Completo do Sistema

```mermaid
graph TD
    A[Cliente] -->|POST /api/payments| B[Payment Service]
    B -->|Salva PENDENTE| C[PostgreSQL]
    B -->|Publica evento| D[RabbitMQ]
    D -->|Consome evento| E[Notification Service]
    E -->|Envia notificação| F[Usuário: "Pagamento recebido"]
    B -->|Processa pagamento| G[Atualiza status]
    G -->|SUCESSO/FALHA| C
    G -->|Publica evento| D
    D -->|Consome evento| E
    E -->|Envia notificação| H[Usuário: "Pagamento confirmado/falhado"]
```

## 📋 Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/downloads))

## 🛠️ Instalação e Execução

### 1. Clone o repositório
```bash
git clone <repository-url>
cd ecommerce-microservices
```

### 2. Inicie todo o sistema com Docker
```bash
docker-compose up --build
```

### 3. Aguarde a inicialização
Os serviços estarão disponíveis em:
- **Payment Service**: http://localhost:3001
- **Notification Service**: http://localhost:3002
- **PostgreSQL**: localhost:5432
- **RabbitMQ Management**: http://localhost:15672 (usuário: `comprefacil_user`, senha: `comprefacil_password`)

## 🧪 Testando o Sistema

### 1. Verificar se os serviços estão funcionando

**Health Check - Payment Service:**
```bash
curl http://localhost:3001/health
```

**Health Check - Notification Service:**
```bash
curl http://localhost:3002/health
```

### 2. Criar um pagamento

```bash
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "amount": 99.99,
    "payment_method": "cartao_credito",
    "description": "Compra de produto XYZ"
  }'
```

### 3. Acompanhar as notificações

```bash
# Ver todas as notificações
curl http://localhost:3002/api/notifications

# Ver notificações de um usuário
curl http://localhost:3002/api/notifications/user/1

# Ver estatísticas
curl http://localhost:3002/api/notifications/stats
```

### 4. Consultar uma transação

```bash
# Buscar transação por ID
curl http://localhost:3001/api/payments/1

# Buscar transações de um usuário
curl http://localhost:3001/api/payments/user/1
```

## 📊 Endpoints da API

### Payment Service (Porto 3001)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Health check do serviço |
| `POST` | `/api/payments` | Criar novo pagamento |
| `GET` | `/api/payments/:id` | Buscar pagamento por ID |
| `GET` | `/api/payments/user/:userId` | Buscar pagamentos por usuário |
| `GET` | `/api/payments` | Listar todos os pagamentos (paginado) |

### Notification Service (Porto 3002)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Health check do serviço |
| `GET` | `/api/notifications` | Listar todas as notificações |
| `GET` | `/api/notifications/user/:userId` | Notificações por usuário |
| `GET` | `/api/notifications/transaction/:transactionId` | Notificações por transação |
| `GET` | `/api/notifications/stats` | Estatísticas de notificações |

## 🗄️ Estrutura do Banco de Dados

### Tabela: `transactions`

```sql
Column         | Type                 | Description
---------------|---------------------|---------------------------
id             | SERIAL PRIMARY KEY  | ID único da transação
user_id        | INTEGER NOT NULL    | ID do usuário
amount         | DECIMAL(10,2)       | Valor da transação
status         | VARCHAR(20)         | PENDENTE/SUCESSO/FALHA
payment_method | VARCHAR(50)         | Método de pagamento
description    | TEXT                | Descrição da transação
created_at     | TIMESTAMP           | Data de criação
updated_at     | TIMESTAMP           | Data de atualização
```

## 🔄 Sistema de Mensageria

### Exchange: `comprefacil_exchange` (topic)

| Routing Key | Fila | Descrição |
|-------------|------|-----------|
| `payment.transaction.received` | `transaction_received` | Transação recebida |
| `payment.transaction.confirmed` | `transaction_confirmed` | Transação confirmada |
| `payment.transaction.failed` | `transaction_failed` | Transação falhada |

## 🐳 Comandos Docker Úteis

```bash
# Iniciar serviços em background
docker-compose up -d

# Ver logs de um serviço específico
docker-compose logs -f payment-service

# Parar todos os serviços
docker-compose down

# Remover volumes (CUIDADO: remove dados do banco)
docker-compose down -v

# Rebuild de um serviço específico
docker-compose up --build payment-service
```

## 🔧 Desenvolvimento Local

### Executar serviços individualmente

**Payment Service:**
```bash
cd payment-service
npm install
npm run dev
```

**Notification Service:**
```bash
cd notification-service
npm install
npm run dev
```

### Variáveis de ambiente

**Payment Service (.env):**
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=comprefacil_db
DB_USER=comprefacil_user
DB_PASSWORD=comprefacil_password
RABBITMQ_URL=amqp://comprefacil_user:comprefacil_password@localhost:5672
```

**Notification Service (.env):**
```env
NODE_ENV=development
PORT=3002
RABBITMQ_URL=amqp://comprefacil_user:comprefacil_password@localhost:5672
```

## 🎯 Funcionalidades Implementadas

- ✅ **Arquitetura de Microsserviços**: Serviços independentes e desacoplados
- ✅ **Comunicação Assíncrona**: Via RabbitMQ com padrão publish/subscribe
- ✅ **Persistência de Dados**: PostgreSQL com transações ACID
- ✅ **Processamento Assíncrono**: Pagamentos processados em background
- ✅ **Sistema de Notificações**: Multi-canal (email, SMS, push)
- ✅ **Health Checks**: Monitoramento da saúde dos serviços
- ✅ **Logs Estruturados**: Para debugging e monitoramento
- ✅ **Tratamento de Erros**: Graceful error handling
- ✅ **Segurança**: Helmet, CORS, Rate limiting
- ✅ **Containerização**: Docker com multi-stage builds

## 🔍 Monitoramento

### RabbitMQ Management UI
- **URL**: http://localhost:15672
- **Usuário**: `comprefacil_user`
- **Senha**: `comprefacil_password`

Aqui você pode:
- Ver filas e exchanges
- Monitorar mensagens
- Acompanhar performance
- Debug de problemas

### Logs dos Serviços
```bash
# Ver logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs payment-service
docker-compose logs notification-service
```

## 🚨 Solução de Problemas

### Serviços não iniciam
1. Verifique se as portas estão livres: `lsof -i :3001 -i :3002 -i :5432 -i :5672`
2. Verifique os logs: `docker-compose logs`
3. Rebuild completo: `docker-compose down && docker-compose up --build`

### Problemas de conexão com banco
1. Aguarde o health check do PostgreSQL
2. Verifique as variáveis de ambiente
3. Teste conexão: `docker-compose exec postgres psql -U comprefacil_user -d comprefacil_db`

### RabbitMQ não conecta
1. Verifique se o serviço está rodando: `docker-compose ps`
2. Acesse o management UI: http://localhost:15672
3. Verifique as credenciais nas variáveis de ambiente

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🏢 CompreFácil

Sistema desenvolvido para demonstrar arquitetura de microsserviços em Node.js com foco em escalabilidade e manutenibilidade.

---

⭐ **Se este projeto foi útil, considere dar uma estrela!**
