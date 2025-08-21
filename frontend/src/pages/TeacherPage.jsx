import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoginContainer from '../components/LoginContainer';
import styles from './TeacherPage.module.css';

const TeacherPage = () => {
  return (
    <div className={styles.body}>
      <Navbar />

      {/* Use LoginContainer directly */}
      <LoginContainer>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Log In</button>
      </LoginContainer>
    </div>
  );
};

export default TeacherPage;