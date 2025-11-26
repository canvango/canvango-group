import React, { useState } from 'react';
import { X, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';

interface URLInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (urls: string[]) => void;
  initialUrls?: string[];
  requiredCount: number; // Jumlah URL yang harus diisi
}

const URLInputModal: React.FC<URLInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUrls = [],
  requiredCount
}) => {
  // Initialize with exact number of inputs based on requiredCount
  const [urlInputs, setUrlInputs] = useState<string[]>(() => {
    if (initialUrls.length === requiredCount) {
      return initialUrls;
    }
    // Create array with requiredCount elements
    return Array(requiredCount).fill('').map((_, i) => initialUrls[i] || '');
  });
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  // Update inputs when requiredCount changes
  React.useEffect(() => {
    if (isOpen) {
      const newInputs = Array(requiredCount).fill('').map((_, i) => urlInputs[i] || '');
      setUrlInputs(newInputs);
      setErrors({});
    }
  }, [requiredCount, isOpen]);

  if (!isOpen) return null;

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is ok, will be filtered out
    try {
      const urlObj = new URL(url.trim());
      // Check if it's a Facebook URL
      return urlObj.hostname.includes('facebook.com');
    } catch {
      return false;
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urlInputs];
    newUrls[index] = value;
    setUrlInputs(newUrls);

    // Clear error when user types
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };



  const handleSave = () => {
    // Validate all URLs - ALL must be filled
    const newErrors: { [key: number]: string } = {};
    const validUrls: string[] = [];

    urlInputs.forEach((url, index) => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        newErrors[index] = 'URL wajib diisi';
      } else if (!validateUrl(trimmedUrl)) {
        newErrors[index] = 'URL tidak valid atau bukan URL Facebook';
      } else {
        validUrls.push(trimmedUrl);
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Must have exact count
    if (validUrls.length !== requiredCount) {
      setErrors({ 0: `Harus mengisi ${requiredCount} URL sesuai jumlah akun` });
      return;
    }

    onSave(validUrls);
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial state
    const resetInputs = Array(requiredCount).fill('').map((_, i) => initialUrls[i] || '');
    setUrlInputs(resetInputs);
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Input URL Akun</h2>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Info Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Isi {requiredCount} URL</span> sesuai dengan jumlah akun yang Anda pesan. Pastikan semua URL valid.
              </p>
            </div>

            {urlInputs.map((url, index) => (
              <div key={index}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label 
                      htmlFor={`url-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      URL Akun BM {index + 1} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={`url-${index}`}
                        type="url"
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder="https://business.facebook.com/..."
                        className={`
                          w-full px-4 py-3 border rounded-xl text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                          transition-all
                          ${errors[index] 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      />
                      {url && !errors[index] && validateUrl(url) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors[index] && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors[index]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Tips:</span> Pastikan URL yang dimasukkan adalah URL Business Manager Facebook yang valid dan dapat diakses.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-primary-600 rounded-xl text-sm font-medium text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Simpan URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default URLInputModal;
