// frontend/src/services/rickAPI.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://gradeinsight.com:8083/api';

/**
 * Send a message to Rick
 */
export const sendMessage = async (message, conversationHistory = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rick/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for sending cookies/session
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message to Rick:', error);
    throw error;
  }
};
