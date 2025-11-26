import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Info, LogIn, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import URLInputModal from './URLInputModal';

// Validation schema
const verifiedBMRequestSchema = z.object({
  quantity: z
    .number()
    .min(1, 'Minimal 1 akun')
    .max(100, 'Maksimal 100 akun per request'),
  urls: z
    .string()
    .min(1, 'Silakan masukkan minimal satu URL')
    .refine(
      (val) => {
        if (!val || typeof val !== 'string') return false;
        const urls = val.split('\n').filter(url => url.trim() !== '');
        return urls.length > 0;
      },
      'Silakan masukkan minimal satu URL'
    )
    .refine(
      (val) => {
        if (!val || typeof val !== 'string') return false;
        const urls = val.split('\n').filter(url => url.trim() !== '');
        return urls.every(url => {
          try {
            new URL(url.trim());
            return true;
          } catch {
            return false;
          }
        });
      },
      'Semua URL harus valid'
    )
});

export type VerifiedBMRequestFormData = z.infer<typeof verifiedBMRequestSchema>;

interface VerifiedBMOrderFormProps {
  userBalance: number;
  onSubmit: (data: VerifiedBMRequestFormData) => void;
  loading?: boolean;
  isGuest?: boolean;
}

const PRICE_PER_ACCOUNT = 200000; // Rp 200,000

const VerifiedBMOrderForm: React.FC<VerifiedBMOrderFormProps> = ({ 
  userBalance,
  onSubmit, 
  loading = false, 
  isGuest = false 
}) => {
  const navigate = useNavigate();
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [savedUrls, setSavedUrls] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors
  } = useForm<VerifiedBMRequestFormData>({
    resolver: zodResolver(verifiedBMRequestSchema),
    defaultValues: {
      quantity: 1,
      urls: ''
    }
  });

  const quantity = watch('quantity');
  const totalPrice = (quantity || 0) * PRICE_PER_ACCOUNT;
  const hasInsufficientBalance = !isGuest && totalPrice > userBalance;

  const handleGuestClick = () => {
    navigate('/login');
  };

  const handleOpenUrlModal = () => {
    setIsUrlModalOpen(true);
  };

  const handleSaveUrls = (urls: string[]) => {
    setSavedUrls(urls);
    setValue('urls', urls.join('\n'));
    clearErrors('urls');
  };

  // Watch quantity changes and clear URLs if count doesn't match
  React.useEffect(() => {
    if (savedUrls.length > 0 && savedUrls.length !== quantity) {
      setSavedUrls([]);
      setValue('urls', '');
    }
  }, [quantity, savedUrls.length, setValue]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Buat Request Baru</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah Akun <span className="text-red-500">*</span>
          </label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={100}
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
            placeholder="Masukkan jumlah akun (1-100)"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimal 1 akun, maksimal 100 akun per request
          </p>
        </div>

        {/* URLs Input with Modal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Business Manager <span className="text-red-500">*</span>
          </label>
          
          {/* Hidden textarea for form validation */}
          <textarea
            {...register('urls')}
            className="hidden"
            aria-hidden="true"
          />

          {/* URL Display/Input Button */}
          <button
            type="button"
            onClick={handleOpenUrlModal}
            disabled={loading}
            className={`
              w-full px-4 py-3 border rounded-xl text-left
              transition-all duration-200
              ${errors.urls 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                {savedUrls.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {savedUrls.length} dari {quantity || 1} URL tersimpan
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {savedUrls[0]}
                      {savedUrls.length > 1 && ` +${savedUrls.length - 1} lainnya`}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Klik untuk masukkan {quantity || 1} URL
                    </p>
                    <p className="text-xs text-gray-500">
                      Masukkan URL Business Manager
                    </p>
                  </div>
                )}
              </div>
              <div className="text-primary-600 text-sm font-medium">
                {savedUrls.length > 0 ? 'Edit' : 'Tambah'}
              </div>
            </div>
          </button>

          {errors.urls && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.urls.message}</span>
            </div>
          )}
          
          <p className="mt-2 text-xs text-gray-500">
            Klik tombol di atas untuk membuka form input URL yang lebih mudah
          </p>
        </div>

        {/* URL Input Modal */}
        <URLInputModal
          isOpen={isUrlModalOpen}
          onClose={() => setIsUrlModalOpen(false)}
          onSave={handleSaveUrls}
          initialUrls={savedUrls}
          requiredCount={quantity || 1}
        />

        {/* Price Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Harga per akun:</span>
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(PRICE_PER_ACCOUNT)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Jumlah akun:</span>
            <span className="font-medium text-gray-900">{quantity || 0}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between">
            <span className="text-sm font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-primary-600">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(totalPrice)}
            </span>
          </div>
        </div>

        {/* Insufficient Balance Warning */}
        {hasInsufficientBalance && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Saldo Tidak Mencukupi</p>
              <p>
                Saldo Anda tidak cukup untuk request ini. Silakan top up terlebih dahulu.
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi Penting:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Saldo akan dipotong langsung setelah submit</li>
              <li>Proses verifikasi memakan waktu 1-3 hari kerja</li>
              <li>Jika gagal, saldo akan dikembalikan otomatis</li>
              <li>Pastikan URL yang dimasukkan valid dan dapat diakses</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        {isGuest ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGuestClick}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login Untuk Melanjutkan
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={loading || hasInsufficientBalance}
          >
            {loading ? 'Memproses...' : 'Submit Request'}
          </Button>
        )}
      </form>
    </div>
  );
};

export default VerifiedBMOrderForm;
