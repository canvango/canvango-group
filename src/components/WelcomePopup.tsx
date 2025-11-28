import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useActiveWelcomePopup } from '@/hooks/useWelcomePopups';

const STORAGE_KEY_PREFIX = 'hasSeenWelcomePopup_';

export const WelcomePopup = () => {
  const { data: popup, isLoading } = useActiveWelcomePopup();
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!popup || isLoading) return;

    // Check if user has seen this popup
    const storageKey = `${STORAGE_KEY_PREFIX}${popup.id}`;
    const hasSeen = localStorage.getItem(storageKey);

    if (!hasSeen) {
      setIsVisible(true);
    }
  }, [popup, isLoading]);

  const handleClose = () => {
    if (!popup) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${popup.id}`;
    
    if (dontShowAgain) {
      localStorage.setItem(storageKey, 'true');
    }

    setIsVisible(false);
  };

  if (!isVisible || !popup) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img 
                src="/canvango-logo.svg" 
                alt="Canvango Group" 
                className="w-16 h-16"
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-6">
            {popup.title}
          </h2>

          {/* Content */}
          <div 
            className="text-sm text-gray-700 leading-relaxed mb-6 prose prose-sm max-w-none [&_strong]:text-gray-900 [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />

          {/* Bullet Points */}
          {popup.bullet_points && popup.bullet_points.length > 0 && (
            <div className="bg-green-50 rounded-2xl p-5 mb-6 space-y-3">
              {popup.bullet_points.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          )}

          {/* Checkbox */}
          {popup.show_checkbox && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="dontShowAgain" className="text-sm text-gray-600 cursor-pointer">
                Jangan tampilkan lagi
              </label>
            </div>
          )}

          {/* Button */}
          <div className="flex justify-center">
            <button
              onClick={handleClose}
              className="btn-primary px-12"
            >
              {popup.button_text}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
