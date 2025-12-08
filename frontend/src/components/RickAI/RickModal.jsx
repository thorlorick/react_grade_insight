import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../api/rickAPI';
import styles from './RickModal.module.css';

// Component to render structured data as a nice list
const StructuredResponse = ({ data }) => {
  if (!data) return null;

  const { type, title, summary, studentList, stats, isHighRate, isHighFailureRate, isLowFailureRate } = data;

  return (
    <div className={styles.structuredResponse}>
      <h3 className={styles.responseTitle}>{title}</h3>
      
      <p className={styles.responseSummary}>
        {summary}
        {isHighRate && <span className={styles.warningBadge}>⚠️ High rate</span>}
        {isHighFailureRate && <span className={styles.warningBadge}>⚠️ Challenging assignment</span>}
        {isLowFailureRate && <span className={styles.infoBadge}>ℹ️ Targeted intervention</span>}
      </p>

      {/* Show stats if available (for failed assignments) */}
      {stats && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Average:</span>
            <span className={styles.statValue}>{stats.average}%</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Range:</span>
            <span className={styles.statValue}>{stats.min}% - {stats.max}%</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Graded:</span>
            <span className={styles.statValue}>{stats.graded}</span>
          </div>
        </div>
      )}

      {/* Student list */}
      {studentList && studentList.length > 0 && (
        <div className={styles.studentListContainer}>
          <p className={styles.studentListHeader}>
            Students ({studentList.length}):
          </p>
          <ul className={styles.studentList}>
            {studentList.map((student, index) => (
              <li key={student.id || index} className={styles.studentItem}>
                <span className={styles.studentName}>{student.name}</span>
                {student.grade && (
                  <span className={styles.studentGrade}>{student.grade}</span>
                )}
                {student.missingCount > 0 && (
                  <span className={styles.missingBadge}>
                    {student.missingCount} missing
                  </span>
                )}
                {student.missingRate && (
                  <span className={styles.missingBadge}>
                    {student.missingRate} of assignments
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Component to render clarification requests
const ClarificationResponse = ({ message }) => {
  return (
    <div className={styles.clarificationResponse}>
      <div className={styles.clarificationIcon}>🤔</div>
      <div className={styles.clarificationContent}>
        <p className={styles.clarificationText}>{message}</p>
        <p className={styles.clarificationHint}>
          💡 Try copying one of the exact names above, or be more specific.
        </p>
      </div>
    </div>
  );
};

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

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);
 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        content: `
Hi! I'm Rick, your Teaching Assistant. I can help you analyze student data and track progress.

You can ask things like:
• How is STUDENT doing in SUBJECT?
• How is STUDENT doing?
• Who didn't do ASSIGNMENT?
• Who failed ASSIGNMENT?
• Who is at risk?
• Who has lots of missing work?
`,  
        isUser: false,
        timestamp: new Date(),
        data: null,
        structured: null,
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
      structured: null,
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
          structured: result.structured || null,  // Store structured data
          needsClarification: result.needsClarification || false,  // Store clarification flag
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
        structured: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Refocus the input after sending
      inputRef.current?.focus();
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
          structured: null,
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
        <span className={styles.minimizedText}>Rick</span>
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
              <h2 className={styles.title}>Rick</h2>
              <p className={styles.subtitle}>Your Personal Teaching Assistant</p>
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

        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.isUser ? styles.messageUser : styles.messageAssistant}`}
            >
              <div className={styles.messageContent}>
                {/* If clarification needed, show special UI */}
                {msg.needsClarification ? (
                  <ClarificationResponse message={msg.content} />
                ) : msg.structured ? (
                  /* If structured data exists, render it nicely */
                  <StructuredResponse data={msg.structured} />
                ) : (
                  /* Otherwise show text */
                  <div className={styles.textContent}>
                    {msg.content}
                  </div>
                )}
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
