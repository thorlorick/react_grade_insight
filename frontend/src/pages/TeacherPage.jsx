import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './TeacherPage.module.css';

const TeacherPage = () => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted!');
  };

  return (
     <div className={styles.body}>
      {/* Reusable Navbar component */}
      <Navbar />

      <div
        className={styles.heroContainer}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}
      >
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            

            <div className={styles.loginForm}>
              <h2 className={styles.loginTitle}>This is the SKELETON</h2>
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  {/* Add your form content here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;