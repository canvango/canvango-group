import { useState } from 'react';
import { ArrowLeft, Plus, X, Save, Eye } from 'lucide-react';
import { useCreateWelcomePopup, useUpdateWelcomePopup } from '@/hooks/useWelcomePopups';
import { WelcomePopup } from '@/types/welcome-popup';
import { RichTextEditor } from '@/components/RichTextEditor';
import { WelcomePopupPreview } from '@/features/admin/components/welcome-popups/WelcomePopupPreview';
import { toast } from 'react-hot-toast';

interface WelcomePopupFormProps {
  popup?: WelcomePopup | null;
  onClose: () => void;
}

export const WelcomePopupForm = ({ popup, onClose }: WelcomePopupFormProps) => {
  const createPopup = useCreateWelcomePopup();
  const updatePopup = useUpdateWelcomePopup();

  const [formData, setFormData] = useState({
    title: popup?.title || '',
    content: popup?.content || '',
    bullet_points: popup?.bullet_points || [],
    type: popup?.type || 'welcome' as 'welcome' | 'security' | 'promo',
    show_checkbox: popup?.show_checkbox ?? true,
    button_text: popup?.button_text || 'Saya Mengerti',
  });

  const [newBulletPoint, setNewBulletPoint] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleAddBulletPoint = () => {
    if (!newBulletPoint.trim()) return;
    setFormData({
      ...formData,
      bullet_points: [...formData.bullet_points, newBulletPoint.trim()],
    });
    setNewBulletPoint('');
  };

  const handleRemoveBulletPoint = (index: number) => {
    setFormData({
      ...formData,
      bullet_points: formData.bullet_points.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title harus diisi');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content harus diisi');
      return;
    }

    try {
      if (popup) {
        await updatePopup.mutateAsync({ id: popup.id, formData });
        toast.success('Popup berhasil diupdate');
      } else {
        await createPopup.mutateAsync(formData);
        toast.success('Popup berhasil dibuat');
      }
      onClose();
    } catch (error) {
      toast.error('Gagal menyimpan popup');
      console.error(error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              {popup ? 'Edit Popup' : 'Buat Popup Baru'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Popup untuk first-time guest visitors
            </p>
          </div>
        </div>
        
        {/* Preview Button */}
        {formData.title && formData.content && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input w-full"
            placeholder="Peringatan Keamanan Penting"
            required
          />
        </div>

        {/* Type */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="input w-full"
          >
            <option value="welcome">Welcome</option>
            <option value="security">Security</option>
            <option value="promo">Promo</option>
          </select>
        </div>

        {/* Content */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content * (HTML)
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
            placeholder="Tulis konten popup di sini..."
          />
        </div>

        {/* Bullet Points */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bullet Points
          </label>
          
          {/* Add new */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newBulletPoint}
              onChange={(e) => setNewBulletPoint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBulletPoint())}
              className="input flex-1"
              placeholder="Tambah bullet point..."
            />
            <button
              type="button"
              onClick={handleAddBulletPoint}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>

          {/* List */}
          {formData.bullet_points.length > 0 && (
            <div className="space-y-2">
              {formData.bullet_points.map((point, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex-1">{point}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBulletPoint(index)}
                    className="p-1 rounded hover:bg-gray-200 text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Button Text */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Text *
          </label>
          <input
            type="text"
            value={formData.button_text}
            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
            className="input w-full"
            placeholder="Saya Mengerti"
            required
          />
        </div>

        {/* Show Checkbox */}
        <div className="card">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.show_checkbox}
              onChange={(e) => setFormData({ ...formData, show_checkbox: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Tampilkan checkbox "Jangan tampilkan lagi"
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={createPopup.isPending || updatePopup.isPending}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={createPopup.isPending || updatePopup.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {createPopup.isPending || updatePopup.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <WelcomePopupPreview
          popup={{
            ...formData,
            id: popup?.id || 'preview',
            is_active: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
