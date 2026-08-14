import React, { useRef, useEffect } from 'react';

export default function MessageList({ messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.role}`}>
          <div className={`avatar ${msg.role}`}>
            {msg.role === 'user' ? 'U' : 'AI'}
          </div>
          <div className="bubble">
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
