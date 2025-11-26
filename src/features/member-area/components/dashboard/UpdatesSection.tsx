import React from 'react';
import { RefreshCw, Calendar, AlertCircle, CheckCircle, Info, Wrench, Megaphone } from 'lucide-react';
import { usePublishedAnnouncements } from '@/hooks/useAnnouncements';
import type { AnnouncementType } from '@/types/announcement';

interface UpdatesSectionProps {
  limit?: number;
}

const UpdatesSection: React.FC<UpdatesSectionProps> = ({ limit = 5 }) => {
  const { data: announcements, isLoading, refetch } = usePublishedAnnouncements(limit);

  const typeConfig: Record<AnnouncementType, { color: string; label: string; icon: React.ElementType }> = {
    info: { color: 'bg-blue-100 text-blue-800', label: 'Informasi', icon: Info },
    warning: { color: 'bg-orange-100 text-orange-800', label: 'Peringatan', icon: AlertCircle },
    success: { color: 'bg-green-100 text-green-800', label: 'Sukses', icon: CheckCircle },
    maintenance: { color: 'bg-amber-100 text-amber-800', label: 'Pemeliharaan', icon: Wrench },
    update: { color: 'bg-indigo-100 text-indigo-800', label: 'Update', icon: Megaphone }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            Update Terbaru
          </h3>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh updates"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Memuat update...</p>
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Belum Ada Update</h4>
          <p className="text-xs text-gray-500">Update terbaru platform akan muncul di sini</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {announcements.map((announcement) => {
            const config = typeConfig[announcement.type];
            const Icon = config.icon;
            
            return (
              <div 
                key={announcement.id} 
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex-1">
                    {announcement.title}
                  </h4>
                  <span 
                    className={`px-2.5 py-1 text-xs font-medium rounded-2xl flex-shrink-0 flex items-center gap-1 ${config.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed whitespace-pre-line">
                  {announcement.content}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                  <time dateTime={announcement.published_at || announcement.created_at}>
                    {formatDate(announcement.published_at || announcement.created_at)}
                  </time>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpdatesSection;
