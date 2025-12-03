// backend/src/utils/assignmentNormalizer.js

/**
 * Normalize assignment names for better fuzzy matching
 * Handles emojis, special chars, abbreviations, and extracts key tokens
 */

/**
 * Remove emojis and special characters
 */
function stripSpecialChars(str) {
  return str
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
    .replace(/[_\-#]/g, ' ')                // Replace separators with spaces
    .replace(/\s+/g, ' ')                   // Collapse multiple spaces
    .trim()
    .toLowerCase();
}

/**
 * Extract unit number from assignment name
 * Examples: "unit 1", "u1", "unit_1"
 */
function extractUnit(str) {
  const patterns = [
    /unit\s*(\d+)/i,
    /u\s*(\d+)/i,
    /unit\s*([ivxlcdm]+)/i  // Roman numerals
  ];
  
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) return match[1].toLowerCase();
  }
  return null;
}

/**
 * Extract assignment type
 * Examples: "quiz", "test", "homework", "interview"
 */
function extractType(str) {
  const types = {
    'quiz': ['quiz', 'qz'],
    'test': ['test', 'exam', 'assessment'],
    'homework': ['homework', 'hw', 'assignment'],
    'interview': ['interview', 'int'],
    'project': ['project', 'proj'],
    'lab': ['lab', 'laboratory'],
    'essay': ['essay', 'writing'],
    'presentation': ['presentation', 'pres'],
    'exit': ['exit', 'ticket']
  };
  
  const normalized = str.toLowerCase();
  
  for (const [standardType, variations] of Object.entries(types)) {
    for (const variation of variations) {
      if (normalized.includes(variation)) {
        return standardType;
      }
    }
  }
  
  return null;
}

/**
 * Extract assignment number
 * Examples: "#1", "1.1", "part 2"
 */
