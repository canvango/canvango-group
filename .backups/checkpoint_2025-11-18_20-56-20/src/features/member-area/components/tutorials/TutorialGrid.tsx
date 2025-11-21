import React from 'react';
import { BookOpen } from 'lucide-react';
import { Tutorial } from '../../types/tutorial';
import TutorialCard from './TutorialCard';

interface TutorialGridProps {
  tutorials: Tutorial[];
  isLoading?: boolean;
  onTutorialClick: (slug: string) => void;
}

const TutorialGrid: React.FC<TutorialGridProps> = ({
  tutorials,
  isLoading = false,
  onTutorialClick
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 280px))',
    justifyContent: 'space-between',
    gap: '8px'
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div style={gridStyle}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="relative w-full" style={{ paddingTop: '50%' }}>
              <div className="absolute inset-0 bg-gray-200" />
            </div>
            <div className="px-3 py-3">
              <div className="h-5 bg-gray-200 rounded mb-1" />
              <div className="h-4 bg-gray-200 rounded mb-1" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (tutorials.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Tidak ada tutorial ditemukan
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Coba ubah filter atau kata kunci pencarian Anda
        </p>
      </div>
    );
  }

  // Tutorial grid
  return (
    <div style={gridStyle}>
      {tutorials.map((tutorial) => (
        <TutorialCard
          key={tutorial.id}
          tutorial={tutorial}
          onClick={onTutorialClick}
        />
      ))}
    </div>
  );
};

export default TutorialGrid;
