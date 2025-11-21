import apiClient from './api';

export interface Claim {
  id: string;
  user_id: string;
  transaction_id: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  response_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
  };
}

export interface GetAllClaimsParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  user_id?: string;
  transaction_id?: string;
  page?: number;
  limit?: number;
}

export interface GetAllClaimsResponse {
  claims: Claim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateClaimStatusData {
  status: 'APPROVED' | 'REJECTED';
  response_note?: string;
}

/**
 * Admin Claims Service
 * Handles administrative operations for warranty claims
 */
export const adminClaimsService = {
  /**
   * Get all claims with filtering
   */
  getAllClaims: async (params?: GetAllClaimsParams): Promise<GetAllClaimsResponse> => {
    const response = await apiClient.get('/admin/claims', { params });
    return response.data.data;
  },

  /**
   * Update claim status (approve/reject)
   */
  updateClaimStatus: async (
    claimId: string,
    data: UpdateClaimStatusData
  ): Promise<Claim> => {
    const response = await apiClient.put(`/admin/claims/${claimId}`, data);
    return response.data.data;
  },

  /**
   * Resolve approved claim (process refund)
   */
  resolveClaim: async (claimId: string): Promise<any> => {
    const response = await apiClient.post(`/admin/claims/${claimId}/resolve`);
    return response.data.data;
  },
};
