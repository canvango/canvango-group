import React from 'react';
import { VerifiedBMURL } from '../../types/verified-bm';
import { CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface URLStatusListProps {
  urls: VerifiedBMURL[];
  pricePerUrl: number;
  isAdmin?: boolean;
  onUpdateStatus?: (urlId: string, status: 'processing' | 'completed' | 'failed') => void;
  onRefund?: (urlId: string) => void;
}

export const URLStatusList: React.FC<URLStatusListProps> = ({
  urls,
  pricePerUrl,
  isAdmin = false,
  onUpdateStatus,
  onRefund
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          label: 'Selesai'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          label: 'Gagal'
        };
      case 'refunded':
        return {
          icon: RefreshCw,
          color: 'text-red-600',
          bg: 'bg-red-50',
          label: 'Refund'
        };
      case 'processing':
        return {
          icon: AlertCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          label: 'Proses'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          label: 'Pending'
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Detail URL ({urls.length} akun)</h3>
      
      <div className="space-y-2">
        {urls.map((url) => {
          const statusConfig = getStatusConfig(url.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div
              key={url.id}
              className={`p-4 rounded-2xl border ${statusConfig.bg} border-gray-200`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">
                      Akun #{url.url_index}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 break-all mb-2">
                    {url.url}
                  </p>
                  
                  {url.admin_notes && (
                    <div className="mt-2 p-2 bg-white rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Catatan Admin:</p>
                      <p className="text-sm text-gray-700">{url.admin_notes}</p>
                    </div>
                  )}
                  
                  {url.refunded_at && (
                    <div className="mt-2 text-xs text-red-600">
                      Refund: {formatCurrency(url.refund_amount || pricePerUrl)} • {new Date(url.refunded_at).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
                
                {isAdmin && url.status !== 'refunded' && (
                  <div className="flex flex-col gap-2">
                    {url.status === 'pending' && (
                      <button
                        onClick={() => onUpdateStatus?.(url.id, 'processing')}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Proses
                      </button>
                    )}
                    
                    {url.status === 'processing' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus?.(url.id, 'completed')}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          Selesai
                        </button>
                        <button
                          onClick={() => onUpdateStatus?.(url.id, 'failed')}
                          className="btn-secondary text-xs px-3 py-1"
                        >
                          Gagal
                        </button>
                      </>
                    )}
                    
                    {url.status === 'failed' && (
                      <button
                        onClick={() => onRefund?.(url.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-xl transition-colors"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
