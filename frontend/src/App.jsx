import React, { useState, useEffect } from 'react';
import Chat from './components/Chat/Chat';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [route, setRoute] = useState('chat'); // 'chat', 'login', 'dashboard'

  const hasToken = !!localStorage.getItem('adminToken');

  const goLogin = () => setRoute('login');
  const goDashboard = () => setRoute('dashboard');
  const goChat = () => setRoute('chat');

  useEffect(() => {
    if (route === 'dashboard' && !hasToken) {
      setRoute('login');
    }
  }, [route, hasToken]);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="glass-panel" style={{ 
        position: 'fixed', 
        top: '16px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        padding: '6px',
        zIndex: 1000,
        borderRadius: '30px'
      }}>
        <button 
          onClick={goChat} 
          style={{ 
            padding: '8px 24px', 
            borderRadius: '24px', 
            background: route === 'chat' ? 'var(--accent-gradient)' : 'transparent',
            color: route === 'chat' ? '#fff' : 'var(--text)',
          }}
        >
          Chatbot
        </button>
        <button 
          onClick={hasToken ? goDashboard : goLogin}
          style={{ 
            padding: '8px 24px', 
            borderRadius: '24px', 
            background: (route === 'dashboard' || route === 'login') ? 'var(--accent-gradient)' : 'transparent',
            color: (route === 'dashboard' || route === 'login') ? '#fff' : 'var(--text)',
          }}
        >
          {hasToken ? 'Admin Dashboard' : 'Admin Login'}
        </button>
      </nav>
      
      <main style={{ flex: 1, display: 'flex', paddingTop: '80px' }}>
        {route === 'chat' && <Chat />}
        {route === 'login' && <Login onLoginSuccess={() => setRoute('dashboard')} />}
        {route === 'dashboard' && <Dashboard onLogout={() => setRoute('chat')} />}
      </main>
    </div>
  );
}

export default App;
