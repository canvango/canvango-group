export enum VerifiedBMOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface VerifiedBMOrder {
  id: string;
  userId: string;
  quantity: number;
  urls: string[];
  status: VerifiedBMOrderStatus;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface VerifiedBMOrderStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface VerifiedBMOrderFormData {
  quantity: number;
  urls: string;
}
