import React from 'react';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';
import { APIStats } from '../../types/api';

interface APIStatsCardsProps {
  stats: APIStats;
}

export const APIStatsCards: React.FC<APIStatsCardsProps> = ({ stats }) => {
  const usagePercentage = (stats.requestsToday / stats.rateLimit) * 100;
  
  const getHitLimitColor = () => {
    if (usagePercentage >= 90) return 'text-red-600 bg-red-50';
    if (usagePercentage >= 75) return 'text-orange-600 bg-orange-50';
    if (usagePercentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-primary-600 bg-primary-50';
  };
  
  const getHitLimitIconBg = () => {
    if (usagePercentage >= 90) return 'bg-red-100';
    if (usagePercentage >= 75) return 'bg-orange-100';
    if (usagePercentage >= 50) return 'bg-yellow-100';
    return 'bg-primary-100';
  };

  const cards = [
    {
      icon: usagePercentage >= 75 ? AlertTriangle : Activity,
      label: 'Rate Limit',
      value: `${stats.requestsToday.toLocaleString()} / ${stats.rateLimit.toLocaleString()}`,
      subInfo: `${usagePercentage.toFixed(1)}% used`,
      colorClass: getHitLimitColor(),
      iconBgClass: getHitLimitIconBg(),
      showWarning: usagePercentage >= 75,
    },
    {
      icon: Zap,
      label: 'Total Requests',
      value: stats.totalRequests.toLocaleString(),
      subInfo: 'All time',
      colorClass: 'text-blue-600 bg-blue-50',
      iconBgClass: 'bg-blue-100',
    },
    {
      icon: Clock,
      label: 'Last Request',
      value: stats.lastRequest ? new Date(stats.lastRequest).toLocaleTimeString() : 'Never',
      subInfo: stats.lastRequest ? new Date(stats.lastRequest).toLocaleDateString() : '',
      colorClass: 'text-gray-600 bg-gray-50',
      iconBgClass: 'bg-gray-100',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Rate limit warning banner */}
      {usagePercentage >= 75 && (
        <div
          className={`
            ${usagePercentage >= 90 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700'}
            border rounded-lg p-4
          `}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {usagePercentage >= 90
                  ? 'Critical: API rate limit almost reached'
                  : 'Warning: Approaching API rate limit'}
              </p>
              <p className="text-xs mt-1">
                You have used {usagePercentage.toFixed(1)}% of your daily API quota. 
                {usagePercentage >= 90 && ' Please reduce API calls to avoid service interruption.'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.colorClass} rounded-lg p-6 border border-gray-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.subInfo}</p>
                </div>
                <div className={`${card.iconBgClass} rounded-full p-3`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
