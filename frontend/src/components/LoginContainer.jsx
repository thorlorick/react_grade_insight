import React from 'react';
import styles from './LoginContainer.module.css';

const LoginContainer = ({ children }) => {
  return (
    <div
      className={styles.heroContainer}
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}
    >
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <div className={styles.contentInner}>
          <div className={styles.loginForm}>
            <div className={styles.formContainer}>
              <div className={styles.formGroup}>
                {children /* form fields or other content */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginContainer;
