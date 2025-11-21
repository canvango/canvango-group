import React, { useState, useEffect } from 'react';
import { RoleManagementClient } from '../clients/RoleManagementClient';
import { AuditLogWithDetails, UserRole } from '../types/roleManagement';

interface AuditLogViewerProps {
  roleClient: RoleManagementClient;
  userId?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ roleClient, userId }) => {
  const [logs, setLogs] = useState<AuditLogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    loadLogs();
  }, [userId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const auditLogs = await roleClient.getRoleAuditLogs(userId);
      setLogs(auditLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogsByDate = (logs: AuditLogWithDetails[]) => {
    if (dateFilter === 'all') return logs;

    const now = new Date();
    const daysAgo = {
      '7days': 7,
      '30days': 30,
      '90days': 90
    }[dateFilter];

    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return logs.filter(log => new Date(log.changed_at) >= cutoffDate);
  };

  const filteredLogs = filterLogsByDate(logs);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleChangeIcon = (_oldRole: UserRole | null, newRole: UserRole) => {
    if (newRole === UserRole.ADMIN) {
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User Email', 'Old Role', 'New Role', 'Changed By'];
    const rows = filteredLogs.map(log => [
      formatDate(log.changed_at),
      log.user_email || 'Unknown',
      log.old_role || 'N/A',
      log.new_role,
      log.changed_by_email || 'System'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading audit logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadLogs}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {userId ? 'User Role History' : 'Role Change Audit Log'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-600">Filter by date:</label>
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value as any);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
        <span className="text-sm text-gray-500">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Timeline */}
      {paginatedLogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-gray-600">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {paginatedLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getRoleChangeIcon(log.old_role, log.new_role)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {log.user_email || 'Unknown User'}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(log.changed_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Role changed from</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          log.old_role === UserRole.ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.old_role || 'N/A'}
                      </span>
                      <span className="text-gray-600">to</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          log.new_role === UserRole.ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.new_role}
                      </span>
                    </div>

                    {log.changed_by_email && (
                      <div className="mt-1 text-xs text-gray-500">
                        Changed by: {log.changed_by_email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, filteredLogs.length)} of{' '}
            {filteredLogs.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
