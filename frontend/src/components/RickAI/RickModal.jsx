import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../api/rickAPI';
import styles from './RickModal.module.css';

const RickModal = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!minimized) {
      scrollToBottom();
    }
  }, [messages, minimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        content: "Hi! I'm Rick, your AI teaching assistant. I can help you analyze student data, track progress, and answer questions about your class.",
        isUser: false,
        timestamp: new Date(),
        data: null,
      },
    ]);
  }, []);

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
      data: null,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Send to backend (teacher_id handled by auth)
      const result = await sendMessage(messageText, conversationHistory);

      if (result.success) {
        const rickMessage = {
          id: Date.now() + 1,
          content: result.response,
          isUser: false,
          timestamp: new Date(),
          data: result.data || null,
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
        data: null,
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
          data: null,
        },
      ]);
    }
  };

  // Handle click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (minimized) {
    return (
      <div className={styles.minimized} onClick={() => setMinimized(false)}>
        <span className={styles.minimizedIcon}>🤖</span>
        <span className={styles.minimizedText}>Rick AI</span>
        {messages.length > 1 && (
          <span className={styles.messageCount}>{messages.length - 1}</span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.icon}>🤖</span>
            <div>
              <h2 className={styles.title}>Rick AI</h2>
              <p className={styles.subtitle}>Your teaching assistant</p>
            </div>
          </div>
          <div className={styles.headerButtons}>
            <button
              onClick={() => setMinimized(true)}
              className={styles.minimizeButton}
              title="Minimize"
            >
              −
            </button>
            <button
              onClick={clearChat}
              className={styles.clearButton}
              title="Clear chat"
            >
              🗑️
            </button>
            <button
              onClick={onClose}
              className={styles.closeButton}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.isUser ? styles.messageUser : styles.messageAssistant}`}
            >
              <div className={styles.messageContent}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg.content}
                </pre>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={styles.loadingIndicator}>
              <div className={styles.typingAnimation}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className={styles.loadingText}>Rick is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <form onSubmit={handleSendMessage} className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.sendButton}
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

export default RickModal;
