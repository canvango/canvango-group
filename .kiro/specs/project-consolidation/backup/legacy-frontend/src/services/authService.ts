import api from '../utils/api';

export interface GetEmailResponse {
  success: boolean;
  data: {
    email: string;
  };
}

/**
 * Get email from username or email identifier
 * This is used to convert username to email for Supabase authentication
 */
export const getEmailFromIdentifier = async (identifier: string): Promise<string> => {
  try {
    const response = await api.post<GetEmailResponse>('/auth/get-email', {
      identifier,
    });

    if (response.data.success && response.data.data.email) {
      return response.data.data.email;
    }

    throw new Error('Failed to get email from identifier');
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};
