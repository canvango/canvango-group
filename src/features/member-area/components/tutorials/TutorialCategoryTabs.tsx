import React from 'react';
import { BookOpen, Briefcase, TrendingUp, Code, AlertCircle, LucideIcon } from 'lucide-react';

interface CategoryTab {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
}

interface TutorialCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

// Match actual database categories
const categoryTabs: CategoryTab[] = [
  { id: 'all', label: 'Semua', icon: BookOpen, value: 'all' },
  { id: 'bm_management', label: 'BM Management', icon: Briefcase, value: 'bm_management' },
  { id: 'advertising', label: 'Advertising', icon: TrendingUp, value: 'advertising' },
  { id: 'api', label: 'API', icon: Code, value: 'api' },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle, value: 'troubleshooting' }
];

const TutorialCategoryTabs: React.FC<TutorialCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="w-full overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
      <div className="flex gap-2 min-w-max pb-2">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.value;
          
          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.value)}
              className={`
                flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-2xl font-medium transition-colors whitespace-nowrap text-sm md:text-base
                ${isActive 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TutorialCategoryTabs;
