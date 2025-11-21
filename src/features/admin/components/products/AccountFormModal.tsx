import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProductAccountField, ProductAccount } from '../../types/productAccount';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Record<string, any>) => void;
  fields: ProductAccountField[];
  account?: ProductAccount | null;
  isProcessing?: boolean;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fields,
  account,
  isProcessing = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (account) {
      setFormData(account.account_data);
    } else {
      // Initialize with empty values
      const initial: Record<string, any> = {};
      fields.forEach(field => {
        initial[field.field_name] = '';
      });
      setFormData(initial);
    }
  }, [account, fields]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = fields
      .filter(f => f.is_required && !formData[f.field_name])
      .map(f => f.field_name);
    
    if (missingFields.length > 0) {
      alert(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {account ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.field_name}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.field_type === 'textarea' ? (
                  <textarea
                    value={formData[field.field_name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
                    className="input w-full"
                    rows={3}
                    required={field.is_required}
                  />
                ) : (
                  <input
                    type={field.field_type}
                    value={formData[field.field_name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
                    className="input w-full"
                    required={field.is_required}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountFormModal;
