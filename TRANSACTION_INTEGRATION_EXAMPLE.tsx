/**
 * Contoh Integrasi Service Transaksi dengan View dan Function Database
 * 
 * File ini menunjukkan cara menggunakan service yang telah diupdate
 * untuk mengintegrasikan dengan view transaction_summary_by_member
 * dan function get_member_transactions
 */

import React, { useState, useEffect } from 'react';
import { 
  fetchExtendedTransactionStats, 
  getMemberTransactions,
  ExtendedTransactionStats 
} from '../services/transactions.service';
import { supabase } from '../services/supabase';

/**
 * Contoh 1: Menggunakan Extended Transaction Stats
 * Stats ini akan menampilkan 0 untuk member yang belum pernah transaksi
 */
export const TransactionStatsExample: React.FC = () => {
  const [stats, setStats] = useState<ExtendedTransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchExtendedTransactionStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-600 text-sm">Total Akun Dibeli</h3>
        <p className="text-2xl font-bold">{stats.totalAccountsPurchased}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-600 text-sm">Total Pengeluaran</h3>
        <p className="text-2xl font-bold">
          Rp {stats.totalSpending.toLocaleString('id-ID')}
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-600 text-sm">Total Top Up</h3>
        <p className="text-2xl font-bold">
          Rp {stats.totalTopup.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-600 text-sm">Total Transaksi</h3>
        <p className="text-2xl font-bold">{stats.totalTransactions}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-600 text-sm">Pending</h3>
        <p className="text-2xl font-bold text-yellow-600">
          {stats.pendingTransactions}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-600 text-sm">Completed</h3>
        <p className="text-2xl font-bold text-green-600">
          {stats.completedTransactions}
        </p>
      </div>
    </div>
  );
};

/**
 * Contoh 2: Menggunakan getMemberTransactions dengan Filter
 */
export const TransactionListExample: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [transactionType, setTransactionType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Fetch transactions with filters
        const data = await getMemberTransactions({
          userId: user.id,
          transactionType: transactionType || undefined,
          status: status || undefined,
          dateStart: dateStart || undefined,
          dateEnd: dateEnd || undefined,
          limit: 50,
          offset: 0
        });

        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [transactionType, status, dateStart, dateEnd]);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Filter Transaksi</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Transaksi
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Semua</option>
              <option value="purchase">Purchase</option>
              <option value="topup">Top Up</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada transaksi</p>
            <p className="text-sm mt-2">
              Semua transaksi Anda akan muncul di sini
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(txn.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {txn.transaction_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {txn.product_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {Number(txn.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      txn.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/**
 * Contoh 3: Menggunakan View Langsung dengan Supabase Client
 */
export const AllMembersSummaryExample: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembersSummary = async () => {
      try {
        setLoading(true);
        
        // Query view langsung
        const { data, error } = await supabase
          .from('transaction_summary_by_member')
          .select('*')
          .order('username');

        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        console.error('Error loading members summary:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMembersSummary();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Transaksi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Spending
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Top Up
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((member) => (
            <tr key={member.user_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {member.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {member.total_transactions}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {Number(member.total_spending).toLocaleString('id-ID')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {Number(member.total_topup).toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Contoh 4: Hook Custom untuk Transaction Stats
 */
export const useTransactionStats = () => {
  const [stats, setStats] = useState<ExtendedTransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchExtendedTransactionStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExtendedTransactionStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
};

// Contoh penggunaan hook
export const DashboardWithHook: React.FC = () => {
  const { stats, loading, error, refetch } = useTransactionStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div>
      <button 
        onClick={refetch}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Stats
      </button>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Total Akun</p>
          <p className="text-2xl font-bold">{stats.totalAccountsPurchased}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Total Spending</p>
          <p className="text-2xl font-bold">
            Rp {stats.totalSpending.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Total Top Up</p>
          <p className="text-2xl font-bold">
            Rp {stats.totalTopup.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
};
