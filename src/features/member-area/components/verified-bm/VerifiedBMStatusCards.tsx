import React from 'react';
import { Clock, Loader, CheckCircle, XCircle } from 'lucide-react';
import { VerifiedBMRequestStats } from '../../types/verified-bm';

interface VerifiedBMStatusCardsProps {
  stats: VerifiedBMRequestStats;
}

const VerifiedBMStatusCards: React.FC<VerifiedBMStatusCardsProps> = ({ stats }) => {
  const statusCards = [
    {
      label: 'Pending',
      value: stats.pendingRequests,
      icon: Clock,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-100'
    },
    {
      label: 'Processing',
      value: stats.processingRequests,
      icon: Loader,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      label: 'Completed',
      value: stats.completedRequests,
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100'
    },
    {
      label: 'Failed',
      value: stats.failedRequests,
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {statusCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-3xl p-5 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.iconBgColor} rounded-full p-3`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerifiedBMStatusCards;
