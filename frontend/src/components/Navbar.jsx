import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUploadCSV } from '../hooks/useUploadCSV';
import styles from './Navbar.module.css';

const Navbar = ({ brand = "Grade Insight", links = [], children, onUploadSuccess, refreshStudents }) => {
  const fileInputRef = useRef(null);
  const { handleFileChange, loading } = useUploadCSV({ onUploadSuccess, refreshStudents });

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navLogo}>{brand}</Link>

      <div className={styles.navLinks}>
        {links.map(({ to, label }) => (
          <Link key={to} to={to} className={styles.navLink}>
            {label}
          </Link>
        ))}

        {/* CSV Upload Text Link */}
        <span
          className={styles.navLink}
          onClick={triggerFileSelect}
          style={{ cursor: 'pointer' }}
        >
          {loading ? 'Uploading...' : 'Upload CSV'}
        </span>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Render other children if needed */}
        {children}
      </div>
    </nav>
  );
};

export default Navbar;
