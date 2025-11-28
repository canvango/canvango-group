/**
 * Admin Statistics Service
 * Provides statistics and analytics for admin dashboard
 */

import { supabase } from '@/clients/supabase';

export interface OverviewStats {
  users: {
    total: number;
    byRole: {
      admin: number;
      member: number;
      guest: number;
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
    today: number;
    thisMonth: number;
  };
  claims: {
    pending: number;
    byStatus: {
      APPROVED: number;
      REJECTED: number;
      PENDING: number;
    };
  };
  tutorials?: {
    total: number;
    totalViews: number;
  };
  products?: {
    total: number;
    byStock?: {
      available: number;
      out_of_stock: number;
    };
  };
  recentActivities?: any[];
}

export interface UserStats {
  growth: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
}

export interface TransactionStats {
  volume: Array<{
    date: string;
    count: number;
    totalAmount: number;
  }>;
  byProduct: Array<{
    productType: string;
    count: number;
    totalAmount: number;
  }>;
  avgTransactionAmount: number;
  breakdown?: {
    totalPurchase: number;
    totalPurchaseCompleted: number;
    totalPurchasePending: number;
    totalTopup: number;
    purchaseBM: number;
    purchaseBMCompleted: number;
    purchasePersonal: number;
    purchasePersonalCompleted: number;
    purchaseVerifiedBM: number;
    purchaseVerifiedBMCompleted: number;
    purchaseAPI: number;
    purchaseAPICompleted: number;
    revenuePurchase: number;
    revenueTopup: number;
  };
}

class AdminStatsService {
  async getOverviewStats(): Promise<OverviewStats> {
    try {
      console.log('📊 Fetching overview stats...');
      
      // Get user stats
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role');
      
      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        throw usersError;
      }
      console.log('✅ Users fetched:', users?.length);

      const usersByRole = users?.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get transaction stats
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('status, amount, transaction_type');
      
      if (transactionsError) {
        console.error('❌ Error fetching transactions:', transactionsError);
        throw transactionsError;
      }
      console.log('✅ Transactions fetched:', transactions?.length);

      const transactionsByStatus = transactions?.reduce((acc: any, txn: any) => {
        acc[txn.status] = (acc[txn.status] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log('📊 Transactions by status:', transactionsByStatus);

      // Calculate total revenue (only from completed PURCHASE transactions)
      const totalRevenue = transactions?.reduce((sum, txn) => {
        if (txn.status === 'completed' && txn.transaction_type === 'purchase') {
          return sum + (txn.amount || 0);
        }
        return sum;
      }, 0) || 0;

      // Calculate revenue breakdown for verification
      const purchaseRevenue = transactions?.reduce((sum, txn) => {
        if (txn.status === 'completed' && txn.transaction_type === 'purchase') {
          return sum + (txn.amount || 0);
        }
        return sum;
      }, 0) || 0;

      const topupRevenue = transactions?.reduce((sum, txn) => {
        if (txn.status === 'completed' && txn.transaction_type === 'topup') {
          return sum + (txn.amount || 0);
        }
        return sum;
      }, 0) || 0;

      console.log('💰 Total revenue (purchase only):', totalRevenue);
      console.log('📊 Revenue breakdown - Purchase:', purchaseRevenue, '| Topup:', topupRevenue);

      // Get claims stats
      const { data: claims, error: claimsError } = await supabase
        .from('warranty_claims')
        .select('status');
      
      if (claimsError) {
        console.error('❌ Error fetching claims:', claimsError);
        throw claimsError;
      }
      console.log('✅ Claims fetched:', claims?.length);

      const claimsByStatus = claims?.reduce((acc: any, claim: any) => {
        acc[claim.status] = (acc[claim.status] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log('📋 Claims by status:', claimsByStatus);

      // Get tutorials stats
      const { data: tutorials, error: tutorialsError } = await supabase
        .from('tutorials')
        .select('id, view_count');
      
      if (tutorialsError) {
        console.error('❌ Error fetching tutorials:', tutorialsError);
      } else {
        console.log('✅ Tutorials fetched:', tutorials?.length);
      }

      const totalViews = tutorials?.reduce((sum, tutorial) => sum + (tutorial.view_count || 0), 0) || 0;

      // Get products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock_status');
      
      if (productsError) {
        console.error('❌ Error fetching products:', productsError);
      } else {
        console.log('✅ Products fetched:', products?.length);
      }

      const productsByStock = products?.reduce((acc: any, product: any) => {
        acc[product.stock_status] = (acc[product.stock_status] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log('📦 Products by stock:', productsByStock);

      return {
        users: {
          total: users?.length || 0,
          byRole: {
            admin: usersByRole.admin || 0,
            member: usersByRole.member || 0,
            guest: usersByRole.guest || 0,
          },
        },
        transactions: {
          total: transactions?.length || 0,
          byStatus: {
            BERHASIL: transactionsByStatus.completed || 0,
            PENDING: transactionsByStatus.pending || 0,
            GAGAL: (transactionsByStatus.failed || 0) + (transactionsByStatus.cancelled || 0),
          },
        },
        revenue: {
          total: totalRevenue,
          today: 0, // TODO: Calculate today's revenue
          thisMonth: 0, // TODO: Calculate this month's revenue
        },
        claims: {
          pending: (claimsByStatus.pending || 0) + (claimsByStatus.reviewing || 0),
          byStatus: {
            APPROVED: claimsByStatus.approved || 0,
            REJECTED: claimsByStatus.rejected || 0,
            PENDING: (claimsByStatus.pending || 0) + (claimsByStatus.reviewing || 0),
          },
        },
        tutorials: {
          total: tutorials?.length || 0,
          totalViews: totalViews,
        },
        products: {
          total: products?.length || 0,
          byStock: {
            available: productsByStock.available || 0,
            out_of_stock: productsByStock.out_of_stock || 0,
          },
        },
        recentActivities: [],
      };
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      throw error;
    }
  }

  async getUserStats(_period: string): Promise<UserStats> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Group by date
      const growthMap = new Map<string, { newUsers: number; totalUsers: number }>();
      let totalUsers = 0;

      users?.forEach((user) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        totalUsers++;
        
        if (!growthMap.has(date)) {
          growthMap.set(date, { newUsers: 0, totalUsers: 0 });
        }
        
        const entry = growthMap.get(date)!;
        entry.newUsers++;
        entry.totalUsers = totalUsers;
      });

      const growth = Array.from(growthMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));

      return { growth };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async getTransactionStats(_period: string): Promise<TransactionStats> {
    try {
      console.log('📊 Fetching transaction stats...');
      
      // Join with products table to get product_type
      // Get ALL transactions for volume chart (including topup, refund, etc)
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          created_at,
          amount,
          status,
          transaction_type,
          products (
            product_type,
            product_name
          )
        `)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching transaction stats:', error);
        throw error;
      }
      console.log('✅ Transaction stats fetched:', transactions?.length);

      // Group by date
      const volumeMap = new Map<string, { count: number; totalAmount: number }>();
      const productMap = new Map<string, { count: number; totalAmount: number }>();

      transactions?.forEach((txn: any) => {
        const date = new Date(txn.created_at).toISOString().split('T')[0];
        
        // Volume by date - include ALL transactions
        if (!volumeMap.has(date)) {
          volumeMap.set(date, { count: 0, totalAmount: 0 });
        }
        const volumeEntry = volumeMap.get(date)!;
        volumeEntry.count++;
        volumeEntry.totalAmount += txn.amount || 0;

        // By product - ONLY count purchase transactions with product_type
        // Skip topup, refund, and other non-purchase transactions
        if (txn.transaction_type === 'purchase' && txn.products && txn.products.product_type) {
          const productType = txn.products.product_type;
          
          if (!productMap.has(productType)) {
            productMap.set(productType, { count: 0, totalAmount: 0 });
          }
          const productEntry = productMap.get(productType)!;
          productEntry.count++;
          productEntry.totalAmount += txn.amount || 0;
        }
      });

      const volume = Array.from(volumeMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));

      const byProduct = Array.from(productMap.entries()).map(([productType, data]) => ({
        productType,
        ...data,
      }));

      const totalAmount = transactions?.reduce((sum: number, txn: any) => sum + (txn.amount || 0), 0) || 0;
      const avgTransactionAmount = transactions?.length ? totalAmount / transactions.length : 0;

      // Calculate breakdown (count ALL transactions but track completed separately)
      const breakdown = {
        totalPurchase: 0,
        totalPurchaseCompleted: 0,
        totalPurchasePending: 0,
        totalTopup: 0,
        purchaseBM: 0,
        purchaseBMCompleted: 0,
        purchasePersonal: 0,
        purchasePersonalCompleted: 0,
        purchaseVerifiedBM: 0,
        purchaseVerifiedBMCompleted: 0,
        purchaseAPI: 0,
        purchaseAPICompleted: 0,
        revenuePurchase: 0,
        revenueTopup: 0,
      };

      transactions?.forEach((txn: any) => {
        if (txn.transaction_type === 'purchase') {
          breakdown.totalPurchase++;
          
          if (txn.status === 'completed') {
            breakdown.totalPurchaseCompleted++;
            breakdown.revenuePurchase += txn.amount || 0;
          } else if (txn.status === 'pending') {
            breakdown.totalPurchasePending++;
          }
          
          if (txn.products && txn.products.product_type) {
            const isCompleted = txn.status === 'completed';
            
            switch (txn.products.product_type) {
              case 'bm_account':
                breakdown.purchaseBM++;
                if (isCompleted) breakdown.purchaseBMCompleted++;
                break;
              case 'personal_account':
                breakdown.purchasePersonal++;
                if (isCompleted) breakdown.purchasePersonalCompleted++;
                break;
              case 'verified_bm':
                breakdown.purchaseVerifiedBM++;
                if (isCompleted) breakdown.purchaseVerifiedBMCompleted++;
                break;
              case 'api':
                breakdown.purchaseAPI++;
                if (isCompleted) breakdown.purchaseAPICompleted++;
                break;
            }
          }
        } else if (txn.transaction_type === 'topup') {
          breakdown.totalTopup++;
          if (txn.status === 'completed') {
            breakdown.revenueTopup += txn.amount || 0;
          }
        }
      });

      console.log('📊 Transaction breakdown:', breakdown);

      return {
        volume,
        byProduct,
        avgTransactionAmount,
        breakdown,
      };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }
}

export const adminStatsService = new AdminStatsService();
