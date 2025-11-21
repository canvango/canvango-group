import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ProductDetailModal from './ProductDetailModal';
import { DynamicDetailFields, DetailField } from '../../components/products/DynamicDetailFields';

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
  detail_fields?: DetailField[];
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
  const [products, setProducts] = useState<Product[]>([]);
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
  }, [currentPage, searchQuery, productTypeFilter, stockStatusFilter, activeStatusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
      };

      if (searchQuery) params.search = searchQuery;
      if (productTypeFilter !== 'all') params.product_type = productTypeFilter;
      if (stockStatusFilter !== 'all') params.stock_status = stockStatusFilter;
      if (activeStatusFilter !== 'all') params.is_active = activeStatusFilter === 'active';

      const response = await api.get('/admin/products', { params });
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
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
      
      let requestData: any = {
        product_ids: productIds,
        action: bulkAction
      };

      if (bulkAction === 'update_stock') {
        requestData.data = { stock_status: 'out_of_stock' };
      }

      const response = await api.post('/admin/products/bulk', requestData);
      
      const { success, failed } = response.data.data;
      
      if (failed > 0) {
        toast.success(`Bulk action completed: ${success} succeeded, ${failed} failed`);
      } else {
        toast.success(`Bulk action completed successfully: ${success} products updated`);
      }
      
      setSelectedProducts(new Set());
      setBulkAction('');
      fetchProducts();
    } catch (error: any) {
      console.error('Bulk action error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to perform bulk action');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('⏳ Already submitting, ignoring...');
      return;
    }
    
    console.log('🚀 handleCreateProduct called');
    console.log('📝 Form Data:', formData);
    
    // Manual validation for required fields
    if (!formData.product_name.trim()) {
      console.log('❌ Validation failed: Nama Produk kosong');
      toast.error('Nama Produk wajib diisi');
      setActiveTab('basic');
      return;
    }
    if (!formData.category.trim()) {
      console.log('❌ Validation failed: Kategori kosong');
      toast.error('Kategori wajib diisi');
      setActiveTab('basic');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      console.log('❌ Validation failed: Harga tidak valid', formData.price);
      toast.error('Harga harus lebih dari 0');
      setActiveTab('basic');
      return;
    }
    if (!formData.warranty_duration || parseInt(formData.warranty_duration) < 0) {
      console.log('❌ Validation failed: Durasi garansi tidak valid', formData.warranty_duration);
      toast.error('Durasi Garansi tidak valid');
      setActiveTab('warranty');
      return;
    }
    
    console.log('✅ Validation passed, sending to backend...');
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      warranty_duration: parseInt(formData.warranty_duration),
    };
    
    console.log('📤 Payload:', payload);
    console.log('📤 API URL:', api.defaults.baseURL);
    
    try {
      const response = await api.post('/admin/products', payload, {
        timeout: 10000 // 10 second timeout
      });
      console.log('✅ Backend response:', response.data);
      toast.success('Product created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Error creating product:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error code:', error.code);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - Backend tidak merespons');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - Pastikan backend running di port 3000');
      } else {
        toast.error(error.response?.data?.error?.message || error.message || 'Failed to create product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('⏳ Already submitting, ignoring...');
      return;
    }

    console.log('🔄 handleUpdateProduct called');
    console.log('📝 Form Data:', formData);

    // Manual validation for required fields
    if (!formData.product_name.trim()) {
      console.log('❌ Validation failed: Nama Produk kosong');
      toast.error('Nama Produk wajib diisi');
      setActiveTab('basic');
      return;
    }
    if (!formData.category.trim()) {
      console.log('❌ Validation failed: Kategori kosong');
      toast.error('Kategori wajib diisi');
      setActiveTab('basic');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      console.log('❌ Validation failed: Harga tidak valid', formData.price);
      toast.error('Harga harus lebih dari 0');
      setActiveTab('basic');
      return;
    }
    if (!formData.warranty_duration || parseInt(formData.warranty_duration) < 0) {
      console.log('❌ Validation failed: Durasi garansi tidak valid', formData.warranty_duration);
      toast.error('Durasi Garansi tidak valid');
      setActiveTab('warranty');
      return;
    }

    console.log('✅ Validation passed, sending to backend...');
    setIsSubmitting(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      warranty_duration: parseInt(formData.warranty_duration),
    };

    console.log('📤 Payload:', payload);

    try {
      const response = await api.put(`/admin/products/${selectedProduct.id}`, payload, {
        timeout: 10000
      });
      console.log('✅ Backend response:', response.data);
      toast.success('Product updated successfully');
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Error updating product:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error code:', error.code);

      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - Backend tidak merespons');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - Pastikan backend running di port 3000');
      } else {
        toast.error(error.response?.data?.error?.message || error.message || 'Failed to update product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/admin/products/${selectedProduct.id}`);
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      // Check if it's a foreign key constraint error
      if (error.response?.data?.error?.code === 'PRODUCT_IN_USE') {
        toast.error(
          'Cannot delete: Product has purchase history. Please deactivate it instead.',
          { duration: 5000 }
        );
      } else {
        toast.error(error.response?.data?.error?.message || 'Failed to delete product');
      }
      
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      await api.post(`/admin/products/${product.id}/duplicate`);
      toast.success('Product duplicated successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Error duplicating product:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to duplicate product');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      product_name: product.product_name,
      product_type: product.product_type,
      category: product.category,
      description: product.description || '',
      price: product.price.toString(),
      stock_status: product.stock_status,
      is_active: product.is_active,
      warranty_duration: (product as any).warranty_duration?.toString() || '30',
      warranty_enabled: (product as any).warranty_enabled !== undefined ? (product as any).warranty_enabled : true,
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

  const handleQuickToggleActive = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}`, {
        is_active: !product.is_active
      });
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const resetForm = () => {
    setActiveTab('basic'); // Reset tab to basic
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
      verified_bm: 'Verified BM',
      api: 'API',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
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
          <option value="verified_bm">Verified BM</option>
          <option value="api">API</option>
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
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 border border-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="update_stock">Mark Out of Stock</option>
                <option value="delete">Delete</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || isBulkProcessing}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {isBulkProcessing ? 'Processing...' : 'Apply'}
              </button>
              <button
                onClick={() => {
                  setSelectedProducts(new Set());
                  setBulkAction('');
                }}
                className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner for Inactive Products */}
      {activeStatusFilter === 'inactive' && products.length > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Inactive Products</h3>
              <p className="mt-1 text-sm text-yellow-700">
                These products are hidden from users and cannot be purchased. They may have purchase history and cannot be deleted. 
                Use "Activate" to make them available again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-12 text-center">
          <p className="text-gray-500">
            {activeStatusFilter === 'active' && 'No active products found'}
            {activeStatusFilter === 'inactive' && 'No inactive products found'}
            {activeStatusFilter === 'all' && 'No products found'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.stock_status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stock_status === 'available' ? 'Available' : 'Out of Stock'}
                        </span>
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedProduct(null);
              resetForm();
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={isCreateModalOpen ? handleCreateProduct : handleUpdateProduct}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {isCreateModalOpen ? '✨ Tambah Produk Baru' : '✏️ Edit Produk'}
                  </h3>

                  {/* Required Fields Info */}
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">ℹ️ Field Wajib:</span> Field yang ditandai dengan <span className="text-red-500 font-bold">*</span> wajib diisi untuk membuat produk.
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('basic')}
                      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'basic'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📋 Info Dasar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'details'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🎯 Detail Produk
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('warranty')}
                      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'warranty'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🛡️ Garansi
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Tab: Info Dasar */}
                    {activeTab === 'basic' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Produk <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.product_name}
                            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Contoh: BM Account - Limit 250"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipe Produk <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              value={formData.product_type}
                              onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="bm_account">BM Account</option>
                              <option value="personal_account">Personal Account</option>
                              <option value="verified_bm">Verified BM</option>
                              <option value="api">API</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Pilih Kategori</option>
                              <option value="limit_250">BM Limit 250$</option>
                              <option value="limit_500">BM Limit 500$</option>
                              <option value="limit_1000">BM Limit 1000$</option>
                              <option value="bm_verified">BM Verified</option>
                              <option value="limit_140">BM 140 Limit</option>
                              <option value="bm50">BM 50 Limit</option>
                              <option value="bm_160">BM 160 Limit</option>
                              <option value="aged_1year">Personal Aged 1 Year</option>
                              <option value="aged_2years">Personal Aged 2 Years</option>
                              <option value="aged_3years">Personal Aged 3+ Years</option>
                              <option value="whatsapp_api">WhatsApp API</option>
                              <option value="basic">Basic</option>
                              <option value="premium">Premium</option>
                              <option value="professional">Professional</option>
                              <option value="starter">Starter</option>
                              <option value="verified">Verified</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                              Pilih kategori yang sesuai dengan produk
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi Singkat
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Deskripsi singkat produk..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Harga (IDR) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="1000"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="150000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status Stok <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              value={formData.stock_status}
                              onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="available">✅ Tersedia</option>
                              <option value="out_of_stock">❌ Habis</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="is_active"
                              checked={formData.is_active}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                              Produk Aktif
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab: Detail Produk */}
                    {activeTab === 'details' && (
                      <div className="space-y-4">
                        <DynamicDetailFields
                          fields={formData.detail_fields}
                          onChange={(fields) => setFormData({ ...formData, detail_fields: fields })}
                        />

                        <div className="border-t border-gray-200 pt-4 mt-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">📝 Field Tetap (Opsional)</h4>
                          <p className="text-xs text-gray-500 mb-4">
                            Field di bawah ini masih tersedia untuk backward compatibility. Disarankan menggunakan "Detail Produk Custom" di atas.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              💰 Limit Iklan
                            </label>
                            <input
                              type="text"
                              value={formData.ad_limit}
                              onChange={(e) => setFormData({ ...formData, ad_limit: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Contoh: $250/hari"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Limit spending iklan per hari
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ✅ Status Verifikasi
                            </label>
                            <input
                              type="text"
                              value={formData.verification_status}
                              onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Contoh: Verified, Blue Badge"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Status verifikasi akun
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            🏢 Tipe Akun Iklan
                          </label>
                          <input
                            type="text"
                            value={formData.ad_account_type}
                            onChange={(e) => setFormData({ ...formData, ad_account_type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: Business Manager, Personal, Agency"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Jenis akun iklan yang digunakan
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ⭐ Keunggulan Produk
                          </label>
                          <textarea
                            value={formData.advantages}
                            onChange={(e) => setFormData({ ...formData, advantages: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tulis keunggulan produk, pisahkan dengan enter untuk list:&#10;- Limit tinggi&#10;- Akun terverifikasi&#10;- Support 24/7"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Pisahkan setiap poin dengan enter (baris baru)
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ⚠️ Kekurangan & Peringatan
                          </label>
                          <textarea
                            value={formData.disadvantages}
                            onChange={(e) => setFormData({ ...formData, disadvantages: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tulis kekurangan atau peringatan, pisahkan dengan enter:&#10;- Tidak bisa refund&#10;- Harus ganti password&#10;- Jangan share ke orang lain"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Pisahkan setiap poin dengan enter (baris baru)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tab: Garansi */}
                    {activeTab === 'warranty' && (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                          <p className="text-sm text-green-800">
                            🛡️ <strong>Garansi:</strong> Atur durasi dan ketentuan garansi untuk produk ini.
                          </p>
                        </div>

                        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl mb-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="warranty_enabled"
                              checked={formData.warranty_enabled}
                              onChange={(e) => setFormData({ ...formData, warranty_enabled: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="warranty_enabled" className="ml-2 text-sm font-medium text-gray-700">
                              Aktifkan Garansi
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ⏱️ Durasi Garansi (Hari) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="365"
                            value={formData.warranty_duration}
                            onChange={(e) => setFormData({ ...formData, warranty_duration: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="30"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            💡 Rekomendasi: 30 hari untuk BM Account, 7 hari untuk Personal Account
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            📋 Ketentuan Garansi
                          </label>
                          <textarea
                            value={formData.warranty_terms}
                            onChange={(e) => setFormData({ ...formData, warranty_terms: e.target.value })}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tulis ketentuan garansi, contoh:&#10;&#10;1. Garansi berlaku 30 hari sejak pembelian&#10;2. Claim hanya untuk akun yang disabled/banned&#10;3. Tidak cover kesalahan user&#10;4. Replacement 1x1 dengan produk yang sama&#10;5. Wajib screenshot bukti error"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Jelaskan syarat dan ketentuan garansi secara detail
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      isCreateModalOpen ? 'Create' : 'Update'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                      setSelectedProduct(null);
                      resetForm();
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduct(null);
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete "{selectedProduct.product_name}"? This action cannot be undone.
                </p>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  onClick={handleDeleteProduct}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal with Account Pool */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductManagement;
