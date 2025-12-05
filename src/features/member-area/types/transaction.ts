export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  PURCHASE = 'purchase',
  TOPUP = 'topup'
}

export interface Transaction {
  id: string;
  userId: string;
  type?: TransactionType; // Add alias for compatibility
  transactionType?: TransactionType;
  status: TransactionStatus;
  amount: number;
  quantity?: number;
  productId?: string;
  productName?: string;
  product?: {
    id: string;
    title: string;
  };
  paymentMethod?: string;
  paymentProofUrl?: string;
  notes?: string;
  metadata?: Record<string, any>;
  accounts?: Account[];
  warranty?: {
    expiresAt: Date;
    claimed: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  // Additional fields for warranty and account details
  purchaseId?: string;
  accountDetails?: Record<string, any>;
  
  // Username for public display (masked in UI)
  username?: string;
  
  // TriPay payment gateway fields
  tripayReference?: string;
  tripayMerchantRef?: string;
  tripayPaymentMethod?: string;
  tripayPaymentName?: string;
  tripayStatus?: string;
  tripayQrUrl?: string;
  tripayPaymentUrl?: string;
  tripayAmount?: number;
  tripayFee?: number;
  tripayTotalAmount?: number;
  tripayExpiredAt?: Date; // Payment expiration timestamp
  tripayCallbackData?: {
    instructions?: Array<{
      title: string;
      steps: string[];
    }>;
    expired_time?: number;
    pay_code?: string;
    qr_string?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    fee_merchant?: number;
    amount_received?: number;
  };
}

export interface Account {
  id: string;
  transactionId: string;
  type: 'bm' | 'personal';
  credentials: {
    accountId?: string;
    url: string;
    username?: string;
    password?: string;
    additionalInfo?: Record<string, any>;
  };
  status: 'active' | 'disabled' | 'claimed';
  warranty: {
    expiresAt: Date;
    claimed: boolean;
  };
  createdAt: Date;
}
