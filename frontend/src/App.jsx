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
    <div className="app-container">
      <nav className="main-nav" style={{ position: 'fixed', top: 0, right: 0, padding: '10px', zIndex: 1000 }}>
        <button onClick={goChat} style={{ marginRight: '10px' }}>Chat</button>
        <button onClick={hasToken ? goDashboard : goLogin}>
          {hasToken ? 'Dashboard' : 'Admin Login'}
        </button>
      </nav>
      
      {route === 'chat' && <Chat />}
      {route === 'login' && <Login onLoginSuccess={() => setRoute('dashboard')} />}
      {route === 'dashboard' && <Dashboard onLogout={() => setRoute('chat')} />}
    </div>
  );
}

export default App;
