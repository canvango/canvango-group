import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction.model.js';
import { ProductAccountModel } from '../models/productAccount.model.js';
import { UserModel } from '../models/User.model.js';
import { getSupabaseClient } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const purchaseController = {
  async purchaseProduct(req: Request, res: Response) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json(errorResponse('AUTH_ERROR', 'User not authenticated'));
      }

      // Validate input
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid product ID or quantity'));
      }

      // Get product details
      const supabase = getSupabaseClient();
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return res.status(404).json(errorResponse('PRODUCT_NOT_FOUND', 'Product not found'));
      }

      // Check if product is active
      if (!(product as any).is_active) {
        return res.status(400).json(errorResponse('PRODUCT_INACTIVE', 'Product is not available'));
      }

      // Check available accounts
      const availableCount = await ProductAccountModel.getAvailableCount(productId);
      if (availableCount < quantity) {
        return res.status(400).json(errorResponse(
          'INSUFFICIENT_STOCK',
          `Only ${availableCount} accounts available. Requested: ${quantity}`
        ));
      }

      // Get user balance
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json(errorResponse('USER_NOT_FOUND', 'User not found'));
      }

      // Calculate total price
      const totalPrice = Number((product as any).price) * quantity;
      if (user.balance < totalPrice) {
        return res.status(400).json(errorResponse(
          'INSUFFICIENT_BALANCE',
          `Insufficient balance. Required: ${totalPrice}, Available: ${user.balance}`
        ));
      }

      // Start transaction process
      // Note: Balance will be automatically updated by trigger 'trigger_auto_update_balance'
      // when transaction is created with status='completed'
      
      // 1. Create transaction record
      const transaction = await TransactionModel.create({
        user_id: userId,
        transaction_type: 'purchase',
        product_id: productId,
        amount: totalPrice,
        status: 'completed', // Set as completed (valid status)
        metadata: {
          product_name: (product as any).product_name,
          product_type: (product as any).product_type,
          quantity: quantity
        }
      });

      // 3. Assign account(s) to transaction
      const assignedAccounts: any[] = [];
      const accountsToAssign = await supabase
        .from('product_accounts')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'available')
        .limit(quantity);

      if (accountsToAssign.data && accountsToAssign.data.length >= quantity) {
        for (const account of accountsToAssign.data) {
          const assigned = await ProductAccountModel.assignToTransaction(
            (account as any).id,
            transaction.id
          );
          assignedAccounts.push(assigned);
        }
      }

      // If not all accounts were assigned (shouldn't happen due to earlier check)
      if (assignedAccounts.length < quantity) {
        // Rollback: Update transaction status to 'GAGAL'
        // Trigger will automatically refund balance when status changes from 'completed' to 'GAGAL'
        await TransactionModel.updateStatus(transaction.id, 'GAGAL');
        
        return res.status(500).json(errorResponse(
          'ASSIGNMENT_ERROR',
          'Failed to assign all accounts. Transaction cancelled and refunded.'
        ));
      }

      // 4. Create purchase records with warranty
      const warrantyDuration = (product as any).warranty_duration || 30; // Default 30 days
      const warrantyEnabled = (product as any).warranty_enabled !== false;
      const warrantyExpiresAt = warrantyEnabled 
        ? new Date(Date.now() + warrantyDuration * 24 * 60 * 60 * 1000)
        : null;

      for (const account of assignedAccounts) {
        const { error: purchaseError } = await supabase.from('purchases').insert({
          user_id: userId,
          transaction_id: transaction.id,
          product_id: productId,
          quantity: 1,
          unit_price: (product as any).price,
          total_price: (product as any).price,
          account_details: account.account_data,
          warranty_expires_at: warrantyExpiresAt?.toISOString(),
          status: 'active'
        } as any);

        if (purchaseError) {
          console.error('Failed to create purchase record:', purchaseError);
        }
      }

      // Get updated user balance (after trigger execution)
      const updatedUser = await UserModel.findById(userId);
      const newBalance = updatedUser?.balance || 0;

      res.status(201).json(successResponse({
        transactionId: transaction.id,
        status: 'success',
        message: 'Purchase completed successfully',
        assignedAccounts: assignedAccounts.length,
        accountDetails: assignedAccounts.map(acc => ({
          id: acc.id,
          accountData: acc.account_data
        })),
        newBalance: newBalance
      }));

    } catch (error: any) {
      console.error('Purchase error:', error);
      res.status(500).json(errorResponse('INTERNAL_ERROR', error.message || 'Purchase failed'));
    }
  }
};
