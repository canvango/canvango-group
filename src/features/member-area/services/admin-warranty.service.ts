import apiClient from './api';

export interface WarrantyClaim {
  id: string;
  user_id: string;
  purchase_id: string;
  claim_type: 'replacement' | 'refund' | 'repair';
  reason: string;
  evidence_urls: string[];
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  resolution_details: any;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
  };
  purchase?: {
    id: string;
    product_id: string;
    product_name: string;
    product_type: string;
    category: string;
    account_details: any;
    warranty_expires_at: string;
  };
}

export interface GetAllWarrantyClaimsParams {
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  page?: number;
  limit?: number;
}

export interface GetAllWarrantyClaimsResponse {
  claims: WarrantyClaim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateWarrantyClaimStatusData {
  status: 'reviewing' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
}

export interface WarrantyClaimStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  completed: number;
  successRate: number;
  claimsByMonth: { [key: string]: number };
}

/**
 * Get all warranty claims with filtering
 */
export const getAllWarrantyClaims = async (
  params?: GetAllWarrantyClaimsParams
): Promise<GetAllWarrantyClaimsResponse> => {
  const response = await apiClient.get('/admin/warranty-claims', { params });
  return response.data.data;
};

/**
 * Update warranty claim status
 */
export const updateWarrantyClaimStatus = async (
  claimId: string,
  data: UpdateWarrantyClaimStatusData
): Promise<WarrantyClaim> => {
  const response = await apiClient.put(`/admin/warranty-claims/${claimId}`, data);
  return response.data.data;
};

/**
 * Get warranty claim statistics
 */
export const getWarrantyClaimStats = async (): Promise<WarrantyClaimStats> => {
  const response = await apiClient.get('/admin/warranty-claims/stats');
  return response.data.data;
};

/**
 * Process refund for approved warranty claim
 */
export const processWarrantyRefund = async (claimId: string): Promise<any> => {
  const response = await apiClient.post(`/admin/warranty-claims/${claimId}/refund`);
  return response.data.data;
};
