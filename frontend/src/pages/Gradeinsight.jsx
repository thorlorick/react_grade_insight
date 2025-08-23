import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import styles from './Gradeinsight.module.css';

const GradeInsight = () => {
 return (
    <div className={styles.body}>
      <Navbar />
      <BackgroundContainer image="/images/insightBG.jpg">
        
          <h1 className={styles.heroText}>
            Grade Insight.<br />
            When Good Isn't Enough.
          </h1>
        
      </BackgroundContainer>
    </div>
  );
};

export default GradeInsight;
