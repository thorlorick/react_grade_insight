// backend/src/utils/rick/commandParser.js

/**
 * Parse special commands from user messages
 * Commands: /remember, /memories, /forget
 */

const COMMANDS = {
  REMEMBER: 'remember',
  MEMORIES: 'memories',
  FORGET: 'forget'
};

/**
 * Parse a message for commands
 * @param {string} message - User's message
 * @returns {Object|null} - Parsed command or null
 */
function parseCommand(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  const trimmed = message.trim().toLowerCase();

  // /remember [content]
  if (trimmed.startsWith('/remember ')) {
    const content = message.trim().substring(10).trim(); // Get everything after "/remember "
    if (!content) {
      return null;
    }
    return {
      type: COMMANDS.REMEMBER,
      content
    };
  }

  // /memories
  if (trimmed === '/memories') {
    return {
      type: COMMANDS.MEMORIES
    };
  }

  // /forget [memory_id]
  if (trimmed.startsWith('/forget ')) {
    const memoryId = message.trim().substring(8).trim(); // Get everything after "/forget "
    if (!memoryId || isNaN(parseInt(memoryId))) {
      return null;
    }
    return {
      type: COMMANDS.FORGET,
      memoryId: parseInt(memoryId)
    };
  }

  return null;
}

module.exports = {
  parseCommand,
  COMMANDS
};
