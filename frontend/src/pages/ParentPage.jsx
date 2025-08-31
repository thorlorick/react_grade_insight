import React from 'react';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import styles from './ParentPage.module.css';

const ParentPage = () => {
  

  return (
    <BackgroundContainer>
      <Navbar />
      <div className={styles.parentContent}>
        {/* Add your parent page content here */}
        <h1>Welcome, Parent!</h1>
      </div>
    </BackgroundContainer>
  );
};

export default ParentPage;
