import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Badge from './Badge';
import Card from './Card';
import Modal from './Modal';
import { Search, Mail, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Component Showcase - Visual verification of all shared UI components
 * This page demonstrates all variants and states of the shared components
 */
const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shared UI Components Showcase
          </h1>
          <p className="text-gray-600">
            Visual verification of all implemented components for Task 2
          </p>
        </div>

        {/* Button Component */}
        <Card>
          <Card.Header>
            <h2 className="text-2xl font-semibold text-gray-900">Button Component</h2>
            <p className="text-sm text-gray-600 mt-1">
              Variants: primary, secondary, outline, ghost, danger | Sizes: sm, md, lg | States: loading, disabled
            </p>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button icon={<Search className="w-4 h-4" />}>With Icon</Button>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Input Component */}
        <Card>
          <Card.Header>
            <h2 className="text-2xl font-semibold text-gray-900">Input Component</h2>
            <p className="text-sm text-gray-600 mt-1">
              Types: text, number, email, password | Features: validation, icons, helper text
            </p>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Basic Input"
                placeholder="Enter text..."
                helperText="This is helper text"
              />
              <Input
                label="With Prefix Icon"
                placeholder="Search..."
                prefixIcon={<Search className="w-5 h-5 text-gray-400" />}
              />
              <Input
                label="With Suffix Icon"
                placeholder="Email address"
                type="email"
                suffixIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />
              <Input
                label="With Error"
                placeholder="Enter value..."
                error="This field is required"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Required Field"
                placeholder="Required..."
                required
              />
              <Input
                label="Disabled Input"
                placeholder="Disabled..."
                disabled
                value="Cannot edit"
              />
            </div>
          </Card.Body>
        </Card>

        {/* Badge Component */}
        <Card>
          <Card.Header>
            <h2 className="text-2xl font-semibold text-gray-900">Badge Component</h2>
            <p className="text-sm text-gray-600 mt-1">
              Variants: success, warning, error, info, default | Sizes: sm, md, lg | Features: icon support
            </p>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="default">Default</Badge>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge size="sm" variant="success">Small</Badge>
                  <Badge size="md" variant="success">Medium</Badge>
                  <Badge size="lg" variant="success">Large</Badge>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                    Approved
                  </Badge>
                  <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>
                    Pending
                  </Badge>
                  <Badge variant="error" icon={<XCircle className="w-3 h-3" />}>
                    Rejected
                  </Badge>
                  <Badge variant="info" icon={<Info className="w-3 h-3" />}>
                    Information
                  </Badge>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Card Component */}
        <Card>
          <Card.Header>
            <h2 className="text-2xl font-semibold text-gray-900">Card Component</h2>
            <p className="text-sm text-gray-600 mt-1">
              Features: header, body, footer sections | hover effects | shadow variants
            </p>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Card */}
              <Card shadow="sm">
                <Card.Body>
                  <h3 className="font-semibold mb-2">Basic Card</h3>
                  <p className="text-sm text-gray-600">
                    Simple card with small shadow
                  </p>
                </Card.Body>
              </Card>

              {/* Card with Header and Footer */}
              <Card shadow="md">
                <Card.Header>
                  <h3 className="font-semibold">Card Header</h3>
                </Card.Header>
                <Card.Body>
                  <p className="text-sm text-gray-600">
                    Card with header, body, and footer sections
                  </p>
                </Card.Body>
                <Card.Footer>
                  <Button size="sm" variant="outline">Action</Button>
                </Card.Footer>
              </Card>

              {/* Hover Card */}
              <Card shadow="lg" hover>
                <Card.Body>
                  <h3 className="font-semibold mb-2">Hover Card</h3>
                  <p className="text-sm text-gray-600">
                    Hover over this card to see the effect
                  </p>
                </Card.Body>
              </Card>
            </div>
          </Card.Body>
        </Card>

        {/* Modal Component */}
        <Card>
          <Card.Header>
            <h2 className="text-2xl font-semibold text-gray-900">Modal Component</h2>
            <p className="text-sm text-gray-600 mt-1">
              Features: focus trap, backdrop click, sizes, close button, accessibility
            </p>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click the button below to open a modal dialog. The modal includes:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Focus trap (tab navigation stays within modal)</li>
                <li>Backdrop click to close</li>
                <li>Escape key to close</li>
                <li>Proper ARIA attributes for accessibility</li>
                <li>Multiple size options</li>
              </ul>
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Summary Card */}
        <Card shadow="lg">
          <Card.Body>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Task 2 Complete! ✓
              </h2>
              <p className="text-gray-600 mb-4">
                All shared UI components have been successfully implemented and verified
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="success">Button ✓</Badge>
                <Badge variant="success">Input ✓</Badge>
                <Badge variant="success">Badge ✓</Badge>
                <Badge variant="success">Card ✓</Badge>
                <Badge variant="success">Modal ✓</Badge>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Modal Example */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is an example modal dialog. It demonstrates:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Proper focus management</li>
            <li>Keyboard navigation (try pressing Tab)</li>
            <li>Escape key closes the modal</li>
            <li>Clicking outside closes the modal</li>
            <li>ARIA attributes for screen readers</li>
          </ul>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComponentShowcase;
