import React from 'react';
import styles from './LoginContainer.module.css';

const LoginContainer = ({ title, children }) => {
  return (
    <div className={styles.loginForm}>
      <h2 className={styles.loginTitle}>{title}</h2>
      <div className={styles.formContainer}>
        {children}
      </div>
    </div>
  );
};

export default LoginContainer;
