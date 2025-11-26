import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Info, Shield, Upload, X } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import { ClaimReason } from '../../types/warranty';
import { formatDate } from '../../utils/formatters';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { EligibleAccount } from '../../services/warranty.service';

// Validation schema
const claimSubmissionSchema = z.object({
  accountId: z.string().min(1, 'Silakan pilih akun'),
  reason: z.string().min(1, 'Silakan pilih alasan klaim'),
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(500, 'Deskripsi maksimal 500 karakter')
});

export type ClaimSubmissionFormData = z.infer<typeof claimSubmissionSchema> & {
  screenshotUrls?: string[];
};

interface ClaimSubmissionSectionProps {
  eligibleAccounts: EligibleAccount[];
  onSubmit: (data: ClaimSubmissionFormData) => void;
  loading?: boolean;
}

const ClaimSubmissionSection: React.FC<ClaimSubmissionSectionProps> = ({
  eligibleAccounts,
  onSubmit,
  loading = false
}) => {
  const { user } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ClaimSubmissionFormData>({
    resolver: zodResolver(claimSubmissionSchema),
    defaultValues: {
      accountId: '',
      reason: '' as any, // Will be selected by user
      description: ''
    }
  });

  // Helper function to parse account_details (handle string JSONB)
  const parseAccountDetails = (details: any): Record<string, any> => {
    if (!details) return {};
    if (typeof details === 'string') {
      try {
        return JSON.parse(details);
      } catch (e) {
        console.error('❌ Failed to parse account_details:', e);
        return {};
      }
    }
    return details;
  };



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length + screenshots.length > 3) {
      alert('Maksimal 3 screenshot');
      return;
    }

    setScreenshots(prev => [...prev, ...validFiles]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const uploadScreenshots = async (): Promise<string[]> => {
    if (screenshots.length === 0) return [];
    if (!user?.id) return [];

    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of screenshots) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('warranty-screenshots')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Store the file path (not URL) - we'll generate signed URLs when viewing
        urls.push(fileName);
      }

      return urls;
    } catch (error) {
      console.error('Error uploading screenshots:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (data: ClaimSubmissionFormData) => {
    try {
      // Upload screenshots first if any
      const screenshotUrls = await uploadScreenshots();
      
      // Submit with screenshot URLs
      onSubmit({
        ...data,
        screenshotUrls
      });
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Gagal mengupload screenshot. Silakan coba lagi.');
    }
  };

  const getReasonLabel = (reason: ClaimReason): string => {
    switch (reason) {
      case ClaimReason.LOGIN_FAILED:
        return 'Akun tidak bisa login';
      case ClaimReason.CHECKPOINT:
        return 'Akun terkena checkpoint';
      case ClaimReason.DISABLED:
        return 'Akun disabled/dinonaktifkan';
      case ClaimReason.AD_LIMIT_MISMATCH:
        return 'Limit iklan tidak sesuai';
      case ClaimReason.INCOMPLETE_DATA:
        return 'Data akun tidak lengkap';
      case ClaimReason.OTHER:
        return 'Lainnya (Jelaskan di detail)';
      default:
        return reason;
    }
  };

  // Empty state when no eligible accounts
  if (eligibleAccounts.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12">
        <div className="text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Tidak ada akun yang dapat di-claim
          </h3>
          
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            Semua akun Anda sudah melewati masa garansi, tidak memiliki garansi, atau sudah pernah di-claim.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajukan Klaim Garansi</h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Eligible Accounts Selection - Dropdown */}
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Akun <span className="text-red-500">*</span>
          </label>
          <select
            id="accountId"
            {...register('accountId')}
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              setValue('accountId', e.target.value);
            }}
            className={`
              w-full px-3 py-2.5 border rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.accountId ? 'border-red-300' : 'border-gray-300'}
            `}
            disabled={loading}
          >
            <option value="">Pilih produk yang ingin diklaim</option>
            {eligibleAccounts.map((account, index) => {
              const accountId = account.id;
              const accountDetails = parseAccountDetails(account.account_details);
              
              // Debug logging (only for first 3 items)
              if (index < 3) {
                console.log('🔍 Dropdown Debug:', {
                  index,
                  accountId: accountId.slice(0, 8),
                  accountDetailsType: typeof account.account_details,
                  accountDetailsRaw: account.account_details,
                  accountDetailsParsed: accountDetails,
                  productNameFromDetails: accountDetails.product_name,
                  hasProducts: !!account.products,
                  productNameFromJoin: account.products?.product_name,
                  accountDetailsKeys: Object.keys(accountDetails)
                });
              }
              
              // Get product name - from direct column (most reliable)
              const productName = 
                account.product_name ||                     // From direct column (PRIORITY)
                accountDetails.product_name ||              // From account_details (fallback)
                'Unknown Product';                          // Last resort
              
              const warrantyExpires = account.warranty_expires_at;
              const email = accountDetails.email || accountDetails.atas || '';
              
              // Format display text
              const displayText = email 
                ? `${productName} - ${email} (Garansi: ${formatDate(warrantyExpires)})`
                : `${productName} - #${accountId.slice(0, 8)} (Garansi: ${formatDate(warrantyExpires)})`;
              
              return (
                <option key={accountId} value={accountId}>
                  {displayText}
                </option>
              );
            })}
          </select>
          {errors.accountId && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.accountId.message}</span>
            </div>
          )}
          
          {/* Selected Account Info */}
          {selectedAccountId && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              {(() => {
                const selectedAccount = eligibleAccounts.find((acc) => acc.id === selectedAccountId);
                if (!selectedAccount) return null;
                
                const accountDetails = parseAccountDetails(selectedAccount.account_details);
                
                // Get product name - from direct column (most reliable)
                const productName = 
                  selectedAccount.product_name ||               // From direct column (PRIORITY)
                  accountDetails.product_name ||                // From account_details (fallback)
                  'Unknown Product';                            // Last resort
                
                const warrantyExpires = selectedAccount.warranty_expires_at;
                const createdAt = selectedAccount.created_at;
                const email = accountDetails.email || accountDetails.atas || '';
                
                return (
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 mb-1">{productName}</div>
                    {email && (
                      <div className="text-blue-700 mb-2">{email}</div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-blue-600">
                      <span>Dibeli: {formatDate(createdAt)}</span>
                      <span>•</span>
                      <span>Garansi hingga: {formatDate(warrantyExpires)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Reason Selection */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Alasan Klaim <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            {...register('reason')}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.reason ? 'border-red-300' : 'border-gray-300'}
            `}
            disabled={loading}
          >
            <option value="" disabled>Pilih Alasan</option>
            {Object.values(ClaimReason).map((reason) => (
              <option key={reason} value={reason}>
                {getReasonLabel(reason)}
              </option>
            ))}
          </select>
          {errors.reason && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.reason.message}</span>
            </div>
          )}
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Masalah <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={5}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.description ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Jelaskan masalah yang Anda alami dengan akun ini secara detail..."
            disabled={loading}
          />
          {errors.description && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.description.message}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {watch('description')?.length || 0}/500 karakter
          </p>
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bukti Screenshot (Opsional)
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading || uploading || screenshots.length >= 3}
            />
            
            {screenshots.length === 0 ? (
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-2xl">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    disabled={loading || uploading}
                  >
                    Pilih file gambar
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF maks. 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {screenshots.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={loading || uploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {screenshots.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    disabled={loading || uploading}
                  >
                    + Tambah Screenshot ({screenshots.length}/3)
                  </button>
                )}
              </div>
            )}
          </div>
          
          <p className="mt-2 text-xs text-gray-500">
            Screenshot dapat membantu mempercepat proses verifikasi claim
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi Penting:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Klaim garansi akan diproses dalam 1-3 hari kerja</li>
              <li>Pastikan deskripsi masalah jelas dan detail</li>
              <li>Anda akan menerima notifikasi setelah klaim diproses</li>
              <li>Akun yang disetujui akan diganti dengan akun baru</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading || uploading}
          disabled={loading || uploading || !selectedAccountId}
        >
          {uploading ? 'Mengupload Screenshot...' : loading ? 'Mengirim Klaim...' : 'Ajukan Claim'}
        </Button>
      </form>
    </div>
  );
};

export default ClaimSubmissionSection;
