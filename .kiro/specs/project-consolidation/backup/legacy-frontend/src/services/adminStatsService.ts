import api from '../utils/api';

export interface OverviewStats {
  users: {
    total: number;
    byRole: {
      guest: number;
      member: number;
      admin: number;
    };
  };
  transactions: {
    total: number;
    byStatus: {
      BERHASIL: number;
      PENDING: number;
      GAGAL: number;
    };
  };
  revenue: {
    total: number;
  };
  claims: {
    total: number;
    pending: number;
    byStatus: {
      PENDING: number;
      APPROVED: number;
      REJECTED: number;
    };
  };
  tutorials?: {
    total: number;
    totalViews: number;
  };
  products?: {
    total: number;
    byStock: {
      available: number;
      out_of_stock: number;
    };
  };
  recentActivities?: any[];
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface UserStats {
  period: string;
  totalUsers: number;
  activeUsers: number;
  growth: UserGrowthData[];
  growthByRole: {
    date: string;
    role: string;
    count: number;
  }[];
}

export interface TransactionVolumeData {
  date: string;
  count: number;
  totalAmount: number;
}

export interface TransactionStats {
  period: string;
  totalTransactions: number;
  totalRevenue: number;
  avgTransactionAmount: number;
  volume: TransactionVolumeData[];
  byStatus: {
    date: string;
    status: string;
    count: number;
    totalAmount: number;
  }[];
  byProduct: {
    productType: string;
    count: number;
    totalAmount: number;
  }[];
}

export const adminStatsService = {
  getOverviewStats: async (): Promise<OverviewStats> => {
    const response = await api.get('/admin/stats/overview');
    return response.data.data;
  },

  getUserStats: async (period: string = '30d'): Promise<UserStats> => {
    const response = await api.get('/admin/stats/users', {
      params: { period },
    });
    return response.data.data;
  },

  getTransactionStats: async (period: string = '30d'): Promise<TransactionStats> => {
    const response = await api.get('/admin/stats/transactions', {
      params: { period },
    });
    return response.data.data;
  },
};
