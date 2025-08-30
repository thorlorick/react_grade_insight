import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = ({ brand = "Grade Insight", links = [], children }) => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navLogo}>{brand}</Link>

      <div className={styles.navLinks}>
        {links.map(({ to, label }) => (
          <Link key={to} to={to} className={styles.navLink}>
            {label}
          </Link>
        ))}

        {/* Render whatever is passed inside Navbar as children */}
        {children}
      </div>
    </nav>
  );
};

export default Navbar;
