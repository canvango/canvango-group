import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useTutorials } from '../hooks/useTutorials';
import {
  TutorialSearchBar,
  TutorialCategoryTabs,
  TutorialGrid
} from '../components/tutorials';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePersistedFilters } from '../../../shared/hooks/usePersistedFilters';

const TutorialCenter: React.FC = () => {
  usePageTitle('Tutorial Center');
  const navigate = useNavigate();
  
  // Persisted filters
  const { filters, setFilter } = usePersistedFilters('tutorial-center', {
    search: '',
    category: 'all',
  });

  // Extract filter values
  const searchValue = filters.search as string;
  const activeCategory = filters.category as string;

  // Fetch tutorials with filters - filtering done by Supabase
  const { data: tutorials = [], isLoading } = useTutorials({
    category: activeCategory,
    search: searchValue
  });

  const handleTutorialClick = (slug: string) => {
    // Navigate to tutorial detail page
    navigate(`/member/tutorial/${slug}`);
  };

  const handleSearchChange = (value: string) => {
    setFilter('search', value);
  };

  const handleCategoryChange = (category: string) => {
    setFilter('category', category);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary-600 flex-shrink-0" />
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Pusat Tutorial</h1>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Pelajari cara menggunakan platform kami dengan panduan lengkap dan tutorial step-by-step
        </p>
      </div>

      {/* Search Bar */}
      <TutorialSearchBar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        resultCount={searchValue ? filteredTutorials.length : undefined}
      />

      {/* Category Tabs */}
      <TutorialCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Total Count */}
      {!searchValue && (
        <div className="text-sm text-gray-600">
          Total {tutorials.length} tutorial tersedia
        </div>
      )}

      {/* Tutorial Grid */}
      <TutorialGrid
        tutorials={tutorials}
        isLoading={isLoading}
        onTutorialClick={handleTutorialClick}
      />
    </div>
  );
};

export default TutorialCenter;
