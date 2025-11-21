import React, { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';

export interface DetailField {
  label: string;
  value: string;
  icon?: string;
}

interface DynamicDetailFieldsProps {
  fields: DetailField[];
  onChange: (fields: DetailField[]) => void;
}

export const DynamicDetailFields: React.FC<DynamicDetailFieldsProps> = ({
  fields,
  onChange
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addField = () => {
    onChange([...fields, { label: '', value: '', icon: '' }]);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof DetailField, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    onChange(newFields);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedItem);
    
    onChange(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          📋 Detail Produk Custom
        </label>
        <button
          type="button"
          onClick={addField}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Field
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-sm text-blue-700">
        💡 <strong>Tips:</strong> Field ini akan ditampilkan di halaman detail produk untuk membantu user memahami produk dengan lebih baik.
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">
            Belum ada field custom. Klik "Tambah Field" untuk menambahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-start gap-2 p-3 bg-white border rounded-2xl transition-all ${
                draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-sm'
              }`}
            >
              <button
                type="button"
                className="mt-2 cursor-move text-gray-400 hover:text-gray-600"
                title="Drag untuk mengubah urutan"
              >
                <GripVertical className="w-5 h-5" />
              </button>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(index, 'label', e.target.value)}
                    placeholder="Label (contoh: Limit Iklan)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField(index, 'value', e.target.value)}
                    placeholder="Value (contoh: $250/hari)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeField(index)}
                className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                title="Hapus field"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {fields.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-3 text-xs text-gray-600">
          <strong>Preview:</strong> Field akan ditampilkan sesuai urutan di atas. Drag untuk mengubah urutan.
        </div>
      )}
    </div>
  );
};
