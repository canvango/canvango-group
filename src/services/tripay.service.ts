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

// Tripay credentials from environment
const TRIPAY_API_KEY = import.meta.env.VITE_TRIPAY_API_KEY;
const TRIPAY_PRIVATE_KEY = import.meta.env.VITE_TRIPAY_PRIVATE_KEY;
const TRIPAY_MERCHANT_CODE = import.meta.env.VITE_TRIPAY_MERCHANT_CODE;

interface TripayPaymentMethod {
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
 * Get available payment methods from Tripay
 * Returns hardcoded list to avoid CORS issues
 * TODO: Create backend endpoint to fetch from Tripay API
 */
export async function getPaymentMethods(): Promise<TripayPaymentMethod[]> {
  // Return hardcoded payment methods to avoid CORS
  // These are common Tripay payment channels
  return [
    {
      code: 'BRIVA',
      name: 'BRI Virtual Account',
      fee_merchant: { flat: 2500, percent: 0 },
      fee_customer: { flat: 0, percent: 0 },
      total_fee: { flat: 2500, percent: 0 },
      minimum_fee: 2500,
      maximum_fee: 2500,
      icon_url: 'https://tripay.co.id/images/payment_icon/BRIVA.png',
      active: true,
    },
    {
      code: 'BCAVA',
      name: 'BCA Virtual Account',
      fee_merchant: { flat: 2500, percent: 0 },
      fee_customer: { flat: 0, percent: 0 },
      total_fee: { flat: 2500, percent: 0 },
      minimum_fee: 2500,
      maximum_fee: 2500,
      icon_url: 'https://tripay.co.id/images/payment_icon/BCAVA.png',
      active: true,
    },
    {
      code: 'BNIVA',
      name: 'BNI Virtual Account',
      fee_merchant: { flat: 2500, percent: 0 },
      fee_customer: { flat: 0, percent: 0 },
      total_fee: { flat: 2500, percent: 0 },
      minimum_fee: 2500,
      maximum_fee: 2500,
      icon_url: 'https://tripay.co.id/images/payment_icon/BNIVA.png',
      active: true,
    },
    {
      code: 'MANDIRIVA',
      name: 'Mandiri Virtual Account',
      fee_merchant: { flat: 2500, percent: 0 },
      fee_customer: { flat: 0, percent: 0 },
      total_fee: { flat: 2500, percent: 0 },
      minimum_fee: 2500,
      maximum_fee: 2500,
      icon_url: 'https://tripay.co.id/images/payment_icon/MANDIRIVA.png',
      active: true,
    },
    {
      code: 'QRIS',
      name: 'QRIS (All E-Wallet)',
      fee_merchant: { flat: 0, percent: 0.7 },
      fee_customer: { flat: 0, percent: 0 },
      total_fee: { flat: 0, percent: 0.7 },
      minimum_fee: 0,
      maximum_fee: 0,
      icon_url: 'https://tripay.co.id/images/payment_icon/QRIS.png',
      active: true,
    },
    {
      code: 'SHOPEEPAY',
      name: 'ShopeePay',
      fee_merchant: { flat: 0, percent: 2 },
      fee_customer: { flat: 0, percent: 0 },
      total_fee: { flat: 0, percent: 2 },
      minimum_fee: 0,
      maximum_fee: 0,
      icon_url: 'https://tripay.co.id/images/payment_icon/SHOPEEPAY.png',
      active: true,
    },
  ];
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

    const response = await axios.post(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tripay-create-payment`,
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
  const flatFee = paymentMethod.fee_merchant.flat;
  const percentFee = (amount * paymentMethod.fee_merchant.percent) / 100;
  const totalFee = Math.max(flatFee + percentFee, paymentMethod.minimum_fee);
  
  return amount + totalFee;
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
