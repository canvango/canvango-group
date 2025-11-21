import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, CheckCircle } from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import CategoryTabs from '../components/products/CategoryTabs';
import SearchSortBar, { SortOption } from '../components/products/SearchSortBar';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../../../shared/components/Pagination';
import { useProducts } from '../hooks/useProducts';
import { usePurchase } from '../hooks/usePurchase';
import { usePersonalStats } from '../hooks/usePersonalStats';
import { ProductCategory, Product } from '../types/product';
import { PERSONAL_TYPES, getPersonalTypeTabs } from '../config/personal-types.config';
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

const PersonalAccounts: React.FC = () => {
  usePageTitle('Personal Accounts');
  const navigate = useNavigate();
  
  // Persisted filters
  const { filters, setFilter, setFilters } = usePersistedFilters('personal-accounts', {
    type: 'all',
    search: '',
    sort: 'newest',
    page: 1,
  });

  // Purchase modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Extract filter values
  const activeType = filters.type;
  const searchQuery = filters.search;
  const sortValue = filters.sort;
  const currentPage = filters.page;
  const pageSize = 12;

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

  // Get product type from active type
  const productType = useMemo(() => {
    const type = PERSONAL_TYPES.find((t) => t.id === activeType);
    return type?.type;
  }, [activeType]);

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    category: ProductCategory.PERSONAL,
    type: productType,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize,
  });

  // Fetch Personal Account statistics from Supabase (real-time data)
  const { data: stats, isLoading: isLoadingStats } = usePersonalStats();

  // Purchase mutation
  const purchaseMutation = usePurchase();



  // Handlers
  const handleTypeChange = (typeId: string) => {
    setFilters({ type: typeId, page: 1 });
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



  // Get type tabs
  const typeTabs = getPersonalTypeTabs();

  return (
    <div className="space-y-3 md:space-y-5">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          Personal Facebook Accounts
        </h1>
        <p className="text-xs md:text-sm text-gray-600">
          Browse and purchase Personal Facebook accounts with different age categories
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

      {/* Type Filter Tabs */}
      <div>
        <CategoryTabs
          tabs={typeTabs}
          activeTab={activeType}
          onTabChange={handleTypeChange}
        />
      </div>

      {/* Search and Sort Bar */}
      <SearchSortBar
        searchValue={searchQuery}
        sortValue={sortValue}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search Personal accounts..."
        resultCount={searchQuery ? productsData?.pagination.total : undefined}
      />

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

export default PersonalAccounts;
