import React, { useState } from 'react';
import { Plus, Upload, Download, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ProductAccount, ProductAccountField, ProductAccountStats } from '../../types/productAccount';

interface AccountPoolTabProps {
  productId: string;
  fields: ProductAccountField[];
  accounts: ProductAccount[];
  stats: ProductAccountStats;
  onAddField: () => void;
  onEditField: (field: ProductAccountField) => void;
  onDeleteField: (fieldId: string) => void;
  onAddAccount: () => void;
  onEditAccount: (account: ProductAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onBulkImport: () => void;
}

const AccountPoolTab: React.FC<AccountPoolTabProps> = ({
  productId,
  fields,
  accounts,
  stats,
  onAddField,
  onEditField,
  onDeleteField,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onBulkImport
}) => {
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  
  // Filter out sold accounts - only show available accounts
  const availableAccounts = accounts.filter(account => account.status === 'available');

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Available</div>
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Sold</div>
          <div className="text-2xl font-bold text-gray-600">{stats.sold}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
        </div>
      </div>

      {/* Field Definition Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Account Fields Definition</h3>
          <button
            onClick={() => setShowFieldEditor(!showFieldEditor)}
            className="btn-secondary text-sm"
          >
            {showFieldEditor ? 'Hide' : 'Edit'} Fields
          </button>
        </div>

        {showFieldEditor && (
          <div className="space-y-3 mb-4">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="font-medium">{field.field_name}</div>
                  <div className="text-sm text-gray-600">
                    Type: {field.field_type} • {field.is_required ? 'Required' : 'Optional'}
                  </div>
                </div>
                <button
                  onClick={() => onEditField(field)}
                  className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteField(field.id)}
                  className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={onAddField} className="btn-secondary w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </button>
          </div>
        )}

        {!showFieldEditor && fields.length > 0 && (
          <div className="text-sm text-gray-600">
            {fields.map(f => f.field_name).join(', ')}
          </div>
        )}
      </div>

      {/* Account Pool Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Account Pool</h3>
          <div className="flex gap-2">
            <button onClick={onBulkImport} className="btn-secondary text-sm">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </button>
            <button onClick={onAddAccount} className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </button>
          </div>
        </div>

        {availableAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No available accounts in pool. Add accounts to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {availableAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  {account.status === 'available' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-2xl ${
                      account.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {account.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {Object.entries(account.account_data).slice(0, 2).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </span>
                    ))}
                  </div>
                  {account.assigned_to_transaction_id && (
                    <div className="text-xs text-gray-500 mt-1">
                      Transaction: {account.assigned_to_transaction_id.slice(0, 8)}...
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditAccount(account)}
                    className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPoolTab;
