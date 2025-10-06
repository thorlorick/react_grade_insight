import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import loginStyles from './ParentLogin.module.css';

const ParentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
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
      const checkRes = await fetch('/api/parent/checkLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
        credentials: 'include',
      });
      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setErrors({ form: checkData.message || 'Email not found' });
        return;
      }

      // If first login, redirect to set password
      if (checkData.mustChangePassword) {
        navigate('/ParentSetPassword', {
          state: { parentId: checkData.parentId, email: formData.email }
        });
        return;
      }

      // Step 2: normal login
      const loginRes = await fetch('/api/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const loginData = await loginRes.json();

      if (loginRes.ok) {
        navigate('/ParentPage');
      } else {
        setErrors({ form: loginData.message || 'Invalid credentials' });
      }
    } catch (err) {
      console.error('Login error:', err);
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
          {errors.form && <div className={loginStyles.errorMessage}>{errors.form}</div>}

          <div className={loginStyles.formGroup}>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? loginStyles.inputError : ''}
              disabled={isLoading}
            />
            {errors.email && <span className={loginStyles.fieldError}>{errors.email}</span>}
          </div>

          <div className={loginStyles.formGroup}>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? loginStyles.inputError : ''}
              disabled={isLoading}
            />
            {errors.password && <span className={loginStyles.fieldError}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={loginStyles.loginButton}
          >
            {isLoading ? 'Checking...' : 'Log In'}
          </button>
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default ParentLogin;
