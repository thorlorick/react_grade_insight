import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Gradeinsight.module.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, studentEmail });
    // TODO: call backend signup endpoint
  };

  return (
    <div className={styles.body}>
      <nav className={styles.navbar}>
        <a href="#" className={styles.navLogo}>Grade Insight</a>
      </nav>

      <div
        className={styles.heroContainer}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}
      >
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <h1 className={styles.heroText}>Sign Up</h1>
          <form className={styles.formContainer} onSubmit={handleFormSubmit}>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Student Email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            <button type="submit" className={styles.loginButton}>Sign Up</button>
          </form>

          <p style={{ marginTop: "1rem" }}>
            Teacher? <Link to="/purchase">Purchase Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
