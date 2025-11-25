import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabase';
import { useCategories, Category } from '../../hooks/useCategories';
import { useQueryClient } from '@tanstack/react-query';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  product_type: 'bm_account' | 'personal_account';
  display_order: number;
}

const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories({ includeInactive: true });
  
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    product_type: 'bm_account',
    display_order: 1,
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (isCreateMode && !editingCategory) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isCreateMode, editingCategory]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      product_type: 'bm_account',
      display_order: 1,
    });
    setIsCreateMode(false);
    setEditingCategory(null);
  };

  const handleCreate = () => {
    const maxOrder = Math.max(...(categories?.map(c => c.display_order) || [0]), 0);
    setFormData({
      name: '',
      slug: '',
      description: '',
      product_type: 'bm_account',
      display_order: maxOrder + 1,
    });
    setIsCreateMode(true);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      product_type: category.product_type,
      display_order: category.display_order,
    });
    setEditingCategory(category);
    setIsCreateMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description,
            product_type: formData.product_type,
            display_order: formData.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            product_type: formData.product_type,
            display_order: formData.display_order,
            is_active: true,
          }]);

        if (error) throw error;
        toast.success('Category created successfully');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    } catch (error: any) {
      console.error('Error saving category:', error);
      if (error.code === '23505') {
        toast.error('Category slug already exists');
      } else {
        toast.error(error.message || 'Failed to save category');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Check if category is used by any products
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category', category.slug)
        .limit(1);

      if (checkError) throw checkError;

      if (products && products.length > 0) {
        toast.error('Cannot delete category that is used by products. Please reassign products first.');
        return;
      }

      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;

      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          is_active: !category.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', category.id);

      if (error) throw error;

      toast.success(`Category ${!category.is_active ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error: any) {
      console.error('Error toggling category:', error);
      toast.error(error.message || 'Failed to update category');
    }
  };

  if (!isOpen) return null;

  const bmCategories = categories?.filter(c => c.product_type === 'bm_account') || [];
  const personalCategories = categories?.filter(c => c.product_type === 'personal_account') || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Manage Categories</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Create/Edit Form */}
          {(isCreateMode || editingCategory) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., BM Limit 3000$"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug * {editingCategory && '(cannot be changed)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      disabled={!!editingCategory}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="e.g., limit_3000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Type *
                    </label>
                    <select
                      required
                      value={formData.product_type}
                      onChange={(e) => setFormData({ ...formData, product_type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bm_account">BM Account</option>
                      <option value="personal_account">Personal Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Category Button */}
          {!isCreateMode && !editingCategory && (
            <button
              onClick={handleCreate}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Category
            </button>
          )}

          {/* Categories List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* BM Account Categories */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">BM Account Categories</h4>
                <div className="space-y-2">
                  {bmCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">{category.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {category.slug}
                          </span>
                          {!category.is_active && (
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Order: {category.display_order}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            category.is_active
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {category.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Edit category"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Delete category"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {bmCategories.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No BM categories yet</p>
                  )}
                </div>
              </div>

              {/* Personal Account Categories */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Personal Account Categories</h4>
                <div className="space-y-2">
                  {personalCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">{category.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {category.slug}
                          </span>
                          {!category.is_active && (
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Order: {category.display_order}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            category.is_active
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {category.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Edit category"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Delete category"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {personalCategories.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No Personal categories yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementModal;
