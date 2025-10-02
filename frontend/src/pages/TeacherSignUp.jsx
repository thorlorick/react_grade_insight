import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import loginStyles from './TeacherSignUp.module.css'; 

const TeacherSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    accessCode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password validation helper
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const isValid = Object.values(requirements).every(req => req);
    return { isValid, requirements };
  };

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

  const handleVerifyCode = async () => {
    if (!formData.accessCode.trim()) {
      setErrors({ accessCode: 'Please enter an access code' });
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      const response = await fetch('https://gradeinsight.com:8083/api/auth/verifyAccessCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code: formData.accessCode })
      });

      const data = await response.json();

      if (data.valid) {
        setCodeVerified(true);
      } else {
        setErrors({ accessCode: data.message });
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setErrors({ accessCode: 'Network error. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('https://gradeinsight.com:8083/api/auth/teacherSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Signup successful:', data);
        navigate('/TeacherPage');
      } else {
        if (data.message.includes('already exists')) {
          setErrors({ email: data.message });
        } else {
          setErrors({ form: data.message });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

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
        <LoginContainer>
          {errors.form && (
            <div className={loginStyles.errorMessage}>
              {errors.form}
            </div>
          )}

          {!codeVerified ? (
            <div className={loginStyles.formGroup}>
              <input
                id="accessCode"
                name="accessCode"
                className={`${loginStyles.formInput} ${errors.accessCode ? loginStyles.inputError : ''}`}
                type="text"
                value={formData.accessCode}
                onChange={handleChange}
                placeholder="Access Code"
                disabled={isVerifying}
              />
              {errors.accessCode && (
                <span className={loginStyles.fieldError}>
                  {errors.accessCode}
                </span>
              )}
              <button 
                className={loginStyles.loginButton} 
                type="button"
                onClick={handleVerifyCode}
                disabled={isVerifying}
                style={{ marginTop: '8px' }}
              >
                {isVerifying ? 'Verifying...' : 'Verify Access Code'}
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className={loginStyles.formGroup} style={{ flex: '1' }}>
                  <input
                    id="firstName"
                    name="firstName"
                    className={`${loginStyles.formInput} ${errors.firstName ? loginStyles.inputError : ''}`}
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <span className={loginStyles.fieldError}>
                      {errors.firstName}
                    </span>
                  )}
                </div>

                <div className={loginStyles.formGroup} style={{ flex: '1' }}>
                  <input
                    id="lastName"
                    name="lastName"
                    className={`${loginStyles.formInput} ${errors.lastName ? loginStyles.inputError : ''}`}
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <span className={loginStyles.fieldError}>
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div className={loginStyles.formGroup}>
                <input
                  id="schoolName"
                  name="schoolName"
                  className={`${loginStyles.formInput} ${errors.schoolName ? loginStyles.inputError : ''}`}
                  type="text"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="School Name"
                  disabled={isLoading}
                />
                {errors.schoolName && (
                  <span className={loginStyles.fieldError}>
                    {errors.schoolName}
                  </span>
                )}
              </div>

              <div className={loginStyles.formGroup}>
                <input
                  id="email"
                  name="email"
                  className={`${loginStyles.formInput} ${errors.email ? loginStyles.inputError : ''}`}
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className={loginStyles.fieldError}>
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
                  placeholder="Password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <span className={loginStyles.fieldError}>
                    {errors.password}
                  </span>
                )}
                
                {formData.password && (
                  <div style={{ 
                    marginTop: '6px', 
                    padding: '6px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '4px',
                    fontSize: '10px',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px', color: '#6ee7b7' }}>
                      Requirements:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px' }}>
                      <div style={{ color: passwordValidation.requirements.length ? '#34d399' : '#86efac' }}>
                        ✓ 8+ chars
                      </div>
                      <div style={{ color: passwordValidation.requirements.uppercase ? '#34d399' : '#86efac' }}>
                        ✓ Upper
                      </div>
                      <div style={{ color: passwordValidation.requirements.lowercase ? '#34d399' : '#86efac' }}>
                        ✓ Lower
                      </div>
                      <div style={{ color: passwordValidation.requirements.number ? '#34d399' : '#86efac' }}>
                        ✓ Number
                      </div>
                      <div style={{ 
                        color: passwordValidation.requirements.special ? '#34d399' : '#86efac',
                        gridColumn: '1 / -1'
                      }}>
                        ✓ Special char
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={loginStyles.formGroup}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`${loginStyles.formInput} ${errors.confirmPassword ? loginStyles.inputError : ''}`}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <span className={loginStyles.fieldError}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button 
                className={loginStyles.loginButton} 
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </>
          )}
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default TeacherSignup;
