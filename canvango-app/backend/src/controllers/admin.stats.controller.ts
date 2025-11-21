import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';

/**
 * Get system overview statistics
 * GET /api/admin/stats/overview
 */
export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get users by role
    const { data: usersData, error: usersDataError } = await supabase
      .from('users')
      .select('role');

    if (usersDataError) throw usersDataError;

    const usersByRole = (usersData || []).reduce((acc: any, row: any) => {
      acc[row.role] = (acc[row.role] || 0) + 1;
      return acc;
    }, {});

    // Get total transactions count
    const { count: totalTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (transactionsError) throw transactionsError;

    // Get transactions by status
    const { data: transactionsData, error: transactionsDataError } = await supabase
      .from('transactions')
      .select('status');

    if (transactionsDataError) throw transactionsDataError;

    const transactionsByStatus = (transactionsData || []).reduce((acc: any, row: any) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});

    // Get total revenue (sum of successful transactions)
    const { data: revenueData, error: revenueError } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('status', 'BERHASIL');

    if (revenueError) throw revenueError;

    const totalRevenue = (revenueData || []).reduce((sum, row: any) => sum + Number(row.total_amount), 0);

    // Get pending claims count
    const { count: pendingClaims, error: pendingClaimsError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    if (pendingClaimsError) throw pendingClaimsError;

    // Get claims by status
    const { data: claimsData, error: claimsDataError } = await supabase
      .from('claims')
      .select('status');

    if (claimsDataError) throw claimsDataError;

    const claimsByStatus = (claimsData || []).reduce((acc: any, row: any) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});

    // Get total tutorials count
    const { count: totalTutorials, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*', { count: 'exact', head: true });

    if (tutorialsError) throw tutorialsError;

    // Get total tutorial views
    const { data: tutorialsData, error: tutorialsDataError } = await supabase
      .from('tutorials')
      .select('view_count');

    if (tutorialsDataError) throw tutorialsDataError;

    const totalTutorialViews = (tutorialsData || []).reduce((sum, row: any) => sum + Number(row.view_count), 0);

    // Get total products count
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    // Get products by stock status
    const { data: productsData, error: productsDataError } = await supabase
      .from('products')
      .select('stock_status, is_active');

    if (productsDataError) throw productsDataError;

    const productsByStock = (productsData || []).reduce((acc: any, row: any) => {
      if (row.is_active) {
        acc[row.stock_status] = (acc[row.stock_status] || 0) + 1;
      }
      return acc;
    }, {});

    // Get recent audit logs (last 10 activities)
    const { data: recentActivities, error: activitiesError } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) throw activitiesError;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: {
            guest: usersByRole.guest || 0,
            member: usersByRole.member || 0,
            admin: usersByRole.admin || 0,
          },
        },
        transactions: {
          total: totalTransactions,
          byStatus: {
            BERHASIL: transactionsByStatus.BERHASIL || 0,
            PENDING: transactionsByStatus.PENDING || 0,
            GAGAL: transactionsByStatus.GAGAL || 0,
          },
        },
        revenue: {
          total: totalRevenue,
        },
        claims: {
          total: claimsByStatus.PENDING + claimsByStatus.APPROVED + claimsByStatus.REJECTED || 0,
          pending: pendingClaims,
          byStatus: {
            PENDING: claimsByStatus.PENDING || 0,
            APPROVED: claimsByStatus.APPROVED || 0,
            REJECTED: claimsByStatus.REJECTED || 0,
          },
        },
        tutorials: {
          total: totalTutorials,
          totalViews: totalTutorialViews,
        },
        products: {
          total: totalProducts,
          byStock: {
            available: productsByStock.available || 0,
            out_of_stock: productsByStock.out_of_stock || 0,
          },
        },
        recentActivities: recentActivities || [],
      },
    });
  } catch (error: any) {
    console.error('Error getting overview stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve overview statistics',
        details: error.message,
      },
    });
  }
};

