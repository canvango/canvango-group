import React from 'react';
import { ExternalLink, Shield } from 'lucide-react';
import Modal from '../../../../shared/components/Modal';
import Badge from '../../../../shared/components/Badge';
import Button from '../../../../shared/components/Button';
import CopyButton from '../../../../shared/components/CopyButton';
import { Transaction, TransactionStatus } from '../../types/transaction';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  if (!transaction) return null;

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS:
        return <Badge variant="success">Berhasil</Badge>;
      case TransactionStatus.PENDING:
        return <Badge variant="warning">Pending</Badge>;
      case TransactionStatus.FAILED:
        return <Badge variant="error">Gagal</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };



  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Transaksi"
      size="lg"
    >
      <div className="space-y-6">
        {/* Transaction Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">ID Transaksi</p>
              <p className="font-mono font-semibold text-gray-900">#{transaction.id}</p>
            </div>
            {getStatusBadge(transaction.status)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium text-gray-900">{formatDateTime(transaction.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-semibold text-lg text-primary-600">{formatCurrency(transaction.amount)}</p>
            </div>
          </div>

          {transaction.product && (
            <div>
              <p className="text-sm text-gray-500">Produk</p>
              <p className="font-medium text-gray-900">{transaction.product.title}</p>
              {transaction.quantity && (
                <p className="text-sm text-gray-600">Jumlah: {transaction.quantity} akun</p>
              )}
            </div>
          )}

          {transaction.paymentMethod && (
            <div>
              <p className="text-sm text-gray-500">Metode Pembayaran</p>
              <p className="font-medium text-gray-900">{transaction.paymentMethod}</p>
            </div>
          )}

          {transaction.warranty && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Informasi Garansi</p>
                <p className="text-sm text-blue-700">
                  {transaction.warranty.claimed ? (
                    'Garansi sudah diklaim'
                  ) : (
                    `Berlaku hingga ${formatDateTime(transaction.warranty.expiresAt)}`
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Account Credentials */}
        {transaction.accounts && transaction.accounts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Kredensial Akun ({transaction.accounts.length})
            </h3>
            <div className="space-y-3">
              {transaction.accounts.map((account, index) => (
                <div
                  key={account.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">Akun #{index + 1}</h4>
                    <Badge
                      variant={account.status === 'active' ? 'success' : 'error'}
                      size="sm"
                    >
                      {account.status === 'active' ? 'Aktif' : account.status === 'disabled' ? 'Nonaktif' : 'Diklaim'}
                    </Badge>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">URL</label>
                    <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                      <a
                        href={account.credentials.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-primary-600 hover:text-primary-700 font-mono truncate"
                      >
                        {account.credentials.url}
                      </a>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <CopyButton 
                        text={account.credentials.url} 
                        iconOnly 
                        ariaLabel="Salin URL"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  {account.credentials.username && (
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Username</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                        <span className="flex-1 text-sm text-gray-900 font-mono">
                          {account.credentials.username}
                        </span>
                        <CopyButton 
                          text={account.credentials.username} 
                          iconOnly 
                          ariaLabel="Salin Username"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  {account.credentials.password && (
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Password</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                        <span className="flex-1 text-sm text-gray-900 font-mono">
                          {account.credentials.password}
                        </span>
                        <CopyButton 
                          text={account.credentials.password} 
                          iconOnly 
                          ariaLabel="Salin Password"
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {account.credentials.additionalInfo && Object.keys(account.credentials.additionalInfo).length > 0 && (
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Informasi Tambahan</label>
                      <div className="bg-gray-50 rounded px-3 py-2 space-y-1">
                        {Object.entries(account.credentials.additionalInfo).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{key}:</span>
                            <span className="text-gray-900 font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warranty Info */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Garansi:</span>
                      <span className={`font-medium ${
                        account.warranty.claimed ? 'text-gray-600' :
                        new Date(account.warranty.expiresAt) > new Date() ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.warranty.claimed ? 'Sudah Diklaim' :
                         new Date(account.warranty.expiresAt) > new Date() ? 
                         `Aktif hingga ${formatDateTime(account.warranty.expiresAt)}` : 
                         'Kadaluarsa'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;
