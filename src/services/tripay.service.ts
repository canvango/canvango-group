/**
 * Tripay Payment Gateway Service
 * Handles payment creation and status checking
 */

import { supabase } from '@/clients/supabase';
import axios from 'axios';

// Always use Vercel API route for HTTPS support
// GCP proxy is accessed via Vercel serverless function
const USE_WORKER = false;

// Tripay mode (sandbox/production)
const TRIPAY_MODE = import.meta.env.VITE_TRIPAY_MODE || 'sandbox';
const IS_SANDBOX = TRIPAY_MODE === 'sandbox';

export interface TripayPaymentMethod {
  code: string;
  name: string;
  fee_merchant: {
    flat: number;
    percent: number;
  };
  fee_customer: {
    flat: number;
    percent: number;
  };
  total_fee: {
    flat: number;
    percent: number;
  };
  minimum_fee: number;
  maximum_fee: number;
  minimum_amount?: number;
  maximum_amount?: number;
  icon_url: string;
  active: boolean;
}

interface CreatePaymentParams {
  amount: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderItems: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  returnUrl?: string;
  expiredTime?: number; // in hours
}

interface TripayPaymentResponse {
  success: boolean;
  message: string;
  data: {
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    callback_url: string;
    return_url: string;
    amount: number;
    fee_merchant: number;
    fee_customer: number;
    total_fee: number;
    amount_received: number;
    pay_code: string;
    pay_url: string;
    checkout_url: string;
    qr_url: string;
    qr_string: string;
    status: string;
    expired_time: number;
    order_items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    instructions: Array<{
      title: string;
      steps: string[];
    }>;
  };
}

/**
 * Get available payment methods from database
 * Fetches enabled payment channels that were synced from Tripay API
 */
export async function getPaymentMethods(): Promise<TripayPaymentMethod[]> {
  try {
    // Fetch enabled payment channels from database
    const { data, error } = await supabase
      .from('tripay_payment_channels')
      .select('*')
      .eq('is_enabled', true)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching payment channels:', error);
      throw error;
    }

    // Transform database format to TripayPaymentMethod format
    return (data || []).map(channel => ({
      code: channel.code,
      name: channel.name,
      fee_merchant: channel.fee_merchant,
      fee_customer: channel.fee_customer,
      total_fee: channel.total_fee,
      minimum_fee: channel.minimum_fee || 0,
      maximum_fee: channel.maximum_fee || 0,
      icon_url: channel.icon_url || '',
      active: channel.is_active,
    }));
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
}

/**
 * Create a new payment transaction
 * Uses Cloudflare Worker if available, otherwise uses Vercel API route
 */
