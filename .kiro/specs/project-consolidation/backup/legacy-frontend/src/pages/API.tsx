import React, { useState } from 'react';
import {
  KeyIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Types
type APITab = 'endpoints' | 'examples' | 'rate-limits';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: string;
}

interface APIStats {
  hitLimit: number;
  currentHits: number;
  uptime: number;
  averageLatency: number;
}

// Mock Data
const mockAPIKey = 'cvg_live_1234567890abcdefghijklmnopqrstuvwxyz';

const mockStats: APIStats = {
  hitLimit: 10000,
  currentHits: 2547,
  uptime: 99.8,
  averageLatency: 85
};

const mockEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/products',
    description: 'Retrieve list of available products',
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'Filter by category' },
      { name: 'limit', type: 'number', required: false, description: 'Number of results (default: 20)' }
    ],
    response: '{ "success": true, "data": [...], "total": 100 }'
  },
  {
    method: 'GET',
    path: '/api/v1/products/:id',
    description: 'Get details of a specific product',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Product ID' }
    ],
    response: '{ "success": true, "data": {...} }'
  },
  {
    method: 'POST',
    path: '/api/v1/products/:id/purchase',
    description: 'Purchase a product',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Product ID' },
      { name: 'quantity', type: 'number', required: true, description: 'Quantity to purchase' }
    ],
    response: '{ "success": true, "orderId": "...", "message": "..." }'
  },
  {
    method: 'GET',
    path: '/api/v1/transactions',
    description: 'Get transaction history',
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Results per page (default: 20)' }
    ],
    response: '{ "success": true, "data": [...], "pagination": {...} }'
  },
  {
    method: 'GET',
    path: '/api/v1/balance',
    description: 'Get current account balance',
    response: '{ "success": true, "balance": 500000 }'
  }
];

// API Key Display Component
const APIKeyDisplay: React.FC<{
  apiKey: string;
  onGenerateKey: () => void;
  isGenerating: boolean;
}> = ({ apiKey, onGenerateKey, isGenerating }) => {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayKey = showKey ? apiKey : apiKey.slice(0, 20) + '•'.repeat(apiKey.length - 20);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your API Key</h2>
        <button
          onClick={onGenerateKey}
          disabled={isGenerating}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate New Key'}
        </button>
      </div>
      
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <KeyIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <code className="flex-1 text-sm font-mono text-gray-900 overflow-x-auto">
          {displayKey}
        </code>
        <button
          onClick={() => setShowKey(!showKey)}
          className="text-sm text-gray-600 hover:text-gray-700 px-2"
        >
          {showKey ? 'Hide' : 'Show'}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 px-2"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Keep your API key secure. Do not share it publicly or commit it to version control.
      </p>
    </div>
  );
};

