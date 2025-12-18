// frontend/src/components/RickAI/RickTrigger.jsx
import React, { useState } from 'react';
import RickModal from './RickModal';
import StudentModal from '../StudentModal'; // Fixed path
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
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Callback for when Rick wants to open a student modal
  const handleOpenStudentModal = (studentId) => {
    console.log('Rick triggered student modal for ID:', studentId);
    setSelectedStudentId(studentId);
    setShowStudentModal(true);
    // Optionally minimize Rick when student modal opens
    // setShowRick(false);
  };

  if (variant === 'link') {
    // For use in navigation bar
    return (
      <>
        <button 
          onClick={() => setShowRick(true)}
          className={styles.navLink}
          aria-label="Open Rick AI Assistant"
        >
          Analysis
        </button>
        
        {showRick && (
          <RickModal 
            onClose={() => setShowRick(false)}
            onOpenStudentModal={handleOpenStudentModal}
          />
        )}

        {showStudentModal && (
          <StudentModal 
            studentId={selectedStudentId}
            onClose={() => {
              setShowStudentModal(false);
              setSelectedStudentId(null);
            }}
          />
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
        <RickModal 
          onClose={() => setShowRick(false)}
          onOpenStudentModal={handleOpenStudentModal}
        />
      )}

      {showStudentModal && (
        <StudentModal 
          studentId={selectedStudentId}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudentId(null);
          }}
        />
      )}
    </>
  );
};

export default RickTrigger;
