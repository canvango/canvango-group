import apiClient from './api';
import { WarrantyClaim, ClaimReason } from '../types/warranty';
import { Account } from '../types/transaction';

export interface SubmitClaimData {
  accountId: string;
  reason: ClaimReason;
  description: string;
}

export interface WarrantyClaimsResponse {
  claims: WarrantyClaim[];
  total: number;
}

export interface EligibleAccountsResponse {
  accounts: Account[];
  total: number;
}

/**
 * Fetch all warranty claims for the current user
 */
export const fetchWarrantyClaims = async (): Promise<WarrantyClaimsResponse> => {
  const response = await apiClient.get<WarrantyClaimsResponse>('/warranty/claims');
  return response.data;
};

/**
 * Fetch a specific warranty claim by ID
 */
export const fetchClaimById = async (claimId: string): Promise<WarrantyClaim> => {
  const response = await apiClient.get<WarrantyClaim>(`/warranty/claims/${claimId}`);
  return response.data;
};

/**
 * Submit a new warranty claim
 */
export const submitWarrantyClaim = async (data: SubmitClaimData): Promise<WarrantyClaim> => {
  const response = await apiClient.post<WarrantyClaim>('/warranty/claims', data);
  return response.data;
};

/**
 * Fetch accounts eligible for warranty claim
 */
export const fetchEligibleAccounts = async (): Promise<EligibleAccountsResponse> => {
  const response = await apiClient.get<EligibleAccountsResponse>('/warranty/eligible-accounts');
  return response.data;
};

/**
 * Fetch warranty claim statistics
 */
export const fetchWarrantyStats = async () => {
  const response = await apiClient.get('/warranty/stats');
  return response.data;
};
