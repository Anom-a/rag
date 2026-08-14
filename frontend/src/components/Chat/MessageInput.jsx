import React, { useState } from 'react';

export default function MessageInput({ onSend, isLoading }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Ask me anything..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className="input-actions">
          <button className="icon-btn">📎</button>
          <button className="icon-btn" onClick={handleSend} disabled={isLoading || !text.trim()}>
            🚀
          </button>
        </div>
      </div>
    </div>
  );
}
