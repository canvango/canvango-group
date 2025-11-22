import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconType } from 'react-icons';

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon | IconType; // Support both Lucide and React Icons (Font Awesome)
  count?: number;
}

export interface CategoryTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  // Debug logging
  console.log('CategoryTabs Debug:', {
    activeTab,
    tabs: tabs.map(t => ({ id: t.id, label: t.label }))
  });

  // Use horizontal scroll for many tabs (> 4), grid for few tabs
  const useManyTabsLayout = tabs.length > 4;

  return (
    <div className="w-full">
      <div 
        className={
          useManyTabsLayout
            ? 'flex gap-2 overflow-x-auto pb-2 scrollbar-hide'
            : 'grid gap-2 pb-2'
        }
        style={
          useManyTabsLayout
            ? undefined
            : { 
                gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
              }
        }
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          console.log(`Tab ${tab.id}: isActive = ${isActive}, activeTab = ${activeTab}`);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                inline-flex items-center justify-center px-4 py-2.5 rounded-full font-medium text-sm min-h-[44px]
                transition-all duration-200
                ${useManyTabsLayout ? 'flex-shrink-0 whitespace-nowrap' : ''}
                ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {Icon && (
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              )}
              <span className={useManyTabsLayout ? '' : 'truncate'}>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
