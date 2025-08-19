import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
              <h2 className={styles.loginTitle}>Your Email and Password, please...</h2>
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
                
                <button
                  onClick={handleFormSubmit}
                  className={styles.loginButton}>
                  Secure Sign In
                </button>
                <div className={styles.signupLink}>
                  NOT SURE WHAT TO DO?<br /> <Link to="/signup" className={styles.signupLinkAnchor}>CLICK HERE</a><br />
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
    </div>
  );
};

export default Login;
