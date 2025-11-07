// frontend/src/components/RickAI/ChatMessage.jsx

import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser, timestamp, data }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const renderData = () => {
    if (!data || data.length === 0) return null;

    // Check if data is tabular
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      
      return (
        <div className="message-data">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header}>{header.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr key={index}>
                  {headers.map(header => (
                    <td key={header}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <p className="data-note">Showing 10 of {data.length} results</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'rick-message'}`}>
      <div className="message-header">
        <span className="message-sender">
          {isUser ? 'You' : '🤖 Rick'}
        </span>
        <span className="message-time">
          {formatTime(timestamp)}
        </span>
      </div>
      <div className="message-content">
        {message}
      </div>
      {renderData()}
    </div>
  );
};

export default ChatMessage;
