import { Tutorial } from '../../types/tutorial.types';

interface TutorialDetailProps {
  tutorial: Tutorial;
  onBack: () => void;
}

const TutorialDetail = ({ tutorial, onBack }: TutorialDetailProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke daftar tutorial
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {tutorial.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {tutorial.category}
          </span>
          
          <div className="flex items-center">
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
            {tutorial.view_count} views
          </div>

          <div className="flex items-center">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(tutorial.created_at)}
          </div>
        </div>

        {tutorial.tags && tutorial.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tutorial.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-gray-700 text-lg">
          {tutorial.description}
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="prose max-w-none">
          <div 
            className="text-gray-800 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: tutorial.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default TutorialDetail;
