import React from 'react';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import styles from './ParentPage.module.css';

const ParentPage = () => {
  // Uncomment this if you want to refresh student data
  const [students, setStudents] = React.useState([]);

  return (
    <div className={styles.body}>
      <Navbar
        brand="Grade Insight"
        links={[]}
        onUploadSuccess={(data) => {
          if (data.ok) {
            console.log('CSV uploaded successfully!');
          } else {
            console.error('CSV upload failed:', data.error);
          }
        }}
        refreshStudents={(newData) => setStudents(newData)}
      />

      <BackgroundContainer image="/images/insightBG.jpg">
        {/* You can put any content here */}
      </BackgroundContainer>
    </div>
  );
};

export default ParentPage;
