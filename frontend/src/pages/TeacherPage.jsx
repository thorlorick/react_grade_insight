import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoginContainer from '../components/LoginContainer';
import styles from './TeacherPage.module.css';

const TeacherPage = () => {
  return (

     <div className={styles.body}>
      {/* Reusable Navbar component */}
      <Navbar />

      <div
        className={styles.heroContainer}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}
      >
        <LoginContainer title="Teacher Login">
        {/* Insert form fields or other elements */}
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Log In</button>
      </LoginContainer>
      
      </div>
    </div>
  );
};

export default TeacherPage;