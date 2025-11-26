import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Megaphone, AlertCircle } from 'lucide-react';
import {
  useAllAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement
} from '@/hooks/useAnnouncements';
import type { Announcement, AnnouncementType } from '@/types/announcement';
import AnnouncementFormModal from './components/AnnouncementFormModal';

const AnnouncementManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: announcements, isLoading } = useAllAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteMutation.mutateAsync(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete announcement:', error);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleTogglePublish = async (announcement: Announcement) => {
    try {
      await updateMutation.mutateAsync({
        id: announcement.id,
        input: { is_published: !announcement.is_published }
      });
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  const typeConfig: Record<AnnouncementType, { color: string; label: string }> = {
    info: { color: 'bg-blue-100 text-blue-800', label: 'Info' },
    warning: { color: 'bg-orange-100 text-orange-800', label: 'Warning' },
    success: { color: 'bg-green-100 text-green-800', label: 'Success' },
    maintenance: { color: 'bg-amber-100 text-amber-800', label: 'Maintenance' },
    update: { color: 'bg-indigo-100 text-indigo-800', label: 'Update' }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-primary-600" />
            Announcement Management
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola update dan pengumuman yang ditampilkan di dashboard member
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Buat Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-600">Total Announcements</p>
            <p className="text-2xl font-bold text-gray-900">{announcements?.length || 0}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {announcements?.filter(a => a.is_published).length || 0}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-600">Draft</p>
            <p className="text-2xl font-bold text-gray-600">
              {announcements?.filter(a => !a.is_published).length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="card">
        <div className="card-body">
          {!announcements || announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Announcement
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai buat announcement pertama untuk member
              </p>
              <button onClick={handleCreate} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Buat Announcement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {announcement.title}
                        </h3>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-2xl ${
                            typeConfig[announcement.type].color
                          }`}
                        >
                          {typeConfig[announcement.type].label}
                        </span>
                        {announcement.is_published ? (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-2xl bg-green-100 text-green-800 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-2xl bg-gray-100 text-gray-800 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                        <span className="px-2.5 py-1 text-xs font-medium rounded-2xl bg-purple-100 text-purple-800">
                          Priority: {announcement.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {announcement.published_at
                          ? `Published: ${formatDate(announcement.published_at)}`
                          : `Created: ${formatDate(announcement.created_at)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePublish(announcement)}
                        className={`p-2 rounded-xl transition-colors ${
                          announcement.is_published
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={announcement.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {announcement.is_published ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          deleteConfirm === announcement.id
                            ? 'bg-red-100 text-red-700'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={deleteConfirm === announcement.id ? 'Click again to confirm' : 'Delete'}
                      >
                        {deleteConfirm === announcement.id ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AnnouncementFormModal
          announcement={editingAnnouncement}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={async (data) => {
            try {
              if (editingAnnouncement) {
                await updateMutation.mutateAsync({
                  id: editingAnnouncement.id,
                  input: data
                });
              } else {
                await createMutation.mutateAsync(data);
              }
              setIsModalOpen(false);
              setEditingAnnouncement(null);
            } catch (error) {
              console.error('Failed to save announcement:', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
};

export default AnnouncementManagement;
