import React from 'react';
import { Code, BookOpen, Shield } from 'lucide-react';

export type APITab = 'endpoints' | 'examples' | 'rate-limits';

interface APITabNavigationProps {
  activeTab: APITab;
  onTabChange: (tab: APITab) => void;
}

export const APITabNavigation: React.FC<APITabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: 'endpoints' as APITab,
      label: 'Endpoints',
      icon: Code,
    },
    {
      id: 'examples' as APITab,
      label: 'Usage Examples',
      icon: BookOpen,
    },
    {
      id: 'rate-limits' as APITab,
      label: 'Rate Limits',
      icon: Shield,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="API Documentation Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
