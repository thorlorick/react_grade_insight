import React from 'react';
import styles from './BackgroundContainer.module.css';

const BackgroundContainer = ({ image, children }) => {
  return (
    <div
      className={styles.heroContainer}
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${image})` }}
    >
      <div className={styles.overlay}></div>
      {children}
    </div>
  );
};

export default BackgroundContainer;
