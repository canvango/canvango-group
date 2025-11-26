import React, { useState } from 'react';
import {
  useAdminTutorials,
  useAdminTutorialStats,
  useCreateTutorial,
  useUpdateTutorial,
  useDeleteTutorial,
  useToggleTutorialPublish,
} from '@/hooks/useAdminTutorials';
import {
  Tutorial,
  CreateTutorialData,
  UpdateTutorialData,
} from '../../types/tutorial.types';

const TutorialManagement: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [formData, setFormData] = useState<CreateTutorialData>({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    is_published: false,
  });
  const [tagInput, setTagInput] = useState('');

  // React Query hooks
  const { data: tutorialsData, isLoading, error } = useAdminTutorials(
    {
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: searchTerm || undefined,
    },
    1,
    50
  );

  const { data: stats } = useAdminTutorialStats();
  const createMutation = useCreateTutorial();
  const updateMutation = useUpdateTutorial();
  const deleteMutation = useDeleteTutorial();
  const togglePublishMutation = useToggleTutorialPublish();

  const tutorials = tutorialsData?.tutorials || [];

  // Handlers
  const handleCreate = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      is_published: false,
    });
    setTagInput('');
    setShowCreateModal(true);
  };

  const handleEdit = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title,
      slug: tutorial.slug,
      description: tutorial.description || '',
      content: tutorial.content,
      category: tutorial.category,
      tags: tutorial.tags || [],
      is_published: tutorial.is_published,
      difficulty: tutorial.difficulty || undefined,
      duration_minutes: tutorial.duration_minutes || undefined,
      video_url: tutorial.video_url || undefined,
      thumbnail_url: tutorial.thumbnail_url || undefined,
    });
    setTagInput('');
    setShowEditModal(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-generate slug if empty
      const slug = formData.slug || generateSlug(formData.title);
      
      await createMutation.mutateAsync({
        ...formData,
        slug,
      });
      
      setShowCreateModal(false);
      alert('Tutorial berhasil dibuat!');
    } catch (err: any) {
      alert(err.message || 'Gagal membuat tutorial');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutorial) return;

    try {
      const updateData: UpdateTutorialData = {};
      
      if (formData.title !== editingTutorial.title) updateData.title = formData.title;
      if (formData.slug !== editingTutorial.slug) updateData.slug = formData.slug;
      if (formData.description !== editingTutorial.description)
        updateData.description = formData.description;
      if (formData.content !== editingTutorial.content) updateData.content = formData.content;
      if (formData.category !== editingTutorial.category) updateData.category = formData.category;
      if (JSON.stringify(formData.tags) !== JSON.stringify(editingTutorial.tags))
        updateData.tags = formData.tags;
      if (formData.is_published !== editingTutorial.is_published)
        updateData.is_published = formData.is_published;
      if (formData.difficulty !== editingTutorial.difficulty)
        updateData.difficulty = formData.difficulty;
      if (formData.duration_minutes !== editingTutorial.duration_minutes)
        updateData.duration_minutes = formData.duration_minutes;
      if (formData.video_url !== editingTutorial.video_url)
        updateData.video_url = formData.video_url;
      if (formData.thumbnail_url !== editingTutorial.thumbnail_url)
        updateData.thumbnail_url = formData.thumbnail_url;

      await updateMutation.mutateAsync({
        id: editingTutorial.id,
        data: updateData,
      });

      setShowEditModal(false);
      setEditingTutorial(null);
      alert('Tutorial berhasil diupdate!');
    } catch (err: any) {
      alert(err.message || 'Gagal mengupdate tutorial');
    }
  };

  const handleDelete = async (tutorial: Tutorial) => {
    if (!confirm(`Yakin ingin menghapus tutorial "${tutorial.title}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(tutorial.id);
      alert('Tutorial berhasil dihapus!');
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus tutorial');
    }
  };

  const handleTogglePublish = async (tutorial: Tutorial) => {
    try {
      await togglePublishMutation.mutateAsync({
        id: tutorial.id,
        isPublished: !tutorial.is_published,
      });
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status publish');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Tutorial</h1>
        <p className="text-gray-600 mt-1">Kelola tutorial dan lihat statistik</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6">
          <div className="card">
            <div className="card-body">
              <div className="text-sm font-medium text-gray-500">Total Tutorial</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-sm font-medium text-gray-500">Published</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.published}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-sm font-medium text-gray-500">Draft</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.draft}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-sm font-medium text-gray-500">Kategori</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {stats.categories.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Create Button */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-4">
              <input
                type="text"
                placeholder="Cari tutorial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input flex-1"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                <option value="all">Semua Kategori</option>
                {stats?.categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleCreate} className="btn-primary">
              + Buat Tutorial
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-3xl mb-6">
          {error.message || 'Terjadi kesalahan'}
        </div>
      )}

      {/* Tutorials Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat tutorial...</p>
          </div>
        ) : tutorials.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'Tidak ada tutorial yang sesuai filter'
              : 'Belum ada tutorial'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutorial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tutorials.map((tutorial) => (
                  <tr key={tutorial.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tutorial.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {tutorial.description}
                        </div>
                        {tutorial.tags && tutorial.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {tutorial.tags.map((tag) => (
                              <span
                                key={tag}
                                className="badge badge-secondary text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-primary">
                        {tutorial.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(tutorial)}
                        className={`badge ${
                          tutorial.is_published ? 'badge-success' : 'badge-warning'
                        } cursor-pointer hover:opacity-80`}
                      >
                        {tutorial.is_published ? '✓ Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tutorial.view_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(tutorial)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tutorial)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Tutorial Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Buat Tutorial Baru</h2>
            <form onSubmit={handleSubmitCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        title: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input w-full"
                    placeholder="auto-generated-from-title"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input w-full"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konten <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input w-full"
                    rows={8}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={formData.difficulty || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as any,
                        })
                      }
                      className="input w-full"
                    >
                      <option value="">Pilih...</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="input flex-1"
                      placeholder="Tambah tag..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-secondary"
                    >
                      Tambah
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-primary flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-current hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({ ...formData, is_published: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Publish sekarang</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Buat Tutorial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tutorial Modal */}
      {showEditModal && editingTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Tutorial</h2>
            <form onSubmit={handleSubmitEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input w-full"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konten <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input w-full"
                    rows={8}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={formData.difficulty || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as any,
                        })
                      }
                      className="input w-full"
                    >
                      <option value="">Pilih...</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="input flex-1"
                      placeholder="Tambah tag..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-secondary"
                    >
                      Tambah
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-primary flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-current hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({ ...formData, is_published: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Published</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTutorial(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialManagement;
