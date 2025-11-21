import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import { createClaim } from '../../services/claimService';
import { Transaction } from '../../types/transaction.types';

interface ClaimFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const ClaimForm: React.FC<ClaimFormProps> = ({ onSuccess, onError }) => {
  const [transactionId, setTransactionId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errors, setErrors] = useState<{
    transactionId?: string;
    reason?: string;
    description?: string;
  }>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      // Fetch only successful transactions
      const response = await transactionService.getUserTransactions(1, 100, 'BERHASIL');
      setTransactions(response.transactions);
    } catch (error: any) {
      onError(error.response?.data?.error?.message || 'Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      transactionId?: string;
      reason?: string;
      description?: string;
    } = {};

    if (!transactionId) {
      newErrors.transactionId = 'Please select a transaction';
    }

    if (!reason || reason.trim().length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters';
    } else if (reason.length > 255) {
      newErrors.reason = 'Reason must not exceed 255 characters';
    }

    if (!description || description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await createClaim({
        transaction_id: transactionId,
        reason: reason.trim(),
        description: description.trim(),
      });

      // Reset form
      setTransactionId('');
      setReason('');
      setDescription('');
      setErrors({});

      onSuccess();
    } catch (error: any) {
      onError(error.response?.data?.error?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Selection */}
      <div>
        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Transaksi <span className="text-red-500">*</span>
        </label>
        {loadingTransactions ? (
          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-600">Tidak ada transaksi yang dapat di-claim</p>
            <p className="text-sm text-gray-500 mt-1">
              Hanya transaksi dengan status BERHASIL yang dapat di-claim
            </p>
          </div>
        ) : (
          <select
            id="transactionId"
            value={transactionId}
            onChange={(e) => {
              setTransactionId(e.target.value);
              setErrors({ ...errors, transactionId: undefined });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.transactionId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Pilih transaksi yang ingin di-claim</option>
            {transactions.map((transaction) => (
              <option key={transaction.id} value={transaction.id}>
                {transaction.product_name} - {formatCurrency(transaction.total_amount)} - {formatDate(transaction.created_at)}
              </option>
            ))}
          </select>
        )}
        {errors.transactionId && (
          <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>
        )}
      </div>

      {/* Reason Input */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Alasan Claim <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setErrors({ ...errors, reason: undefined });
          }}
          placeholder="Contoh: Produk tidak sesuai deskripsi"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.reason ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={255}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {reason.length}/255 karakter
        </p>
      </div>

      {/* Description Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi Masalah <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors({ ...errors, description: undefined });
          }}
          placeholder="Jelaskan masalah yang Anda alami secara detail..."
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={5000}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {description.length}/5000 karakter
        </p>
      </div>

      {/* Information Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Informasi Penting:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Hanya transaksi dengan status BERHASIL yang dapat di-claim</li>
          <li>Setiap transaksi hanya dapat di-claim satu kali</li>
          <li>Jelaskan masalah Anda dengan detail untuk mempercepat proses</li>
          <li>Tim kami akan meninjau claim Anda dalam 1-3 hari kerja</li>
          <li>Anda akan menerima notifikasi setelah claim diproses</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || loadingTransactions || transactions.length === 0}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Memproses...' : 'Submit Claim Garansi'}
      </button>
    </form>
  );
};

export default ClaimForm;
