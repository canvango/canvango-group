import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  fetchTransactions,
  fetchTransactionById,
  fetchTransactionAccounts,
  fetchTransactionStats,
  FetchTransactionsParams,
  PaginatedResponse,
  TransactionStats,
} from '../services/transactions.service';
import { Transaction, Account } from '../types/transaction';

/**
 * Hook to fetch transactions with filters and pagination
 */
export const useTransactions = (
  params: FetchTransactionsParams
): UseQueryResult<PaginatedResponse<Transaction>, Error> => {
  return useQuery<PaginatedResponse<Transaction>, Error>({
    queryKey: ['transactions', params],
    queryFn: () => fetchTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a single transaction by ID
 */
export const useTransaction = (
  transactionId: string
): UseQueryResult<Transaction, Error> => {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => fetchTransactionById(transactionId),
    enabled: !!transactionId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch accounts for a specific transaction
 */
export const useTransactionAccounts = (
  transactionId: string
): UseQueryResult<Account[], Error> => {
  return useQuery({
    queryKey: ['transactionAccounts', transactionId],
    queryFn: () => fetchTransactionAccounts(transactionId),
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch transaction statistics
 */
export const useTransactionStats = (): UseQueryResult<TransactionStats, Error> => {
  return useQuery({
    queryKey: ['transactionStats'],
    queryFn: fetchTransactionStats,
    staleTime: 5 * 60 * 1000,
  });
};
