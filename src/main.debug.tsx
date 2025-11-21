import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/**
 * SIMPLIFIED DEBUG VERSION
 * Gunakan file ini untuk debugging dengan mengganti import di index.html
 * Ganti: <script type="module" src="/src/main.tsx"></script>
 * Dengan: <script type="module" src="/src/main.debug.tsx"></script>
 */

console.log('=== DEBUG MODE ===');
console.log('1. Environment Check:');
console.log('   - MODE:', import.meta.env.MODE);
console.log('   - DEV:', import.meta.env.DEV);
console.log('   - PROD:', import.meta.env.PROD);
console.log('   - BASE_URL:', import.meta.env.BASE_URL);

console.log('2. Supabase Config:');
console.log('   - URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('   - Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('   - Key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

console.log('3. All VITE_ variables:');
Object.keys(import.meta.env).forEach(key => {
  if (key.startsWith('VITE_')) {
    console.log(`   - ${key}:`, import.meta.env[key]);
  }
});

// Test Supabase connection
const testSupabaseConnection = async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ Supabase credentials missing!');
    return false;
  }
  
  try {
    console.log('4. Testing Supabase connection...');
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    console.log('   - Status:', response.status);
    console.log('   - OK:', response.ok);
    
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      return true;
    } else {
      console.error('❌ Supabase connection failed:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

// Simple test component
const DebugApp = () => {
  const [supabaseOk, setSupabaseOk] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    testSupabaseConnection()
      .then(setSupabaseOk)
      .catch(err => {
        setError(err.message);
        setSupabaseOk(false);
      });
  }, []);
  
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#4F46E5' }}>🔍 Vite Migration Debug</h1>
      
      <div style={{ 
        background: '#F3F4F6', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Environment Variables</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Mode:</td>
              <td style={{ padding: '8px' }}>{import.meta.env.MODE}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Dev:</td>
              <td style={{ padding: '8px' }}>{import.meta.env.DEV ? '✅ Yes' : '❌ No'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Supabase URL:</td>
              <td style={{ padding: '8px', wordBreak: 'break-all' }}>
                {import.meta.env.VITE_SUPABASE_URL || '❌ NOT SET'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Supabase Key:</td>
              <td style={{ padding: '8px' }}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY 
                  ? `✅ Set (${import.meta.env.VITE_SUPABASE_ANON_KEY.length} chars)` 
                  : '❌ NOT SET'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        background: supabaseOk === null ? '#FEF3C7' : supabaseOk ? '#D1FAE5' : '#FEE2E2', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Supabase Connection Test</h2>
        {supabaseOk === null && <p>⏳ Testing connection...</p>}
        {supabaseOk === true && <p>✅ Connection successful!</p>}
        {supabaseOk === false && (
          <>
            <p>❌ Connection failed!</p>
            {error && <pre style={{ background: 'white', padding: '10px', overflow: 'auto' }}>{error}</pre>}
          </>
        )}
      </div>
      
      <div style={{ 
        background: '#F3F4F6', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>LocalStorage Check</h2>
        <p>Items in localStorage: {localStorage.length}</p>
        {localStorage.length > 0 && (
          <ul>
            {Object.keys(localStorage).map(key => (
              <li key={key}>
                <strong>{key}:</strong> {localStorage.getItem(key)?.substring(0, 50)}...
              </li>
            ))}
          </ul>
        )}
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            background: '#EF4444',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Clear LocalStorage & Reload
        </button>
      </div>
      
      <div style={{ 
        background: '#F3F4F6', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Next Steps</h2>
        <ol>
          <li>Check console for detailed logs (F12 → Console)</li>
          <li>Verify environment variables are loaded correctly</li>
          <li>Test Supabase connection</li>
          <li>Clear localStorage if needed</li>
          <li>Switch back to main.tsx when ready</li>
        </ol>
        <p style={{ marginTop: '20px', color: '#6B7280' }}>
          To use normal app, change index.html back to: 
          <code style={{ background: 'white', padding: '2px 6px', borderRadius: '4px' }}>
            /src/main.tsx
          </code>
        </p>
      </div>
    </div>
  );
};

// Render debug app
const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<div style="padding: 20px; color: red;">❌ Root element not found!</div>';
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <DebugApp />
    </React.StrictMode>
  );
}
