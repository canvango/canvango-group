/**
 * SelectDropdown Usage Examples
 * 
 * This file demonstrates practical usage of the SelectDropdown component
 * in real-world scenarios within the member area.
 */

import React, { useState } from 'react';
import SelectDropdown from './SelectDropdown';
import type { SelectOption } from './SelectDropdown';
import { TrendingUp, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * Example 1: Transaction Filter Dropdown
 * Used in Transaction History page to filter by warranty status
 */
export const TransactionFilterExample: React.FC = () => {
  const [warrantyFilter, setWarrantyFilter] = useState('');

  const warrantyOptions: SelectOption[] = [
    { value: 'all', label: 'Semua Garansi' },
    { value: 'active', label: 'Garansi Aktif', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
    { value: 'expired', label: 'Garansi Habis', icon: <XCircle className="w-4 h-4 text-red-500" /> },
    { value: 'expiring-soon', label: 'Akan Habis', icon: <Clock className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <div className="max-w-md">
      <SelectDropdown
        label="Filter Garansi"
        options={warrantyOptions}
        value={warrantyFilter}
        onChange={setWarrantyFilter}
        onClear={() => setWarrantyFilter('')}
        clearable
        placeholder="Pilih status garansi"
        helperText="Filter transaksi berdasarkan status garansi"
      />
    </div>
  );
};

/**
 * Example 2: Sort Dropdown
 * Used in product pages to sort products
 */
export const ProductSortExample: React.FC = () => {
  const [sortBy, setSortBy] = useState('newest');

  const sortOptions: SelectOption[] = [
    { value: 'newest', label: 'Terbaru', icon: <Calendar className="w-4 h-4" /> },
    { value: 'oldest', label: 'Terlama', icon: <Calendar className="w-4 h-4" /> },
    { value: 'price-low', label: 'Harga Terendah', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'price-high', label: 'Harga Tertinggi', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'name-asc', label: 'Nama (A-Z)' },
    { value: 'name-desc', label: 'Nama (Z-A)' },
  ];

  return (
    <div className="max-w-xs">
      <SelectDropdown
        label="Urutkan"
        options={sortOptions}
        value={sortBy}
        onChange={setSortBy}
        placeholder="Pilih urutan"
      />
    </div>
  );
};

/**
 * Example 3: Country Selector with Search
 * Used in forms where user needs to select from many options
 */
export const CountrySelectorExample: React.FC = () => {
  const [country, setCountry] = useState('');

  const countryOptions: SelectOption[] = [
    { value: 'id', label: 'Indonesia' },
    { value: 'my', label: 'Malaysia' },
    { value: 'sg', label: 'Singapore' },
    { value: 'th', label: 'Thailand' },
    { value: 'ph', label: 'Philippines' },
    { value: 'vn', label: 'Vietnam' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'jp', label: 'Japan' },
    { value: 'kr', label: 'South Korea' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
  ];

  return (
    <div className="max-w-md">
      <SelectDropdown
        label="Negara"
        options={countryOptions}
        value={country}
        onChange={setCountry}
        searchable
        placeholder="Cari negara..."
        helperText="Ketik untuk mencari negara"
        required
      />
    </div>
  );
};

/**
 * Example 4: Payment Method Selector
 * Used in Top Up page with custom rendering
 */
export const PaymentMethodExample: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState('');

  const paymentOptions: SelectOption[] = [
    {
      value: 'qris',
      label: 'QRIS',
      description: 'Scan QR untuk bayar',
      icon: <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-xs font-bold">QR</div>,
    },
    {
      value: 'bca',
      label: 'BCA Virtual Account',
      description: 'Transfer ke VA BCA',
      icon: <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">BCA</div>,
    },
    {
      value: 'mandiri',
      label: 'Mandiri Virtual Account',
      description: 'Transfer ke VA Mandiri',
      icon: <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">MDR</div>,
    },
    {
      value: 'bni',
      label: 'BNI Virtual Account',
      description: 'Transfer ke VA BNI',
      icon: <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">BNI</div>,
    },
  ];

  const renderPaymentOption = (option: SelectOption) => (
    <div className="flex items-center gap-3">
      {option.icon}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{option.label}</div>
        {option.description && (
          <div className="text-xs text-gray-500">{option.description}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-md">
      <SelectDropdown
        label="Metode Pembayaran"
        options={paymentOptions}
        value={paymentMethod}
        onChange={setPaymentMethod}
        renderOption={renderPaymentOption}
        placeholder="Pilih metode pembayaran"
        required
      />
    </div>
  );
};

/**
 * Example 5: Form with Validation
 * Shows error state and required field
 */
export const FormValidationExample: React.FC = () => {
  const [category, setCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categoryOptions: SelectOption[] = [
    { value: 'bm-verified', label: 'BM Verified' },
    { value: 'bm-limit-250', label: 'BM Limit 250$' },
    { value: 'personal-old', label: 'Personal Old' },
    { value: 'personal-new', label: 'Personal New' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (category) {
      alert(`Selected: ${category}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <SelectDropdown
        label="Kategori Produk"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
        placeholder="Pilih kategori"
        required
        error={submitted && !category ? 'Kategori harus dipilih' : undefined}
        helperText="Pilih kategori produk yang ingin Anda beli"
      />
      
      <button
        type="submit"
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Submit
      </button>
    </form>
  );
};

/**
 * Example 6: Disabled State
 * Shows how to disable the select
 */
export const DisabledExample: React.FC = () => {
  const options: SelectOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  return (
    <div className="max-w-md">
      <SelectDropdown
        label="Disabled Select"
        options={options}
        value="1"
        onChange={() => {}}
        disabled
        helperText="This select is disabled"
      />
    </div>
  );
};

/**
 * Complete Demo Component
 * Shows all examples together
 */
export const SelectDropdownDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SelectDropdown Usage Examples
        </h1>
        <p className="text-gray-600">
          Practical examples of SelectDropdown component in real-world scenarios
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          1. Transaction Filter
        </h2>
        <p className="text-gray-600">
          Filter transactions by warranty status with icons
        </p>
        <TransactionFilterExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          2. Product Sort
        </h2>
        <p className="text-gray-600">
          Sort products by various criteria
        </p>
        <ProductSortExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          3. Country Selector with Search
        </h2>
        <p className="text-gray-600">
          Searchable dropdown for long lists
        </p>
        <CountrySelectorExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          4. Payment Method with Custom Rendering
        </h2>
        <p className="text-gray-600">
          Custom option rendering with icons and descriptions
        </p>
        <PaymentMethodExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          5. Form Validation
        </h2>
        <p className="text-gray-600">
          Required field with error handling
        </p>
        <FormValidationExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          6. Disabled State
        </h2>
        <p className="text-gray-600">
          Disabled select example
        </p>
        <DisabledExample />
      </section>
    </div>
  );
};

export default SelectDropdownDemo;
