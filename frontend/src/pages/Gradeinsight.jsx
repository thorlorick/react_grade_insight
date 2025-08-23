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
        <LoginContainer title="Grade Insight.">
        <LoginContainer title="When GOOD isn't enough."></LoginContainer>
          
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default GradeInsight;
