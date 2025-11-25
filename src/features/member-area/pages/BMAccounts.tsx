import React, { useMemo, useEffect, useState } from 'react';
import { Package, TrendingUp, CheckCircle, Layers } from 'lucide-react';
import { FaMeta } from 'react-icons/fa6';
import SummaryCard from '../components/dashboard/SummaryCard';
import CategoryTabs from '../components/products/CategoryTabs';
import SearchSortBar, { SortOption } from '../components/products/SearchSortBar';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../../../shared/components/Pagination';
import { useProducts, useProductStats } from '../hooks/useProducts';
import { usePurchase } from '../hooks/usePurchase';
import { useCategories } from '../hooks/useCategories';
import { ProductCategory, Product } from '../types/product';
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

  // Fetch categories from Supabase
  const { data: categories } = useCategories({ 
    productType: 'bm_account' 
  });

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

  // Get category slug for filtering (null if 'all' is selected)
  const categorySlug = useMemo(() => {
    return activeCategory !== 'all' ? activeCategory : undefined;
  }, [activeCategory]);

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts({
    category: ProductCategory.BM,
    categorySlug: categorySlug,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize,
  } as any);

  // Debug logging
  console.log('BMAccounts Debug:', {
    activeCategory,
    categorySlug,
    searchQuery,
    sortBy,
    sortOrder,
    currentPage,
    isLoading: isLoadingProducts,
    error: productsError,
    productsData,
    productsCount: productsData?.data?.length,
    categoriesCount: categories?.length
  });

  // Fetch product stats
  const { data: stats } = useProductStats(ProductCategory.BM);

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

  const handlePurchaseConfirm = async (quantity: number) => {
    if (!selectedProduct) return;

    await purchaseMutation.mutateAsync(
      { productId: selectedProduct.id, quantity },
      {
        onSuccess: (response) => {
          setIsPurchaseModalOpen(false);
          setSelectedProduct(null);
          alert(`Purchase successful! Transaction ID: ${response.transactionId}`);
        },
        onError: (error) => {
          alert(`Purchase failed: ${error.message}`);
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



  // Build category tabs from Supabase data
  const categoryTabs = useMemo(() => {
    if (!categories) return [{ id: 'all', label: 'All Accounts', icon: Layers }];
    
    return [
      { id: 'all', label: 'All Accounts', icon: Layers },
      ...categories.map(cat => ({
        id: cat.slug,
        label: cat.name,
        icon: FaMeta,
      }))
    ];
  }, [categories]);

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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <SummaryCard
          icon={Package}
          value={stats?.totalStock || 0}
          label="Available Stock"
          bgColor="bg-primary-50"
        />
        <SummaryCard
          icon={TrendingUp}
          value={`${stats?.successRate || 0}%`}
          label="Success Rate"
          subInfo={{
            text: 'High quality accounts',
            color: 'green',
          }}
          bgColor="bg-green-50"
        />
        <SummaryCard
          icon={CheckCircle}
          value={stats?.totalSold || 0}
          label="Total Sold"
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
      <SearchSortBar
        searchValue={searchQuery}
        sortValue={sortValue}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Search BM accounts..."
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

export default BMAccounts;