// API Stats Cards Component
const APIStatsCards: React.FC<{ stats: APIStats }> = ({ stats }) => {
  const usagePercentage = (stats.currentHits / stats.hitLimit) * 100;

  const statsCards = [
    {
      label: 'API Hits',
      value: `${stats.currentHits.toLocaleString()} / ${stats.hitLimit.toLocaleString()}`,
      icon: ChartBarIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      extra: (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{usagePercentage.toFixed(1)}% used</p>
        </div>
      )
    },
    {
      label: 'Uptime',
      value: `${stats.uptime}%`,
      icon: BoltIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100'
    },
    {
      label: 'Avg Latency',
      value: `${stats.averageLatency}ms`,
      icon: ClockIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
      {statsCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-lg p-5 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.iconBgColor} rounded-full p-3`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} aria-hidden="true" />
              </div>
            </div>
            {card.extra}
          </div>
        );
      })}
    </div>
  );
};

// API Endpoint Card Component
const APIEndpointCard: React.FC<{ endpoint: APIEndpoint }> = ({ endpoint }) => {
  const methodColors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${methodColors[endpoint.method]}`}>
          {endpoint.method}
        </span>
        <code className="flex-1 text-sm font-mono text-gray-900 break-all">
          {endpoint.path}
        </code>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
      
      {endpoint.parameters && endpoint.parameters.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Parameters:</p>
          <div className="space-y-1">
            {endpoint.parameters.map((param) => (
              <div key={param.name} className="text-xs">
                <code className="text-indigo-600">{param.name}</code>
                <span className="text-gray-500"> ({param.type})</span>
                {param.required && <span className="text-red-600 ml-1">*</span>}
                <span className="text-gray-600"> - {param.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1">Response:</p>
        <code className="block text-xs bg-gray-50 p-2 rounded text-gray-800 overflow-x-auto">
          {endpoint.response}
        </code>
      </div>
    </div>
  );
};

// Tab Navigation Component
const APITabNavigation: React.FC<{
  activeTab: APITab;
  onTabChange: (tab: APITab) => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: APITab; label: string }> = [
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'examples', label: 'Usage Examples' },
    { id: 'rate-limits', label: 'Rate Limits' }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              pb-3 px-1 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Main Page Component
const API: React.FC = () => {
  const [activeTab, setActiveTab] = useState<APITab>('endpoints');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateKey = () => {
    if (window.confirm('Are you sure you want to generate a new API key? Your current API key will be invalidated.')) {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        alert('New API key generated successfully!');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">API Documentation</h1>
        <p className="text-gray-600">
          Integrate Canvango Group services into your applications using our REST API
        </p>
      </div>

      {/* API Key Section */}
      <APIKeyDisplay
        apiKey={mockAPIKey}
        onGenerateKey={handleGenerateKey}
        isGenerating={isGenerating}
      />

      {/* API Stats Cards */}
      <APIStatsCards stats={mockStats} />

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900 mb-1">
            API Authentication
          </h3>
          <p className="text-sm text-blue-800">
            Include your API key in the request header:{' '}
            <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6">
          <APITabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="p-6">
          {/* Endpoints Tab */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Available Endpoints
                </h2>
                <p className="text-sm text-gray-600">
                  All endpoints return JSON responses and require authentication via API key.
                </p>
              </div>
              {mockEndpoints.map((endpoint, index) => (
                <APIEndpointCard key={index} endpoint={endpoint} />
              ))}
            </div>
          )}

          {/* Usage Examples Tab */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Usage Examples
                </h2>
              </div>

              {/* JavaScript Example */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  JavaScript / Node.js
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    <code>{`// Using fetch API
const apiKey = 'YOUR_API_KEY';

async function getProducts() {
  const response = await fetch('https://api.canvango.com/api/v1/products', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
}

// Purchase product
async function purchaseProduct(productId, quantity) {
  const response = await fetch(\`https://api.canvango.com/api/v1/products/\${productId}/purchase\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  });
  
  return await response.json();
}`}</code>
                  </pre>
                </div>
              </div>

              {/* Python Example */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Python</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-blue-400 font-mono">
                    <code>{`import requests

API_KEY = 'YOUR_API_KEY'
BASE_URL = 'https://api.canvango.com/api/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Get products
response = requests.get(f'{BASE_URL}/products', headers=headers)
products = response.json()

# Purchase product
purchase_data = {'quantity': 1}
response = requests.post(
    f'{BASE_URL}/products/prod_123/purchase',
    headers=headers,
    json=purchase_data
)
result = response.json()`}</code>
                  </pre>
                </div>
              </div>

              {/* PHP Example */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">PHP</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-yellow-400 font-mono">
                    <code>{`<?php

$apiKey = 'YOUR_API_KEY';
$baseUrl = 'https://api.canvango.com/api/v1';

$headers = [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
];

// Get products
$ch = curl_init($baseUrl . '/products');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$products = json_decode($response, true);
curl_close($ch);

?>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Rate Limits Tab */}
          {activeTab === 'rate-limits' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Rate Limits
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  To ensure fair usage and system stability, API requests are rate limited.
                </p>
              </div>

              {/* Rate Limit Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Requests per Hour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Requests per Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Burst Limit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Free
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        100
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        1,000
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        10 req/sec
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Standard
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        500
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        10,000
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        25 req/sec
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Premium
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        2,000
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        50,000
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        50 req/sec
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rate Limit Headers */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  Rate Limit Headers
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Every API response includes headers with rate limit information:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    <code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642345678`}</code>
                  </pre>
                </div>
              </div>

              {/* Rate Limit Exceeded */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-900 mb-1">
                    Rate Limit Exceeded
                  </h3>
                  <p className="text-sm text-red-800 mb-2">
                    When you exceed the rate limit, you'll receive a 429 status code:
                  </p>
                  <div className="bg-red-100 rounded p-2">
                    <code className="text-xs text-red-900">
                      {JSON.stringify(
                        {
                          success: false,
                          error: 'Rate limit exceeded',
                          message: 'Too many requests. Please try again later.',
                          retryAfter: 3600
                        },
                        null,
                        2
                      )}
                    </code>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Implement exponential backoff when receiving 429 responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Cache responses when possible to reduce API calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Monitor rate limit headers to avoid hitting limits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Use webhooks instead of polling for real-time updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Contact support if you need higher rate limits</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default API;
