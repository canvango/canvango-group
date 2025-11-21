export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Claim {
  id: string;
  user_id: string;
  transaction_id: string;
  reason: string;
  description: string;
  status: ClaimStatus;
  response_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface CreateClaimInput {
  transaction_id: string;
  reason: string;
  description: string;
}

export interface ClaimResponse {
  claims: Claim[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
