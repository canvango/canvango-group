import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Power, AlertCircle, CheckCircle2, Sparkles, PowerOff } from 'lucide-react';
import { useWelcomePopups, useDeleteWelcomePopup, useToggleWelcomePopupActive, useDisableAllWelcomePopups } from '@/hooks/useWelcomePopups';
import { WelcomePopup } from '@/types/welcome-popup';
import { WelcomePopupForm } from '@/features/admin/components/welcome-popups/WelcomePopupForm';
import { WelcomePopupPreview } from '@/features/admin/components/welcome-popups/WelcomePopupPreview';
import { toast } from 'react-hot-toast';

export const WelcomePopupList = () => {
  const { data: popups, isLoading } = useWelcomePopups();
  const deletePopup = useDeleteWelcomePopup();
  const toggleActive = useToggleWelcomePopupActive();
  const disableAll = useDisableAllWelcomePopups();

  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<WelcomePopup | null>(null);
  const [previewPopup, setPreviewPopup] = useState<WelcomePopup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showDisableAllConfirm, setShowDisableAllConfirm] = useState(false);

  const hasActivePopup = popups?.some(p => p.is_active) || false;

  const handleDelete = async (id: string) => {
    try {
      await deletePopup.mutateAsync(id);
      toast.success('Popup berhasil dihapus');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Gagal menghapus popup');
      console.error(error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !currentStatus });
      toast.success(
        currentStatus 
          ? 'Popup dinonaktifkan' 
          : 'Popup diaktifkan (popup lain otomatis dinonaktifkan)'
      );
    } catch (error) {
      toast.error('Gagal mengubah status popup');
      console.error(error);
    }
  };

  const handleDisableAll = async () => {
    try {
      await disableAll.mutateAsync();
      toast.success('Semua popup berhasil dinonaktifkan');
      setShowDisableAllConfirm(false);
    } catch (error) {
      toast.error('Gagal menonaktifkan popup');
      console.error(error);
    }
  };

  const handleEdit = (popup: WelcomePopup) => {
    setEditingPopup(popup);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPopup(null);
  };

  if (showForm) {
    return (
      <WelcomePopupForm
        popup={editingPopup}
        onClose={handleCloseForm}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Info Skeleton */}
        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />

        {/* Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded-xl animate-pulse" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Welcome Popups</h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola popup untuk first-time visitors
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasActivePopup && (
            <button
              onClick={() => setShowDisableAllConfirm(true)}
              disabled={disableAll.isPending}
              className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
              title="Nonaktifkan semua popup"
            >
              <PowerOff className="w-4 h-4" />
              <span className="hidden md:inline">Disable All</span>
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Buat Popup</span>
            <span className="sm:hidden">Buat</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className={`border rounded-2xl p-4 mb-6 ${
        hasActivePopup 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-start gap-3">
          {hasActivePopup ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {hasActivePopup ? (
                <>
                  <strong className="text-gray-900">Ada popup aktif.</strong> Hanya 1 popup yang bisa aktif dalam satu waktu. 
                  Mengaktifkan popup lain akan otomatis menonaktifkan yang sekarang.
                </>
              ) : (
                <>
                  <strong className="text-gray-900">Tidak ada popup aktif.</strong> Aktifkan popup untuk menampilkannya ke first-time visitors. 
                  Hanya 1 popup yang bisa aktif dalam satu waktu.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {!popups || popups.length === 0 ? (
        <div className="card text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Popup</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Buat popup pertama untuk menyambut visitor baru atau memberikan peringatan keamanan penting.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Popup Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {popups.map((popup) => (
            <div 
              key={popup.id} 
              className={`card transition-all duration-200 ${
                popup.is_active ? 'ring-2 ring-green-500 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title & Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{popup.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      popup.type === 'security' 
                        ? 'bg-red-100 text-red-700' 
                        : popup.type === 'welcome' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {popup.type === 'security' && '🔒'}
                      {popup.type === 'welcome' && '👋'}
                      {popup.type === 'promo' && '🎉'}
                      {popup.type}
                    </span>
                    {popup.is_active && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div 
                    className="text-sm text-gray-600 line-clamp-2 mb-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: popup.content }}
                  />

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {popup.bullet_points.length} bullet points
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">
                      Button: "{popup.button_text}"
                    </span>
                    {popup.show_checkbox && (
                      <>
                        <span>•</span>
                        <span>Dengan checkbox</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setPreviewPopup(popup)}
                    className="p-2 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(popup.id, popup.is_active)}
                    disabled={toggleActive.isPending}
                    className={`p-2 rounded-xl transition-colors ${
                      popup.is_active 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-green-600'
                    }`}
                    title={popup.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(popup)}
                    className="p-2 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(popup.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewPopup && (
        <WelcomePopupPreview
          popup={previewPopup}
          onClose={() => setPreviewPopup(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Hapus Popup?
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-6">
                Popup yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary flex-1"
                  disabled={deletePopup.isPending}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deletePopup.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deletePopup.isPending ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Disable All Confirmation Modal */}
      {showDisableAllConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowDisableAllConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <PowerOff className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Nonaktifkan Semua Popup?
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-6">
                Semua popup akan dinonaktifkan dan tidak akan ditampilkan ke visitors. 
                Anda bisa mengaktifkannya kembali kapan saja.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisableAllConfirm(false)}
                  className="btn-secondary flex-1"
                  disabled={disableAll.isPending}
                >
                  Batal
                </button>
                <button
                  onClick={handleDisableAll}
                  disabled={disableAll.isPending}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {disableAll.isPending ? 'Menonaktifkan...' : 'Ya, Disable All'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
