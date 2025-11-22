import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

interface SendOTPRequest {
  phone: string;
}

interface SendOTPResponse {
  message: string;
  phone: string;
  otp_id: string;
  expires_at: string;
  otp_code?: string; // Only in development
}

interface VerifyOTPRequest {
  phone: string;
  otp_code: string;
}

interface VerifyOTPResponse {
  message: string;
  phone: string;
  verified: boolean;
}

/**
 * Hook to send OTP to phone number
 */
export const useSendOTP = () => {
  return useMutation<SendOTPResponse, Error, SendOTPRequest>({
    mutationFn: async (data) => {
      const response = await api.post('/auth/send-otp', data);
      return response.data.data;
    }
  });
};

/**
 * Hook to verify OTP code
 */
export const useVerifyOTP = () => {
  return useMutation<VerifyOTPResponse, Error, VerifyOTPRequest>({
    mutationFn: async (data) => {
      const response = await api.post('/auth/verify-otp', data);
      return response.data.data;
    }
  });
};

/**
 * Hook to resend OTP
 */
export const useResendOTP = () => {
  return useMutation<SendOTPResponse, Error, SendOTPRequest>({
    mutationFn: async (data) => {
      const response = await api.post('/auth/resend-otp', data);
      return response.data.data;
    }
  });
};
