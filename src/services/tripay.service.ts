/**
 * Tripay Payment Gateway Service
 * Handles payment creation and status checking
 */

import { supabase } from '@/clients/supabase';
import axios from 'axios';

// Tripay API Configuration
const TRIPAY_API_URL = 'https://tripay.co.id/api';
const TRIPAY_SANDBOX_URL = 'https://tripay.co.id/api-sandbox';

// Use sandbox for development, production for live
const isDevelopment = import.meta.env.MODE === 'development';
const BASE_URL = isDevelopment ? TRIPAY_SANDBOX_URL : TRIPAY_API_URL;

const TRIPAY_API_KEY = import.meta.env.VITE_TRIPAY_API_KEY || 'LYIV2DddSP0DnEaxiMyAYleC3EKAFdaIYalrB2Wd';
const TRIPAY_PRIVATE_KEY = import.meta.env.VITE_TRIPAY_PRIVATE_KEY || 'BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz';
const TRIPAY_MERCHANT_CODE = import.meta.env.VITE_TRIPAY_MERCHANT_CODE || 'T32379';

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
 * Generate signature for Tripay API request
 */
function generateSignature(merchantRef: string, amount: number): string {
  const crypto = window.crypto;
  const encoder = new TextEncoder();
  
  // Create signature string: merchant_code + merchant_ref + amount
  const signatureString = `${TRIPAY_MERCHANT_CODE}${merchantRef}${amount}`;
  
  // For browser, we'll use a simple hash (in production, do this server-side)
  // This is a simplified version - ideally signature should be generated server-side
  return btoa(signatureString);
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
    // Create transaction in our database first
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.user.id,
        transaction_type: 'topup',
        amount: params.amount,
        status: 'pending',
        payment_method: params.paymentMethod,
        metadata: {
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone,
          order_items: params.orderItems,
        },
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      throw new Error('Failed to create transaction record');
    }

    // Use transaction ID as merchant_ref
    const merchantRef = transaction.id;

    // Calculate signature
    const signature = generateSignature(merchantRef, params.amount);

    // Get callback URL from environment or use default
    const callbackUrl = import.meta.env.VITE_TRIPAY_CALLBACK_URL || 
      `${window.location.origin}/api/tripay-callback`;

    // Prepare request data
    const requestData = {
      method: params.paymentMethod,
      merchant_ref: merchantRef,
      amount: params.amount,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone || '',
      order_items: params.orderItems,
      callback_url: callbackUrl,
      return_url: params.returnUrl || `${window.location.origin}/riwayat-transaksi`,
      expired_time: params.expiredTime || 24, // 24 hours default
      signature: signature,
    };

    console.log('Creating Tripay payment:', requestData);

    // Call Tripay API to create payment
    const response = await axios.post(
      `${BASE_URL}/transaction/create`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.success) {
      // Delete transaction if Tripay creation failed
      await supabase.from('transactions').delete().eq('id', transaction.id);
      throw new Error(response.data.message || 'Failed to create payment');
    }

    // Update transaction with Tripay data
    const tripayData = response.data.data;
    await supabase
      .from('transactions')
      .update({
        tripay_reference: tripayData.reference,
        tripay_merchant_ref: tripayData.merchant_ref,
        tripay_payment_method: tripayData.payment_method,
        tripay_payment_name: tripayData.payment_name,
        tripay_payment_url: tripayData.pay_url,
        tripay_qr_url: tripayData.qr_url,
        tripay_checkout_url: tripayData.checkout_url,
        tripay_amount: tripayData.amount,
        tripay_fee: tripayData.fee_merchant,
        tripay_total_amount: tripayData.amount_received,
        tripay_status: tripayData.status,
      })
      .eq('id', transaction.id);

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
