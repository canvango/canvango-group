import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { APIEndpoint } from '../../types/api';
import Badge from '../../../../shared/components/Badge';

interface APIEndpointCardProps {
  endpoint: APIEndpoint;
}

export const APIEndpointCard: React.FC<APIEndpointCardProps> = ({ endpoint }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMethodColor = (method: string): 'success' | 'info' | 'warning' | 'error' => {
    switch (method) {
      case 'GET':
        return 'success';
      case 'POST':
        return 'info';
      case 'PUT':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatJson = (jsonString?: string) => {
    if (!jsonString) return '';
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <Badge variant={getMethodColor(endpoint.method)} size="md">
            {endpoint.method}
          </Badge>
          <div className="text-left">
            <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
            <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {/* Parameters Section */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Required
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {endpoint.parameters.map((param, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">
                          {param.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {param.type}
                          </code>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {param.required ? (
                            <Badge variant="error" size="sm">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="info" size="sm">
                              Optional
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {param.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Example */}
          {endpoint.requestExample && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Request Example</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
                  <code>{formatJson(endpoint.requestExample)}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Response Example */}
          {endpoint.responseExample && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Response Example</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-blue-400 font-mono">
                  <code>{formatJson(endpoint.responseExample)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
