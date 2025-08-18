// src/pages/Login.jsx
import React, { useState } from 'react';
import styles from './Login.module.css';

const Login = () => {
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);

    const handleButtonClick = (e) => {
        e.preventDefault();
        setIsLoginFormVisible(true);
    };

    return (
        <div className={styles.body}>
            <nav className={styles.navbar}>
                <a href="#" className={styles.navLogo}>ZENNOMA</a>
                <div className={styles.navLinks}>
                    <a href="#" className={styles.navLink}>Home</a>
                    <a href="#" className={styles.navLink}>About</a>
                    <a href="#" className={styles.navLink}>Security</a>
                    <a href="#" className={styles.navLink}>Contact</a>
                </div>
            </nav>

            <div className={styles.heroContainer}>
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <div className={styles.contentInner}>
                        <h1 
                            className={`${styles.heroText} ${isLoginFormVisible ? styles.fadeOut : ''}`}
                        >
                            Zennoma.<br />Secure.<br />Anonymous.<br />Yours.
                        </h1>
                        <div 
                            className={`${styles.loginForm} ${isLoginFormVisible ? styles.fadeIn : ''}`}
                        >
                            <h2 className={styles.loginTitle}>Secure Access</h2>
                            <form>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="username">Username</label>
                                    <input type="text" id="username" className={styles.formInput} placeholder="Enter your username" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="password">Password</label>
                                    <input type="password" id="password" className={styles.formInput} placeholder="Enter your password" />
                                </div>
                                <button type="submit" className={styles.loginButton}>Sign In</button>
                                <div className={styles.signupLink}>
                                    Don't have an account? <a href="#">Sign up</a>
                                </div>
                            </form>
                        </div>
                        <a 
                            href="#" 
                            className={`${styles.adventureButton} ${isLoginFormVisible ? styles.fadeOut : ''}`}
                            onClick={handleButtonClick}
                        >
                            Begin your Adventure
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
