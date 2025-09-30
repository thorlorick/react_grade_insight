import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = ({ brand = "Grade Insight", links = [], children }) => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navLogo}>{brand}</Link>
      <div className={styles.navLinks}>
        {links.map(({ to, label, onClick, className }, i) =>
          to ? (
            <Link key={i} to={to} className={`${styles.navLink} ${className || ''}`}>
              {label}
            </Link>
          ) : (
            <button
              key={i}
              onClick={onClick}
              className={`${styles.navButton} ${className || ''}`}
            >
              {label}
            </button>
          )
        )}
        {children}
      </div>
    </nav>
  );
};

export default Navbar;
