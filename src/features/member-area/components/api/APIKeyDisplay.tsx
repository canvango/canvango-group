import React, { useState } from 'react';
import { Key, RefreshCw } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import CopyButton from '../../../../shared/components/CopyButton';

interface APIKeyDisplayProps {
  apiKey: string;
  onGenerateKey: () => void;
  isGenerating?: boolean;
}

export const APIKeyDisplay: React.FC<APIKeyDisplayProps> = ({
  apiKey,
  onGenerateKey,
  isGenerating = false,
}) => {
  const [showFullKey, setShowFullKey] = useState(false);

  const maskKey = (key: string) => {
    if (!key) return '';
    if (showFullKey) return key;
    const visibleChars = 8;
    return key.substring(0, visibleChars) + '•'.repeat(Math.max(0, key.length - visibleChars));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your API Key
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm text-gray-900">
              {apiKey ? maskKey(apiKey) : 'No API key generated'}
            </div>
            {apiKey && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowFullKey(!showFullKey)}
                  aria-label={showFullKey ? 'Hide API key' : 'Show API key'}
                >
                  {showFullKey ? 'Hide' : 'Show'}
                </Button>
                <CopyButton
                  text={apiKey}
                  variant="outline"
                  size="md"
                  label="Copy"
                  copiedLabel="Copied!"
                  ariaLabel="Copy API key to clipboard"
                />
              </>
            )}
          </div>
        </div>

        <div>
          <Button
            variant="primary"
            size="md"
            onClick={onGenerateKey}
            disabled={isGenerating}
            aria-label="Generate new API key"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {apiKey ? 'Regenerate API Key' : 'Generate API Key'}
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            {apiKey
              ? 'Warning: Regenerating will invalidate your current API key.'
              : 'Generate an API key to access the platform API.'}
          </p>
        </div>
      </div>
    </div>
  );
};
