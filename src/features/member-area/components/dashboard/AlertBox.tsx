import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AlertBoxProps {
  type: 'info' | 'warning' | 'error' | 'success';
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
}

const AlertBox: React.FC<AlertBoxProps> = ({ type, icon: Icon, title, content }) => {
  const typeStyles = {
    info: 'border-blue-500 text-blue-900',
    warning: 'border-amber-500 text-amber-900',
    error: 'border-red-500 text-red-900',
    success: 'border-green-500 text-green-900'
  };

  const iconStyles = {
    info: 'text-blue-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    success: 'text-green-600'
  };

  return (
    <div className={`bg-white border-l-4 ${typeStyles[type]} p-6 rounded-lg shadow-sm text-left`}>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[type]}`} />
          <h3 className="font-bold text-gray-900 text-left">{title}</h3>
        </div>
        <div className="text-sm text-gray-700 text-left">{content}</div>
      </div>
    </div>
  );
};

export default AlertBox;
