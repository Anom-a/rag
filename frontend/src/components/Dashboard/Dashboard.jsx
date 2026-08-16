import React, { useState, useRef } from 'react';
import { uploadDocument, uploadFileDocument } from '../../services/api';
import './Dashboard.css';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');
    try {
      if (activeTab === 'text') {
        await uploadDocument(text);
        setText('');
      } else {
        if (!file) {
          setStatus('Error: Please select a file first.');
          return;
        }
        await uploadFileDocument(file);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      setStatus('Upload successful!');
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
        <div className="upload-tabs">
          <button 
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            Paste Text
          </button>
          <button 
            className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            Upload File
          </button>
        </div>
        <form onSubmit={handleUpload} className="upload-form">
          <h3>Upload Resource Document</h3>
          
          {activeTab === 'text' ? (
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Paste document text here..."
              required
              rows="10"
            />
          ) : (
            <div className="file-upload-area">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                accept=".txt,.md,.pdf,.docx"
                required
              />
              <p className="file-help">Supported formats: .txt, .md, .pdf, .docx</p>
            </div>
          )}

          <button type="submit">Upload</button>
          {status && <p className="status-msg">{status}</p>}
        </form>
      </main>
    </div>
  );
}
