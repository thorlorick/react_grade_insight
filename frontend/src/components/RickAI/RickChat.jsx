import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../api/rickAPI';
import './RickChat.css';

const RickChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          content: "Hi! I'm Rick CHAT, your PATTERN RECOG teaching assistant. I can help you analyze student data, track progress, and answer questions about your class.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = inputValue.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history (last 10 messages)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      }));

      const result = await sendMessage(messageText, conversationHistory);

      if (result.success) {
        const rickMessage = {
          id: Date.now() + 1,
          content: result.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, rickMessage]);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([
        {
          id: Date.now(),
          content: 'Chat cleared. How can I help you?',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rick-overlay" onClick={handleOverlayClick}>
      <div className="rick-modal">
        {/* Header */}
        <div className="rick-header">
          <div className="rick-header-left">
            <span className="rick-icon">🤖</span>
            <div>
              <h2 className="rick-title">Rick AI</h2>
              <p className="rick-subtitle">Your teaching assistant</p>
            </div>
          </div>
          <div className="rick-header-buttons">
            <button onClick={clearChat} className="rick-clear-btn" title="Clear chat">
              🗑️
            </button>
            <button onClick={onClose} className="rick-close-btn" title="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="rick-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rick-message ${msg.isUser ? 'rick-message-user' : 'rick-message-assistant'}`}
            >
              <div className="rick-message-content">{msg.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="rick-message rick-message-assistant">
              <div className="rick-loading">
                <div className="rick-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="rick-loading-text">Rick is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="rick-input-form">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            className="rick-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rick-send-btn"
            disabled={isLoading || !inputValue.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RickChat;
