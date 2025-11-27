import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, EyeIcon, CheckCircleIcon, XCircleIcon, TagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabase';
import { productsService } from '../../services/products.service';
import ProductDetailModal from './ProductDetailModal';
import CategoryManagementModal from '../../components/admin/CategoryManagementModal';
import { DynamicDetailFields, DetailField } from '../../components/products/DynamicDetailFields';
import { useSessionRefresh } from '../../hooks/useSessionRefresh';

interface Product {
  id: string;
  product_name: string;
  product_type: 'bm_account' | 'personal_account' | 'verified_bm' | 'api';
  category: string;
  description: string | null;
  price: number;
  stock_status: 'available' | 'out_of_stock';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ad_limit?: string | null;
  verification_status?: string | null;
  ad_account_type?: string | null;
  advantages?: string | null;
  disadvantages?: string | null;
  warranty_terms?: string | null;
  warranty_duration?: number; // Warranty duration in days
  warranty_enabled?: boolean; // Whether warranty is enabled
  detail_fields?: DetailField[];
  available_stock?: number; // Real stock from product_accounts pool
}

interface ProductFormData {
  product_name: string;
  product_type: string;
  category: string;
  description: string;
  price: string;
  stock_status: string;
  is_active: boolean;
  warranty_duration: string;
  warranty_enabled: boolean;
  ad_limit: string;
  verification_status: string;
  ad_account_type: string;
  advantages: string;
  disadvantages: string;
  warranty_terms: string;
  detail_fields: DetailField[];
}

