import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { streamChat } from '../../services/api';
import './Chat.css';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text };
    const chatHistory = [...messages];
    
    setMessages(prev => [...prev, userMsg, { role: 'bot', content: '' }]);
    setIsLoading(true);

    let currentBotContent = '';

    await streamChat(
      text,
      chatHistory,
      (chunk) => {
        currentBotContent += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'bot', content: currentBotContent };
          return newMsgs;
        });
      },
      (error) => {
        console.error("Stream error", error);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'bot', content: currentBotContent + '\n[Error communicating with server]' };
          return newMsgs;
        });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="chat-container">
      <Sidebar />
      <div className="chat-main">
        <header className="chat-header">
          <div className="header-title">Chatbot</div>
          <div className="header-nav">
            <button>Settings</button>
          </div>
        </header>
        <MessageList messages={messages} />
        <MessageInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
