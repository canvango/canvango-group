import api from '../utils/api';

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
 * Get all claims with filtering
 */
export const getAllClaims = async (params?: GetAllClaimsParams): Promise<GetAllClaimsResponse> => {
  const response = await api.get('/admin/claims', { params });
  return response.data.data;
};

/**
 * Update claim status (approve/reject)
 */
export const updateClaimStatus = async (
  claimId: string,
  data: UpdateClaimStatusData
): Promise<Claim> => {
  const response = await api.put(`/admin/claims/${claimId}`, data);
  return response.data.data;
};

/**
 * Resolve approved claim (process refund)
 */
export const resolveClaim = async (claimId: string): Promise<any> => {
  const response = await api.post(`/admin/claims/${claimId}/resolve`);
  return response.data.data;
};
