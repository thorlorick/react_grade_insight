import React from 'react';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import styles from './TeacherPage.module.css';
import loginStyles from '../components/LoginContainer.module.css';

const Login = () => {
  return (
    <div className={styles.body}>
      <Navbar />
      <BackgroundContainer image="/images/insightBG.jpg">
        <LoginContainer title="Teacher Login">
          <div className={loginStyles.formGroup}>
            <label className={loginStyles.formLabel}>Username</label>
            <input className={loginStyles.formInput} type="text" placeholder="Username" />
          </div>
          <div className={loginStyles.formGroup}>
            <label className={loginStyles.formLabel}>Password</label>
            <input className={loginStyles.formInput} type="password" placeholder="Password" />
          </div>
          <button className={loginStyles.loginButton} type="submit">Log In</button> <br />

           <div className={styles.signupLink}>
                  Haven't registered yet? <Link to="/signup" className={styles.signupLinkAnchor}>  REGISTER HERE</Link><br />
                </div>
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default Login;