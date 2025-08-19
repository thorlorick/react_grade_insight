import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Gradeinsight.module.css';

const Signup = () => {
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
          {/* <a href="#" className={styles.navLink}>Home</a>
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
      </div>
    </div>
  );
};

export default Signup;
