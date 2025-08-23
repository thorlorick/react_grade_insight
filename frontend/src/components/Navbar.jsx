// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navLogo}>Grade Insight</Link>
      <div className={styles.navLinks}>
        <Link to="/TeacherLogin" className={styles.navLink}>Teacher</Link>
        <Link to="/StudentLogin" className={styles.navLink}>Student</Link>
        <Link to="/ParentLogin" className={styles.navLink}>Parent</Link>
        <Link to="/contact" className={styles.navLink}>Contact</Link>
      </div>
    </nav>
  );
};

export default Navbar;
