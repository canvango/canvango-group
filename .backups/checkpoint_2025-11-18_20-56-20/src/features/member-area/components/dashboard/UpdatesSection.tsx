import React from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

interface Update {
  id: string;
  title: string;
  description: string;
  date: string;
  type?: 'feature' | 'maintenance' | 'announcement';
}

interface UpdatesSectionProps {
  updates: Update[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

const UpdatesSection: React.FC<UpdatesSectionProps> = ({ 
  updates, 
  onRefresh,
  isLoading = false 
}) => {
  const typeColors = {
    feature: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800',
    announcement: 'bg-green-100 text-green-800'
  };

  const typeLabels = {
    feature: 'Fitur Baru',
    maintenance: 'Pemeliharaan',
    announcement: 'Pengumuman'
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
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh updates"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {updates.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Calendar}
            title="Belum Ada Update"
            description="Update terbaru platform akan muncul di sini"
          />
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {updates.map((update) => (
            <div 
              key={update.id} 
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-gray-900 flex-1">
                  {update.title}
                </h4>
                {update.type && (
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${typeColors[update.type]}`}
                  >
                    {typeLabels[update.type]}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                {update.description}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                <time dateTime={update.date}>{update.date}</time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpdatesSection;
