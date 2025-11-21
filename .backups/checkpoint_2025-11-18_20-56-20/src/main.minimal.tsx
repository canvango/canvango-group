import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

console.log('=== MINIMAL TEST ===');
console.log('1. React loaded:', !!React);
console.log('2. ReactDOM loaded:', !!ReactDOM);
console.log('3. Root element:', document.getElementById('root'));

// Test 1: Just render text


// Test 2: Try to import Supabase
let supabaseTest = 'Not tested';
try {
  const { supabase } = await import('./features/member-area/services/supabase');
  supabaseTest = supabase ? '✅ Supabase loaded' : '❌ Supabase failed';
  console.log('4. Supabase:', supabaseTest);
} catch (error) {
  supabaseTest = `❌ Supabase error: ${error}`;
  console.error('4. Supabase error:', error);
}

// Test 3: Try to import AuthContext
let authContextTest = 'Not tested';
try {
  const { AuthProvider } = await import('./features/member-area/contexts/AuthContext');
  authContextTest = typeof AuthProvider === 'function' ? '✅ AuthContext loaded' : '❌ AuthContext failed';
  console.log('5. AuthContext:', authContextTest);
} catch (error) {
  authContextTest = `❌ AuthContext error: ${error}`;
  console.error('5. AuthContext error:', error);
}

// Test 4: Try to import UIContext
let uiContextTest = 'Not tested';
try {
  const { UIProvider } = await import('./features/member-area/contexts/UIContext');
  uiContextTest = typeof UIProvider === 'function' ? '✅ UIContext loaded' : '❌ UIContext failed';
  console.log('6. UIContext:', uiContextTest);
} catch (error) {
  uiContextTest = `❌ UIContext error: ${error}`;
  console.error('6. UIContext error:', error);
}

// Test 5: Try to import ToastContext
let toastContextTest = 'Not tested';
try {
  const { ToastProvider } = await import('./shared/contexts/ToastContext');
  toastContextTest = typeof ToastProvider === 'function' ? '✅ ToastContext loaded' : '❌ ToastContext failed';
  console.log('7. ToastContext:', toastContextTest);
} catch (error) {
  toastContextTest = `❌ ToastContext error: ${error}`;
  console.error('7. ToastContext error:', error);
}

// Test 6: Try to import MemberArea
let memberAreaTest = 'Not tested';
try {
  const MemberArea = await import('./features/member-area/MemberArea');
  memberAreaTest = MemberArea ? '✅ MemberArea loaded' : '❌ MemberArea failed';
  console.log('8. MemberArea:', memberAreaTest);
} catch (error) {
  memberAreaTest = `❌ MemberArea error: ${error}`;
  console.error('8. MemberArea error:', error);
}

const TestResults = () => (
  <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
    <h1 style={{ color: '#4F46E5', marginBottom: '30px' }}>🔍 Minimal Test Results</h1>
    
    <div style={{ background: '#F3F4F6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Import Tests</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
          <strong>React:</strong> ✅ Working
        </li>
        <li style={{ padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
          <strong>ReactDOM:</strong> ✅ Working
        </li>
        <li style={{ padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
          <strong>Supabase:</strong> {supabaseTest}
        </li>
        <li style={{ padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
          <strong>AuthContext:</strong> {authContextTest}
        </li>
        <li style={{ padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
          <strong>UIContext:</strong> {uiContextTest}
        </li>
        <li style={{ padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
          <strong>ToastContext:</strong> {toastContextTest}
        </li>
        <li style={{ padding: '8px 0' }}>
          <strong>MemberArea:</strong> {memberAreaTest}
        </li>
      </ul>
    </div>
    
    <div style={{ background: '#FEF3C7', padding: '20px', borderRadius: '8px' }}>
      <h2>Instructions</h2>
      <ol>
        <li>Check browser console (F12) for detailed error messages</li>
        <li>Look for the first ❌ in the list above</li>
        <li>That's where the import chain breaks</li>
      </ol>
    </div>
  </div>
);

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <TestResults />
    </React.StrictMode>
  );
}
