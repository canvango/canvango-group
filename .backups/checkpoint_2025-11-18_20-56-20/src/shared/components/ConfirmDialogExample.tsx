import React, { useState } from 'react';
import { useConfirmDialog } from './ConfirmDialog';
import Button from './Button';

/**
 * Example component demonstrating various uses of the ConfirmDialog
 * This file serves as a reference for developers
 */
const ConfirmDialogExample: React.FC = () => {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setActionLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Example 1: Danger variant - Destructive action
  const handleDelete = () => {
    confirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      variant: 'danger',
      confirmLabel: 'Delete Account',
      cancelLabel: 'Keep Account',
      onConfirm: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addLog('Account deleted (danger variant)');
      },
    });
  };

  // Example 2: Warning variant - Important action
  const handlePurchase = () => {
    const productName = 'Premium BM Account';
    const price = 'Rp 500,000';

    confirm({
      title: 'Confirm Purchase',
      message: `Are you sure you want to purchase "${productName}" for ${price}? This action cannot be undone.`,
      variant: 'warning',
      confirmLabel: 'Purchase',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        addLog(`Purchased ${productName} (warning variant)`);
      },
    });
  };

  // Example 3: Info variant - Informational confirmation
  const handleExport = () => {
    confirm({
      title: 'Export Data',
      message: 'This will export all your transaction data to a CSV file. The export may take a few moments to complete.',
      variant: 'info',
      confirmLabel: 'Export',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        addLog('Data exported (info variant)');
      },
    });
  };

  // Example 4: Default variant - General confirmation
  const handleRefresh = () => {
    confirm({
      title: 'Refresh Data',
      message: 'Do you want to refresh the data? Any unsaved changes will be lost.',
      variant: 'default',
      confirmLabel: 'Refresh',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        addLog('Data refreshed (default variant)');
      },
    });
  };

  // Example 5: With error handling
  const handleRiskyAction = () => {
    confirm({
      title: 'Risky Action',
      message: 'This action might fail. Are you sure you want to proceed?',
      variant: 'warning',
      confirmLabel: 'Proceed',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Simulate random failure
        if (Math.random() > 0.5) {
          addLog('Risky action succeeded');
        } else {
          addLog('Risky action failed');
          throw new Error('Action failed');
        }
      },
    });
  };

  // Example 6: API Key regeneration (real-world example)
  const handleRegenerateAPIKey = () => {
    confirm({
      title: 'Generate New API Key',
      message: 'Are you sure you want to generate a new API key? Your current API key will be invalidated and any applications using it will stop working. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Generate New Key',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        addLog('New API key generated');
      },
    });
  };

  const clearLog = () => {
    setActionLog([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Confirmation Dialog Examples
        </h1>
        <p className="text-gray-600">
          Click the buttons below to see different confirmation dialog variants in action
        </p>
      </div>

      {/* Variant Examples */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Variants
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Danger (Red)
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              For destructive actions that can't be undone
            </p>
            <Button variant="danger" onClick={handleDelete} className="w-full">
              Delete Account
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Warning (Orange)
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              For important actions with consequences
            </p>
            <Button variant="primary" onClick={handlePurchase} className="w-full">
              Purchase Product
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Info (Blue)
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              For informational confirmations
            </p>
            <Button variant="primary" onClick={handleExport} className="w-full">
              Export Data
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Default (Gray)
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              For general confirmations
            </p>
            <Button variant="outline" onClick={handleRefresh} className="w-full">
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Real-World Examples */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Real-World Examples
        </h2>
        <div className="space-y-3">
          <Button
            variant="danger"
            onClick={handleRegenerateAPIKey}
            className="w-full"
          >
            Regenerate API Key
          </Button>
          <Button
            variant="primary"
            onClick={handleRiskyAction}
            className="w-full"
          >
            Try Risky Action (May Fail)
          </Button>
        </div>
      </div>

      {/* Action Log */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Action Log
          </h2>
          {actionLog.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearLog}>
              Clear Log
            </Button>
          )}
        </div>
        
        {actionLog.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No actions performed yet. Click a button above to see confirmations in action.
          </p>
        ) : (
          <div className="space-y-2">
            {actionLog.map((log, index) => (
              <div
                key={index}
                className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded"
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Example */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Code Example
        </h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-green-400 font-mono">
            <code>{`import { useConfirmDialog } from '@/shared/components/ConfirmDialog';

const MyComponent = () => {
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleAction = () => {
    confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      variant: 'warning',
      confirmLabel: 'Proceed',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        await performAction();
      },
    });
  };

  return (
    <>
      <button onClick={handleAction}>Action</button>
      <ConfirmDialog />
    </>
  );
};`}</code>
          </pre>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Best Practices
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Use specific, clear messages that explain consequences</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Choose appropriate variant based on action severity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Use action-oriented button labels (e.g., "Delete" not "Yes")</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Include relevant details (names, prices, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Handle async operations and errors properly</span>
          </li>
        </ul>
      </div>

      {/* Render the confirmation dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ConfirmDialogExample;
