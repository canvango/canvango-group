import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { Tutorial, TutorialCategory } from '../../types/tutorial';
import Badge from '../../../../shared/components/Badge';

interface TutorialCardProps {
  tutorial: Tutorial;
  onClick: (slug: string) => void;
}

const categoryLabels: Record<TutorialCategory, string> = {
  [TutorialCategory.GETTING_STARTED]: 'Memulai',
  [TutorialCategory.ACCOUNT]: 'Akun',
  [TutorialCategory.TRANSACTION]: 'Transaksi',
  [TutorialCategory.API]: 'API',
  [TutorialCategory.TROUBLESHOOT]: 'Troubleshoot'
};

const categoryColors: Record<TutorialCategory, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  [TutorialCategory.GETTING_STARTED]: 'success',
  [TutorialCategory.ACCOUNT]: 'info',
  [TutorialCategory.TRANSACTION]: 'default',
  [TutorialCategory.API]: 'warning',
  [TutorialCategory.TROUBLESHOOT]: 'error'
};

const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial, onClick }) => {
  // Extract first 150 characters of content as description
  const description = tutorial.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 150) + (tutorial.content.length > 150 ? '...' : '');

  return (
    <div
      onClick={() => onClick(tutorial.slug)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Thumbnail Image */}
      <div className="relative w-full" style={{ paddingTop: '50%' }}>
        {tutorial.thumbnail ? (
          <img
            src={tutorial.thumbnail}
            alt={tutorial.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-primary-600" />
          </div>
        )}
        
        {/* Category Badge Overlay */}
        <div className="absolute top-3 left-3">
          <Badge variant={categoryColors[tutorial.category]} size="sm">
            {categoryLabels[tutorial.category]}
          </Badge>
        </div>
      </div>

      {/* Tutorial Info */}
      <div className="px-3 py-3 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
          {tutorial.title}
        </h3>
        
        <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Read Time */}
        <div className="flex items-center text-xs text-gray-500 mt-auto">
          <Clock className="w-3.5 h-3.5 mr-1" />
          <span>{tutorial.readTime} menit baca</span>
        </div>
      </div>
    </div>
  );
};

export default TutorialCard;
