/**
 * Verified BM Request Types
 * Simple service request - no product selection
 * Fixed price: Rp 200,000 per account
 */

export type VerifiedBMRequestStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type VerifiedBMURLStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface VerifiedBMURL {
  id: string;
  request_id: string;
  url: string;
  url_index: number;
  status: VerifiedBMURLStatus;
  admin_notes: string | null;
  refund_amount: number | null;
  refunded_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifiedBMRequest {
  id: string;
  user_id: string;
  quantity: number;
  urls: string[];
  amount: number;
  status: VerifiedBMRequestStatus;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  failed_at: string | null;
  // Extended with URL details
  url_details?: VerifiedBMURL[];
}

export interface VerifiedBMRequestStats {
  totalRequests: number;
  pendingRequests: number;
  processingRequests: number;
  completedRequests: number;
  failedRequests: number;
}

export interface VerifiedBMRequestFormData {
  quantity: number;
  urls: string;
}

export interface SubmitVerifiedBMRequestResponse {
  success: boolean;
  request_id: string;
  amount: number;
  new_balance: number;
  message: string;
}
