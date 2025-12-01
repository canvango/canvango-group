/**
 * PaymentChannelManager Component
 * Admin interface to manage payment channels
 */

import { useState } from 'react';
import {
  usePaymentChannelsFromDB,
  useSyncPaymentChannels,
  useUpdateChannelStatus,
  useLastSyncTime,
} from '@/hooks/useTripay';
import type { TripayPaymentChannel } from '@/services/tripayChannels.service';

export function PaymentChannelManager() {
  const [showDisabled, setShowDisabled] = useState(false);

  const { data: channels, isLoading, error } = usePaymentChannelsFromDB(showDisabled);
  const { data: lastSyncTime } = useLastSyncTime();
  const { mutate: syncChannels, isPending: isSyncing } = useSyncPaymentChannels();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateChannelStatus();

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belum pernah';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Handle toggle channel status
  const handleToggleStatus = (code: string, currentStatus: boolean) => {
    updateStatus({ code, isEnabled: !currentStatus });
  };

  // Handle sync
  const handleSync = () => {
    syncChannels();
  };

  // Group channels by group_name
  const groupedChannels = channels?.reduce((acc, channel) => {
    const group = channel.group_name || 'Lainnya';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, TripayPaymentChannel[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Channel Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                Kelola metode pembayaran yang tersedia untuk user
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isSyncing ? 'Syncing...' : 'Sync dari Tripay'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-blue-900">
                Terakhir sync: {formatDate(lastSyncTime)}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDisabled}
                onChange={(e) => setShowDisabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Tampilkan yang dinonaktifkan</span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-3xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="card-body">
            <p className="text-sm text-red-600">
              Gagal memuat payment channels. Silakan refresh halaman.
            </p>
          </div>
        </div>
      )}

      {/* Channels List */}
      {!isLoading && !error && groupedChannels && (
        <div className="space-y-4">
          {Object.entries(groupedChannels).map(([groupName, groupChannels]) => (
            <div key={groupName} className="card">
              <div className="card-header">
                <h4 className="text-lg font-semibold text-gray-900">{groupName}</h4>
              </div>

              <div className="divide-y divide-gray-200">
                {groupChannels.map((channel) => (
                  <div key={channel.code} className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      {channel.icon_url && (
                        <img
                          src={channel.icon_url}
                          alt={channel.name}
                          className="w-12 h-12 object-contain flex-shrink-0"
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {channel.name}
                          </h5>
                          <span className="text-xs font-mono text-gray-500">
                            {channel.code}
                          </span>
                          {!channel.is_active && (
                            <span className="badge bg-red-100 text-red-700">
                              Inactive di Tripay
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mt-2">
                          <div>
                            <span className="font-medium">Fee Merchant:</span>{' '}
                            {formatCurrency(channel.fee_merchant.flat)} +{' '}
                            {channel.fee_merchant.percent}%
                          </div>
                          <div>
                            <span className="font-medium">Fee Customer:</span>{' '}
                            {formatCurrency(channel.fee_customer.flat)} +{' '}
                            {channel.fee_customer.percent}%
                          </div>
                          {channel.minimum_amount && (
                            <div>
                              <span className="font-medium">Min:</span>{' '}
                              {formatCurrency(channel.minimum_amount)}
                            </div>
                          )}
                          {channel.maximum_amount && (
                            <div>
                              <span className="font-medium">Max:</span>{' '}
                              {formatCurrency(channel.maximum_amount)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Toggle */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={channel.is_enabled}
                            onChange={() =>
                              handleToggleStatus(channel.code, channel.is_enabled || false)
                            }
                            disabled={isUpdating}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span className="text-sm font-medium text-gray-700">
                          {channel.is_enabled ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!channels || channels.length === 0) && (
        <div className="card bg-gray-50">
          <div className="card-body text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Payment Channel
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sync payment channels dari Tripay untuk memulai
            </p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Sync dari Tripay</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
