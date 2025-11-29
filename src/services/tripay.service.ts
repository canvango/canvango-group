/**
 * Tripay Payment Gateway Service
 * Handles payment creation and status checking
 */

import { supabase } from '@/clients/supabase';
import axios from 'axios';

// Tripay API Configuration
const TRIPAY_API_URL = 'https://tripay.co.id/api';
const TRIPAY_SANDBOX_URL = 'https://tripay.co.id/api-sandbox';

// Always use sandbox until merchant is approved
const TRIPAY_MODE = import.meta.env.VITE_TRIPAY_MODE || 'sandbox';
const BASE_URL = TRIPAY_MODE === 'production' ? TRIPAY_API_URL : TRIPAY_SANDBOX_URL;

// Tripay API Key for direct API calls (if needed)
const TRIPAY_API_KEY = import.meta.env.VITE_TRIPAY_API_KEY;

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
 * Create a new payment transaction via Tripay
 */
export async function createPayment(params: CreatePaymentParams): Promise<TripayPaymentResponse> {
  try {
    // Prepare request data for Edge Function
    const requestData = {
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone || '',
      orderItems: params.orderItems,
      returnUrl: params.returnUrl || `${window.location.origin}/riwayat-transaksi`,
      expiredTime: params.expiredTime || 24, // 24 hours default
    };

    console.log('Creating Tripay payment:', requestData);

    // Call Edge Function to create payment (to avoid CORS)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // Use Vercel API route as proxy (has static IP for Tripay whitelist)
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

    console.log('📦 Edge Function response:', response.data);
    
    if (!response.data.success) {
      const errorMessage = response.data.message || 'Failed to create payment';
      console.error('❌ Payment creation failed:', errorMessage);
      throw new Error(errorMessage);
    }

    // Edge Function already handles transaction creation and update
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

/**
 * Check payment status from Tripay
 */
export async function checkPaymentStatus(reference: string): Promise<any> {
  try {
    const response = await axios.get(
      `${BASE_URL}/transaction/detail`,
      {
        params: { reference },
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to check payment status');
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
