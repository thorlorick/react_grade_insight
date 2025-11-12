// backend/utils/rick/contextBuilder.js

/**
 * Build context for the AI prompt
 * No memories are used; only teacher info and user message.
 */
const buildContext = ({ teacherId, teacherName, userMessage }) => {
  return {
    teacherId,
    teacherName,
    userMessage
  };
};

/**
 * Format memories for prompt
 * Stub: returns empty string because we are memory-free
 */
const formatMemories = (memories) => {
  return ''; // no memories to include
};

/**
 * Optional: extract keywords from message
 * For now, we just return an empty array (no student parsing)
 */
const extractStudentNames = (text) => {
  return [];
};

module.exports = {
  buildContext,
  formatMemories,
  extractStudentNames
};
