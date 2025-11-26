import React from 'react';
import { Clock, BookOpen, Eye } from 'lucide-react';
import { Tutorial } from '../../types/tutorial';
import Badge from '../../../../shared/components/Badge';

interface TutorialCardProps {
  tutorial: Tutorial;
  onClick: (slug: string) => void;
}

// Category labels mapping
const categoryLabels: Record<string, string> = {
  'bm_management': 'BM Management',
  'advertising': 'Advertising',
  'troubleshooting': 'Troubleshooting',
  'api': 'API',
};

// Category colors mapping
const categoryColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  'bm_management': 'info',
  'advertising': 'success',
  'troubleshooting': 'error',
  'api': 'warning',
};

// Calculate read time from content (average 200 words per minute)
const calculateReadTime = (content: string): number => {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial, onClick }) => {
  // Use description if available, otherwise extract from content
  const description = tutorial.description || 
    tutorial.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 150) + (tutorial.content.length > 150 ? '...' : '');

  const readTime = tutorial.duration_minutes || calculateReadTime(tutorial.content);
  const categoryLabel = categoryLabels[tutorial.category] || tutorial.category;
  const categoryColor = categoryColors[tutorial.category] || 'default';

  return (
    <div
      onClick={() => onClick(tutorial.slug)}
      className="bg-white rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Thumbnail Image */}
      <div className="relative w-full" style={{ paddingTop: '50%' }}>
        {tutorial.thumbnail_url ? (
          <img
            src={tutorial.thumbnail_url}
            alt={tutorial.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-primary-600" />
          </div>
        )}
        
        {/* Category Badge Overlay */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <Badge variant={categoryColor} size="sm">
            {categoryLabel}
          </Badge>
        </div>

        {/* Difficulty Badge */}
        {tutorial.difficulty && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3">
            <Badge 
              variant={
                tutorial.difficulty === 'beginner' ? 'success' :
                tutorial.difficulty === 'intermediate' ? 'warning' : 'error'
              } 
              size="sm"
            >
              {tutorial.difficulty === 'beginner' ? 'Pemula' :
               tutorial.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
            </Badge>
          </div>
        )}
      </div>

      {/* Tutorial Info */}
      <div className="px-3 py-3 md:px-4 md:py-4 flex-1 flex flex-col">
        <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 line-clamp-2">
          {tutorial.title}
        </h3>
        
        <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        {tutorial.tags && tutorial.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tutorial.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span>{readTime} menit</span>
          </div>
          <div className="flex items-center">
            <Eye className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span>{tutorial.view_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialCard;
