import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Gradeinsight.module.css';

const Signup = () => {
  const [isSignupFormVisible, setIsSignupFormVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  const handleButtonClick = (e) => {
    e.preventDefault();
    setIsSignupFormVisible(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, studentEmail });
    // TODO: call backend signup API
  };

  return (
    <div className={styles.body}>
      <nav className={styles.navbar}>
        <a href="#" className={styles.navLogo}>Grade Insight</a>
      </nav>

      <div 
        className={styles.heroContainer} 
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}>

              <h2 className={styles.loginTitle}>Sign Up</h2>
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="password"
                    className={styles.formInput}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="Student Email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={handleFormSubmit}
                  className={styles.loginButton}
                >
                  Sign Up
                </button>

                <div className={styles.signupLink}>
                  Already have an account?<br />
                  <Link to="/login" className={styles.signupLinkAnchor}>Click to Log In</Link><br />
                </div>
              </div>
            </div>

            <button
              onClick={handleButtonClick}
              className={`${styles.adventureButton} ${isSignupFormVisible ? styles.fadeOut : ''}`}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
