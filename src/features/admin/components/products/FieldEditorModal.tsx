import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { ProductAccountField } from '../../types/productAccount';

interface FieldDefinition {
  field_name: string;
  field_type: 'text' | 'password' | 'email' | 'url' | 'textarea';
  is_required: boolean;
}

interface FieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: FieldDefinition[]) => void;
  existingFields: ProductAccountField[];
  isProcessing?: boolean;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'password', label: 'Password' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'textarea', label: 'Textarea' }
];

const FieldEditorModal: React.FC<FieldEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingFields,
  isProcessing = false
}) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);

  useEffect(() => {
    if (existingFields.length > 0) {
      setFields(existingFields.map(f => ({
        field_name: f.field_name,
        field_type: f.field_type,
        is_required: f.is_required
      })));
    } else {
      // Default fields for new product
      setFields([
        { field_name: 'Email', field_type: 'email', is_required: true },
        { field_name: 'Password', field_type: 'password', is_required: true }
      ]);
    }
  }, [existingFields]);

  const addField = () => {
    setFields([...fields, { field_name: '', field_type: 'text', is_required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const emptyNames = fields.filter(f => !f.field_name.trim());
    if (emptyNames.length > 0) {
      alert('All fields must have a name');
      return;
    }

    onSave(fields);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Configure Account Fields</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                
                <input
                  type="text"
                  value={field.field_name}
                  onChange={(e) => updateField(index, { field_name: e.target.value })}
                  placeholder="Field name"
                  className="input flex-1"
                  required
                />

                <select
                  value={field.field_type}
                  onChange={(e) => updateField(index, { field_type: e.target.value as any })}
                  className="input w-32"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.is_required}
                    onChange={(e) => updateField(index, { is_required: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>

                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addField}
            className="btn-secondary w-full mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </button>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : 'Save Fields'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldEditorModal;
