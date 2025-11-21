import React from 'react';
import CopyButton from './CopyButton';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check } from 'lucide-react';

/**
 * Example component demonstrating various uses of copy-to-clipboard functionality
 * This file serves as a reference for developers
 */
export const CopyButtonExample: React.FC = () => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Copy to Clipboard Examples</h1>
        <p className="text-gray-600">
          Demonstrating various implementations of copy-to-clipboard functionality
        </p>
      </div>

      {/* CopyButton Component Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">CopyButton Component</h2>
        
        {/* Basic Usage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Usage</h3>
          <div className="flex items-center gap-4">
            <CopyButton text="Hello World" />
            <CopyButton text="Hello World" label="Copy Text" />
            <CopyButton text="Hello World" label="Copy" copiedLabel="Done!" />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Variants</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <CopyButton text="Primary variant" variant="primary" label="Primary" />
            <CopyButton text="Secondary variant" variant="secondary" label="Secondary" />
            <CopyButton text="Outline variant" variant="outline" label="Outline" />
            <CopyButton text="Ghost variant" variant="ghost" label="Ghost" />
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Sizes</h3>
          <div className="flex items-center gap-4">
            <CopyButton text="Small size" size="sm" label="Small" />
            <CopyButton text="Medium size" size="md" label="Medium" />
            <CopyButton text="Large size" size="lg" label="Large" />
          </div>
        </div>

        {/* Icon Only */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Icon Only</h3>
          <div className="flex items-center gap-4">
            <CopyButton text="Icon only" iconOnly />
            <CopyButton text="Icon only with label" iconOnly ariaLabel="Copy this text" />
          </div>
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Real-World Examples</h2>

        {/* API Key Display */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">API Key Display</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 px-4 py-2 rounded font-mono text-sm">
              sk_live_51234567890abcdef
            </code>
            <CopyButton 
              text="sk_live_51234567890abcdef"
              variant="outline"
              size="md"
              label="Copy Key"
            />
          </div>
        </div>

        {/* Credential Fields */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Credential Fields</h3>
          <div className="space-y-3">
            {/* URL */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">URL</label>
              <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                <span className="flex-1 text-sm font-mono text-gray-900">
                  https://example.com/account/12345
                </span>
                <CopyButton 
                  text="https://example.com/account/12345"
                  iconOnly
                  ariaLabel="Copy URL"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">Username</label>
              <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                <span className="flex-1 text-sm font-mono text-gray-900">
                  user@example.com
                </span>
                <CopyButton 
                  text="user@example.com"
                  iconOnly
                  ariaLabel="Copy username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">Password</label>
              <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                <span className="flex-1 text-sm font-mono text-gray-900">
                  ••••••••••••
                </span>
                <CopyButton 
                  text="SecurePassword123!"
                  iconOnly
                  ariaLabel="Copy password"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Code Snippet</h3>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`import { CopyButton } from '@/shared/components';

function MyComponent() {
  return <CopyButton text="Copy me!" />;
}`}</code>
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton 
                text={`import { CopyButton } from '@/shared/components';\n\nfunction MyComponent() {\n  return <CopyButton text="Copy me!" />;\n}`}
                variant="ghost"
                size="sm"
                label="Copy"
                className="bg-gray-800 hover:bg-gray-700 text-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* useCopyToClipboard Hook Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">useCopyToClipboard Hook</h2>

        {/* Custom Implementation */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Custom Implementation</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => copyToClipboard('Custom hook example')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy with Hook</span>
                </>
              )}
            </button>
            <span className="text-sm text-gray-600">
              {copied ? 'Text copied to clipboard!' : 'Click to copy'}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <code className="text-sm text-gray-800">
              const {`{ copied, copyToClipboard }`} = useCopyToClipboard();
            </code>
          </div>
        </div>
      </section>

      {/* With Callbacks */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">With Callbacks</h2>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Success and Error Callbacks</h3>
          <div className="flex items-center gap-4">
            <CopyButton 
              text="Text with callbacks"
              label="Copy with Callbacks"
              onCopy={() => console.log('✅ Copy successful!')}
              onError={(error) => console.error('❌ Copy failed:', error)}
            />
          </div>
          <p className="text-sm text-gray-600">
            Check the browser console to see callback messages
          </p>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Accessibility Features</h2>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Keyboard Navigation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Try navigating with Tab key and activating with Enter or Space
          </p>
          <div className="flex items-center gap-4">
            <CopyButton text="Keyboard accessible 1" label="Button 1" />
            <CopyButton text="Keyboard accessible 2" label="Button 2" />
            <CopyButton text="Keyboard accessible 3" label="Button 3" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Screen Reader Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            All buttons have proper ARIA labels for screen readers
          </p>
          <div className="flex items-center gap-4">
            <CopyButton 
              text="Screen reader friendly"
              iconOnly
              ariaLabel="Copy text to clipboard"
            />
            <CopyButton 
              text="Another example"
              label="Copy"
              ariaLabel="Copy example text to clipboard"
            />
          </div>
        </div>
      </section>

      {/* Browser Compatibility */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Browser Compatibility</h2>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Modern Browsers</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Chrome 63+</li>
                <li>✅ Firefox 53+</li>
                <li>✅ Safari 13.1+</li>
                <li>✅ Edge 79+</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fallback Support</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Internet Explorer 11</li>
                <li>✅ Older Edge versions</li>
                <li>✅ HTTP contexts</li>
                <li>✅ Mobile browsers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CopyButtonExample;
