import React, { useState } from 'react';
import { uploadDocument } from '../../services/api';
import './Dashboard.css';

export default function Dashboard({ onLogout }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');
    try {
      await uploadDocument(text);
      setStatus('Upload successful!');
      setText('');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>
      <main className="dashboard-main">
        <form onSubmit={handleUpload} className="upload-form">
          <h3>Upload Resource Document</h3>
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Paste document text here..."
            required
            rows="10"
          />
          <button type="submit">Upload</button>
          {status && <p className="status-msg">{status}</p>}
        </form>
      </main>
    </div>
  );
}
