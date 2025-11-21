import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const UserDebug: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#1a1a1a',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔍 User Debug</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      {user && (
        <>
          <div>Email: {user.email}</div>
          <div>Username: {user.username}</div>
          <div style={{ 
            color: user.role === 'admin' ? '#4ade80' : '#fbbf24',
            fontWeight: 'bold' 
          }}>
            Role: {user.role}
          </div>
          <div>Balance: {user.balance}</div>
        </>
      )}
      {!user && !loading && (
        <div style={{ color: '#ef4444' }}>No user data</div>
      )}
    </div>
  );
};
