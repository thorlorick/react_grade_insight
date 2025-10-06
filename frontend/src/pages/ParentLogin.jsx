import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import loginStyles from './ParentLogin.module.css';

const ParentLogin = () => {
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
      // Step 1: check first-time login
      const checkResponse = await fetch('/api/parent/checkLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email })
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        // Email doesn't exist or other error
        setErrors({ form: checkData.message || 'Email not found' });
        return;
      }

      // If parent must change password, redirect to ParentSetPassword page
      if (checkData.mustChangePassword) {
        navigate('/ParentSetPassword', {
          state: { 
            parentId: checkData.parentId,
            email: formData.email,
            message: 'Please set your password for first-time login'
          }
        });
        return;
      }

      // If password doesn't need to be changed, proceed with normal login
      const loginResponse = await fetch('/api/parent/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        // Login successful - redirect to dashboard
        console.log('Login successful:', loginData);
        navigate('/ParentPage');
      } else {
        // Login failed
        setErrors({ form: loginData.message || 'Invalid login credentials' });
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
        <LoginContainer title="Parent Login">
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
            <input
              id="email"
              name="email"
              className={`${loginStyles.formInput} ${errors.email ? loginStyles.inputError : ''}`}
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
            <input
              id="password"
              name="password"
              className={`${loginStyles.formInput} ${errors.password ? loginStyles.inputError : ''}`}
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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
            {isLoading ? 'Checking...' : 'Log In'}
          </button>

        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default ParentLogin;
