import React, { useState, useEffect } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Badge from '../../../../shared/components/Badge';
import { Transaction } from '../../types/transaction';
import { formatDateTime } from '../../utils/formatters';
import axios from 'axios';

export interface AccountDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Fetch account data when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      // If accountDetails is available from transaction, use it directly
      if (transaction.accountDetails && !transaction.accounts) {
        const transformedAccount = {
          id: transaction.purchaseId || transaction.id,
          transactionId: transaction.id,
          type: 'bm' as const,
          credentials: {
            accountId: transaction.accountDetails.id_bm || 
                       transaction.accountDetails.ID_BM || 
                       transaction.accountDetails.email || 
                       transaction.accountDetails.Email ||
                       transaction.purchaseId,
            url: transaction.accountDetails.link_akses || 
                 transaction.accountDetails.Link_Akses || 
                 transaction.accountDetails.url || 
                 '#',
            username: transaction.accountDetails.email || 
                     transaction.accountDetails.Email ||
                     transaction.accountDetails.username,
            password: transaction.accountDetails.password || 
                     transaction.accountDetails.Password,
            additionalInfo: transaction.accountDetails
          },
          status: 'active' as const,
          warranty: transaction.warranty || {
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            claimed: false
          },
          createdAt: transaction.createdAt
        };
        transaction.accounts = [transformedAccount];
      } else if (!transaction.accounts || transaction.accounts.length === 0) {
        // Fallback to API fetch
        fetchAccountData();
      }
    }
  }, [isOpen, transaction]);

  const fetchAccountData = async () => {
    if (!transaction) return;
    
    setIsLoadingAccount(true);
    setAccountError(null);
    
    try {
      const response = await axios.get(
        `/api/product-accounts/account/transaction/${transaction.id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        const apiData = response.data.data;
        
        // Handle both single account and multiple accounts
        const apiAccounts = Array.isArray(apiData) ? apiData : [apiData];
        
        // Transform API data to match existing structure
        const transformedAccounts = apiAccounts.map((apiAccount: any) => ({
          id: apiAccount.id,
          transactionId: transaction.id,
          type: 'bm' as const,
          credentials: {
            accountId: apiAccount.account_data.id_bm || 
                       apiAccount.account_data.ID_BM || 
                       apiAccount.account_data.email || 
                       apiAccount.account_data.Email ||
                       apiAccount.id,
            url: apiAccount.account_data.link_akses || 
                 apiAccount.account_data.Link_Akses || 
                 apiAccount.account_data.url || 
                 '#',
            username: apiAccount.account_data.email || 
                     apiAccount.account_data.Email ||
                     apiAccount.account_data.username,
            password: apiAccount.account_data.password || 
                     apiAccount.account_data.Password,
            additionalInfo: apiAccount.account_data
          },
          status: 'active' as const,
          warranty: transaction.warranty || {
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            claimed: false
          },
          createdAt: new Date(apiAccount.created_at)
        }));
        
        // Update transaction with account data
        transaction.accounts = transformedAccounts;
      }
    } catch (err: any) {
      console.error('Failed to fetch account:', err);
      setAccountError(err.response?.data?.message || 'Failed to load account data');
    } finally {
      setIsLoadingAccount(false);
    }
  };

  if (!transaction) return null;

  // Format account details as text for copying/downloading (matching screenshot format)
  const formatAccountDetails = () => {
    if (!transaction.accounts || transaction.accounts.length === 0) {
      return 'Tidak ada data akun tersedia';
    }

    let details = '=====================================\n';
    details += 'DETAIL AKUN PEMBELIAN\n';
    details += `Transaksi ID: #${transaction.id}\n`;
    details += `Tanggal: ${formatDateTime(transaction.createdAt)}\n`;
    details += `Produk: ${transaction.product?.title || '-'}\n`;
    details += `Status Garansi: ${getWarrantyStatus()}\n`;
    details += '=====================================\n\n';

    details += 'URUTAN AKUN | DATA AKUN\n\n';

    transaction.accounts.forEach((account, index) => {
      const accountId = account.credentials.accountId || account.id;
      const url = account.credentials.url || '#';
      
      details += `${index + 1} | ${accountId}|${url}\n`;
      
      // Add additional fields if available
      if (account.credentials.additionalInfo) {
        const info = account.credentials.additionalInfo;
        Object.entries(info).forEach(([key, value]) => {
          // Skip fields already shown
          if (key !== 'id_bm' && key !== 'ID_BM' && key !== 'link_akses' && key !== 'Link_Akses' && key !== 'url') {
            details += `  | ${key}: ${value}\n`;
          }
        });
      }
      
      details += '\n';
    });

    details += '=====================================\n\n';
    details += 'KETERANGAN:\n\n';
    details += `ID BM | Link Akses\n\n`;
    details += 'Jika bingung cara akses akun BM nya, Hubungi customer service kami.\n\n';
    details += '=====================================\n';

    return details;
  };

  const getWarrantyStatus = () => {
    if (!transaction.warranty) return 'TANPA GARANSI';
    if (transaction.warranty.claimed) return 'SUDAH DIKLAIM';
    
    const now = new Date();
    const expiresAt = new Date(transaction.warranty.expiresAt);
    
    if (expiresAt < now) return 'KADALUARSA';
    
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `AKTIF (${daysLeft} jam ${Math.floor(daysLeft * 24 % 24)} menit tersisa)`;
  };

  const handleCopyAll = async () => {
    const details = formatAccountDetails();
    try {
      await navigator.clipboard.writeText(details);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const details = formatAccountDetails();
    const blob = new Blob([details], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detail-akun-${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getWarrantyBadgeVariant = () => {
    if (!transaction.warranty) return 'default';
    if (transaction.warranty.claimed) return 'info';
    
    const now = new Date();
    const expiresAt = new Date(transaction.warranty.expiresAt);
    
    if (expiresAt < now) return 'error';
    
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 ? 'warning' : 'success';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Akun - Transaksi #${transaction.id.slice(0, 6)}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Transaction Header */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Transaksi ID</p>
              <p className="font-mono font-semibold text-gray-900">#{transaction.id}</p>
            </div>
            <Badge variant={getWarrantyBadgeVariant()} size="sm">
              {getWarrantyStatus()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium text-gray-900 text-sm">
                {formatDateTime(transaction.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Produk</p>
              <p className="font-medium text-gray-900 text-sm">
                {transaction.product?.title || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Details - Screenshot Format */}
        {isLoadingAccount ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading account data...</span>
          </div>
        ) : accountError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-red-700">{accountError}</p>
          </div>
        ) : transaction.accounts && transaction.accounts.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Urutan Akun | Data Akun
            </h3>
            
            {/* Account List - Compact Format */}
            <div className="bg-gray-50 rounded-2xl p-4 font-mono text-sm space-y-3">
              {transaction.accounts.map((account, index) => {
                const accountId = account.credentials.accountId || account.id;
                const url = account.credentials.url || '#';
                
                return (
                  <div key={account.id} className="space-y-1">
                    {/* Main Line: Number | ID | URL */}
                    <div className="flex items-start gap-2 text-gray-900">
                      <span className="font-bold text-primary-600 flex-shrink-0">{index + 1}</span>
                      <span className="text-gray-400">|</span>
                      <div className="flex-1 break-all">
                        <span className="text-gray-700">{accountId}</span>
                        <span className="text-gray-400">|</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {url}
                        </a>
                      </div>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(`${accountId}|${url}`);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Salin baris"
                        title="Salin ID dan Link"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    
                    {/* Additional Info if available */}
                    {account.credentials.additionalInfo && Object.entries(account.credentials.additionalInfo).map(([key, value]) => {
                      // Skip already displayed fields
                      if (['id_bm', 'ID_BM', 'link_akses', 'Link_Akses', 'url'].includes(key)) {
                        return null;
                      }
                      
                      return (
                        <div key={key} className="flex items-start gap-2 text-gray-600 text-xs ml-6">
                          <span className="text-gray-400">|</span>
                          <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="flex-1">{String(value)}</span>
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(String(value));
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                            aria-label={`Salin ${key}`}
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Expandable Details (Optional) */}
            <details className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700">
                Lihat Detail Lengkap
              </summary>
              <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
                {transaction.accounts.map((account, index) => (
                  <div
                    key={account.id}
                    className="bg-gray-50 rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Akun {index + 1}</span>
                      <Badge
                        variant={account.status === 'active' ? 'success' : 'error'}
                        size="sm"
                      >
                        {account.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">ID:</span>
                        <span className="font-mono text-gray-900">{account.credentials.accountId || account.id}</span>
                      </div>
                      
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-500 flex-shrink-0">Link:</span>
                        <a
                          href={account.credentials.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-right break-all"
                        >
                          {account.credentials.url}
                        </a>
                      </div>
                      
                      {account.credentials.username && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Username:</span>
                          <span className="font-mono text-gray-900">{account.credentials.username}</span>
                        </div>
                      )}
                      
                      {account.credentials.password && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Password:</span>
                          <span className="font-mono text-gray-900">{account.credentials.password}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Tidak ada data akun tersedia</p>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">KETERANGAN:</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p className="font-medium">ID BM | Link Akses</p>
            <p className="text-blue-700">
              Jika bingung cara akses akun BM nya, Hubungi customer service kami.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleCopyAll}
            icon={copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            className="flex-1"
          >
            {copiedAll ? 'Tersalin!' : 'Salin Semua'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownload}
            icon={<Download className="w-4 h-4" />}
            className="flex-1"
          >
            Download
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Selesai
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AccountDetailModal;
