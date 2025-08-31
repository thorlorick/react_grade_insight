import React from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ brand = "Grade Insight", links = [], children }) => {
  return (
    <nav className={styles.navbar}>
      {/* Brand can be string or custom component */}
      <div className={styles.navLogo}>
        {typeof brand === 'string' ? brand : <brand />}
      </div>

      <div className={styles.navLinks}>
        {links.map(({ key, element }) => (
          <div key={key} className={styles.navLink}>
            {element}
          </div>
        ))}

        {/* Render any custom children */}
        {children}
      </div>
    </nav>
  );
};

export default Navbar;
