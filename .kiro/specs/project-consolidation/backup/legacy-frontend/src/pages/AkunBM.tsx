import React, { useState, useMemo } from 'react';
import {
  CubeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  RectangleGroupIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  category: string;
  type: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  features: string[];
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

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, value, label, subInfo, bgColor }) => {
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
        <div className={`text-xs font-medium text-${subInfo.color}-600`}>
          {subInfo.text}
        </div>
      )}
    </div>
  );
};

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface CategoryTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ tabs, activeTab, onTabChange }) => {
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

interface ProductCardProps {
  product: Product;
  onBuy: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, onViewDetails }) => {
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
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          {product.type}
        </span>
      </div>

      <div className="flex justify-center py-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <CubeIcon className="w-8 h-8 text-indigo-600" />
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
            {isOutOfStock ? 'Sold Out' : `Stock: ${product.stock}`}
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

interface SearchSortBarProps {
  searchValue: string;
  sortValue: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const SearchSortBar: React.FC<SearchSortBarProps> = ({
  searchValue,
  sortValue,
  onSearchChange,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari akun BM..."
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

// Mock data - replace with actual API calls
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    category: 'bm',
    type: 'BM VERIFIED',
    title: 'BM TUA VERIFIED | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM Tua dengan status verified. Sudah terverifikasi dan siap digunakan untuk kampanye iklan.',
    price: 200000,
    stock: 5,
    features: ['Verified', 'Old Account', 'Ready to use']
  },
  {
    id: '2',
    category: 'bm',
    type: 'BM WHATSAPP API',
    title: 'AKUN BM VERIFIED SUPPORT WHATSAPP API | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM dengan dukungan WhatsApp API. Cocok untuk bisnis yang membutuhkan integrasi WhatsApp.',
    price: 450000,
    stock: 3,
    features: ['WhatsApp API', 'Verified', 'Business Support']
  },
  {
    id: '3',
    category: 'bm',
    type: 'BM50',
    title: 'BM 50 NEW INDONESIA | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM 50 baru dari Indonesia. Limit $50 untuk memulai kampanye iklan Anda.',
    price: 95000,
    stock: 10,
    features: ['$50 Limit', 'New Account', 'Indonesia']
  },
  {
    id: '4',
    category: 'bm',
    type: 'BM VERIFIED',
    title: 'BM NEW VERIFIED PT/CV | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM baru dengan verifikasi PT/CV. Cocok untuk perusahaan yang membutuhkan akun terverifikasi.',
    price: 100000,
    stock: 8,
    features: ['PT/CV Verified', 'New Account', 'Corporate']
  },
  {
    id: '5',
    category: 'bm',
    type: 'BM LIMIT 250$',
    title: 'BM NEW VIETNAM VERIFIED | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM baru dari Vietnam dengan limit $250. Sudah terverifikasi dan siap pakai.',
    price: 95000,
    stock: 0,
    features: ['$250 Limit', 'Vietnam', 'Verified']
  },
  {
    id: '6',
    category: 'bm',
    type: 'BM VERIFIED',
    title: 'BM TUA VERIFIED PT/CV | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM tua dengan verifikasi PT/CV. Memiliki riwayat yang baik dan limit tinggi.',
    price: 150000,
    stock: 4,
    features: ['Old Account', 'PT/CV', 'High Limit']
  },
  {
    id: '7',
    category: 'bm',
    type: 'BM LIMIT 250$',
    title: 'BM LIMIT 250$ VERIFIED | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM dengan limit $250 yang sudah terverifikasi. Siap untuk kampanye iklan skala menengah.',
    price: 400000,
    stock: 6,
    features: ['$250 Limit', 'Verified', 'Mid-scale']
  },
  {
    id: '8',
    category: 'bm',
    type: 'BM LIMIT 140',
    title: 'BM LIMIT 140 250$ | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM dengan limit 140-250$. Cocok untuk bisnis yang sedang berkembang.',
    price: 700000,
    stock: 2,
    features: ['$140-250 Limit', 'Growing Business', 'Flexible']
  },
  {
    id: '9',
    category: 'bm',
    type: 'BM TUA VERIFIED',
    title: 'BM5 TUA LIMIT 250$ | CEK DETAIL SEBELUM MEMBELI',
    description: 'Akun BM tua dengan limit $250. Memiliki riwayat yang baik dan stabil.',
    price: 205000,
    stock: 7,
    features: ['$250 Limit', 'Old Account', 'Stable']
  },
  {
    id: '10',
    category: 'bm',
    type: 'BM50 NEW + 250PERSONAL TUA',
    title: 'BM50 NEW + 250PERSONAL TUA | CEK DETAIL SEBELUM MEMBELI',
    description: 'Paket BM50 baru dengan 250 akun personal tua. Cocok untuk kampanye besar.',
    price: 125000,
    stock: 12,
    features: ['BM50', '250 Personal', 'Package Deal']
  },
];

const CATEGORY_TABS: Tab[] = [
  { id: 'all', label: 'Semua Akun', icon: RectangleGroupIcon },
  { id: 'verified', label: 'BM Verified', icon: CheckCircleIcon },
  { id: 'limit-250', label: 'BM Limit 250$', icon: CurrencyDollarIcon },
  { id: 'bm50', label: 'BM50', icon: ChartBarIcon },
  { id: 'whatsapp-api', label: 'BM WhatsApp API', icon: ChatBubbleLeftRightIcon },
  { id: 'limit-140', label: 'BM 140 Limit', icon: DevicePhoneMobileIcon },
];

const AkunBM: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortValue, setSortValue] = useState('newest');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = MOCK_PRODUCTS;

    // Filter by category
    if (activeCategory !== 'all') {
      const categoryMap: Record<string, string> = {
        'verified': 'BM VERIFIED',
        'limit-250': 'BM LIMIT 250$',
        'bm50': 'BM50',
        'whatsapp-api': 'BM WHATSAPP API',
        'limit-140': 'BM LIMIT 140',
      };
      filtered = filtered.filter(p => p.type.includes(categoryMap[activeCategory]));
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
  const totalSold = 480;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Business Manager Facebook
        </h1>
        <p className="text-gray-600">
          Jelajahi dan beli akun Business Manager dengan berbagai spesifikasi
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

export default AkunBM;
