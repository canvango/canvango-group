import React, { useState, useMemo } from 'react';
import {
  CubeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  RectangleGroupIcon,
  ClockIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES
// ============================================================================

interface Product {
  id: string;
  category: string;
  type: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  features: string[];
  age: 'old' | 'new';
}

interface SummaryCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string | number;
  label: string;
  subInfo?: {
    text: string;
    color: 'green' | 'blue' | 'orange' | 'red';
  };
  bgColor: string;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, subInfo, bgColor }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-white bg-opacity-50 flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      {subInfo && (
        <div className={`text-xs font-medium ${colorClasses[subInfo.color]}`}>
          {subInfo.text}
        </div>
      )}
    </div>
  );
};

const CategoryTabs: React.FC<{
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-2 min-w-max pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                inline-flex items-center px-4 py-2.5 rounded-full font-medium text-sm min-h-[44px]
                transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ProductCard: React.FC<{
  product: Product;
  onBuy: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}> = ({ product, onBuy, onViewDetails }) => {
  const isOutOfStock = product.stock === 0;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 pb-2">
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
          product.age === 'old' 
            ? 'bg-amber-100 text-amber-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {product.age === 'old' ? 'AKUN LAMA' : 'AKUN BARU'}
        </span>
      </div>

      <div className="flex justify-center py-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      </div>

      <div className="px-4 pb-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {product.description}
        </p>

        <div className="mb-3">
          <p className="text-2xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex items-center mb-4">
          <div className={`w-2 h-2 rounded-full mr-2 ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className={`text-sm ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {isOutOfStock ? 'Sold Out' : `Stok: ${product.stock}`}
          </span>
        </div>

        <div className="space-y-2">
          {isOutOfStock ? (
            <button
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md font-medium cursor-not-allowed opacity-60"
              disabled
            >
              Sold Out
            </button>
          ) : (
            <button
              className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-md font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all"
              onClick={() => onBuy(product.id)}
            >
              Beli
            </button>
          )}
          
          <button
            className="w-full px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition-all"
            onClick={() => onViewDetails(product.id)}
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchSortBar: React.FC<{
  searchValue: string;
  sortValue: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}> = ({ searchValue, sortValue, onSearchChange, onSortChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari akun personal..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <div className="sm:w-48">
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="price-low">Harga: Rendah ke Tinggi</option>
          <option value="price-high">Harga: Tinggi ke Rendah</option>
          <option value="name-asc">Nama: A ke Z</option>
          <option value="name-desc">Nama: Z ke A</option>
        </select>
      </div>
    </div>
  );
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    category: 'personal',
    type: 'OLD',
    age: 'old',
    title: 'AKUN PERSONAL LAMA 2015-2018 | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun Facebook personal lama tahun 2015-2018. Sudah memiliki riwayat aktivitas dan teman yang banyak.',
    price: 75000,
    stock: 15,
    features: ['Tahun 2015-2018', 'Banyak teman', 'Riwayat aktif']
  },
  {
    id: '2',
    category: 'personal',
    type: 'OLD',
    age: 'old',
    title: 'AKUN PERSONAL LAMA 2012-2014 | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun Facebook personal sangat lama tahun 2012-2014. Akun premium dengan trust score tinggi.',
    price: 150000,
    stock: 8,
    features: ['Tahun 2012-2014', 'Trust score tinggi', 'Premium']
  },
  {
    id: '3',
    category: 'personal',
    type: 'NEW',
    age: 'new',
    title: 'AKUN PERSONAL BARU 2024 | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun Facebook personal baru tahun 2024. Fresh dan siap digunakan untuk berbagai keperluan.',
    price: 35000,
    stock: 25,
    features: ['Tahun 2024', 'Fresh', 'Siap pakai']
  },
  {
    id: '4',
    category: 'personal',
    type: 'NEW',
    age: 'new',
    title: 'AKUN PERSONAL BARU VERIFIED | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun Facebook personal baru dengan verifikasi email dan nomor telepon.',
    price: 50000,
    stock: 20,
    features: ['Verified', 'Email + Phone', 'Baru']
  },
  {
    id: '5',
    category: 'personal',
    type: 'OLD',
    age: 'old',
    title: 'AKUN PERSONAL LAMA 2016 INDONESIA | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun Facebook personal lama tahun 2016 dari Indonesia. Cocok untuk target market lokal.',
    price: 85000,
    stock: 12,
    features: ['Tahun 2016', 'Indonesia', 'Local market']
  },
  {
    id: '6',
    category: 'personal',
    type: 'NEW',
    age: 'new',
    title: 'AKUN PERSONAL BARU PREMIUM | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun Facebook personal baru premium dengan profile lengkap dan foto profil.',
    price: 65000,
    stock: 0,
    features: ['Premium', 'Profile lengkap', 'Foto profil']
  },
  {
    id: '7',
    category: 'personal',
    type: 'OLD',
    age: 'old',
    title: 'AKUN PERSONAL LAMA 2017 AKTIF | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun Facebook personal lama tahun 2017 dengan aktivitas posting rutin.',
    price: 95000,
    stock: 10,
    features: ['Tahun 2017', 'Aktif posting', 'Engagement tinggi']
  },
  {
    id: '8',
    category: 'personal',
    type: 'NEW',
    age: 'new',
    title: 'AKUN PERSONAL BARU BUNDLE 5 AKUN | CEK DETAIL SEBELUM MEMBELI',
    description: 'Paket 5 akun Facebook personal baru. Hemat dan cocok untuk kebutuhan banyak akun.',
    price: 150000,
    stock: 18,
    features: ['5 Akun', 'Bundle', 'Hemat']
  },
];

const CATEGORY_TABS: Tab[] = [
  { id: 'all', label: 'Semua Akun', icon: RectangleGroupIcon },
  { id: 'old', label: 'Akun Lama', icon: ClockIcon },
  { id: 'new', label: 'Akun Baru', icon: SparklesIcon },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AkunPersonal: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortValue, setSortValue] = useState('newest');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = MOCK_PRODUCTS;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.age === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortValue) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return sorted;
  }, [activeCategory, searchQuery, sortValue]);

  const handleBuy = (productId: string) => {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product) {
      alert(`Membeli: ${product.title}\nHarga: Rp ${product.price.toLocaleString('id-ID')}\n\nSilakan hubungi admin untuk melanjutkan pembelian.`);
    }
  };

  const handleViewDetails = (productId: string) => {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product) {
      alert(`Detail Produk:\n\nNama: ${product.title}\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nStok: ${product.stock}\n\nFitur:\n${product.features.join('\n')}`);
    }
  };

  // Calculate stats
  const totalStock = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stock, 0);
  const successRate = 98;
  const totalSold = 320;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Akun Personal Facebook
        </h1>
        <p className="text-gray-600">
          Jelajahi dan beli akun Personal Facebook dengan berbagai kategori usia
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
        <SummaryCard
          icon={CubeIcon}
          value={totalStock}
          label="Stok Tersedia"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={ChartBarIcon}
          value={`${successRate}%`}
          label="Tingkat Keberhasilan"
          subInfo={{
            text: 'Akun berkualitas tinggi',
            color: 'green',
          }}
          bgColor="bg-green-50"
        />
        <SummaryCard
          icon={CheckCircleIcon}
          value={totalSold}
          label="Total Terjual"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Category Filter Tabs */}
      <div>
        <CategoryTabs
          tabs={CATEGORY_TABS}
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
        />
      </div>

      {/* Search and Sort Bar */}
      <SearchSortBar
        searchValue={searchQuery}
        sortValue={sortValue}
        onSearchChange={setSearchQuery}
        onSortChange={setSortValue}
      />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={handleBuy}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CubeIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak Ada Produk Ditemukan
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Kami tidak dapat menemukan produk yang sesuai dengan kriteria Anda. Coba sesuaikan filter atau kata kunci pencarian.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AkunPersonal;
