// frontend/src/components/RickAI/ChatInput.jsx

import React, { useState, useRef } from 'react';
import './ChatInput.module.css';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim());
    setMessage('');

    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Enter = send, Shift+Enter = newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="input-wrapper">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="chat-input"
        />

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="send-button"
        >
          {disabled ? '...' : '→'}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
