import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Tracker API',
      version: '1.0.0',
      description: 'A TypeScript Express.js API for managing financial transactions',
      contact: {
        name: 'API Support',
        url: 'https://github.com/Siocraft/FinanceTrackerApi',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Transaction: {
          type: 'object',
          required: ['id', 'amount', 'description', 'category', 'type', 'date', 'createdAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the transaction',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount',
              example: 150.75,
            },
            description: {
              type: 'string',
              description: 'Transaction description',
              example: 'Grocery shopping',
            },
            category: {
              type: 'string',
              description: 'Transaction category',
              example: 'Food',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Transaction type',
              example: 'expense',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction date',
              example: '2023-12-01T10:30:00.000Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2023-12-01T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2023-12-01T11:30:00.000Z',
            },
          },
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['amount', 'description', 'type'],
          properties: {
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount',
              example: 150.75,
            },
            description: {
              type: 'string',
              description: 'Transaction description',
              example: 'Grocery shopping',
            },
            category: {
              type: 'string',
              description: 'Transaction category (defaults to "Other")',
              example: 'Food',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Transaction type',
              example: 'expense',
            },
          },
        },
        UpdateTransactionRequest: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount',
              example: 200.00,
            },
            description: {
              type: 'string',
              description: 'Transaction description',
              example: 'Updated grocery shopping',
            },
            category: {
              type: 'string',
              description: 'Transaction category',
              example: 'Food & Dining',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Transaction type',
              example: 'expense',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Transaction not found',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          required: ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage', 'hasNextPage', 'hasPreviousPage'],
          properties: {
            currentPage: {
              type: 'integer',
              minimum: 1,
              description: 'Current page number',
              example: 1,
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of pages',
              example: 5,
            },
            totalItems: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items',
              example: 47,
            },
            itemsPerPage: {
              type: 'integer',
              minimum: 1,
              description: 'Number of items per page',
              example: 10,
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true,
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false,
            },
          },
        },
        PaginatedTransactionResponse: {
          type: 'object',
          required: ['data', 'pagination'],
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Transaction',
              },
              description: 'Array of transactions for the current page',
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta',
              description: 'Pagination metadata',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'API status',
              example: 'ok',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current timestamp',
              example: '2023-12-01T10:30:00.000Z',
            },
          },
        },
      },
    },
  },
  apis: ['./src/index.ts'], // Path to the API files
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };