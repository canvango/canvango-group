import { useState } from 'react';
import { Tutorial } from '../../types/tutorial.types';

interface TutorialListProps {
  tutorials: Tutorial[];
  onTutorialClick: (tutorial: Tutorial) => void;
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

const TutorialList = ({ tutorials, onTutorialClick, onSearch, searchTerm }: TutorialListProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
    // Trigger search on every keystroke for better UX
    onSearch(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={localSearchTerm}
            onChange={handleSearchChange}
            placeholder="Cari tutorial..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {/* Tutorial List */}
      {tutorials.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada tutorial</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tidak ada tutorial yang cocok dengan pencarian Anda.' : 'Belum ada tutorial tersedia.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              onClick={() => onTutorialClick(tutorial)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {tutorial.title}
                </h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {tutorial.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tutorial.category}
                </span>
                
                <div className="flex items-center text-gray-500">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {tutorial.view_count}
                </div>
              </div>

              {tutorial.tags && tutorial.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {tutorial.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {tutorial.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      +{tutorial.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorialList;
