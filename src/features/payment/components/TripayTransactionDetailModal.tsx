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
  const paymentData = {
    reference: transaction.tripayReference,
    merchant_ref: transaction.tripayMerchantRef || transaction.id,
    payment_method: transaction.tripayPaymentMethod || '',
    payment_name: transaction.tripayPaymentName || 'Payment',
    customer_name: transaction.tripayCallbackData?.customer_name || 'Customer',
    customer_email: transaction.tripayCallbackData?.customer_email || '',
    customer_phone: transaction.tripayCallbackData?.customer_phone || '',
    amount: transaction.tripayAmount || transaction.amount,
    fee_merchant: transaction.tripayCallbackData?.fee_merchant || transaction.tripayFee || 0,
    total_fee: transaction.tripayFee || 0,
    amount_received: transaction.tripayCallbackData?.amount_received || transaction.tripayTotalAmount || transaction.amount,
    pay_code: transaction.tripayCallbackData?.pay_code,
    qr_url: transaction.tripayQrUrl,
    qr_string: transaction.tripayCallbackData?.qr_string,
    expired_time: transaction.tripayCallbackData?.expired_time || Math.floor(Date.now() / 1000) + 86400,
    instructions: transaction.tripayCallbackData?.instructions || [],
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
