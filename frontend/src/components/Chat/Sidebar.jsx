import React from 'react';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header-mobile">
          <h2>Chatbot</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <h2 className="sidebar-header-desktop">Chatbot</h2>
        <button className="new-chat-btn">
        <span>New Chat</span>
        <span>➕</span>
      </button>
      
      <div className="recent-chats">
        <h3>Recent</h3>
        <div className="chat-item">How to use RAG</div>
        <div className="chat-item">Upload documents</div>
        <div className="chat-item">Explain API setup</div>
      </div>
    </aside>
  );
}
