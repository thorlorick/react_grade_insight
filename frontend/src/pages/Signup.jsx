import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Gradeinsight.module.css';

const Signup = () => {
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);

  const handleButtonClick = (e) => {
    e.preventDefault();
    setIsLoginFormVisible(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className={styles.body}>
      <nav className={styles.navbar}>
        <a href="#" className={styles.navLogo}>Grade Insight</a>
        <div className={styles.navLinks}>
          {/* <a href="#" className={styles.navLink}>Home</a>
          <a href="#" className={styles.navLink}>Student</a>
          <a href="#" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>Contact</a>
          */}
        </div>
      </nav>

      <div
        className={styles.heroContainer}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}
      >
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <h2 className={styles.signupTitle}>Create Your Account</h2>
            <div className={styles.signupFormContainer}>
              <div className={styles.signupFormGroup}>
                <input
                  type="text"
                  className={styles.signupInput}
                  placeholder="Email"
                />
              </div>
              <div className={styles.signupFormGroup}>
                <input
                  type="password"
                  className={styles.signupInput}
                  placeholder="Password"
                />
              </div>
              <div className={styles.signupFormGroup}>
                <input
                  type="text"
                  className={styles.signupInput}
                  placeholder="Student's Email"
                />
              </div>

              <button
                onClick={handleFormSubmit}
                className={styles.signupButton}
              >
                Sign Up
              </button>
              <div className={styles.signupLink}>
                Already have an account?<br /> <Link to="/login" className={styles.loginLinkAnchor}>CLICK HERE</Link>
              </div>
            </div>
          </div>
          <button
            onClick={handleButtonClick}
            className={`${styles.adventureButton} ${isLoginFormVisible ? styles.fadeOut : ''}`}
          >
            See Your Grades
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
