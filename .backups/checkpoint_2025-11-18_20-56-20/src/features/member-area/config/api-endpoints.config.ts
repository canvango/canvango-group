import { APIEndpoint } from '../types/api';

/**
 * @deprecated This file is no longer used. API endpoints are now fetched from Supabase.
 * Use apiKeysService.fetchAPIEndpoints() instead.
 */
export const mockAPIEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/products',
    description: 'Retrieve a list of available products',
    parameters: [
      {
        name: 'category',
        type: 'string',
        required: false,
        description: 'Filter by product category (bm, personal)',
      },
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Filter by product type',
      },
      {
        name: 'page',
        type: 'number',
        required: false,
        description: 'Page number for pagination (default: 1)',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of items per page (default: 20)',
      },
    ],
    requestExample: JSON.stringify({
      category: 'bm',
      type: 'verified',
      page: 1,
      limit: 20,
    }),
    responseExample: JSON.stringify({
      success: true,
      data: [
        {
          id: 'prod_123',
          category: 'bm',
          type: 'verified',
          title: 'BM Verified Account',
          description: 'Verified Business Manager account',
          price: 500000,
          stock: 10,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
      },
    }),
  },
  {
    method: 'GET',
    path: '/api/v1/products/:id',
    description: 'Retrieve details of a specific product',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Product ID',
      },
    ],
    requestExample: '',
    responseExample: JSON.stringify({
      success: true,
      data: {
        id: 'prod_123',
        category: 'bm',
        type: 'verified',
        title: 'BM Verified Account',
        description: 'Verified Business Manager account with full features',
        price: 500000,
        stock: 10,
        features: ['Verified status', '250$ limit', 'Full access'],
        warranty: {
          enabled: true,
          duration: 7,
        },
      },
    }),
  },
  {
    method: 'POST',
    path: '/api/v1/products/:id/purchase',
    description: 'Purchase a product',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Product ID',
      },
      {
        name: 'quantity',
        type: 'number',
        required: true,
        description: 'Number of items to purchase',
      },
    ],
    requestExample: JSON.stringify({
      quantity: 1,
    }),
    responseExample: JSON.stringify({
      success: true,
      data: {
        transactionId: 'txn_456',
        productId: 'prod_123',
        quantity: 1,
        total: 500000,
        status: 'success',
        accounts: [
          {
            id: 'acc_789',
            credentials: {
              url: 'https://business.facebook.com/...',
              username: 'user@example.com',
              password: '********',
            },
          },
        ],
      },
    }),
  },
  {
    method: 'GET',
    path: '/api/v1/transactions',
    description: 'Retrieve transaction history',
    parameters: [
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Filter by transaction type (purchase, topup)',
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by status (pending, success, failed)',
      },
      {
        name: 'page',
        type: 'number',
        required: false,
        description: 'Page number for pagination',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of items per page',
      },
    ],
    requestExample: JSON.stringify({
      type: 'purchase',
      status: 'success',
      page: 1,
      limit: 10,
    }),
    responseExample: JSON.stringify({
      success: true,
      data: [
        {
          id: 'txn_456',
          type: 'purchase',
          status: 'success',
          amount: 500000,
          quantity: 1,
          product: {
            id: 'prod_123',
            title: 'BM Verified Account',
          },
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
      },
    }),
  },
  {
    method: 'POST',
    path: '/api/v1/topup',
    description: 'Process a balance top-up',
    parameters: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'Top-up amount (minimum: 10000)',
      },
      {
        name: 'paymentMethod',
        type: 'string',
        required: true,
        description: 'Payment method ID',
      },
    ],
    requestExample: JSON.stringify({
      amount: 100000,
      paymentMethod: 'qris',
    }),
    responseExample: JSON.stringify({
      success: true,
      data: {
        transactionId: 'txn_789',
        amount: 100000,
        paymentMethod: 'qris',
        paymentUrl: 'https://payment.example.com/...',
        status: 'pending',
      },
    }),
  },
  {
    method: 'GET',
    path: '/api/v1/warranty/claims',
    description: 'Retrieve warranty claims',
    parameters: [
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by claim status (pending, approved, rejected)',
      },
    ],
    requestExample: '',
    responseExample: JSON.stringify({
      success: true,
      data: [
        {
          id: 'claim_123',
          transactionId: 'txn_456',
          accountId: 'acc_789',
          reason: 'disabled',
          description: 'Account was disabled',
          status: 'pending',
          createdAt: '2024-01-16T14:20:00Z',
        },
      ],
    }),
  },
  {
    method: 'POST',
    path: '/api/v1/warranty/claims',
    description: 'Submit a warranty claim',
    parameters: [
      {
        name: 'transactionId',
        type: 'string',
        required: true,
        description: 'Transaction ID',
      },
      {
        name: 'accountId',
        type: 'string',
        required: true,
        description: 'Account ID',
      },
      {
        name: 'reason',
        type: 'string',
        required: true,
        description: 'Claim reason (disabled, invalid, other)',
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        description: 'Detailed description of the issue',
      },
    ],
    requestExample: JSON.stringify({
      transactionId: 'txn_456',
      accountId: 'acc_789',
      reason: 'disabled',
      description: 'The account was disabled within 24 hours of purchase',
    }),
    responseExample: JSON.stringify({
      success: true,
      data: {
        id: 'claim_123',
        transactionId: 'txn_456',
        accountId: 'acc_789',
        status: 'pending',
        createdAt: '2024-01-16T14:20:00Z',
      },
    }),
  },
  {
    method: 'GET',
    path: '/api/v1/user/profile',
    description: 'Retrieve user profile information',
    parameters: [],
    requestExample: '',
    responseExample: JSON.stringify({
      success: true,
      data: {
        id: 'user_123',
        username: 'john_doe',
        email: 'john@example.com',
        balance: 1500000,
        stats: {
          totalPurchases: 15,
          totalSpending: 7500000,
          totalTopUps: 10,
          successRate: 98.5,
        },
      },
    }),
  },
  {
    method: 'PUT',
    path: '/api/v1/user/profile',
    description: 'Update user profile information',
    parameters: [
      {
        name: 'username',
        type: 'string',
        required: false,
        description: 'New username',
      },
      {
        name: 'email',
        type: 'string',
        required: false,
        description: 'New email address',
      },
    ],
    requestExample: JSON.stringify({
      username: 'john_doe_updated',
      email: 'john.updated@example.com',
    }),
    responseExample: JSON.stringify({
      success: true,
      data: {
        id: 'user_123',
        username: 'john_doe_updated',
        email: 'john.updated@example.com',
      },
    }),
  },
  {
    method: 'DELETE',
    path: '/api/v1/user/account',
    description: 'Delete user account (irreversible)',
    parameters: [
      {
        name: 'confirmation',
        type: 'string',
        required: true,
        description: 'Must be "DELETE" to confirm',
      },
    ],
    requestExample: JSON.stringify({
      confirmation: 'DELETE',
    }),
    responseExample: JSON.stringify({
      success: true,
      message: 'Account successfully deleted',
    }),
  },
];
