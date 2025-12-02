import { useState } from 'react';
import { supabase } from '@/clients/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EmailVerificationStatus {
  isVerified: boolean;
  email: string | null;
  userId: string | null;
}

export const useEmailVerification = () => {
  const queryClient = useQueryClient();
  const [resendCooldown, setResendCooldown] = useState(0);

  // Query untuk cek status verifikasi
  const { data: verificationStatus, isLoading } = useQuery<EmailVerificationStatus>({
    queryKey: ['email-verification-status'],
    queryFn: async (): Promise<EmailVerificationStatus> => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (!user) {
        return {
          isVerified: true, // Jika tidak ada user, anggap verified (tidak tampilkan banner)
          email: null,
          userId: null,
        };
      }

      return {
        isVerified: !!user.email_confirmed_at,
        email: user.email || null,
        userId: user.id,
      };
    },
    refetchInterval: 30000, // Refetch setiap 30 detik untuk cek jika user sudah verifikasi
  });

  // Mutation untuk resend verification email
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Resend verification email menggunakan signInWithOtp
      // Ini akan trigger email confirmation
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      // Set cooldown 60 detik
      setResendCooldown(60);
      
      // Countdown timer
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Invalidate query untuk refresh status
      queryClient.invalidateQueries({ queryKey: ['email-verification-status'] });
    },
  });

  return {
    verificationStatus,
    isLoading,
    resendVerification: resendVerificationMutation.mutate,
    isResending: resendVerificationMutation.isPending,
    resendError: resendVerificationMutation.error,
    resendSuccess: resendVerificationMutation.isSuccess,
    resendCooldown,
  };
};
