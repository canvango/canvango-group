export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export enum TransactionType {
  PURCHASE = 'purchase',
  TOPUP = 'topup'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  quantity?: number;
  product?: {
    id: string;
    title: string;
  };
  paymentMethod?: string;
  accounts?: Account[];
  warranty?: {
    expiresAt: Date;
    claimed: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  transactionId: string;
  type: 'bm' | 'personal';
  credentials: {
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
