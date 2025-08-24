import React from 'react';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import styles from './TeacherPage.module.css';
import loginStyles from '../components/LoginContainer.module.css';

const GradeInsight = () => {
 return (
    <div className={styles.body}>
      <Navbar
  brand="Grade Insight"
  links={[
    { to: '/TeacherLogin', label: 'Teachers' },
    { to: '/StudentLogin', label: 'Students' },
    { to: '/ParentLogin', label: 'Parents' },
    { to: '/contact', label: 'Contact Us' }
  ]}
/>
      <BackgroundContainer image="/images/insightBG.jpg">
        
          <h1 className={styles.heroText}>
            Grade Insight.<br />
            When Good Isn't Enough.
          </h1>
        
      </BackgroundContainer>
    </div>
  );
};

export default TeacherPage;