# Finance Tracker API

A TypeScript-based REST API for managing financial transactions, built with Express.js and designed to run with Docker.

## Features

- 🚀 TypeScript-first development
- 📊 Complete CRUD operations for transactions
- 💾 File-based JSON persistence (MongoDB-ready architecture)
- 🐳 Docker containerization
- 🔧 Development and production environments
- ✅ Health check endpoint

## API Endpoints

### Health Check
- `GET /health` - API health status

### Transactions
- `GET /transactions` - Get all transactions
- `GET /transactions/:id` - Get transaction by ID
- `POST /transactions` - Create new transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Transaction Schema
```typescript
{
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
  updatedAt?: string;
}
```

## Quick Start

### Development (Local)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Development (Docker)
```bash
# Start development container
docker-compose --profile dev up finance-api-dev
```

### Production (Docker)
```bash
# Build and start production container
docker-compose up finance-api
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Docker Commands

```bash
# Build image
docker build -t finance-tracker-api .

# Run container
docker run -p 3000:3000 -v $(pwd)/data:/app/data finance-tracker-api

# Development with docker-compose
docker-compose --profile dev up

# Production with docker-compose
docker-compose up
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/       # Business logic
├── types/          # TypeScript interfaces
└── index.ts        # Application entry point
```

## Data Persistence

Currently uses JSON file storage in the `data/` directory. The architecture is designed to easily migrate to MongoDB when needed.

## Health Check

The API includes a health check endpoint at `/health` that returns the current status and timestamp.

Access: http://localhost:3000/health