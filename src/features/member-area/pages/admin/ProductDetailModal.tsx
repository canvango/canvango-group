import React, { useState } from 'react';
import { X } from 'lucide-react';
import AccountPoolTab from '../../../../features/admin/components/products/AccountPoolTab';
import AccountFormModal from '../../../../features/admin/components/products/AccountFormModal';
import FieldEditorModal from '../../../../features/admin/components/products/FieldEditorModal';
import { useAccountFields, useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount, useBulkCreateFields } from '../../../../features/admin/hooks/useProductAccounts';
import { ProductAccount } from '../../../../features/admin/types/productAccount';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  product_name: string;
  product_type: string;
  category: string;
  description: string | null;
  price: number;
  stock_status: string;
  is_active: boolean;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type TabType = 'info' | 'accounts';

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isFieldEditorOpen, setIsFieldEditorOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ProductAccount | null>(null);

  // Fetch data
  const { data: fieldsData, isLoading: isLoadingFields } = useAccountFields(product?.id || '');
  const { data: accountsData, isLoading: isLoadingAccounts } = useAccounts(product?.id || '');

  // Mutations
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const bulkCreateFieldsMutation = useBulkCreateFields();

  if (!isOpen || !product) return null;

  const fields = fieldsData || [];
  const accounts = accountsData?.accounts || [];
  const stats = accountsData?.stats || { available: 0, sold: 0, total: 0 };

  const handleAddField = () => {
    setIsFieldEditorOpen(true);
  };

  const handleSaveFields = async (newFields: any[]) => {
    try {
      console.log('Saving fields:', { productId: product.id, fields: newFields });
      await bulkCreateFieldsMutation.mutateAsync({
        productId: product.id,
        fields: newFields
      });
      toast.success('Fields saved successfully');
      setIsFieldEditorOpen(false);
    } catch (error: any) {
      console.error('Failed to save fields:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save fields';
      toast.error(errorMessage);
    }
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsAccountFormOpen(true);
  };

  const handleEditAccount = (account: ProductAccount) => {
    setSelectedAccount(account);
    setIsAccountFormOpen(true);
  };

  const handleSaveAccount = async (accountData: Record<string, any>) => {
    try {
      if (selectedAccount) {
        await updateAccountMutation.mutateAsync({
          id: selectedAccount.id,
          accountData
        });
        toast.success('Account updated successfully');
      } else {
        await createAccountMutation.mutateAsync({
          productId: product.id,
          accountData
        });
        toast.success('Account added successfully');
      }
      setIsAccountFormOpen(false);
      setSelectedAccount(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save account');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteAccountMutation.mutateAsync(accountId);
      toast.success('Account deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleBulkImport = () => {
    toast('Bulk import feature coming soon!', { icon: 'ℹ️' });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">{product.product_name}</h2>
              <p className="text-sm text-gray-600 mt-1">{product.category}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-1 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Product Info
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'accounts'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Account Pool
                {stats.total > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                    {stats.available}/{stats.total}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <p className="text-gray-900">{product.product_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900">{product.product_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{product.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p className="text-gray-900">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{product.description || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 text-sm rounded-full ${
                    product.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <AccountPoolTab
                productId={product.id}
                fields={fields}
                accounts={accounts}
                stats={stats}
                onAddField={handleAddField}
                onEditField={() => setIsFieldEditorOpen(true)}
                onDeleteField={() => {}}
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
                onBulkImport={handleBulkImport}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AccountFormModal
        isOpen={isAccountFormOpen}
        onClose={() => {
          setIsAccountFormOpen(false);
          setSelectedAccount(null);
        }}
        onSave={handleSaveAccount}
        fields={fields}
        account={selectedAccount}
        isProcessing={createAccountMutation.isPending || updateAccountMutation.isPending}
      />

      <FieldEditorModal
        isOpen={isFieldEditorOpen}
        onClose={() => setIsFieldEditorOpen(false)}
        onSave={handleSaveFields}
        existingFields={fields}
        isProcessing={bulkCreateFieldsMutation.isPending}
      />
    </>
  );
};

export default ProductDetailModal;
