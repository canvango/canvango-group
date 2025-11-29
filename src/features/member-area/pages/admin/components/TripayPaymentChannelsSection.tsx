/**
 * Tripay Payment Channels Section
 * Displays and manages payment channels from Tripay API
 */

import React, { useState, useEffect } from 'react';
import {
  getPaymentChannelsFromDB,
  syncPaymentChannels,
  updateChannelStatus,
  getLastSyncTime,
  TripayPaymentChannel,
} from '@/services/tripayChannels.service';

export const TripayPaymentChannelsSection: React.FC = () => {
  const [channels, setChannels] = useState<TripayPaymentChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
    fetchLastSyncTime();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPaymentChannelsFromDB(true); // Include disabled
      setChannels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment channels');
    } finally {
      setLoading(false);
    }
  };

  const fetchLastSyncTime = async () => {
    const time = await getLastSyncTime();
    setLastSyncTime(time);
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMessage(null);

      const result = await syncPaymentChannels();

      setSuccessMessage(
        `✅ Sync successful! Added: ${result.added}, Updated: ${result.updated}, Total: ${result.total}`
      );

      // Refresh channels
      await fetchChannels();
      await fetchLastSyncTime();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to sync payment channels');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleChannel = async (code: string, currentStatus: boolean) => {
    try {
      await updateChannelStatus(code, !currentStatus);
      
      // Update local state
      setChannels(prev =>
        prev.map(ch =>
          ch.code === code ? { ...ch, is_enabled: !currentStatus } : ch
        )
      );

      setSuccessMessage(`✅ ${code} ${!currentStatus ? 'enabled' : 'disabled'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update channel status');
    }
  };

  const formatFee = (channel: TripayPaymentChannel) => {
    const { flat, percent } = channel.fee_merchant;
    if (flat > 0 && percent > 0) {
      return `Rp ${flat.toLocaleString()} + ${percent}%`;
    } else if (flat > 0) {
      return `Rp ${flat.toLocaleString()}`;
    } else if (percent > 0) {
      return `${percent}%`;
    }
    return 'Free';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-sm text-gray-600">Loading payment channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tripay Payment Channels</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage payment methods from Tripay API
          </p>
          {lastSyncTime && (
            <p className="text-xs text-gray-500 mt-1">
              Last synced: {formatDate(lastSyncTime)}
            </p>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Syncing...
            </>
          ) : (
            <>🔄 Refresh from Tripay</>
          )}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Payment Channels List */}
      {channels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-4">No payment channels found</p>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700"
          >
            Sync from Tripay
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.code}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              {/* Icon */}
              {channel.icon_url && (
                <img
                  src={channel.icon_url}
                  alt={channel.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{channel.name}</h3>
                  {!channel.is_active && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      Inactive in Tripay
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="font-mono">{channel.code}</span>
                  {channel.group_name && (
                    <>
                      <span>•</span>
                      <span>{channel.group_name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-green-600 font-medium">Fee: {formatFee(channel)}</span>
                </div>
                {channel.minimum_amount && channel.maximum_amount && (
                  <div className="text-xs text-gray-500 mt-1">
                    Range: Rp {channel.minimum_amount.toLocaleString()} - Rp {channel.maximum_amount.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={channel.is_enabled}
                  onChange={() => handleToggleChannel(channel.code, channel.is_enabled || false)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {channel.is_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Payment Channels</h3>
            <div className="mt-2 text-xs text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Payment channels are fetched from Tripay API</li>
                <li>Only enabled channels will be shown to customers</li>
                <li>Fees are set by Tripay and cannot be changed here</li>
                <li>Click "Refresh from Tripay" to get latest channels</li>
                <li>Inactive channels in Tripay cannot be used even if enabled here</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
