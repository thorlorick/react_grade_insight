import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';

const Login = () => {
  return (
    <div className={body}>
      <Navbar />
      <BackgroundContainer image="/images/insightBG.jpg">
        <LoginContainer title="Teacher Login">
          <div className="formGroup">
            <label className="formLabel">Username</label>
            <input className="formInput" type="text" placeholder="Username" />
          </div>
          <div className="formGroup">
            <label className="formLabel">Password</label>
            <input className="formInput" type="password" placeholder="Password" />
          </div>
          <button className="loginButton" type="submit">Log In</button>
          <br />
          <div className="signupLink">
            Don't have an account? <Link to="/signup" className="signupLinkAnchor">Sign up here</Link>
          </div>
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default Login;
