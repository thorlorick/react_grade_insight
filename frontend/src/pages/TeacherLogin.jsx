import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import loginStyles from './TeacherLogin.module.css';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('http://localhost:8081/api/auth/login/teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sessions
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - redirect to dashboard
        console.log('Login successful:', data);
        navigate('/'); // Use React Router navigation
      } else {
        // Login failed
        setErrors({ form: data.message });
      }

    } catch (error) {
      console.error('Login error:', error);
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Form Error Display */}
          {errors.form && (
            <div 
              className={loginStyles.errorMessage}
              style={{ 
                color: '#d32f2f', 
                backgroundColor: '#ffebee', 
                padding: '12px', 
                borderRadius: '4px', 
                marginBottom: '16px',
                border: '1px solid #ffcdd2',
                fontSize: '14px'
              }}
            >
              {errors.form}
            </div>
          )}

          <div className={loginStyles.formGroup}>
            <label 
              htmlFor="email" 
              className={loginStyles.formLabel}
            >
              User E-mail
            </label>
            <input
              id="email"
              name="email"
              className={`${loginStyles.formInput} ${errors.email ? loginStyles.inputError : ''}`}
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && (
              <span 
                className={loginStyles.fieldError}
                style={{ color: '#d32f2f', fontSize: '12px', display: 'block', marginTop: '4px' }}
              >
                {errors.email}
              </span>
            )}
          </div>

          <div className={loginStyles.formGroup}>
            <label 
              htmlFor="password" 
              className={loginStyles.formLabel}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              className={`${loginStyles.formInput} ${errors.password ? loginStyles.inputError : ''}`}
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
            />
            {errors.password && (
              <span 
                className={loginStyles.fieldError}
                style={{ color: '#d32f2f', fontSize: '12px', display: 'block', marginTop: '4px' }}
              >
                {errors.password}
              </span>
            )}
          </div>

          <button 
            className={loginStyles.loginButton} 
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
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

export default TeacherLogin;