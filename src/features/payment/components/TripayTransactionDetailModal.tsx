/**
 * TripayTransactionDetailModal Component
 * Modal wrapper for TripayPaymentGateway to show TriPay transaction details
 */

import React from 'react';
import Modal from '../../../shared/components/Modal';
import { TripayPaymentGateway } from './TripayPaymentGateway';
import { Transaction } from '../../member-area/types/transaction';

export interface TripayTransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshStatus?: () => void;
}

export const TripayTransactionDetailModal: React.FC<TripayTransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onRefreshStatus,
}) => {
  // Don't render if no transaction or not a TriPay transaction
  if (!transaction || !transaction.tripayReference) {
    return null;
  }

  // Extract payment data from transaction
  // FIX: Use transaction.amount (user's top-up amount) instead of tripayAmount (which is amount - fee)
  const paymentData = {
    reference: transaction.tripayReference,
    merchant_ref: transaction.tripayMerchantRef || transaction.id,
    payment_method: transaction.tripayPaymentMethod || '',
    payment_name: transaction.tripayPaymentName || 'Payment',
    customer_name: transaction.tripayCallbackData?.customer_name || 'Customer',
    customer_email: transaction.tripayCallbackData?.customer_email || '',
    customer_phone: transaction.tripayCallbackData?.customer_phone || '',
    amount: transaction.amount, // ✅ Use transaction.amount (10000) not tripayAmount (9180)
    fee_merchant: transaction.tripayCallbackData?.fee_merchant || transaction.tripayFee || 0,
    total_fee: transaction.tripayFee || 0,
    amount_received: transaction.tripayCallbackData?.amount_received || transaction.tripayTotalAmount || transaction.amount,
    pay_code: transaction.tripayCallbackData?.pay_code,
    qr_url: transaction.tripayQrUrl,
    qr_string: transaction.tripayCallbackData?.qr_string,
    // Use tripayExpiredAt from database, fallback to callback data, then fallback to expired (0)
    expired_time: transaction.tripayExpiredAt 
      ? Math.floor(transaction.tripayExpiredAt.getTime() / 1000)
      : transaction.tripayCallbackData?.expired_time || 0,
    instructions: transaction.tripayCallbackData?.instructions || [],
    status: transaction.tripayStatus || transaction.status, // ✅ Add status for conditional rendering
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pembayaran TriPay"
      size="full"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <TripayPaymentGateway
          paymentData={paymentData}
          onRefreshStatus={onRefreshStatus}
          isModal={true}
        />
      </div>
    </Modal>
  );
};

export default TripayTransactionDetailModal;
