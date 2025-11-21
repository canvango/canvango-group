import React, { useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  APIKeyDisplay,
  APIStatsCards,
  APIEndpointCard,
  APITabNavigation,
  APITab,
} from '../components/api';
import {
  useAPIKey,
  useGenerateAPIKey,
  useAPIStats,
  useAPIEndpoints,
} from '../hooks/useAPIKeys';
import { mockAPIEndpoints } from '../config/api-endpoints.config';
import { usePageTitle } from '../hooks/usePageTitle';
import { Skeleton } from '../../../shared/components/SkeletonLoader';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';

const APIDocumentation: React.FC = () => {
  usePageTitle('API Documentation');
  const [activeTab, setActiveTab] = useState<APITab>('endpoints');

  // Confirmation dialog
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Fetch API key and stats
  const { data: apiKeyData, isLoading: isLoadingKey } = useAPIKey();
  const { data: statsData, isLoading: isLoadingStats } = useAPIStats();
  const { data: endpointsData } = useAPIEndpoints();
  const generateKeyMutation = useGenerateAPIKey();

  // Use mock data if API is not available
  const endpoints = endpointsData || mockAPIEndpoints;

  // Mock stats if not available
  const stats = statsData || {
    totalRequests: 15234,
    requestsToday: 2547,
    lastRequest: new Date(),
    rateLimit: 10000,
  };

  const handleGenerateKey = async () => {
    confirm({
      title: 'Generate New API Key',
      message: 'Are you sure you want to generate a new API key? Your current API key will be invalidated and any applications using it will stop working. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Generate New Key',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await generateKeyMutation.mutateAsync();
        } catch (error) {
          console.error('Failed to generate API key:', error);
        }
      },
    });
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
      {isLoadingKey ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
      ) : (
        <APIKeyDisplay
          apiKey={apiKeyData?.key || ''}
          onGenerateKey={handleGenerateKey}
          isGenerating={generateKeyMutation.isPending}
        />
      )}

      {/* API Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="space-y-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <APIStatsCards stats={stats} />
      )}

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
              {endpoints.map((endpoint, index) => (
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

// Using axios
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.canvango.com/api/v1',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`
  }
});

async function purchaseProduct(productId, quantity) {
  const response = await api.post(\`/products/\${productId}/purchase\`, {
    quantity: quantity
  });
  return response.data;
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
purchase_data = {
    'quantity': 1
}
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

// Purchase product
$purchaseData = json_encode(['quantity' => 1]);
$ch = curl_init($baseUrl . '/products/prod_123/purchase');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $purchaseData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$result = json_decode($response, true);
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
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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
                          retryAfter: 3600,
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
                    <span className="text-primary-600 mt-1">•</span>
                    <span>
                      Implement exponential backoff when receiving 429 responses
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>Cache responses when possible to reduce API calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>
                      Monitor rate limit headers to avoid hitting limits
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>
                      Use webhooks instead of polling for real-time updates
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>
                      Contact support if you need higher rate limits
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default APIDocumentation;
