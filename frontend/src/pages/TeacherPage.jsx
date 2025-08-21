import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TeacherPage.module.css';

const TeacherPage = () => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted!');
  };

  return (
    <div className={styles.body}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.navLogo}>Grade Insight</Link>
        <div className={styles.navLinks}>
          <Link to="/teacher" className={styles.navLink}>Teacher</Link>
          <Link to="/student" className={styles.navLink}>Student</Link>
          <Link to="/parent" className={styles.navLink}>Parent</Link>
          <Link to="/contact" className={styles.navLink}>Contact</Link>
        </div>
      </nav>

      <div
        className={styles.heroContainer}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}
      >
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <h1 className={styles.heroText}>
              Grade Insight.<br />
              For when<br />
              Good<br />
              Isn't Enough.
            </h1>

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