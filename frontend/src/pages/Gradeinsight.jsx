import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import ContactEmailModal from '../components/ContactEmailModal';
import styles from './Gradeinsight.module.css';

const GradeInsight = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  const navLinks = [
    { to: '/TeacherLogin', label: 'Teachers' },
    { to: '/StudentLogin', label: 'Students' },
    { to: '/ParentLogin', label: 'Parents' },
    { label: 'Contact', onClick: () => setShowContactModal(true) } // Use onClick instead of "to"
  ];

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight" links={navLinks} />

      <BackgroundContainer image="/images/insightBG.jpg">
        <h1 className={styles.heroText}>
          Grade Insight.<br />
          When Good Isn't Enough.
        </h1>
      </BackgroundContainer>

      {showContactModal && (
        <ContactEmailModal onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
};

export default GradeInsight;
