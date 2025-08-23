import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import loginStyles from './TeacherLogin.module.css';

const Login = () => {
  return (
    <div className={loginStyles.body}>
        <Navbar
  brand="Grade Insight"
  links={[
    { to: '/TeacherLogin', label: 'Teachers' },
    { to: '/StudentLogin', label: 'Students' },
    { to: '/ParentLogin', label: 'Parents' },
    { to: '/contact', label: 'Contact Us' }
  ]}
/>
      <BackgroundContainer image="/images/insightBG.jpg">
        <LoginContainer title="Teacher Login">
          <div className={loginStyles.formGroup}>
            <label className={loginStyles.formLabel}>Username</label>
            <input
              className={loginStyles.formInput}
              type="text"
              placeholder="Username"
            />
          </div>

          <div className={loginStyles.formGroup}>
            <label className={loginStyles.formLabel}>Password</label>
            <input
              className={loginStyles.formInput}
              type="password"
              placeholder="Password"
            />
          </div>

          <button className={loginStyles.loginButton} type="submit">
            Log In
          </button>

          <div className={loginStyles.signupLink}>
            Don't have an account?{' '}
            <Link to="/signup" className={loginStyles.signupLinkAnchor}>
              Sign up here
            </Link>
          </div>
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default Login;
