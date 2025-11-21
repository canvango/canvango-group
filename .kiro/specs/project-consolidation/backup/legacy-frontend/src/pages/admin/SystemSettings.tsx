import React, { useState, useEffect } from 'react';
import {
  getSettings,
  updateSettings,
  getLogs,
  SystemSettings as SystemSettingsType,
  AuditLog,
} from '../../services/adminSettingsService';

const SystemSettings: React.FC = () => {
  const [, setSettings] = useState<SystemSettingsType | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState({
    enabled: true,
    admin_email: '',
  });
  const [systemNotifications, setSystemNotifications] = useState({
    enabled: true,
    show_alerts: true,
  });

  // Maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: '',
  });

  // Logs pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resourceFilter, setResourceFilter] = useState('');
  const limit = 20;

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, currentPage, resourceFilter]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettings(data);

      // Set form states
      setPaymentMethods(data.payment_methods || []);
      setEmailNotifications(data.notification_email || { enabled: true, admin_email: '' });
      setSystemNotifications(data.notification_system || { enabled: true, show_alerts: true });
      setMaintenanceMode(data.maintenance_mode || { enabled: false, message: '' });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const params: any = {
        page: currentPage,
        limit,
      };

      if (resourceFilter) {
        params.resource = resourceFilter;
      }

      const response = await getLogs(params);
      setLogs(response.logs);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      await updateSettings({
        payment_methods: paymentMethods,
        notification_email: emailNotifications,
        notification_system: systemNotifications,
        maintenance_mode: maintenanceMode,
      });

      setSuccessMessage('Settings updated successfully');
      fetchSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update settings');
    }
  };

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.trim() && !paymentMethods.includes(newPaymentMethod.trim())) {
      setPaymentMethods([...paymentMethods, newPaymentMethod.trim()]);
      setNewPaymentMethod('');
    }
  };

  const handleRemovePaymentMethod = (method: string) => {
    setPaymentMethods(paymentMethods.filter((m) => m !== method));
  };

  const formatDate = (dateString: string) => {
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
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure system-wide settings and view audit logs</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Audit Logs
          </button>
        </nav>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure available payment methods for top-up
            </p>

            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => (
                <div
                  key={method}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{method}</span>
                  <button
                    onClick={() => handleRemovePaymentMethod(method)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPaymentMethod()}
                placeholder="Add new payment method"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddPaymentMethod}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailNotifications.enabled}
                      onChange={(e) =>
                        setEmailNotifications({
                          ...emailNotifications,
                          enabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Enable email notifications</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={emailNotifications.admin_email}
                      onChange={(e) =>
                        setEmailNotifications({
                          ...emailNotifications,
                          admin_email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* System Notifications */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">System Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemNotifications.enabled}
                      onChange={(e) =>
                        setSystemNotifications({
                          ...systemNotifications,
                          enabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Enable system notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemNotifications.show_alerts}
                      onChange={(e) =>
                        setSystemNotifications({
                          ...systemNotifications,
                          show_alerts: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Show alert messages</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Mode</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enable maintenance mode to prevent users from accessing the system
            </p>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={maintenanceMode.enabled}
                  onChange={(e) =>
                    setMaintenanceMode({
                      ...maintenanceMode,
                      enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Enable maintenance mode</span>
              </label>

              {maintenanceMode.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Message
                  </label>
                  <textarea
                    value={maintenanceMode.message}
                    onChange={(e) =>
                      setMaintenanceMode({
                        ...maintenanceMode,
                        message: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="System is under maintenance. Please try again later."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <select
                  value={resourceFilter}
                  onChange={(e) => {
                    setResourceFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Resources</option>
                  <option value="users">Users</option>
                  <option value="transactions">Transactions</option>
                  <option value="claims">Claims</option>
                  <option value="tutorials">Tutorials</option>
                  <option value="settings">Settings</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {logsLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No logs found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.admin_id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.ip_address || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
