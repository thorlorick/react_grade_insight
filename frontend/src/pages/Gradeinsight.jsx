import React, { useState } from 'react';
import styles from './Gradeinsight.module.css';

const Login = () => {
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
          <a href="#" className={styles.navLink}>Home</a>
          <a href="#" className={styles.navLink}>Student</a>
          <a href="#" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </div>
      </nav>
      
      <div 
        className={styles.heroContainer} 
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <h1 className={`${styles.heroText} ${isLoginFormVisible ? styles.fadeOut : ''}`}>
              Grade Insight.<br />
              When<br />
              Good isn't<br />
              Enough.
            </h1>
            
            <div className={`${styles.loginForm} ${isLoginFormVisible ? styles.fadeIn : ''}`}>
              <h2 className={styles.loginTitle}>Secure Access</h2>
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter your Email to begin."
                  />
                </div>
                <button
                  onClick={handleFormSubmit}
                  className={styles.loginButton}>
                  Sign In
                </button>
                <div className={styles.signupLink}>
                  Don't have a Teacher account? <a href="#" className={styles.signupLinkAnchor}>Purchase Here</a>
                  Don't have a Parent account? <a href="#" className={styles.signupLinkAnchor}>Sign-up Here</a>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleButtonClick}
              className={`${styles.adventureButton} ${isLoginFormVisible ? styles.fadeOut : ''}`}
            >
              Begin your Adventure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
