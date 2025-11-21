import apiClient from './api';

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

export interface AdminTransactionStats {
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

/**
 * Admin Statistics Service
 * Provides analytics and statistics for admin dashboard
 */
export const adminStatsService = {
  /**
   * Get overview statistics
   */
  getOverviewStats: async (): Promise<OverviewStats> => {
    const response = await apiClient.get('/admin/stats/overview');
    return response.data.data;
  },

  /**
   * Get user statistics with growth data
   */
  getUserStats: async (period: string = '30d'): Promise<UserStats> => {
    const response = await apiClient.get('/admin/stats/users', {
      params: { period },
    });
    return response.data.data;
  },

  /**
   * Get transaction statistics with volume data
   */
  getTransactionStats: async (period: string = '30d'): Promise<AdminTransactionStats> => {
    const response = await apiClient.get('/admin/stats/transactions', {
      params: { period },
    });
    return response.data.data;
  },
};
