import React, { useState, useMemo } from 'react';
import {
  BookOpenIcon,
  RocketLaunchIcon,
  UserIcon,
  CreditCardIcon,
  CodeBracketIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Types
enum TutorialCategory {
  GETTING_STARTED = 'getting-started',
  ACCOUNT = 'account',
  TRANSACTION = 'transaction',
  API = 'api',
  TROUBLESHOOT = 'troubleshoot'
}

interface Tutorial {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: TutorialCategory;
  readTime: number;
  thumbnail?: string;
}

// Mock Data
const mockTutorials: Tutorial[] = [
  {
    id: '1',
    slug: 'cara-membuat-akun',
    title: 'Cara Membuat Akun di Canvango Group',
    content: 'Panduan lengkap untuk membuat akun baru di platform Canvango Group. Ikuti langkah-langkah mudah untuk memulai perjalanan Anda.',
    category: TutorialCategory.GETTING_STARTED,
    readTime: 5
  },
  {
    id: '2',
    slug: 'cara-membeli-akun-bm',
    title: 'Cara Membeli Akun Business Manager',
    content: 'Pelajari cara membeli akun Business Manager dengan mudah. Tutorial step-by-step dari pemilihan produk hingga pembayaran.',
    category: TutorialCategory.ACCOUNT,
    readTime: 8
  },
  {
    id: '3',
    slug: 'cara-top-up-saldo',
    title: 'Cara Top Up Saldo Akun',
    content: 'Panduan lengkap untuk melakukan top up saldo menggunakan berbagai metode pembayaran yang tersedia.',
    category: TutorialCategory.TRANSACTION,
    readTime: 6
  },
  {
    id: '4',
    slug: 'menggunakan-api',
    title: 'Menggunakan API Canvango Group',
    content: 'Pelajari cara mengintegrasikan API Canvango Group ke dalam aplikasi Anda. Termasuk autentikasi dan contoh penggunaan.',
    category: TutorialCategory.API,
    readTime: 15
  },
  {
    id: '5',
    slug: 'mengatasi-masalah-login',
    title: 'Mengatasi Masalah Login',
    content: 'Solusi untuk berbagai masalah login yang mungkin Anda hadapi, termasuk lupa password dan akun terkunci.',
    category: TutorialCategory.TROUBLESHOOT,
    readTime: 7
  },
  {
    id: '6',
    slug: 'memahami-garansi',
    title: 'Memahami Sistem Garansi',
    content: 'Penjelasan lengkap tentang sistem garansi produk, cara klaim, dan syarat & ketentuan yang berlaku.',
    category: TutorialCategory.GETTING_STARTED,
    readTime: 10
  },
  {
    id: '7',
    slug: 'cara-claim-garansi',
    title: 'Cara Mengajukan Klaim Garansi',
    content: 'Tutorial step-by-step untuk mengajukan klaim garansi produk yang bermasalah.',
    category: TutorialCategory.ACCOUNT,
    readTime: 8
  },
  {
    id: '8',
    slug: 'riwayat-transaksi',
    title: 'Melihat Riwayat Transaksi',
    content: 'Pelajari cara melihat dan mengelola riwayat transaksi Anda, termasuk filter dan export data.',
    category: TutorialCategory.TRANSACTION,
    readTime: 5
  },
  {
    id: '9',
    slug: 'api-authentication',
    title: 'API Authentication & Security',
    content: 'Panduan keamanan API termasuk cara menggunakan API key dengan aman dan best practices.',
    category: TutorialCategory.API,
    readTime: 12
  },
  {
    id: '10',
    slug: 'troubleshoot-payment',
    title: 'Mengatasi Masalah Pembayaran',
    content: 'Solusi untuk berbagai masalah pembayaran seperti transaksi gagal, pending, atau tidak terdeteksi.',
    category: TutorialCategory.TROUBLESHOOT,
    readTime: 9
  },
  {
    id: '11',
    slug: 'verified-bm-service',
    title: 'Layanan Verified BM',
    content: 'Panduan lengkap tentang layanan verifikasi Business Manager dan cara menggunakannya.',
    category: TutorialCategory.ACCOUNT,
    readTime: 10
  },
  {
    id: '12',
    slug: 'akun-personal-vs-bm',
    title: 'Perbedaan Akun Personal dan BM',
    content: 'Memahami perbedaan antara akun personal Facebook dan Business Manager, serta kapan menggunakan masing-masing.',
    category: TutorialCategory.GETTING_STARTED,
    readTime: 7
  }
];

// Category Labels & Colors
const categoryLabels: Record<TutorialCategory, string> = {
  [TutorialCategory.GETTING_STARTED]: 'Memulai',
  [TutorialCategory.ACCOUNT]: 'Akun',
  [TutorialCategory.TRANSACTION]: 'Transaksi',
  [TutorialCategory.API]: 'API',
  [TutorialCategory.TROUBLESHOOT]: 'Troubleshoot'
};

const categoryColors: Record<TutorialCategory, string> = {
  [TutorialCategory.GETTING_STARTED]: 'bg-green-100 text-green-800',
  [TutorialCategory.ACCOUNT]: 'bg-blue-100 text-blue-800',
  [TutorialCategory.TRANSACTION]: 'bg-gray-100 text-gray-800',
  [TutorialCategory.API]: 'bg-yellow-100 text-yellow-800',
  [TutorialCategory.TROUBLESHOOT]: 'bg-red-100 text-red-800'
};

// Tutorial Card Component
const TutorialCard: React.FC<{
  tutorial: Tutorial;
  onClick: (slug: string) => void;
}> = ({ tutorial, onClick }) => {
  const description = tutorial.content.substring(0, 150) + (tutorial.content.length > 150 ? '...' : '');

  return (
    <div
      onClick={() => onClick(tutorial.slug)}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {tutorial.thumbnail ? (
          <img
            src={tutorial.thumbnail}
            alt={tutorial.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpenIcon className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[tutorial.category]}`}>
            {categoryLabels[tutorial.category]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {tutorial.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Read Time */}
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>{tutorial.readTime} menit baca</span>
        </div>
      </div>
    </div>
  );
};

// Tutorial Grid Component
const TutorialGrid: React.FC<{
  tutorials: Tutorial[];
  isLoading?: boolean;
  onTutorialClick: (slug: string) => void;
}> = ({ tutorials, isLoading = false, onTutorialClick }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tutorials.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tidak ada tutorial ditemukan
        </h3>
        <p className="text-gray-600 mb-4">
          Coba ubah filter atau kata kunci pencarian Anda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutorials.map((tutorial) => (
        <TutorialCard
          key={tutorial.id}
          tutorial={tutorial}
          onClick={onTutorialClick}
        />
      ))}
    </div>
  );
};

// Category Tabs Component
const TutorialCategoryTabs: React.FC<{
  activeCategory: TutorialCategory | 'all';
  onCategoryChange: (category: TutorialCategory | 'all') => void;
}> = ({ activeCategory, onCategoryChange }) => {
  const categoryTabs = [
    { id: 'all', label: 'Semua', icon: BookOpenIcon, value: 'all' as const },
    { id: 'getting-started', label: 'Memulai', icon: RocketLaunchIcon, value: TutorialCategory.GETTING_STARTED },
    { id: 'account', label: 'Akun', icon: UserIcon, value: TutorialCategory.ACCOUNT },
    { id: 'transaction', label: 'Transaksi', icon: CreditCardIcon, value: TutorialCategory.TRANSACTION },
    { id: 'api', label: 'API', icon: CodeBracketIcon, value: TutorialCategory.API },
    { id: 'troubleshoot', label: 'Troubleshoot', icon: ExclamationCircleIcon, value: TutorialCategory.TROUBLESHOOT }
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-2">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.value;
          
          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors
                ${isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Search Bar Component
const TutorialSearchBar: React.FC<{
  searchValue: string;
  onSearchChange: (value: string) => void;
  resultCount?: number;
}> = ({ searchValue, onSearchChange, resultCount }) => {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari tutorial..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      {resultCount !== undefined && searchValue && (
        <p className="mt-2 text-sm text-gray-600">
          Ditemukan {resultCount} tutorial
        </p>
      )}
    </div>
  );
};

// Main Page Component
const Tutorial: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<TutorialCategory | 'all'>('all');

  // Filter tutorials
  const filteredTutorials = useMemo(() => {
    let filtered = mockTutorials;

    // Filter by search
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (tutorial) =>
          tutorial.title.toLowerCase().includes(searchLower) ||
          tutorial.content.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((tutorial) => tutorial.category === activeCategory);
    }

    return filtered;
  }, [searchValue, activeCategory]);

  const handleTutorialClick = (slug: string) => {
    alert(`Navigating to tutorial: ${slug}`);
    // In real app: navigate(`/member/tutorials/${slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpenIcon className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Pusat Tutorial</h1>
        </div>
        <p className="text-gray-600">
          Pelajari cara menggunakan platform kami dengan panduan lengkap dan tutorial step-by-step
        </p>
      </div>

      {/* Search Bar */}
      <TutorialSearchBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        resultCount={searchValue ? filteredTutorials.length : undefined}
      />

      {/* Category Tabs */}
      <TutorialCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Total Count */}
      {!searchValue && (
        <div className="text-sm text-gray-600">
          Total {filteredTutorials.length} tutorial tersedia
        </div>
      )}

      {/* Tutorial Grid */}
      <TutorialGrid
        tutorials={filteredTutorials}
        isLoading={false}
        onTutorialClick={handleTutorialClick}
      />
    </div>
  );
};

export default Tutorial;