const ProductManagement = () => {
  // Auto-refresh session to prevent token expiration
  useSessionRefresh();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string; product_type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'warranty'>('basic');
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    product_type: 'bm_account',
    category: '',
    description: '',
    price: '',
    stock_status: 'available',
    is_active: true,
    warranty_duration: '30',
    warranty_enabled: true,
    ad_limit: '',
    verification_status: '',
    ad_account_type: '',
    advantages: '',
    disadvantages: '',
    warranty_terms: '',
    detail_fields: [],
  });

  const limit = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchQuery, productTypeFilter, stockStatusFilter, activeStatusFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('slug, name, product_type')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const filters = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        product_type: productTypeFilter !== 'all' ? productTypeFilter : undefined,
        stock_status: stockStatusFilter !== 'all' ? stockStatusFilter : undefined,
        is_active: activeStatusFilter !== 'all' ? activeStatusFilter === 'active' : undefined,
      };

      console.log('📦 Fetching products with filters:', filters);
      const response = await productsService.getAll(filters);
      console.log('✅ Products fetched:', response);
      
      setProducts(response.products);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      toast.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.size === 0) {
      toast.error('Please select products and an action');
      return;
    }

    const productIds = Array.from(selectedProducts);
    
    try {
      setIsBulkProcessing(true);
      let results;

      switch (bulkAction) {
        case 'activate':
          results = await productsService.bulkUpdate(productIds, { is_active: true });
          break;
        case 'deactivate':
          results = await productsService.bulkUpdate(productIds, { is_active: false });
          break;
        case 'update_stock':
          results = await productsService.bulkUpdate(productIds, { stock_status: 'out_of_stock' });
          break;
        case 'delete':
          results = await productsService.bulkDelete(productIds);
          break;
        default:
          return;
      }

      toast.success(`Bulk action completed: ${results.success} succeeded, ${results.failed} failed`);
      
      if (results.errors.length > 0) {
        console.error('Bulk action errors:', results.errors);
      }

      setSelectedProducts(new Set());
      setBulkAction('');
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Bulk action error:', error);
      toast.error(error.message || 'Bulk action failed');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const openEditModal = (product: Product) => {
    // Reset submitting state before opening modal
    setIsSubmitting(false);
    setSelectedProduct(product);
    setFormData({
      product_name: product.product_name,
      product_type: product.product_type,
      category: product.category,
      description: product.description || '',
      price: product.price.toString(),
      stock_status: product.stock_status,
      is_active: product.is_active,
      warranty_duration: (product.warranty_duration || 30).toString(),
      warranty_enabled: product.warranty_enabled !== undefined ? product.warranty_enabled : true,
      ad_limit: product.ad_limit || '',
      verification_status: product.verification_status || '',
      ad_account_type: product.ad_account_type || '',
      advantages: product.advantages || '',
      disadvantages: product.disadvantages || '',
      warranty_terms: product.warranty_terms || '',
      detail_fields: product.detail_fields || [],
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 handleCreateProduct called');
    console.log('📋 Current form data:', formData);
    console.log('⏳ isSubmitting:', isSubmitting);
    
    if (isSubmitting) {
      console.log('⚠️ Already submitting, returning...');
      return;
    }
    
    // Validate required fields
    if (!formData.product_name || !formData.category || !formData.price) {
      console.error('❌ Validation failed: Missing required fields');
      toast.error('Please fill in all required fields (Product Name, Category, Price)');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('✅ Validation passed, creating product...');
      
      const payload = {
        product_name: formData.product_name,
        product_type: formData.product_type,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_status: formData.stock_status,
        is_active: formData.is_active,
        warranty_duration: parseInt(formData.warranty_duration),
        warranty_enabled: formData.warranty_enabled,
        ad_limit: formData.ad_limit || null,
        verification_status: formData.verification_status || null,
        ad_account_type: formData.ad_account_type || null,
        advantages: formData.advantages || null,
        disadvantages: formData.disadvantages || null,
        warranty_terms: formData.warranty_terms || null,
        detail_fields: formData.detail_fields,
      };
    
      console.log('🚀 Sending payload to API:', payload);
      
      const product = await productsService.create(payload);
      console.log('✅ Product created successfully:', product);
      
      // Close modal and reset state FIRST (don't wait for anything)
      setIsCreateModalOpen(false);
      setIsSubmitting(false);
      resetForm();
      
      // Show success message
      toast.success('Product created successfully');
      
      // Refresh products list in background (don't await)
      fetchProducts().catch(err => console.error('Failed to refresh products:', err));
    } catch (error: any) {
      console.error('❌ Error creating product:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: error
      });
      toast.error(error.message || 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 handleUpdateProduct called');
    console.log('📋 Selected product:', selectedProduct);
    console.log('📋 Current form data:', formData);
    console.log('⏳ isSubmitting:', isSubmitting);
    
    if (!selectedProduct) {
      console.error('❌ No product selected');
      toast.error('No product selected');
      return;
    }
    
    if (isSubmitting) {
      console.log('⚠️ Already submitting, returning...');
      return;
    }

    // Validate required fields
    if (!formData.product_name || !formData.category || !formData.price) {
      console.error('❌ Validation failed: Missing required fields');
      toast.error('Please fill in all required fields (Product Name, Category, Price)');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('✅ Validation passed, updating product...');
      
      const payload = {
        product_name: formData.product_name,
        product_type: formData.product_type,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_status: formData.stock_status,
        is_active: formData.is_active,
        warranty_duration: parseInt(formData.warranty_duration),
        warranty_enabled: formData.warranty_enabled,
        ad_limit: formData.ad_limit || null,
        verification_status: formData.verification_status || null,
        ad_account_type: formData.ad_account_type || null,
        advantages: formData.advantages || null,
        disadvantages: formData.disadvantages || null,
        warranty_terms: formData.warranty_terms || null,
        detail_fields: formData.detail_fields,
      };

      console.log('🚀 Sending update payload to API:', payload);
      
      const product = await productsService.update(selectedProduct.id, payload);
      console.log('✅ Product updated successfully:', product);
      
      // Close modal and reset state FIRST (don't wait for anything)
      setIsEditModalOpen(false);
      setIsSubmitting(false);
      setSelectedProduct(null);
      resetForm();
      
      // Show success message
      toast.success('Product updated successfully');
      
      // Refresh products list in background (don't await)
      fetchProducts().catch(err => console.error('Failed to refresh products:', err));
    } catch (error: any) {
      console.error('❌ Error updating product:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: error
      });
      toast.error(error.message || 'Failed to update product');
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await productsService.delete(selectedProduct.id);
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      await productsService.duplicate(product.id);
      toast.success('Product duplicated successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Error duplicating product:', error);
      toast.error(error.message || 'Failed to duplicate product');
    }
  };

  const handleQuickToggleActive = async (product: Product) => {
    try {
      await productsService.update(product.id, {
        is_active: !product.is_active
      });
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Error toggling product status:', error);
      toast.error(error.message || 'Failed to update product status');
    }
  };

  const resetForm = () => {
    setActiveTab('basic');
    setFormData({
      product_name: '',
      product_type: 'bm_account',
      category: '',
      description: '',
      price: '',
      stock_status: 'available',
      is_active: true,
      warranty_duration: '30',
      warranty_enabled: true,
      ad_limit: '',
      verification_status: '',
      ad_account_type: '',
      advantages: '',
      disadvantages: '',
      warranty_terms: '',
      detail_fields: [],
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bm_account: 'BM Account',
      personal_account: 'Personal Account',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kelola Produk</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <TagIcon className="w-5 h-5" />
            Manage Categories
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={activeStatusFilter}
          onChange={(e) => {
            setActiveStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="all">All Status</option>
          <option value="active">✅ Active Only</option>
          <option value="inactive">⭕ Inactive Only</option>
        </select>

        <select
          value={productTypeFilter}
          onChange={(e) => {
            setProductTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Product Types</option>
          <option value="bm_account">BM Account</option>
          <option value="personal_account">Personal Account</option>
        </select>

        <select
          value={stockStatusFilter}
          onChange={(e) => {
            setStockStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Stock Status</option>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedProducts.size} product(s) selected
          </span>
          <div className="flex items-center gap-3">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Action</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="update_stock">Mark Out of Stock</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || isBulkProcessing}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isBulkProcessing ? 'Processing...' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getProductTypeLabel(product.product_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {product.available_stock !== undefined ? product.available_stock : 0} akun
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full inline-block w-fit ${
                            product.stock_status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stock_status === 'available' ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openDetailModal(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View details & manage accounts"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleQuickToggleActive(product)}
                          className={product.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                          title={product.is_active ? 'Deactivate product' : 'Activate product'}
                        >
                          {product.is_active ? (
                            <XCircleIcon className="w-5 h-5" />
                          ) : (
                            <CheckCircleIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit product"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(product)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Duplicate product"
                        >
                          <DocumentDuplicateIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete product"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedProduct?.product_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Product Modal - Will be added in next part */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-xl font-bold text-gray-900">
                {isCreateModalOpen ? 'Create New Product' : 'Edit Product'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setIsSubmitting(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={isCreateModalOpen ? handleCreateProduct : handleUpdateProduct} className="p-6">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'basic'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'details'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Product Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('warranty')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'warranty'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Warranty & Terms
                </button>
              </div>

              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
                      <select
                        required
                        value={formData.product_type}
                        onChange={(e) => {
                          // Reset category when product type changes
                          setFormData({ ...formData, product_type: e.target.value, category: '' });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="bm_account">BM Account</option>
                        <option value="personal_account">Personal Account</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Product type determines which page displays this product (/akun-bm or /akun-personal)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Category --</option>
                        {categories
                          .filter(cat => cat.product_type === formData.product_type)
                          .map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Categories filtered by product type ({formData.product_type === 'bm_account' ? 'BM Account' : 'Personal Account'})
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (IDR) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status *</label>
                      <select
                        required
                        value={formData.stock_status}
                        onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="available">Available</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">Product is active</label>
                  </div>
                </div>
              )}

              {/* Product Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Limit</label>
                    <input
                      type="text"
                      value={formData.ad_limit}
                      onChange={(e) => setFormData({ ...formData, ad_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., $250/day"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                    <input
                      type="text"
                      value={formData.verification_status}
                      onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Verified, Blue Badge"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Account Type</label>
                    <input
                      type="text"
                      value={formData.ad_account_type}
                      onChange={(e) => setFormData({ ...formData, ad_account_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Business Manager, Personal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advantages</label>
                    <textarea
                      value={formData.advantages}
                      onChange={(e) => setFormData({ ...formData, advantages: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List advantages, one per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disadvantages</label>
                    <textarea
                      value={formData.disadvantages}
                      onChange={(e) => setFormData({ ...formData, disadvantages: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List disadvantages, one per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Dynamic Detail Fields</label>
                    <DynamicDetailFields
                      fields={formData.detail_fields}
                      onChange={(fields) => setFormData({ ...formData, detail_fields: fields })}
                    />
                  </div>
                </div>
              )}

              {/* Warranty Tab */}
              {activeTab === 'warranty' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Duration (days)</label>
                      <input
                        type="number"
                        value={formData.warranty_duration}
                        onChange={(e) => setFormData({ ...formData, warranty_duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center pt-7">
                      <input
                        type="checkbox"
                        checked={formData.warranty_enabled}
                        onChange={(e) => setFormData({ ...formData, warranty_enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Warranty enabled</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Terms & Conditions</label>
                    <textarea
                      value={formData.warranty_terms}
                      onChange={(e) => setFormData({ ...formData, warranty_terms: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List warranty terms, one per line"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setIsSubmitting(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (isCreateModalOpen ? 'Create Product' : 'Update Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
