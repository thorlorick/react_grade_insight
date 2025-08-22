import React from 'react';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import styles from './TeacherPage.module.css';
import loginStyles from '../components/LoginContainer.module.css';

const TeacherPage = () => {
  return (
    <div className={styles.body}>
      <Navbar />
      <BackgroundContainer image="/images/insightBG.jpg">
        <LoginContainer title="Teacher Dashboard">
         
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default TeacherPage;