import React, { useState } from 'react';
import SelectDropdown, { SelectOption } from './SelectDropdown';
import { User, Mail, Phone, Globe, Star, Heart, Zap } from 'lucide-react';

/**
 * Example component demonstrating SelectDropdown usage
 */
const SelectDropdownExample: React.FC = () => {
  const [basicValue, setBasicValue] = useState('');
  const [searchableValue, setSearchableValue] = useState('');
  const [clearableValue, setClearableValue] = useState('option2');
  const [customValue, setCustomValue] = useState('');
  const [iconValue, setIconValue] = useState('');

  // Basic options
  const basicOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4', disabled: true },
  ];

  // Options with many items (for search)
  const countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'it', label: 'Italy' },
    { value: 'es', label: 'Spain' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'br', label: 'Brazil' },
    { value: 'mx', label: 'Mexico' },
    { value: 'id', label: 'Indonesia' },
    { value: 'nl', label: 'Netherlands' },
  ];

  // Options with icons
  const iconOptions: SelectOption[] = [
    { value: 'user', label: 'User Profile', icon: <User className="w-4 h-4 text-blue-500" /> },
    { value: 'mail', label: 'Email', icon: <Mail className="w-4 h-4 text-green-500" /> },
    { value: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4 text-orange-500" /> },
    { value: 'globe', label: 'Website', icon: <Globe className="w-4 h-4 text-purple-500" /> },
  ];

  // Options with descriptions
  const planOptions: SelectOption[] = [
    {
      value: 'free',
      label: 'Free Plan',
      description: 'Perfect for getting started',
      icon: <Star className="w-4 h-4 text-gray-400" />,
    },
    {
      value: 'pro',
      label: 'Pro Plan',
      description: 'For professional users',
      icon: <Heart className="w-4 h-4 text-pink-500" />,
    },
    {
      value: 'enterprise',
      label: 'Enterprise Plan',
      description: 'For large organizations',
      icon: <Zap className="w-4 h-4 text-yellow-500" />,
    },
  ];

  // Custom option renderer
  const customRenderOption = (option: SelectOption) => (
    <div className="flex items-center gap-3">
      {option.icon}
      <div>
        <div className="font-medium">{option.label}</div>
        {option.description && (
          <div className="text-xs text-gray-500">{option.description}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SelectDropdown Component</h1>
        <p className="text-gray-600">
          An accessible, searchable dropdown component with keyboard navigation
        </p>
      </div>

      {/* Basic Select */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Select</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectDropdown
            label="Basic Select"
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Choose an option"
            helperText="This is a basic select dropdown"
          />

          <SelectDropdown
            label="Required Select"
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Choose an option"
            required
          />
        </div>
        <div className="text-sm text-gray-600">
          Selected value: <code className="bg-gray-100 px-2 py-1 rounded">{basicValue || 'none'}</code>
        </div>
      </section>

      {/* Searchable Select */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Searchable Select</h2>
        <SelectDropdown
          label="Country"
          options={countryOptions}
          value={searchableValue}
          onChange={setSearchableValue}
          placeholder="Search for a country"
          searchable
          helperText="Type to search through options"
        />
        <div className="text-sm text-gray-600">
          Selected: <code className="bg-gray-100 px-2 py-1 rounded">{searchableValue || 'none'}</code>
        </div>
      </section>

      {/* Clearable Select */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Clearable Select</h2>
        <SelectDropdown
          label="Clearable Option"
          options={basicOptions}
          value={clearableValue}
          onChange={setClearableValue}
          onClear={() => setClearableValue('')}
          placeholder="Choose an option"
          clearable
          helperText="Click the X icon to clear selection"
        />
        <div className="text-sm text-gray-600">
          Selected: <code className="bg-gray-100 px-2 py-1 rounded">{clearableValue || 'none'}</code>
        </div>
      </section>

      {/* Select with Icons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Select with Icons</h2>
        <SelectDropdown
          label="Contact Method"
          options={iconOptions}
          value={iconValue}
          onChange={setIconValue}
          placeholder="Choose a contact method"
          helperText="Options can include icons"
        />
        <div className="text-sm text-gray-600">
          Selected: <code className="bg-gray-100 px-2 py-1 rounded">{iconValue || 'none'}</code>
        </div>
      </section>

      {/* Custom Rendered Options */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Custom Option Rendering</h2>
        <SelectDropdown
          label="Subscription Plan"
          options={planOptions}
          value={customValue}
          onChange={setCustomValue}
          placeholder="Choose a plan"
          renderOption={customRenderOption}
          helperText="Options with custom rendering including descriptions"
        />
        <div className="text-sm text-gray-600">
          Selected: <code className="bg-gray-100 px-2 py-1 rounded">{customValue || 'none'}</code>
        </div>
      </section>

      {/* States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectDropdown
            label="Disabled Select"
            options={basicOptions}
            value="option1"
            onChange={() => {}}
            disabled
            helperText="This select is disabled"
          />

          <SelectDropdown
            label="Error State"
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            error="Please select a valid option"
          />
        </div>
      </section>

      {/* Keyboard Navigation Guide */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Keyboard Navigation</h2>
        <div className="bg-gray-50 rounded-lg p-6 space-y-3">
          <h3 className="font-medium text-gray-900">Keyboard Shortcuts:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Enter
              </kbd>
              <span>or</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Space
              </kbd>
              <span>- Open dropdown or select highlighted option</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Escape
              </kbd>
              <span>- Close dropdown</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                ↑ ↓
              </kbd>
              <span>- Navigate through options</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Home
              </kbd>
              <span>- Jump to first option</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                End
              </kbd>
              <span>- Jump to last option</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Tab
              </kbd>
              <span>- Close dropdown and move to next element</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                A-Z
              </kbd>
              <span>- Type-ahead search (when not searchable)</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Accessibility Features</h2>
        <div className="bg-green-50 rounded-lg p-6 space-y-3">
          <h3 className="font-medium text-green-900">Built-in Accessibility:</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✓ Full keyboard navigation support</li>
            <li>✓ ARIA labels and roles (listbox, option)</li>
            <li>✓ Screen reader announcements</li>
            <li>✓ Focus management and visible focus indicators</li>
            <li>✓ Proper label association</li>
            <li>✓ Error state announcements</li>
            <li>✓ Disabled state handling</li>
            <li>✓ Required field indication</li>
            <li>✓ Minimum 44x44px touch targets</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default SelectDropdownExample;
