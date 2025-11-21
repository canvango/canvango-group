/**
 * Analytics Integration Examples for Member Area
 * 
 * Demonstrates how to integrate analytics tracking into member area components
 */

import React, { useState } from 'react';
import {
  useAnalytics,
  useButtonTracking,
  useFormTracking,
  usePurchaseTracking,
  useNavigationTracking,
  useFilterTracking
} from '../../../shared/hooks/useAnalytics';

/**
 * Example: Dashboard with Analytics
 */
export const DashboardWithAnalytics: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const trackRefresh = useButtonTracking('Dashboard', 'Refresh Button');

  const handleRefresh = () => {
    trackRefresh();
    // Refresh logic
  };

  const handleCardClick = (cardName: string) => {
    trackEvent('Dashboard', 'card_click', cardName);
    // Navigation logic
  };

  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      <div onClick={() => handleCardClick('Total Purchases')}>
        Total Purchases Card
      </div>
    </div>
  );
};

/**
 * Example: Product Purchase with Analytics
 */
export const ProductPurchaseWithAnalytics: React.FC<{ product: any }> = ({ product }) => {
  const {
    trackPurchaseStart
  } = usePurchaseTracking();

  const handleBuyClick = () => {
    trackPurchaseStart(product.id, product.title, product.price);
    // Show purchase modal
  };

  return (
    <div>
      <h3>{product.title}</h3>
      <p>Rp {product.price.toLocaleString()}</p>
      <button onClick={handleBuyClick}>Buy Now</button>
    </div>
  );
};

/**
 * Example: Top Up Form with Analytics
 */
export const TopUpFormWithAnalytics: React.FC = () => {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const { trackFormStart, trackFormSubmit, trackFormError } = useFormTracking('Top Up Form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 10000) {
      trackFormError('amount', 'Amount below minimum');
      return;
    }

    if (!paymentMethod) {
      trackFormError('paymentMethod', 'Payment method not selected');
      return;
    }

    try {
      await processTopUp({ amount, paymentMethod });
      trackFormSubmit(true, { amount, paymentMethod });
    } catch (error: any) {
      trackFormSubmit(false, { error: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} onFocus={trackFormStart}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount"
      />
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="">Select Payment Method</option>
        <option value="qris">QRIS</option>
        <option value="bca">BCA</option>
      </select>
      <button type="submit">Top Up</button>
    </form>
  );
};

/**
 * Example: Product Filters with Analytics
 */
export const ProductFiltersWithAnalytics: React.FC = () => {
  const [_category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { trackFilterChange, trackSortChange } = useFilterTracking('BM Accounts');

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    trackFilterChange('category', newCategory);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    trackSortChange('date', newSort);
  };

  return (
    <div>
      <div>
        <button onClick={() => handleCategoryChange('all')}>All</button>
        <button onClick={() => handleCategoryChange('verified')}>Verified</button>
        <button onClick={() => handleCategoryChange('limit-250')}>Limit 250$</button>
      </div>
      <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  );
};

/**
 * Example: Sidebar Navigation with Analytics
 */
export const SidebarWithAnalytics: React.FC = () => {
  const { trackNavigation } = useNavigationTracking();

  const handleNavigate = (path: string, _label: string) => {
    trackNavigation(path, 'sidebar');
    // Navigate to path
  };

  return (
    <nav>
      <button onClick={() => handleNavigate('/member/dashboard', 'Dashboard')}>
        Dashboard
      </button>
      <button onClick={() => handleNavigate('/member/transactions', 'Transactions')}>
        Transactions
      </button>
      <button onClick={() => handleNavigate('/member/accounts/bm', 'BM Accounts')}>
        BM Accounts
      </button>
    </nav>
  );
};

/**
 * Example: Transaction Detail Modal with Analytics
 */
export const TransactionDetailModalWithAnalytics: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}> = ({ isOpen, onClose, transaction }) => {
  const { trackEvent } = useAnalytics();

  React.useEffect(() => {
    if (isOpen) {
      trackEvent('Modal', 'open', 'Transaction Detail');
    }
  }, [isOpen, trackEvent]);

  const handleClose = () => {
    trackEvent('Modal', 'close', 'Transaction Detail');
    onClose();
  };

  const handleCopyCredentials = () => {
    trackEvent('Transaction', 'copy_credentials', transaction.id);
    // Copy logic
  };

  if (!isOpen) return null;

  return (
    <div>
      <h2>Transaction Details</h2>
      <p>ID: {transaction.id}</p>
      <button onClick={handleCopyCredentials}>Copy Credentials</button>
      <button onClick={handleClose}>Close</button>
    </div>
  );
};

/**
 * Example: Warranty Claim Form with Analytics
 */
export const WarrantyClaimFormWithAnalytics: React.FC = () => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const { trackFormStart, trackFormSubmit } = useFormTracking('Warranty Claim');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitWarrantyClaim({ reason, description });
      trackFormSubmit(true, { reason });
    } catch (error: any) {
      trackFormSubmit(false, { error: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} onFocus={trackFormStart}>
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        <option value="">Select Reason</option>
        <option value="disabled">Account Disabled</option>
        <option value="invalid">Invalid Credentials</option>
        <option value="other">Other</option>
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue"
      />
      <button type="submit">Submit Claim</button>
    </form>
  );
};

/**
 * Example: API Key Generation with Analytics
 */
export const APIKeyGenerationWithAnalytics: React.FC = () => {
  const { trackEvent } = useAnalytics();

  const handleGenerateKey = async () => {
    trackEvent('API', 'generate_key_start');

    try {
      await generateAPIKey();
      trackEvent('API', 'generate_key_success');
      // Show new key
    } catch (error: any) {
      trackEvent('API', 'generate_key_error', undefined, undefined, {
        error: error.message
      });
    }
  };

  const handleCopyKey = () => {
    trackEvent('API', 'copy_key');
    // Copy logic
  };

  return (
    <div>
      <button onClick={handleGenerateKey}>Generate New API Key</button>
      <button onClick={handleCopyKey}>Copy Key</button>
    </div>
  );
};

// Mock functions for examples

const processTopUp = async (_data: any) => ({ success: true });
const submitWarrantyClaim = async (_data: any) => ({ success: true });
const generateAPIKey = async () => 'new-api-key-123';

export default {
  DashboardWithAnalytics,
  ProductPurchaseWithAnalytics,
  TopUpFormWithAnalytics,
  ProductFiltersWithAnalytics,
  SidebarWithAnalytics,
  TransactionDetailModalWithAnalytics,
  WarrantyClaimFormWithAnalytics,
  APIKeyGenerationWithAnalytics
};
