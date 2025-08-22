import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Gradeinsight.module.css';

const Gradeinsight = () => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted!');
  };

  return (
    <div className={styles.body}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.navLogo}>Grade Insight</Link>
         <div className={styles.navLinks}>
          <a href="#" className={styles.navLink}>Teacher</a>
          <a href="#" className={styles.navLink}>Student</a>
          <a href="#" className={styles.navLink}>Parent</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </div>
      </nav>

      <div
        className={styles.heroContainer}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/insightBG.jpg)` }}
      >
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <h1 className={styles.heroText}>
              Grade Insight.<br />
              When Good Isn't Enough.
            </h1>

            <div className={styles.loginForm}>
              <form onSubmit={handleFormSubmit}>
                <div className={styles.formContainer}>
                  <div className={styles.formGroup}>
                    {/* Input fields for username, password, etc. */}
                  </div>
                </div>
                
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gradeinsight;