function extractNumber(str) {
  const patterns = [
    /#\s*(\d+(?:\.\d+)?)/,   // #1, #1.1
    /(\d+(?:\.\d+)?)\s*$/,    // Ending with number
    /part\s*(\d+)/i,
    /section\s*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Expand common abbreviations in user input
 */
function expandAbbreviations(str) {
  const expansions = {
    'u': 'unit',
    'hw': 'homework',
    'qz': 'quiz',
    'int': 'interview',
    'proj': 'project',
    'pres': 'presentation',
    'lab': 'laboratory'
  };
  
  let expanded = str.toLowerCase();
  
  // Replace standalone abbreviations (with word boundaries)
  for (const [abbr, full] of Object.entries(expansions)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  }
  
  return expanded;
}

/**
 * Create searchable tokens from assignment name
 */
function tokenizeAssignment(assignmentName) {
  const cleaned = stripSpecialChars(assignmentName);
  const unit = extractUnit(cleaned);
  const type = extractType(cleaned);
  const number = extractNumber(cleaned);
  
  return {
    original: assignmentName,
    cleaned,
    unit,
    type,
    number,
    // Create a normalized search string
    searchString: [unit, type, number].filter(Boolean).join(' '),
    // Create tokens for matching
    tokens: cleaned.split(' ').filter(t => t.length > 0)
  };
}

/**
 * Score two assignments for similarity
 * Returns a score from 0 (no match) to 100 (perfect match)
 */
function scoreMatch(userTokens, assignmentTokens) {
  let score = 0;
  
  // Perfect match on search string (unit + type + number)
  if (userTokens.searchString && 
      assignmentTokens.searchString && 
      userTokens.searchString === assignmentTokens.searchString) {
    return 100;
  }
  
  // High score if unit, type, and number all match
  if (userTokens.unit && assignmentTokens.unit && userTokens.unit === assignmentTokens.unit) {
    score += 40;
  }
  
  if (userTokens.type && assignmentTokens.type && userTokens.type === assignmentTokens.type) {
    score += 30;
  }
  
  if (userTokens.number && assignmentTokens.number && userTokens.number === assignmentTokens.number) {
    score += 20;
  }
  
  // Token overlap scoring - important for keywords like "french", "weekly"
  if (userTokens.tokens && assignmentTokens.tokens) {
    const userSet = new Set(userTokens.tokens);
    const assignmentSet = new Set(assignmentTokens.tokens);
    let overlaps = 0;
    
    userSet.forEach(token => {
      if (assignmentSet.has(token)) {
        overlaps++;
      }
    });
    
    // Award points for keyword matches
    const overlapScore = (overlaps / userTokens.tokens.length) * 20;
    score += overlapScore;
  }
  
  // Partial credit for cleaned string similarity
  if (assignmentTokens.cleaned.includes(userTokens.cleaned)) {
    score += 10;
  } else if (userTokens.cleaned.length > 3 && assignmentTokens.cleaned.includes(userTokens.cleaned.substring(0, Math.floor(userTokens.cleaned.length * 0.7)))) {
    score += 5;
  }
  
  return Math.round(score);
}

/**
 * Smart fuzzy matching for assignments
 * @param {string} userInput - What the teacher typed
 * @param {Array} assignments - Array of assignment objects with 'name' property
 * @returns {Array} - Sorted matches with scores
 */
function smartMatchAssignments(userInput, assignments) {
  // Expand abbreviations in user input
  const expandedInput = expandAbbreviations(userInput);
  const userTokens = tokenizeAssignment(expandedInput);
  
  console.log('=== ASSIGNMENT MATCHER DEBUG ===');
  console.log('User input:', userInput);
  console.log('Expanded:', expandedInput);
  console.log('User tokens:', userTokens);
  
  // Tokenize all assignments
  const tokenizedAssignments = assignments.map(assignment => ({
    ...assignment,
    tokens: tokenizeAssignment(assignment.name)
  }));
  
  console.log('Sample assignment tokens:', tokenizedAssignments[0]?.tokens);
  
  // Score each assignment
  const scored = tokenizedAssignments.map(assignment => ({
    ...assignment,
    matchScore: scoreMatch(userTokens, assignment.tokens)
  }));
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.matchScore - a.matchScore);
  
  console.log('Top 3 matches:');
  scored.slice(0, 3).forEach(a => {
    console.log(`  - ${a.name} (score: ${a.matchScore})`);
  });
  
  return scored;
}

/**
 * Find best assignment match with intelligent fallback
 * @param {string} userInput - What the teacher typed
 * @param {Array} assignments - Array of assignment objects
 * @param {number} threshold - Minimum score to consider a match (default 50)
 * @returns {Object} - Best match or clarification object
 */
function findBestMatch(userInput, assignments, threshold = 50) {
  const matches = smartMatchAssignments(userInput, assignments);
  
  // No matches at all
  if (matches.length === 0) {
    return {
      found: false,
      error: `No assignments found matching "${userInput}"`
    };
  }
  
  const topMatch = matches[0];
  const secondMatch = matches[1];
  
  // Perfect or very high confidence match
  if (topMatch.matchScore >= 90) {
    return {
      found: true,
      assignment: topMatch,
      confidence: 'high'
    };
  }
  
  // Good match and significantly better than second
  if (topMatch.matchScore >= threshold && 
      (!secondMatch || topMatch.matchScore - secondMatch.matchScore >= 20)) {
    return {
      found: true,
      assignment: topMatch,
      confidence: 'medium'
    };
  }
  
  // Multiple close matches - need clarification
  const closeMatches = matches.filter(m => m.matchScore >= threshold).slice(0, 5);
  
  if (closeMatches.length === 0) {
    return {
      found: false,
      error: `No assignments found matching "${userInput}". Try being more specific (e.g., "unit 1 interview 2")`
    };
  }
  
  if (closeMatches.length === 1) {
    return {
      found: true,
      assignment: closeMatches[0],
      confidence: 'low'
    };
  }
  
  // Multiple matches - ask for clarification
  return {
    found: false,
    needsClarification: true,
    matches: closeMatches,
    message: `I found ${closeMatches.length} assignments matching "${userInput}":`
  };
}

/**
 * Format clarification message for frontend
 */
function formatClarification(matches) {
  return matches.map((match, index) => {
    const tokens = match.tokens;
    const details = [];
    
    if (tokens.unit) details.push(`Unit ${tokens.unit}`);
    if (tokens.type) details.push(tokens.type);
    if (tokens.number) details.push(`#${tokens.number}`);
    
    const context = details.length > 0 ? ` (${details.join(', ')})` : '';
    
    return `${index + 1}. ${match.name}${context}`;
  }).join('\n');
}

module.exports = {
  stripSpecialChars,
  extractUnit,
  extractType,
  extractNumber,
  expandAbbreviations,
  tokenizeAssignment,
  smartMatchAssignments,
  findBestMatch,
  formatClarification
};
