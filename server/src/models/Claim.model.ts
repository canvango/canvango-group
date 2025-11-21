import { getSupabaseClient } from '../config/supabase.js';

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Claim {
  id: string;
  user_id: string;
  transaction_id: string;
  reason: string;
  description: string;
  status: ClaimStatus;
  response_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface CreateClaimInput {
  user_id: string;
  transaction_id: string;
  reason: string;
  description: string;
  status?: ClaimStatus;
}

export interface UpdateClaimInput {
  reason?: string;
  description?: string;
  status?: ClaimStatus;
  response_note?: string;
}

export class ClaimModel {
  private static get supabase() {
    return getSupabaseClient();
  }

  /**
   * Create a new claim
   */
  static async create(claimData: CreateClaimInput): Promise<Claim> {
    const insertData = {
      user_id: claimData.user_id,
      transaction_id: claimData.transaction_id,
      reason: claimData.reason,
      description: claimData.description,
      status: claimData.status || 'PENDING'
    };

    const { data, error } = await this.supabase
      .from('claims')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating claim:', error);
      throw new Error(`Failed to create claim: ${error.message}`);
    }

    return data as Claim;
  }

  /**
   * Find claim by ID
   */
  static async findById(id: string): Promise<Claim | null> {
    const { data, error } = await this.supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error finding claim by ID:', error);
      return null;
    }

    return data as Claim;
  }

  /**
   * Find claims by user ID
   */
  static async findByUserId(
    userId: string,
    options?: {
      status?: ClaimStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Claim[]> {
    let query = this.supabase
      .from('claims')
      .select('*')
      .eq('user_id', userId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    query = query.order('created_at', { ascending: false });

    if (options?.limit && options?.offset) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    } else if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding claims by user ID:', error);
      return [];
    }

    return (data || []) as Claim[];
  }

  /**
   * Find claims by transaction ID
   */
  static async findByTransactionId(transactionId: string): Promise<Claim[]> {
    const { data, error } = await this.supabase
      .from('claims')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error finding claims by transaction ID:', error);
      return [];
    }

    return (data || []) as Claim[];
  }

  /**
   * Check if transaction already has a pending or approved claim
   */
  static async hasActiveClaim(transactionId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('claims')
      .select('id', { count: 'exact', head: true })
      .eq('transaction_id', transactionId)
      .in('status', ['PENDING', 'APPROVED']);

    if (error) {
      console.error('Error checking active claim:', error);
      return false;
    }

    return (data as any) > 0;
  }

  /**
   * Get all claims with optional filtering
   */
  static async findAll(filters?: {
    user_id?: string;
    transaction_id?: string;
    status?: ClaimStatus;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Claim[]> {
    let query = this.supabase.from('claims').select('*');

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.transaction_id) {
      query = query.eq('transaction_id', filters.transaction_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit && filters?.offset) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    } else if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding all claims:', error);
      return [];
    }

    return (data || []) as Claim[];
  }

  /**
   * Update claim
   */
  static async update(id: string, claimData: UpdateClaimInput): Promise<Claim | null> {
    const updateData: any = {};

    if (claimData.reason !== undefined) {
      updateData.reason = claimData.reason;
    }
    if (claimData.description !== undefined) {
      updateData.description = claimData.description;
    }
    if (claimData.status !== undefined) {
      updateData.status = claimData.status;
      
      // Set resolved_at when status changes to APPROVED or REJECTED
      if (claimData.status === 'APPROVED' || claimData.status === 'REJECTED') {
        updateData.resolved_at = new Date().toISOString();
      }
    }
    if (claimData.response_note !== undefined) {
      updateData.response_note = claimData.response_note;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await (this.supabase
      .from('claims') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating claim:', error);
      return null;
    }

    return data as Claim;
  }

  /**
   * Update claim status
   */
  static async updateStatus(
    id: string, 
    status: ClaimStatus, 
    responseNote?: string
  ): Promise<Claim | null> {
    const updateData: any = {
      status
    };

    if (status === 'APPROVED' || status === 'REJECTED') {
      updateData.resolved_at = new Date().toISOString();
    }

    if (responseNote !== undefined) {
      updateData.response_note = responseNote;
    }

    const { data, error } = await (this.supabase
      .from('claims') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating claim status:', error);
      return null;
    }

    return data as Claim;
  }

  /**
   * Approve claim
   */
  static async approve(id: string, responseNote?: string): Promise<Claim | null> {
    return this.updateStatus(id, 'APPROVED', responseNote);
  }

  /**
   * Reject claim
   */
  static async reject(id: string, responseNote?: string): Promise<Claim | null> {
    return this.updateStatus(id, 'REJECTED', responseNote);
  }

  /**
   * Delete claim
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('claims')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting claim:', error);
      return false;
    }

    return true;
  }

  /**
   * Count claims with optional filtering
   */
  static async count(filters?: {
    user_id?: string;
    transaction_id?: string;
    status?: ClaimStatus;
    start_date?: Date;
    end_date?: Date;
  }): Promise<number> {
    let query = this.supabase
      .from('claims')
      .select('*', { count: 'exact', head: true });

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.transaction_id) {
      query = query.eq('transaction_id', filters.transaction_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting claims:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get claim statistics
   */
  static async getStatistics(filters?: {
    user_id?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<{
    total_claims: number;
    by_status: { status: ClaimStatus; count: number }[];
  }> {
    // Get total claims count
    let countQuery = this.supabase
      .from('claims')
      .select('*', { count: 'exact', head: true });

    if (filters?.user_id) {
      countQuery = countQuery.eq('user_id', filters.user_id);
    }

    if (filters?.start_date) {
      countQuery = countQuery.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      countQuery = countQuery.lte('created_at', filters.end_date.toISOString());
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting total claims count:', countError);
      return { total_claims: 0, by_status: [] };
    }

    // Get claims grouped by status
    let dataQuery = this.supabase
      .from('claims')
      .select('status');

    if (filters?.user_id) {
      dataQuery = dataQuery.eq('user_id', filters.user_id);
    }

    if (filters?.start_date) {
      dataQuery = dataQuery.gte('created_at', filters.start_date.toISOString());
    }

    if (filters?.end_date) {
      dataQuery = dataQuery.lte('created_at', filters.end_date.toISOString());
    }

    const { data, error: dataError } = await dataQuery;

    if (dataError) {
      console.error('Error getting claims by status:', dataError);
      return { total_claims: totalCount || 0, by_status: [] };
    }

    // Count by status manually
    const statusCounts: { [key: string]: number } = {};
    (data || []).forEach((claim: any) => {
      statusCounts[claim.status] = (statusCounts[claim.status] || 0) + 1;
    });

    const by_status = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as ClaimStatus,
      count
    }));

    return {
      total_claims: totalCount || 0,
      by_status
    };
  }

  /**
   * Validate claim data
   */
  static validateClaimData(claimData: Partial<CreateClaimInput>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (claimData.reason !== undefined) {
      if (claimData.reason.length < 5) {
        errors.push('Reason must be at least 5 characters long');
      }
      if (claimData.reason.length > 255) {
        errors.push('Reason must not exceed 255 characters');
      }
    }

    if (claimData.description !== undefined) {
      if (claimData.description.length < 10) {
        errors.push('Description must be at least 10 characters long');
      }
      if (claimData.description.length > 5000) {
        errors.push('Description must not exceed 5000 characters');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
