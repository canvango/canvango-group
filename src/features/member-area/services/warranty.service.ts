import apiClient from './api';
import { WarrantyClaim, ClaimReason } from '../types/warranty';

export interface SubmitClaimData {
  accountId: string;
  reason: ClaimReason | string;
  description: string;
  screenshotUrls?: string[];
}

export interface WarrantyClaimsResponse {
  claims: WarrantyClaim[];
  total: number;
}

// Type for eligible account (purchase with product info)
export interface EligibleAccount {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  category: string;
  transaction_id: string;
  status: string;
  account_details: Record<string, any>;
  warranty_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface EligibleAccountsResponse {
  accounts: EligibleAccount[];
  total: number;
}

/**
 * Fetch all warranty claims for the current user
 */
export const fetchWarrantyClaims = async (): Promise<WarrantyClaimsResponse> => {
  const response = await apiClient.get<{ success: boolean; data: WarrantyClaimsResponse }>('/warranty/claims');
  return response.data.data;
};

/**
 * Fetch a specific warranty claim by ID
 */
export const fetchClaimById = async (claimId: string): Promise<WarrantyClaim> => {
  const response = await apiClient.get<{ success: boolean; data: WarrantyClaim }>(`/warranty/claims/${claimId}`);
  return response.data.data;
};

/**
 * Submit a new warranty claim
 */
export const submitWarrantyClaim = async (data: SubmitClaimData): Promise<WarrantyClaim> => {
  const response = await apiClient.post<{ success: boolean; data: WarrantyClaim }>('/warranty/claims', data);
  return response.data.data;
};

/**
 * Fetch accounts eligible for warranty claim
 */
export const fetchEligibleAccounts = async (): Promise<EligibleAccountsResponse> => {
  const response = await apiClient.get<{ success: boolean; data: EligibleAccountsResponse }>('/warranty/eligible-accounts');
  return response.data.data;
};

/**
 * Fetch warranty claim statistics
 */
export const fetchWarrantyStats = async () => {
  const response = await apiClient.get<{ success: boolean; data: any }>('/warranty/stats');
  return response.data.data;
};
