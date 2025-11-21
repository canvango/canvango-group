export enum ClaimStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ClaimReason {
  DISABLED = 'disabled',
  INVALID = 'invalid',
  OTHER = 'other'
}

export interface WarrantyClaim {
  id: string;
  transactionId: string;
  accountId: string;
  userId: string;
  reason: ClaimReason;
  description: string;
  status: ClaimStatus;
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy compatibility types
export type Claim = {
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
};

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