/**
 * Get user growth statistics
 * GET /api/admin/stats/users
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '30d') daysBack = 30;
    else if (period === '90d') daysBack = 90;
    else if (period === '365d') daysBack = 365;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Get all users created within the period
    const { data: usersInPeriod, error: usersError } = await supabase
      .from('users')
      .select('created_at, role')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true });

    if (usersError) throw usersError;

    // Process user growth data
    const growthMap = new Map<string, { newUsers: number; totalUsers: number }>();
    const growthByRoleMap = new Map<string, Map<string, number>>();
    
    let cumulativeTotal = 0;
    (usersInPeriod || []).forEach((user: any) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      
      // Update growth map
      const existing = growthMap.get(date) || { newUsers: 0, totalUsers: 0 };
      existing.newUsers += 1;
      cumulativeTotal += 1;
      existing.totalUsers = cumulativeTotal;
      growthMap.set(date, existing);
      
      // Update growth by role map
      if (!growthByRoleMap.has(date)) {
        growthByRoleMap.set(date, new Map());
      }
      const roleMap = growthByRoleMap.get(date)!;
      roleMap.set(user.role, (roleMap.get(user.role) || 0) + 1);
    });

    // Get total users
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalUsersError) throw totalUsersError;

    // Get active users (users who logged in within the period)
    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', cutoffDate.toISOString())
      .not('last_login_at', 'is', null);

    if (activeUsersError) throw activeUsersError;

    // Convert maps to arrays
    const growth = Array.from(growthMap.entries()).map(([date, data]) => ({
      date,
      newUsers: data.newUsers,
      totalUsers: data.totalUsers,
    }));

    const growthByRole: any[] = [];
    growthByRoleMap.forEach((roleMap, date) => {
      roleMap.forEach((count, role) => {
        growthByRole.push({ date, role, count });
      });
    });

    res.json({
      success: true,
      data: {
        period,
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        growth,
        growthByRole,
      },
    });
  } catch (error: any) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve user statistics',
        details: error.message,
      },
    });
  }
};

/**
 * Get transaction statistics per period
 * GET /api/admin/stats/transactions
 */
export const getTransactionStats = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '30d') daysBack = 30;
    else if (period === '90d') daysBack = 90;
    else if (period === '365d') daysBack = 365;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Get all transactions within the period
    const { data: transactionsInPeriod, error: transactionsError } = await supabase
      .from('transactions')
      .select('created_at, status, product_type, total_amount')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true });

    if (transactionsError) throw transactionsError;

    // Process transaction volume data
    const volumeMap = new Map<string, { count: number; totalAmount: number }>();
    const statusMap = new Map<string, Map<string, { count: number; totalAmount: number }>>();
    const productMap = new Map<string, { count: number; totalAmount: number }>();
    
    let totalRevenue = 0;
    let successfulTransactionsCount = 0;

    (transactionsInPeriod || []).forEach((txn: any) => {
      const date = new Date(txn.created_at).toISOString().split('T')[0];
      const amount = Number(txn.total_amount);
      
      // Update volume map
      const existing = volumeMap.get(date) || { count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += amount;
      volumeMap.set(date, existing);
      
      // Update status map
      if (!statusMap.has(date)) {
        statusMap.set(date, new Map());
      }
      const dateStatusMap = statusMap.get(date)!;
      const statusData = dateStatusMap.get(txn.status) || { count: 0, totalAmount: 0 };
      statusData.count += 1;
      statusData.totalAmount += amount;
      dateStatusMap.set(txn.status, statusData);
      
      // Update product map
      const productData = productMap.get(txn.product_type) || { count: 0, totalAmount: 0 };
      productData.count += 1;
      productData.totalAmount += amount;
      productMap.set(txn.product_type, productData);
      
      // Calculate revenue (successful transactions only)
      if (txn.status === 'BERHASIL') {
        totalRevenue += amount;
        successfulTransactionsCount += 1;
      }
    });

    const totalTransactions = transactionsInPeriod?.length || 0;
    const avgTransactionAmount = successfulTransactionsCount > 0 
      ? totalRevenue / successfulTransactionsCount 
      : 0;

    // Convert maps to arrays
    const volume = Array.from(volumeMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      totalAmount: data.totalAmount,
    }));

    const byStatus: any[] = [];
    statusMap.forEach((statusData, date) => {
      statusData.forEach((data, status) => {
        byStatus.push({
          date,
          status,
          count: data.count,
          totalAmount: data.totalAmount,
        });
      });
    });

    const byProduct = Array.from(productMap.entries())
      .map(([productType, data]) => ({
        productType,
        count: data.count,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        period,
        totalTransactions,
        totalRevenue,
        avgTransactionAmount,
        volume,
        byStatus,
        byProduct,
      },
    });
  } catch (error: any) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve transaction statistics',
        details: error.message,
      },
    });
  }
};
