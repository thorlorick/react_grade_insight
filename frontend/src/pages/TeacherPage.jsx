import React from 'react';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import styles from './TeacherPage.module.css';

const TeacherPage = () => {
  return (
    <div className={styles.body}>
      <Navbar />
      <BackgroundContainer image="/images/insightBG.jpg">
        <LoginContainer title="Teacher Login">
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button type="submit">Log In</button>
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default TeacherPage;
