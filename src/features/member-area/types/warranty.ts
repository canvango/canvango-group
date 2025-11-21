export enum ClaimStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum ClaimReason {
  LOGIN_FAILED = 'login_failed',
  CHECKPOINT = 'checkpoint',
  DISABLED = 'disabled',
  AD_LIMIT_MISMATCH = 'ad_limit_mismatch',
  INCOMPLETE_DATA = 'incomplete_data',
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
