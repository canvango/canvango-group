import { useState, useEffect } from 'react';
import { adminStatsService, OverviewStats, UserStats, TransactionStats } from '../../services/adminStatsService';

const AdminDashboard = () => {
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, users, transactions] = await Promise.all([
        adminStatsService.getOverviewStats(),
        adminStatsService.getUserStats(period),
        adminStatsService.getTransactionStats(period),
      ]);

      setOverviewStats(overview);
      setUserStats(users);
      setTransactionStats(transactions);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.error?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!overviewStats || !userStats || !transactionStats) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="period" className="text-sm text-gray-600">
            Period:
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(overviewStats.users.total)}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-600">{overviewStats.users.byRole.member} Members</span>
                {' • '}
                <span className="text-blue-600">{overviewStats.users.byRole.admin} Admins</span>
              </div>
            </div>
            <div className="bg-blue-100 rounded-2xl p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Transactions Card */}
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(overviewStats.transactions.total)}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-600">{overviewStats.transactions.byStatus.BERHASIL} Success</span>
                {' • '}
                <span className="text-yellow-600">{overviewStats.transactions.byStatus.PENDING} Pending</span>
              </div>
            </div>
            <div className="bg-green-100 rounded-2xl p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(overviewStats.revenue.total)}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Avg: {formatCurrency(transactionStats.avgTransactionAmount)}
              </div>
            </div>
            <div className="bg-primary-100 rounded-2xl p-3">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Claims Card */}
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(overviewStats.claims.pending)}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-600">{overviewStats.claims.byStatus.APPROVED} Approved</span>
                {' • '}
                <span className="text-red-600">{overviewStats.claims.byStatus.REJECTED} Rejected</span>
              </div>
            </div>
            <div className="bg-yellow-100 rounded-2xl p-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-8">
        {/* Total Products Card */}
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(overviewStats.products?.total || 0)}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-600">{overviewStats.products?.byStock?.available || 0} Available</span>
                {' • '}
                <span className="text-red-600">{overviewStats.products?.byStock?.out_of_stock || 0} Out of Stock</span>
              </div>
            </div>
            <div className="bg-orange-100 rounded-2xl p-3">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Recent Activities</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(overviewStats.recentActivities?.length || 0)}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-gray-600">Last 10 admin actions</span>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-3">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Breakdown Section */}
      {transactionStats.breakdown && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Purchase */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-500 rounded-2xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">Purchase</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">
                {formatNumber(transactionStats.breakdown.totalPurchaseCompleted)}
              </p>
              <p className="text-sm text-blue-700 mb-2">Total Purchase Sold</p>
              <p className="text-xs text-blue-600 font-medium">
                {transactionStats.breakdown.totalPurchasePending > 0 
                  ? `${transactionStats.breakdown.totalPurchasePending} pending • ${formatCurrency(transactionStats.breakdown.revenuePurchase)}`
                  : formatCurrency(transactionStats.breakdown.revenuePurchase)}
              </p>
            </div>

            {/* Total Topup */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow p-6 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-500 rounded-2xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">Topup</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mb-1">
                {formatNumber(transactionStats.breakdown.totalTopup)}
              </p>
              <p className="text-sm text-green-700 mb-2">Total Topup Transactions</p>
              <p className="text-xs text-green-600 font-medium">
                {formatCurrency(transactionStats.breakdown.revenueTopup)}
              </p>
            </div>

            {/* BM Account Purchase */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl shadow p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-500 rounded-2xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">BM</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mb-1">
                {formatNumber(transactionStats.breakdown.purchaseBMCompleted)}
              </p>
              <p className="text-sm text-purple-700 mb-2">BM Account Sold</p>
              <p className="text-xs text-purple-600">
                {transactionStats.breakdown.purchaseBM > transactionStats.breakdown.purchaseBMCompleted 
                  ? `${transactionStats.breakdown.purchaseBM - transactionStats.breakdown.purchaseBMCompleted} pending • ${transactionStats.breakdown.purchaseBM} total`
                  : `${transactionStats.breakdown.purchaseBM} total • All completed`}
              </p>
            </div>

            {/* Personal Account Purchase */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl shadow p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-500 rounded-2xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-orange-700 bg-orange-200 px-2 py-1 rounded-full">Personal</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mb-1">
                {formatNumber(transactionStats.breakdown.purchasePersonalCompleted)}
              </p>
              <p className="text-sm text-orange-700 mb-2">Personal Account Sold</p>
              <p className="text-xs text-orange-600">
                {transactionStats.breakdown.purchasePersonal > transactionStats.breakdown.purchasePersonalCompleted 
                  ? `${transactionStats.breakdown.purchasePersonal - transactionStats.breakdown.purchasePersonalCompleted} pending • ${transactionStats.breakdown.purchasePersonal} total`
                  : `${transactionStats.breakdown.purchasePersonal} total • All completed`}
              </p>
            </div>
          </div>

          {/* Additional Product Types (if any) */}
          {(transactionStats.breakdown.purchaseVerifiedBM > 0 || transactionStats.breakdown.purchaseAPI > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
              {transactionStats.breakdown.purchaseVerifiedBM > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl shadow p-6 border border-indigo-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-indigo-500 rounded-2xl p-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-indigo-700 bg-indigo-200 px-2 py-1 rounded-full">Verified</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-900 mb-1">
                    {formatNumber(transactionStats.breakdown.purchaseVerifiedBM)}
                  </p>
                  <p className="text-sm text-indigo-700 mb-2">Verified BM Purchases</p>
                  <p className="text-xs text-indigo-600">
                    {transactionStats.breakdown.totalPurchase > 0 
                      ? `${((transactionStats.breakdown.purchaseVerifiedBM / transactionStats.breakdown.totalPurchase) * 100).toFixed(1)}% of purchases`
                      : '0% of purchases'}
                  </p>
                </div>
              )}

              {transactionStats.breakdown.purchaseAPI > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl shadow p-6 border border-pink-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-pink-500 rounded-2xl p-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-pink-700 bg-pink-200 px-2 py-1 rounded-full">API</span>
                  </div>
                  <p className="text-2xl font-bold text-pink-900 mb-1">
                    {formatNumber(transactionStats.breakdown.purchaseAPI)}
                  </p>
                  <p className="text-sm text-pink-700 mb-2">API Purchases</p>
                  <p className="text-xs text-pink-600">
                    {transactionStats.breakdown.totalPurchase > 0 
                      ? `${((transactionStats.breakdown.purchaseAPI / transactionStats.breakdown.totalPurchase) * 100).toFixed(1)}% of purchases`
                      : '0% of purchases'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-8">
        {/* Transaction Volume Chart */}
        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h2>
          <div className="space-y-2">
            {transactionStats.volume.slice(-7).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{item.count} txn</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((item.count / Math.max(...transactionStats.volume.map(v => v.count))) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-24 text-right">
                    {formatCurrency(item.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
          <div className="space-y-2">
            {userStats.growth.slice(-7).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-green-600">+{item.newUsers} new</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((item.newUsers / Math.max(...userStats.growth.map(g => g.newUsers))) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-24 text-right">
                    Total: {item.totalUsers}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-3xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionStats.byProduct.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.productType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatNumber(product.count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(product.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(product.totalAmount / product.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
