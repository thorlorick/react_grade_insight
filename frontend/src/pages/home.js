import React, { useState } from 'react';
import './styles.css';

export default function GradeInsight() {
  const [showLogin, setShowLogin] = useState(false);

  const handleAdventureClick = (e) => {
    e.preventDefault();
    setShowLogin(true);
  };

  return (
    <div>
      <nav className="navbar">
        <a href="#" className="nav-logo">Grade_Insight</a>
        <div className="nav-links">
          <a href="#" className="nav-link">Home</a>
          <a href="about.html" className="nav-link">About</a>
          <a href="#" className="nav-link">Security</a>
          <a href="#" className="nav-link">Contact</a>
        </div>
      </nav>
      
      <div className="hero-container">
        <div className="overlay"></div>
        <div className="content">
          <div className="content-inner">
            <h1 
              className={`hero-text ${showLogin ? 'fade-out' : ''}`}
              id="heroText"
            >
              Grade Insight<br/>Simple.<br/>Secure.<br/>Yours.
            </h1>
            
            <div 
              className={`login-form ${showLogin ? 'fade-in' : ''}`}
              id="loginForm"
            >
              <h2 className="login-title">Secure Access</h2>
              <form>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <input 
                    type="text" 
                    id="username" 
                    className="form-input" 
                    placeholder="Enter your username"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    className="form-input" 
                    placeholder="Enter your password"
                  />
                </div>
                <button type="submit" className="login-button">Sign In</button>
                <div className="signup-link">
                  Don't have an account? <a href="#">Sign up</a>
                </div>
              </form>
            </div>
            
            <a 
              href="#" 
              className={`adventure-button ${showLogin ? 'fade-out' : ''}`}
              id="adventureButton"
              onClick={handleAdventureClick}
            >
              Begin your Adventure
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
