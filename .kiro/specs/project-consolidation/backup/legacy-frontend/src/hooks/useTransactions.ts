import { useState, useEffect } from 'react';
import { transactionsService, Transaction, TransactionFilters } from '../services/transactions.service';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

/**
 * useTransactions - Hook for fetching transactions with filters and pagination
 */
export const useTransactions = (
  filters: TransactionFilters = {},
  page: number = 1,
  limit: number = 20
): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionsService.fetchTransactions(filters, page, limit);
      setTransactions(response.transactions);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [JSON.stringify(filters), page, limit]);

  return {
    transactions,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch: fetchTransactions
  };
};

export default useTransactions;
