/**
 * Warranty Type Definitions
 * Centralized types for warranty and claim-related data structures
 */

export enum ClaimStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ClaimReason {
  ACCOUNT_INVALID = 'account_invalid',
  ACCOUNT_DISABLED = 'account_disabled',
  ACCOUNT_SUSPENDED = 'account_suspended',
  PASSWORD_INCORRECT = 'password_incorrect',
  NOT_AS_DESCRIBED = 'not_as_described',
  OTHER = 'other'
}

export enum ClaimResolution {
  REPLACEMENT = 'replacement',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund',
  REJECTED = 'rejected'
}

export interface WarrantyClaim {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  accountEmail: string;
  reason: ClaimReason;
  description: string;
  status: ClaimStatus;
  resolution?: ClaimResolution;
  resolutionNotes?: string;
  evidence?: ClaimEvidence[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  completedAt?: string;
  expiresAt: string;
}

export interface ClaimEvidence {
  id: string;
  type: 'screenshot' | 'video' | 'document';
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface SubmitClaimRequest {
  transactionId: string;
  accountEmail: string;
  reason: ClaimReason;
  description: string;
  evidence?: File[];
}

export interface ClaimResponse {
  success: boolean;
  message: string;
  claimId: string;
  claim?: WarrantyClaim;
}

export interface ClaimFilters {
  status?: ClaimStatus;
  reason?: ClaimReason;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ClaimStats {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  approvalRate: number;
  averageResolutionTime: number; // in hours
}

export interface WarrantyInfo {
  isActive: boolean;
  expiresAt: string;
  remainingDays: number;
  canClaim: boolean;
  claimCount: number;
  maxClaims: number;
}
