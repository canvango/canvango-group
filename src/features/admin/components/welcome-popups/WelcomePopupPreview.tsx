import { X, CheckCircle } from 'lucide-react';
import { WelcomePopup } from '@/types/welcome-popup';

interface WelcomePopupPreviewProps {
  popup: WelcomePopup;
  onClose: () => void;
}

export const WelcomePopupPreview = ({ popup, onClose }: WelcomePopupPreviewProps) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="badge badge-warning">Preview Mode</span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
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
                id="previewCheckbox"
                disabled
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="previewCheckbox" className="text-sm text-gray-600">
                Jangan tampilkan lagi
              </label>
            </div>
          )}

          {/* Button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
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
