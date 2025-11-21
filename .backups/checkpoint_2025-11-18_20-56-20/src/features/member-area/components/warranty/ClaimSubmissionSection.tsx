import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Info, Shield } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import { Account } from '../../types/transaction';
import { ClaimReason } from '../../types/warranty';
import { formatDate } from '../../utils/formatters';

// Validation schema
const claimSubmissionSchema = z.object({
  accountId: z.string().min(1, 'Silakan pilih akun'),
  reason: z.nativeEnum(ClaimReason),
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(500, 'Deskripsi maksimal 500 karakter')
});

export type ClaimSubmissionFormData = z.infer<typeof claimSubmissionSchema>;

interface ClaimSubmissionSectionProps {
  eligibleAccounts: Account[];
  onSubmit: (data: ClaimSubmissionFormData) => void;
  loading?: boolean;
}

const ClaimSubmissionSection: React.FC<ClaimSubmissionSectionProps> = ({
  eligibleAccounts,
  onSubmit,
  loading = false
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

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
      reason: ClaimReason.DISABLED,
      description: ''
    }
  });



  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    setValue('accountId', accountId);
  };

  const getReasonLabel = (reason: ClaimReason): string => {
    switch (reason) {
      case ClaimReason.DISABLED:
        return 'Akun Disabled/Dinonaktifkan';
      case ClaimReason.INVALID:
        return 'Kredensial Tidak Valid';
      case ClaimReason.OTHER:
        return 'Lainnya';
      default:
        return reason;
    }
  };

  // Empty state when no eligible accounts
  if (eligibleAccounts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tidak Ada Akun yang Memenuhi Syarat
          </h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Saat ini Anda tidak memiliki akun yang memenuhi syarat untuk klaim garansi. 
            Akun harus memiliki garansi aktif dan belum pernah diklaim sebelumnya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajukan Klaim Garansi</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Eligible Accounts Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Akun <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {eligibleAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => handleAccountSelect(account.id)}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${selectedAccountId === account.id
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {account.type === 'bm' ? 'Business Manager' : 'Personal Account'}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{account.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {account.credentials.url}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Garansi hingga: {formatDate(account.warranty.expiresAt)}</span>
                      <span>Dibeli: {formatDate(account.createdAt)}</span>
                    </div>
                  </div>
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedAccountId === account.id
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedAccountId === account.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" {...register('accountId')} />
          {errors.accountId && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.accountId.message}</span>
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
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
          loading={loading}
          disabled={loading || !selectedAccountId}
        >
          {loading ? 'Mengirim Klaim...' : 'Kirim Klaim Garansi'}
        </Button>
      </form>
    </div>
  );
};

export default ClaimSubmissionSection;
