// frontend/src/components/RickAI/RickTrigger.jsx

import React, { useState } from 'react';
import RickModal from './RickModal';
import styles from './RickTrigger.module.css';

/**
 * Trigger button/link to open Rick AI
 * 
 * Usage in navbar:
 * <RickTrigger variant="link" />
 * 
 * Usage as floating button:
 * <RickTrigger />
 */
const RickTrigger = ({ variant = 'button' }) => {
  const [showRick, setShowRick] = useState(false);

  if (variant === 'link') {
    // For use in navigation bar
    return (
      <>
        <button 
          onClick={() => setShowRick(true)}
          className={styles.navLink}
          aria-label="Open Rick AI Assistant"
        >
          🤖 Rick AI
        </button>
        
        {showRick && (
          <RickModal onClose={() => setShowRick(false)} />
        )}
      </>
    );
  }

  // Default: floating button (bottom-right corner)
  return (
    <>
      <button 
        onClick={() => setShowRick(true)}
        className={styles.floatingButton}
        title="Ask Rick AI"
        aria-label="Open Rick AI Assistant"
      >
        🤖
        <span className={styles.pulseRing}></span>
      </button>
      
      {showRick && (
        <RickModal onClose={() => setShowRick(false)} />
      )}
    </>
  );
};

export default RickTrigger;
