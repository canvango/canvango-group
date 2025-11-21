/**
 * Analytics Usage Examples
 * 
 * Demonstrates how to use the analytics tracking system in various scenarios
 */

import React, { useState } from 'react';
import {
  useAnalytics,
  useButtonTracking,
  useFormTracking,
  useSearchTracking,
  usePurchaseTracking,
  useNavigationTracking,
  useModalTracking,
  useFilterTracking
} from '../hooks/useAnalytics';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

/**
 * Example 1: Basic Event Tracking
 */
export const BasicEventExample: React.FC = () => {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent('Button', 'click', 'Example Button', undefined, {
      timestamp: Date.now()
    });
    console.log('Button clicked and tracked!');
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Basic Event Tracking</h3>
      <Button onClick={handleClick}>
        Click Me (Tracked)
      </Button>
    </div>
  );
};

/**
 * Example 2: Button Click Tracking Hook
 */
export const ButtonTrackingExample: React.FC = () => {
  const trackClick = useButtonTracking('Example', 'Save Button');

  const handleSave = () => {
    trackClick();
    console.log('Save action tracked!');
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Button Tracking Hook</h3>
      <Button onClick={handleSave}>
        Save (Auto-tracked)
      </Button>
    </div>
  );
};

/**
 * Example 3: Form Tracking
 */
export const FormTrackingExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const { trackFormStart, trackFormSubmit, trackFormError } = useFormTracking('Newsletter Form');

  const handleFocus = () => {
    trackFormStart();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes('@')) {
      trackFormError('email', 'Invalid email format');
      alert('Invalid email!');
      return;
    }

    trackFormSubmit(true, { email });
    alert('Form submitted and tracked!');
    setEmail('');
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Form Tracking</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={handleFocus}
          placeholder="Enter email"
        />
        <Button type="submit">Subscribe</Button>
      </form>
    </div>
  );
};

/**
 * Example 4: Search Tracking
 */
export const SearchTrackingExample: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const { trackSearch, trackSearchResultClick } = useSearchTracking('Product Search');

  const handleSearch = () => {
    // Simulate search
    const mockResults = ['Product 1', 'Product 2', 'Product 3'];
    setResults(mockResults);
    
    // Track search
    trackSearch(query, mockResults.length);
  };

  const handleResultClick = (result: string, index: number) => {
    trackSearchResultClick(query, result, index);
    alert(`Clicked: ${result}`);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Search Tracking</h3>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        {results.length > 0 && (
          <ul className="space-y-1">
            {results.map((result, index) => (
              <li key={index}>
                <button
                  onClick={() => handleResultClick(result, index)}
                  className="text-blue-600 hover:underline"
                >
                  {result}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * Example 5: Purchase Tracking
 */
export const PurchaseTrackingExample: React.FC = () => {
  const { trackPurchaseStart, trackPurchaseComplete, trackPurchaseError } = usePurchaseTracking();

  const handlePurchase = async () => {
    const product = {
      id: 'prod-123',
      name: 'BM Account Verified',
      price: 50000
    };

    // Track purchase start
    trackPurchaseStart(product.id, product.name, product.price);

    // Simulate purchase process
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track successful purchase
      trackPurchaseComplete(
        'txn-456',
        product.id,
        product.name,
        1,
        product.price
      );
      
      alert('Purchase completed and tracked!');
    } catch (error) {
      // Track purchase error
      trackPurchaseError(product.id, product.name, 'Payment failed');
      alert('Purchase failed!');
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Purchase Tracking</h3>
      <Button onClick={handlePurchase}>
        Buy Product (Tracked)
      </Button>
    </div>
  );
};

/**
 * Example 6: Navigation Tracking
 */
export const NavigationTrackingExample: React.FC = () => {
  const { trackNavigation, trackExternalLink } = useNavigationTracking();

  const handleInternalNav = () => {
    trackNavigation('/dashboard', 'sidebar');
    alert('Internal navigation tracked!');
  };

  const handleExternalLink = () => {
    trackExternalLink('https://example.com', 'Help Center');
    window.open('https://example.com', '_blank');
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Navigation Tracking</h3>
      <div className="space-x-2">
        <Button onClick={handleInternalNav}>
          Go to Dashboard
        </Button>
        <Button onClick={handleExternalLink} variant="outline">
          External Link
        </Button>
      </div>
    </div>
  );
};

/**
 * Example 7: Modal Tracking
 */
export const ModalTrackingExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackModalOpen, trackModalClose, trackModalAction } = useModalTracking('Example Modal');

  const handleOpen = () => {
    setIsOpen(true);
    trackModalOpen();
  };

  const handleClose = () => {
    setIsOpen(false);
    trackModalClose('button');
  };

  const handleAction = () => {
    trackModalAction('confirm');
    handleClose();
    alert('Modal action tracked!');
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Modal Tracking</h3>
      <Button onClick={handleOpen}>
        Open Modal (Tracked)
      </Button>
      
      <Modal isOpen={isOpen} onClose={handleClose} title="Example Modal">
        <div className="space-y-4">
          <p>This modal tracks open, close, and action events.</p>
          <div className="flex gap-2">
            <Button onClick={handleAction}>
              Confirm (Tracked)
            </Button>
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * Example 8: Filter/Sort Tracking
 */
export const FilterTrackingExample: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const { trackFilterChange, trackSortChange } = useFilterTracking('Product List');

  const handleFilterChange = (value: string) => {
    setFilter(value);
    trackFilterChange('category', value);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    trackSortChange('date', value);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Filter/Sort Tracking</h3>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium mb-1">Filter:</label>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="new">New</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sort:</label>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Complete Analytics Examples Showcase
 */
export const AnalyticsExamples: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Tracking Examples</h1>
        <p className="text-gray-600">
          Open the browser console to see analytics events being logged.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BasicEventExample />
        <ButtonTrackingExample />
        <FormTrackingExample />
        <SearchTrackingExample />
        <PurchaseTrackingExample />
        <NavigationTrackingExample />
        <ModalTrackingExample />
        <FilterTrackingExample />
      </div>
    </div>
  );
};

export default AnalyticsExamples;
