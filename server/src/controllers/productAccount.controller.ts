import { Request, Response } from 'express';
import { ProductAccountFieldModel } from '../models/productAccountField.model.js';
import { ProductAccountModel } from '../models/productAccount.model.js';

export const productAccountController = {
  // ===== FIELD MANAGEMENT =====
  async getFieldsByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const fields = await ProductAccountFieldModel.findByProductId(productId);
      res.json({ success: true, data: fields });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createField(req: Request, res: Response) {
    try {
      const field = await ProductAccountFieldModel.create(req.body);
      res.status(201).json({ success: true, data: field });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateField(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const field = await ProductAccountFieldModel.update(id, req.body);
      res.json({ success: true, data: field });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteField(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ProductAccountFieldModel.delete(id);
      res.json({ success: true, message: 'Field deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async bulkCreateFields(req: Request, res: Response) {
    try {
      const { productId, fields } = req.body;
      
      console.log('Bulk create fields request:', { productId, fields });
      
      if (!productId || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid request: productId and fields array required' 
        });
      }
      
      // Delete existing fields first
      await ProductAccountFieldModel.deleteByProductId(productId);
      
      // Create new fields
      const createdFields = await ProductAccountFieldModel.bulkCreate(
        fields.map((field: any, index: number) => ({
          ...field,
          product_id: productId,
          display_order: index
        }))
      );
      
      console.log('Fields created successfully:', createdFields);
      res.json({ success: true, data: createdFields });
    } catch (error: any) {
      console.error('Bulk create fields error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ===== ACCOUNT MANAGEMENT =====
  async getAccountsByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { status } = req.query;
      
      const accounts = await ProductAccountModel.findByProductId(
        productId,
        status as 'available' | 'sold' | undefined
      );
      
      const availableCount = await ProductAccountModel.getAvailableCount(productId);
      const totalCount = await ProductAccountModel.getTotalCount(productId);
      
      res.json({
        success: true,
        data: {
          accounts,
          stats: {
            available: availableCount,
            total: totalCount,
            sold: totalCount - availableCount
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getAccountById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const account = await ProductAccountModel.findById(id);
      
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
      
      res.json({ success: true, data: account });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getAccountByTransaction(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      
      // Get all accounts for this transaction (support multiple accounts)
      const { getSupabaseClient } = await import('../config/supabase.js');
      const supabase = getSupabaseClient();
      
      const { data: accounts, error } = await supabase
        .from('product_accounts')
        .select('*')
        .eq('assigned_to_transaction_id', transactionId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (!accounts || accounts.length === 0) {
        return res.status(404).json({ success: false, message: 'No accounts assigned to this transaction' });
      }
      
      // Return single account for backward compatibility, or all accounts
      res.json({ 
        success: true, 
        data: accounts.length === 1 ? accounts[0] : accounts,
        count: accounts.length
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createAccount(req: Request, res: Response) {
    try {
      const account = await ProductAccountModel.create(req.body);
      res.status(201).json({ success: true, data: account });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async bulkCreateAccounts(req: Request, res: Response) {
    try {
      const { productId, accounts } = req.body;
      
      const createdAccounts = await ProductAccountModel.bulkCreate(
        accounts.map((account: any) => ({
          product_id: productId,
          account_data: account
        }))
      );
      
      res.status(201).json({ success: true, data: createdAccounts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const account = await ProductAccountModel.update(id, req.body);
      res.json({ success: true, data: account });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ProductAccountModel.delete(id);
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
