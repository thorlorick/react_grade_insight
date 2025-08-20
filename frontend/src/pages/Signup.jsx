import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Gradeinsight.module.css';

const Signup = () => {
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className={styles.body}>
      <nav className={styles.navbar}>
        <a href="/Gradeinsight" className={styles.navLogo}>Grade Insight</a>
        <div className={styles.navLinks}>
          {/*
          <a href="#" className={styles.navLink}>Home</a>
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
            <div className={`${styles.loginForm} ${styles.fadeIn}`}>
              <h2 className={styles.loginTitle}>Please Enter your Information</h2>
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Email"
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="password"
                    className={styles.formInput}
                    placeholder="Password"
                  />
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Student's Email"
                  />
                </div>
                
                <button
                  onClick={handleFormSubmit}
                  className={styles.loginButton}>
                  Register
                </button>
                 <div className={styles.signupLink}>
                  Are you a Teacher?<br /> <Link to="/signup" className={styles.signupLinkAnchor}>PURCHASE HERE</Link><br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
