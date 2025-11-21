
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import SelectDropdown, { SelectOption } from '../SelectDropdown';

const mockOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4', disabled: true },
];

describe('SelectDropdown', () => {
  it('renders with label and placeholder', () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        placeholder="Choose an option"
      />
    );

    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  it('selects an option when clicked', async () => {
    const handleChange = jest.fn();
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        onChange={handleChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const option = screen.getByText('Option 2');
      fireEvent.click(option);
    });

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('displays selected value', () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        value="option2"
      />
    );

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows helper text when provided', () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        helperText="Choose your preferred option"
      />
    );

    expect(screen.getByText('Choose your preferred option')).toBeInTheDocument();
  });

  it('marks field as required', () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        required
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  it('disables the select when disabled prop is true', () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        disabled
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not select disabled options', async () => {
    const handleChange = jest.fn();
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        onChange={handleChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const disabledOption = screen.getByText('Option 4');
      fireEvent.click(disabledOption);
    });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('filters options when searchable and user types', async () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        searchable
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Option 2' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('shows "No options found" when search has no results', async () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        searchable
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    });

    await waitFor(() => {
      expect(screen.getByText('No options found')).toBeInTheDocument();
    });
  });

  it('clears selection when clear button is clicked', async () => {
    const handleChange = jest.fn();
    const handleClear = jest.fn();
    
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        value="option1"
        onChange={handleChange}
        onClear={handleClear}
        clearable
      />
    );

    const clearButton = screen.getByLabelText('Clear selection');
    fireEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalled();
  });

  it('closes dropdown when Escape key is pressed', async () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.keyDown(button, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('navigates options with arrow keys', async () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Arrow down should highlight first option
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    
    // The first option should have highlighted styling
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveClass('bg-indigo-50');
  });

  it('renders custom option content', () => {
    const customOptions: SelectOption[] = [
      { 
        value: '1', 
        label: 'Custom Option',
        icon: <span data-testid="custom-icon">🎨</span>
      },
    ];

    render(
      <SelectDropdown
        label="Test Select"
        options={customOptions}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <SelectDropdown
        label="Test Select"
        options={mockOptions}
        error="Error message"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-invalid', 'true');
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <SelectDropdown
          label="Test Select"
          options={mockOptions}
        />
        <button>Outside Button</button>
      </div>
    );

    const selectButton = screen.getByRole('button', { name: /test select/i });
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const outsideButton = screen.getByText('Outside Button');
    fireEvent.mouseDown(outsideButton);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
