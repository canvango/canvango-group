/**
 * Transaction Type Definitions
 * Centralized types for transaction-related data structures
 */

export enum TransactionType {
  ACCOUNT_PURCHASE = 'account_purchase',
  TOP_UP = 'topup',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  GOPAY = 'gopay',
  OVO = 'ovo',
  DANA = 'dana',
  SHOPEEPAY = 'shopeepay',
  BANK_TRANSFER = 'bank_transfer',
  QRIS = 'qris',
  BALANCE = 'balance'
}

export enum WarrantyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CLAIMED = 'claimed',
  PROCESSING = 'processing'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Product purchase specific
  productId?: string;
  productName?: string;
  quantity?: number;
  accounts?: TransactionAccount[];
  warranty?: TransactionWarranty;
  
  // Top-up specific
  paymentMethod?: PaymentMethod;
  paymentUrl?: string;
  paymentInstructions?: string;
  
  // Additional info
  notes?: string;
  metadata?: Record<string, any>;
}

export interface TransactionAccount {
  id: string;
  email: string;
  password: string;
  additionalInfo?: string;
  status: 'active' | 'inactive' | 'replaced';
  deliveredAt: string;
}

export interface TransactionWarranty {
  status: WarrantyStatus;
  expiresAt: string;
  claimedAt?: string;
  claimId?: string;
  remainingDays: number;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  warranty?: WarrantyStatus;
  search?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalSpent: number;
  totalTopUp: number;
  totalRefunds: number;
  successRate: number;
  averageOrderValue: number;
  pendingTransactions: number;
  completedTransactions: number;
}

export interface TransactionDetail extends Transaction {
  user: {
    id: string;
    username: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    category: string;
    type: string;
  };
  payment?: {
    method: PaymentMethod;
    provider: string;
    referenceId: string;
    paidAt?: string;
  };
}
