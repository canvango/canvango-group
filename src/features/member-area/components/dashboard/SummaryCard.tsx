import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  subInfo?: {
    text: string;
    color: 'green' | 'blue' | 'orange' | 'red';
  };
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, subInfo, bgColor }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-primary-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  return (
    <div className={`${bgColor} rounded-2xl p-4 border border-gray-200 relative shadow-sm`}>
      <div className="absolute top-4 right-4">
        <div className="w-10 h-10 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="pr-14">
        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-0.5">{value}</div>
        <div className="text-xs md:text-sm text-gray-500">{label}</div>
        {subInfo && (
          <div className={`text-xs font-medium ${colorClasses[subInfo.color]} mt-0.5`}>
            {subInfo.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