export async function createPayment(params: CreatePaymentParams): Promise<TripayPaymentResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    if (USE_WORKER) {
      // Use Cloudflare Worker
      return await createPaymentViaWorker(params, session);
    } else {
      // Use Vercel API route
      return await createPaymentViaVercel(params, session);
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

/**
 * Create payment via Cloudflare Worker
 */
async function createPaymentViaWorker(params: CreatePaymentParams, session: any): Promise<TripayPaymentResponse> {
  const merchantRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const expiredHours = params.expiredTime || 24;
  const expiredTime = Math.floor(Date.now() / 1000) + (expiredHours * 60 * 60);

  const requestData = {
    method: params.paymentMethod,
    merchant_ref: merchantRef,
    amount: params.amount,
    customer_name: params.customerName,
    customer_email: params.customerEmail,
    customer_phone: params.customerPhone || '',
    order_items: params.orderItems,
    return_url: params.returnUrl || `${window.location.origin}/riwayat-transaksi`,
    expired_time: expiredTime,
    sandbox: IS_SANDBOX,
  };

  console.log('Creating Tripay payment via Cloudflare Worker:', requestData);

  const response = await axios.post(
    `${WORKER_PROXY_URL}/create-transaction`,
    requestData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to create payment');
  }

  // Save transaction to database
  const transactionData = {
    user_id: session.user.id,
    transaction_type: 'topup',
    amount: params.amount,
    status: 'pending',
    payment_method: params.paymentMethod,
    tripay_reference: response.data.data.reference,
    tripay_merchant_ref: merchantRef,
    tripay_payment_method: response.data.data.payment_method,
    tripay_payment_name: response.data.data.payment_name,
    tripay_checkout_url: response.data.data.checkout_url,
    tripay_amount: response.data.data.amount,
    tripay_fee: response.data.data.total_fee,
    tripay_total_amount: response.data.data.amount_received,
    tripay_status: response.data.data.status,
  };

  await supabase.from('transactions').insert(transactionData);

  return response.data;
}

/**
 * Create payment via Vercel API route
 */
async function createPaymentViaVercel(params: CreatePaymentParams, session: any): Promise<TripayPaymentResponse> {
  const requestData = {
    amount: params.amount,
    paymentMethod: params.paymentMethod,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone || '',
    orderItems: params.orderItems,
    returnUrl: params.returnUrl || `${window.location.origin}/riwayat-transaksi`,
    expiredTime: params.expiredTime || 24,
  };

  console.log('Creating Tripay payment via Vercel API:', requestData);

  const response = await axios.post(
    '/api/tripay-proxy',
    requestData,
    {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('📦 Vercel API response:', response.data);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to create payment');
  }

  // Transaction already saved by Vercel API route
  return response.data;
}

/**
 * Check payment status from Tripay
 */
export async function checkPaymentStatus(reference: string): Promise<any> {
  try {
    if (USE_WORKER) {
      // Use Cloudflare Worker
      const response = await axios.get(
        `${WORKER_PROXY_URL}/transaction/${reference}`,
        {
          params: { sandbox: IS_SANDBOX },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to check payment status');
    } else {
      // Fetch from database (updated by callback)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tripay_reference', reference)
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

/**
 * Calculate total amount including Tripay fee
 */
export function calculateTotalAmount(
  amount: number,
  paymentMethod: TripayPaymentMethod
): number {
  const flatFee = paymentMethod.fee_merchant.flat || 0;
  const percentFee = (amount * (paymentMethod.fee_merchant.percent || 0)) / 100;
  let totalFee = flatFee + percentFee;
  
  // Apply minimum fee if set
  if (paymentMethod.minimum_fee && totalFee < paymentMethod.minimum_fee) {
    totalFee = paymentMethod.minimum_fee;
  }
  
  // Apply maximum fee if set
  if (paymentMethod.maximum_fee && totalFee > paymentMethod.maximum_fee) {
    totalFee = paymentMethod.maximum_fee;
  }
  
  return amount + totalFee;
}

/**
 * Get payment method by code
 */
export async function getPaymentMethodByCode(code: string): Promise<TripayPaymentMethod | null> {
  try {
    const { data, error } = await supabase
      .from('tripay_payment_channels')
      .select('*')
      .eq('code', code)
      .eq('is_enabled', true)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      code: data.code,
      name: data.name,
      fee_merchant: data.fee_merchant,
      fee_customer: data.fee_customer,
      total_fee: data.total_fee,
      minimum_fee: data.minimum_fee || 0,
      maximum_fee: data.maximum_fee || 0,
      icon_url: data.icon_url || '',
      active: data.is_active,
    };
  } catch (error) {
    console.error('Failed to fetch payment method:', error);
    return null;
  }
}

/**
 * Format Tripay payment instructions for display
 */
export function formatPaymentInstructions(instructions: Array<{ title: string; steps: string[] }>) {
  return instructions.map(instruction => ({
    title: instruction.title,
    steps: instruction.steps,
  }));
}

/**
 * Generate HMAC-SHA256 signature for Closed Payment
 * Format: merchant_code + merchant_ref + amount
 */
export function generateClosedPaymentSignature(
  merchantCode: string,
  merchantRef: string,
  amount: number,
  privateKey: string
): string {
  // Combine data without separator
  const data = `${merchantCode}${merchantRef}${amount}`;
  
  // Create HMAC-SHA256 hash
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const messageData = encoder.encode(data);
  
  // Use Web Crypto API for HMAC
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => {
    return crypto.subtle.sign('HMAC', key, messageData);
  }).then(signature => {
    // Convert ArrayBuffer to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }).catch(error => {
    console.error('Error generating signature:', error);
    throw new Error('Failed to generate signature');
  });
}

/**
 * Generate HMAC-SHA256 signature for Open Payment
 * Format: merchant_code + channel + merchant_ref
 */
export function generateOpenPaymentSignature(
  merchantCode: string,
  channel: string,
  merchantRef: string,
  privateKey: string
): string {
  // Combine data without separator
  const data = `${merchantCode}${channel}${merchantRef}`;
  
  // Create HMAC-SHA256 hash
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const messageData = encoder.encode(data);
  
  // Use Web Crypto API for HMAC
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => {
    return crypto.subtle.sign('HMAC', key, messageData);
  }).then(signature => {
    // Convert ArrayBuffer to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }).catch(error => {
    console.error('Error generating signature:', error);
    throw new Error('Failed to generate signature');
  });
}

/**
 * Validate callback signature from Tripay
 * Used to verify webhook authenticity
 */
export function validateCallbackSignature(
  payload: string,
  signature: string,
  privateKey: string
): Promise<boolean> {
  // Create HMAC-SHA256 hash of payload
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const messageData = encoder.encode(payload);
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => {
    return crypto.subtle.sign('HMAC', key, messageData);
  }).then(calculatedSignature => {
    // Convert ArrayBuffer to hex string
    const calculatedHex = Array.from(new Uint8Array(calculatedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Compare signatures
    return calculatedHex === signature;
  }).catch(error => {
    console.error('Error validating signature:', error);
    return false;
  });
}

// ============================================================================
// Open Payment Functions
// ============================================================================

export interface OpenPaymentRequest {
  paymentMethod: string;
  customerName?: string;
  expiredTime?: number; // unix timestamp
}

export interface OpenPaymentResponse {
  success: boolean;
  message: string;
  data: {
    uuid: string;
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name?: string;
    pay_code: string;
    qr_string?: string;
    qr_url?: string;
    status: 'UNPAID';
    expired_time: number;
    instructions: Array<{
      title: string;
      steps: string[];
    }>;
  };
}

export interface OpenPayment {
  id: string;
  user_id: string;
  uuid: string;
  merchant_ref: string;
  payment_method: string;
  payment_name: string;
  customer_name?: string;
  pay_code: string;
  qr_string?: string;
  qr_url?: string;
  status: 'ACTIVE' | 'EXPIRED';
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OpenPaymentTransaction {
  id: string;
  open_payment_id: string;
  transaction_id?: string;
  reference: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  status: string;
  paid_at: string;
  created_at: string;
}

/**
 * Create Open Payment (permanent pay code)
 */
export async function createOpenPayment(params: OpenPaymentRequest): Promise<OpenPaymentResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await axios.post(
      '/api/tripay-open-payment',
      params,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create Open Payment');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating Open Payment:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

/**
 * Get Open Payment detail by UUID
 */
export async function getOpenPaymentDetail(uuid: string): Promise<OpenPayment> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await axios.get(
      `/api/tripay-open-payment/${uuid}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get Open Payment detail');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting Open Payment detail:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

/**
 * Get Open Payment transactions (payment history)
 */
export async function getOpenPaymentTransactions(
  uuid: string,
  filters?: {
    reference?: string;
    merchantRef?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  }
): Promise<{ transactions: OpenPaymentTransaction[]; total: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const params = new URLSearchParams();
    if (filters?.reference) params.append('reference', filters.reference);
    if (filters?.merchantRef) params.append('merchantRef', filters.merchantRef);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.perPage) params.append('perPage', filters.perPage.toString());

    const response = await axios.get(
      `/api/tripay-open-payment/${uuid}/transactions?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get Open Payment transactions');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting Open Payment transactions:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

/**
 * Get list of Open Payments for current user
 */
export async function getOpenPaymentList(filters?: {
  status?: 'ACTIVE' | 'EXPIRED';
  paymentMethod?: string;
}): Promise<OpenPayment[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    let query = supabase
      .from('open_payments')
      .select('*')
      .eq('user_id', session.user.id);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.paymentMethod) {
      query = query.eq('payment_method', filters.paymentMethod);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting Open Payment list:', error);
    throw error;
  }
}

// ============================================================================
// Transaction Detail Functions
// ============================================================================

export interface TransactionDetail {
  reference: string;
  merchant_ref: string;
  payment_selection_type: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  callback_url: string;
  return_url: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  pay_code: string;
  pay_url: string;
  checkout_url: string;
  status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';
  expired_time: number;
  order_items: Array<{
    sku?: string;
    name: string;
    price: number;
    quantity: number;
    subtotal?: number;
    product_url?: string;
    image_url?: string;
  }>;
  instructions: Array<{
    title: string;
    steps: string[];
  }>;
  qr_string?: string;
  qr_url?: string;
}

/**
 * Get transaction detail from Tripay API
 * Fetches full transaction details including payment instructions
 */
export async function getTransactionDetail(reference: string): Promise<TransactionDetail> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await axios.get(
      `/api/tripay-transaction-detail?reference=${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get transaction detail');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting transaction detail:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

/**
 * Quick check transaction status (lightweight)
 * Used for polling without fetching full details
 */
export async function quickCheckStatus(reference: string): Promise<{ status: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await axios.get(
      `/api/tripay-transaction-status?reference=${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to check status');
    }

    return { status: response.data.data.status };
  } catch (error) {
    console.error('Error checking status:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

/**
 * Sync transaction status from Tripay API to database
 * Used by admin to manually sync status
 */
export async function syncTransactionStatus(reference: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // Get latest data from Tripay
    const detail = await getTransactionDetail(reference);

    // Update database
    const { error } = await supabase
      .from('transactions')
      .update({
        tripay_status: detail.status,
        tripay_payment_method: detail.payment_method,
        tripay_payment_name: detail.payment_name,
        tripay_amount: detail.amount,
        tripay_fee: detail.total_fee,
        tripay_total_amount: detail.amount_received,
        status: detail.status === 'PAID' ? 'completed' : 
                detail.status === 'EXPIRED' || detail.status === 'FAILED' ? 'failed' : 
                'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('tripay_reference', reference);

    if (error) {
      throw error;
    }

    console.log('Transaction status synced:', reference);
  } catch (error) {
    console.error('Error syncing transaction status:', error);
    throw error;
  }
}

// ============================================================================
// Admin Functions
// ============================================================================

export interface AdminTransactionFilters {
  status?: string;
  paymentMethod?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export interface AdminTransactionsResponse {
  transactions: any[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Get all transactions for admin (all users)
 * Supports filtering and pagination
 */
export async function getAllTransactions(
  filters?: AdminTransactionFilters
): Promise<AdminTransactionsResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // Build query
    let query = supabase
      .from('transactions')
      .select('*, users:user_id(email, full_name)', { count: 'exact' });

    // Apply filters
    if (filters?.status) {
      query = query.eq('tripay_status', filters.status);
    }
    if (filters?.paymentMethod) {
      query = query.eq('tripay_payment_method', filters.paymentMethod);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.perPage || 25;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      transactions: data || [],
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    };
  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
}
