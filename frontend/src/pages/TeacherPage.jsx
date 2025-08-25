import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import styles from './TeacherPage.module.css';
import loginStyles from '../components/LoginContainer.module.css';

const TeacherPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [csvFile, setCsvFile] = useState(null);

  const handleFileUpload = (e) => {
    setCsvFile(e.target.files[0]);
    console.log('Selected file:', e.target.files[0]);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    console.log('Searching for:', e.target.value);
  };

  return (
    <div className={styles.body}>
      <Navbar
        brand="Grade Insight"
        links={[
          { to: '/TeacherLogin', label: 'Teachers' },
          { to: '/StudentLogin', label: 'Students' },
          { to: '/ParentLogin', label: 'Parents' },
          { to: '/contact', label: 'Contact Us' },
        ]}
      />

      <BackgroundContainer image="/images/insightBG.jpg">
        <LoginContainer title="Teacher Dashboard">
          <div className={loginStyles.upload}>
            <label>Upload Grades CSV:</label>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>

          <div className={loginStyles.search}>
            <input
              type="text"
              placeholder="Search students or assignments..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className={loginStyles.results}>
            <p>Results or summary will show here...</p>
          </div>
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default TeacherPage;
