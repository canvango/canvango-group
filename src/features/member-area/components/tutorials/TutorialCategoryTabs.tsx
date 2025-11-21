import React from 'react';
import { BookOpen, Rocket, User, CreditCard, Code, AlertCircle, LucideIcon } from 'lucide-react';
import { TutorialCategory } from '../../types/tutorial';

interface CategoryTab {
  id: string;
  label: string;
  icon: LucideIcon;
  value: TutorialCategory | 'all';
}

interface TutorialCategoryTabsProps {
  activeCategory: TutorialCategory | 'all';
  onCategoryChange: (category: TutorialCategory | 'all') => void;
}

const categoryTabs: CategoryTab[] = [
  { id: 'all', label: 'Semua', icon: BookOpen, value: 'all' },
  { id: 'getting-started', label: 'Memulai', icon: Rocket, value: TutorialCategory.GETTING_STARTED },
  { id: 'account', label: 'Akun', icon: User, value: TutorialCategory.ACCOUNT },
  { id: 'transaction', label: 'Transaksi', icon: CreditCard, value: TutorialCategory.TRANSACTION },
  { id: 'api', label: 'API', icon: Code, value: TutorialCategory.API },
  { id: 'troubleshoot', label: 'Troubleshoot', icon: AlertCircle, value: TutorialCategory.TROUBLESHOOT }
];

const TutorialCategoryTabs: React.FC<TutorialCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-2">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.value;
          
          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TutorialCategoryTabs;
