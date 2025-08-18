import React, { useState } from 'react';
import styles from './Login.module.css';

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
          <a href="#" className={styles.navLink}>About</a>
          <a href="#" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </div>
      </nav>
      
      <div className={styles.heroContainer}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <h1 className={`${styles.heroText} ${isLoginFormVisible ? styles.fadeOut : ''}`}>
              Grade Insight.<br />
              Simple.<br />
              Secure.<br />
              Yours.
            </h1>
            
            <div className={`${styles.loginForm} ${isLoginFormVisible ? styles.fadeIn : ''}`}>
              <h2 className={styles.loginTitle}>Secure Access</h2>
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Username</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter your username"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  onClick={handleFormSubmit}
                  className={styles.loginButton}
                >
                  Sign In
                </button>
                <div className={styles.signupLink}>
                  Don't have an account? <a href="#" className={styles.signupLinkAnchor}>Sign up</a>
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
