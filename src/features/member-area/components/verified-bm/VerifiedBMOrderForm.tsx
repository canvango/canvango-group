import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Info, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';

// Validation schema
const verifiedBMOrderSchema = z.object({
  quantity: z
    .number()
    .min(1, 'Minimal 1 akun')
    .max(100, 'Maksimal 100 akun per pesanan'),
  urls: z
    .string()
    .min(1, 'Silakan masukkan minimal satu URL')
    .refine(
      (val) => {
        const urls = val.split('\n').filter(url => url.trim() !== '');
        return urls.length > 0;
      },
      'Silakan masukkan minimal satu URL'
    )
    .refine(
      (val) => {
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

export type VerifiedBMOrderFormData = z.infer<typeof verifiedBMOrderSchema>;

interface VerifiedBMOrderFormProps {
  onSubmit: (data: VerifiedBMOrderFormData) => void;
  loading?: boolean;
  isGuest?: boolean;
}

const VerifiedBMOrderForm: React.FC<VerifiedBMOrderFormProps> = ({ onSubmit, loading = false, isGuest = false }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<VerifiedBMOrderFormData>({
    resolver: zodResolver(verifiedBMOrderSchema),
    defaultValues: {
      quantity: 1,
      urls: ''
    }
  });

  const quantity = watch('quantity');
  const pricePerAccount = 200000; // Rp 200,000 per akun BM
  const totalPrice = (quantity || 0) * pricePerAccount;

  // Handle guest button click - redirect to login
  const handleGuestClick = () => {
    navigate('/login');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Buat Pesanan Baru</h2>
      
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
            Minimal 1 akun, maksimal 100 akun per pesanan
          </p>
        </div>

        {/* URLs Textarea */}
        <div>
          <label htmlFor="urls" className="block text-sm font-medium text-gray-700 mb-2">
            URL BM atau Akun Personal <span className="text-red-500">*</span>
          </label>
          <textarea
            id="urls"
            {...register('urls')}
            rows={6}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.urls ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Masukkan URL (satu URL per baris)&#10;Contoh:&#10;https://business.facebook.com/...&#10;https://www.facebook.com/..."
            disabled={loading}
          />
          {errors.urls && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.urls.message}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Masukkan satu URL per baris. Pastikan URL valid dan dapat diakses.
          </p>
        </div>

        {/* Price Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Harga per akun BM:</span>
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(pricePerAccount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Jumlah akun BM:</span>
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi Penting:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Proses verifikasi memakan waktu 1-3 hari kerja</li>
              <li>Pastikan URL yang dimasukkan valid dan dapat diakses</li>
              <li>Anda akan menerima notifikasi setelah proses selesai</li>
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
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </Button>
        )}
      </form>
    </div>
  );
};

export default VerifiedBMOrderForm;
