import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, CheckCircle } from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import CategoryTabs from '../components/products/CategoryTabs';
import SearchSortBar, { SortOption } from '../components/products/SearchSortBar';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../../../shared/components/Pagination';
import { useProducts } from '../hooks/useProducts';
import { usePurchase } from '../hooks/usePurchase';
import { useBMStats } from '../hooks/useBMStats';
import { ProductCategory, Product } from '../types/product';
import { BM_CATEGORIES, getBMCategoryTabs } from '../config/bm-categories.config';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePersistedFilters } from '../../../shared/hooks/usePersistedFilters';
import PurchaseModal from '../components/products/PurchaseModal';

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const BMAccounts: React.FC = () => {
  usePageTitle('BM Accounts');
  const navigate = useNavigate();
  
  // Persisted filters
  const { filters, setFilter, setFilters } = usePersistedFilters('bm-accounts', {
    category: 'all',
    search: '',
    sort: 'newest',
    page: 1,
  });

  // Purchase modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Extract filter values
  const activeCategory = filters.category;
  const searchQuery = filters.search;
  const sortValue = filters.sort;
  const currentPage = filters.page;
  const pageSize = 12;

  // Debug: Monitor activeCategory changes
  useEffect(() => {
    console.log('activeCategory changed to:', activeCategory);
  }, [activeCategory]);

  // Parse sort value
  const { sortBy, sortOrder } = useMemo(() => {
    switch (sortValue) {
      case 'newest':
        return { sortBy: 'date' as const, sortOrder: 'desc' as const };
      case 'oldest':
        return { sortBy: 'date' as const, sortOrder: 'asc' as const };
      case 'price-low':
        return { sortBy: 'price' as const, sortOrder: 'asc' as const };
      case 'price-high':
        return { sortBy: 'price' as const, sortOrder: 'desc' as const };
      case 'name-asc':
        return { sortBy: 'name' as const, sortOrder: 'asc' as const };
      case 'name-desc':
        return { sortBy: 'name' as const, sortOrder: 'desc' as const };
      default:
        return { sortBy: 'date' as const, sortOrder: 'desc' as const };
    }
  }, [sortValue]);

  // Get product type from active category
  const productType = useMemo(() => {
    const category = BM_CATEGORIES.find((cat) => cat.id === activeCategory);
    return category?.type;
  }, [activeCategory]);

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useProducts({
    category: ProductCategory.BM,
    type: productType,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize,
  });

  // Debug logging
  console.log('BMAccounts Debug:', {
    activeCategory,
    productType,
    searchQuery,
    sortBy,
    sortOrder,
    currentPage,
    isLoading: isLoadingProducts,
    error: productsError,
    productsData,
    productsCount: productsData?.data?.length
  });

  // Fetch BM statistics from Supabase (real-time data)
  const { data: stats, isLoading: isLoadingStats } = useBMStats();

  // Purchase mutation
  const purchaseMutation = usePurchase();



  // Handlers
  const handleCategoryChange = (categoryId: string) => {
    console.log('handleCategoryChange called with:', categoryId);
    console.log('Current activeCategory:', activeCategory);
    setFilters({ category: categoryId, page: 1 });
    console.log('After setFilters, activeCategory should be:', categoryId);
  };

  const handleSearchChange = (value: string) => {
    setFilters({ search: value, page: 1 });
  };

  const handleSortChange = (value: string) => {
    setFilters({ sort: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilter('page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (productId: string) => {
    // Modal is now handled by ProductGrid
    console.log('View details for product:', productId);
  };

  const handleBuy = (productId: string) => {
    const product = productsData?.data.find((p) => p.id === productId);
    if (!product) return;

    setSelectedProduct(product);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseConfirm = (quantity: number) => {
    if (!selectedProduct) return;
    
    // Prevent double submission
    if (purchaseMutation.isPending) {
      console.warn('Purchase already in progress, ignoring duplicate request');
      return;
    }

    // Use mutate instead of mutateAsync to avoid race conditions
    purchaseMutation.mutate(
      { productId: selectedProduct.id, quantity },
      {
        onSuccess: (response) => {
          setIsPurchaseModalOpen(false);
          setSelectedProduct(null);
          
          // Redirect immediately without alert to prevent timing issues
          // Alert can cause component unmount during navigation
          navigate('/riwayat-transaksi');
        },
        onError: (error) => {
          alert(`❌ Pembelian gagal: ${error.message}`);
        },
      }
    );
  };

  const handlePurchaseModalClose = () => {
    if (!purchaseMutation.isPending) {
      setIsPurchaseModalOpen(false);
      setSelectedProduct(null);
    }
  };



  // Get category tabs
  const categoryTabs = getBMCategoryTabs();

  return (
    <div className="space-y-3 md:space-y-5">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          Business Manager Accounts
        </h1>
        <p className="text-xs md:text-sm text-gray-600">
          Browse and purchase Business Manager accounts with various specifications
        </p>
      </div>

      {/* Summary Cards - Integrated with Supabase */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <SummaryCard
          icon={Package}
          value={isLoadingStats ? '...' : stats?.totalStock || 0}
          label="Available Stock"
          bgColor="bg-primary-50"
        />
        <SummaryCard
          icon={TrendingUp}
          value={isLoadingStats ? '...' : `${stats?.successRate || 0}%`}
          label="Success Rate"
          subInfo={{
            text: 'High quality accounts',
            color: 'green',
          }}
          bgColor="bg-green-50"
        />
        <SummaryCard
          icon={CheckCircle}
          value={isLoadingStats ? '...' : stats?.totalSoldThisMonth || 0}
          label="Total Sold"
          subInfo={{
            text: 'This month',
            color: 'orange',
          }}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Category Filter Tabs */}
      <div>
        <CategoryTabs
          tabs={categoryTabs}
          activeTab={activeCategory}
          onTabChange={handleCategoryChange}
        />
      </div>

      {/* Search and Sort Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchSortBar
            searchValue={searchQuery}
            sortValue={sortValue}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            sortOptions={SORT_OPTIONS}
            searchPlaceholder="Search BM accounts..."
            resultCount={searchQuery ? productsData?.pagination.total : undefined}
          />
        </div>
        <button
          onClick={() => refetchProducts()}
          className="px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
          title="Refresh stock data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={productsData?.data || []}
        isLoading={isLoadingProducts}
        onBuy={handleBuy}
        onViewDetails={handleViewDetails}
      />

      {/* Pagination */}
      {productsData && productsData.pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={productsData.pagination.totalPages}
          pageSize={productsData.pagination.pageSize}
          totalItems={productsData.pagination.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* Purchase Modal */}
      {selectedProduct && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={handlePurchaseModalClose}
          product={selectedProduct}
          onConfirm={handlePurchaseConfirm}
          isProcessing={purchaseMutation.isPending}
        />
      )}
    </div>
  );
};

export default BMAccounts;
