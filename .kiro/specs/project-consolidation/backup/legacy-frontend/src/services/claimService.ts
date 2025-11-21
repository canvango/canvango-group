import api from '../utils/api';
import { Claim, CreateClaimInput, ClaimResponse } from '../types/claim.types';

/**
 * Create a new claim
 */
export const createClaim = async (claimData: CreateClaimInput): Promise<Claim> => {
  const response = await api.post('/claims', claimData);
  return response.data.data;
};

/**
 * Get user's claims
 */
export const getUserClaims = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ClaimResponse> => {
  const response = await api.get('/claims', { params });
  return response.data.data;
};

/**
 * Get claim by ID
 */
export const getClaimById = async (id: string): Promise<Claim> => {
  const response = await api.get(`/claims/${id}`);
  return response.data.data;
};
