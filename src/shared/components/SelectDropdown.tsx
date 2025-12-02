import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectDropdownProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  renderOption?: (option: SelectOption) => React.ReactNode;
  id?: string;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  error,
  helperText,
  options,
  value,
  placeholder = 'Select an option',
  searchable = false,
  clearable = false,
  disabled = false,
  required = false,
  className = '',
  onChange,
  onClear,
  renderOption,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const selectId = id || `select-dropdown-${Math.random().toString(36).substring(2, 9)}`;
  const hasError = !!error;

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  // Handle option selection
  const handleSelect = useCallback(
    (optionValue: string) => {
      const option = options.find((opt) => opt.value === optionValue);
      if (option && !option.disabled) {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchQuery('');
        buttonRef.current?.focus();
      }
    },
    [options, onChange]
  );

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear?.();
      onChange?.('');
      buttonRef.current?.focus();
    },
    [onChange, onClear]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          if (!isOpen) {
            e.preventDefault();
            setIsOpen(true);
          } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            e.preventDefault();
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => {
              const nextIndex = prev + 1;
              // Skip disabled options
              for (let i = nextIndex; i < filteredOptions.length; i++) {
                if (!filteredOptions[i].disabled) {
                  return i;
                }
              }
              return prev;
            });
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => {
              const nextIndex = prev - 1;
              // Skip disabled options
              for (let i = nextIndex; i >= 0; i--) {
                if (!filteredOptions[i].disabled) {
                  return i;
                }
              }
              return prev;
            });
          }
          break;

        case 'Home':
          if (isOpen) {
            e.preventDefault();
            // Find first non-disabled option
            const firstEnabledIndex = filteredOptions.findIndex((opt) => !opt.disabled);
            if (firstEnabledIndex >= 0) {
              setHighlightedIndex(firstEnabledIndex);
            }
          }
          break;

        case 'End':
          if (isOpen) {
            e.preventDefault();
            // Find last non-disabled option
            for (let i = filteredOptions.length - 1; i >= 0; i--) {
              if (!filteredOptions[i].disabled) {
                setHighlightedIndex(i);
                break;
              }
            }
          }
          break;

        case 'Tab':
          if (isOpen) {
            setIsOpen(false);
            setSearchQuery('');
          }
          break;

        default:
          // Type-ahead search
          if (!searchable && isOpen && e.key.length === 1) {
            const char = e.key.toLowerCase();
            const startIndex = highlightedIndex + 1;
            
            // Search from current position
            for (let i = startIndex; i < filteredOptions.length; i++) {
              if (
                !filteredOptions[i].disabled &&
                filteredOptions[i].label.toLowerCase().startsWith(char)
              ) {
                setHighlightedIndex(i);
                return;
              }
            }
            
            // Wrap around to beginning
            for (let i = 0; i < startIndex; i++) {
              if (
                !filteredOptions[i].disabled &&
                filteredOptions[i].label.toLowerCase().startsWith(char)
              ) {
                setHighlightedIndex(i);
                return;
              }
            }
          }
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, filteredOptions, handleSelect, searchable]
  );

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Default option renderer
  const defaultRenderOption = (option: SelectOption) => (
    <div className="flex items-center gap-2">
      {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="truncate">{option.label}</div>
        {option.description && (
          <div className="text-xs text-gray-500 truncate">{option.description}</div>
        )}
      </div>
    </div>
  );

  const optionRenderer = renderOption || defaultRenderOption;

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Select Button */}
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          aria-required={required}
          className={`
            w-full min-h-[44px] px-3 py-2.5 pr-10
            flex items-center justify-between gap-2
            text-left rounded-lg border
            ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer hover:border-gray-400'}
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-colors duration-200
          `}
        >
          <span className="flex-1 truncate">
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
                <span className="truncate">{selectedOption.label}</span>
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>

          <div className="flex items-center gap-1 flex-shrink-0">
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                aria-label="Clear selection"
                tabIndex={-1}
              >
                <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </button>
            )}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            role="listbox"
            aria-labelledby={selectId}
            className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto"
          >
            {/* Search Input */}
            {searchable && (
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Search options"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    className={`
                      px-3 py-2.5 cursor-pointer flex items-center justify-between gap-2
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isHighlighted && !option.disabled ? 'bg-indigo-50' : ''}
                      ${isSelected ? 'bg-indigo-100' : 'hover:bg-gray-50'}
                      transition-colors duration-150
                    `}
                  >
                    <div className="flex-1 min-w-0">{optionRenderer(option)}</div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default SelectDropdown;
