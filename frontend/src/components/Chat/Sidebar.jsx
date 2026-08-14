import React from 'react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Chatbot</h2>
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
