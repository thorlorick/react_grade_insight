import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import loginStyles from './ParentSignup.module.css';

const ParentSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    childEmails: ['']
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect back to login
      navigate('/ParentLogin');
    }
  }, [location.state, navigate]);

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

  const handleChildEmailChange = (index, value) => {
    const newChildEmails = [...formData.childEmails];
    newChildEmails[index] = value;
    setFormData(prev => ({
      ...prev,
      childEmails: newChildEmails
    }));
    
    // Clear error for this specific child email
    if (errors[`childEmail${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`childEmail${index}`]: ''
      }));
    }
  };

  const addChildEmailField = () => {
    setFormData(prev => ({
      ...prev,
      childEmails: [...prev.childEmails, '']
    }));
  };

  const removeChildEmailField = (index) => {
    if (formData.childEmails.length > 1) {
      const newChildEmails = formData.childEmails.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        childEmails: newChildEmails
      }));
    }
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    return requirements;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const requirements = validatePassword(formData.password);
      if (!Object.values(requirements).every(req => req)) {
        newErrors.password = 'Password does not meet requirements';
      }
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate child emails
    let hasValidChild = false;
    formData.childEmails.forEach((email, index) => {
      if (email.trim()) {
        hasValidChild = true;
        if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors[`childEmail${index}`] = 'Please enter a valid email';
        }
      }
    });
    
    if (!hasValidChild) {
      newErrors.childEmails = 'Please add at least one child email';
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
      // Filter out empty email fields
      const validChildEmails = formData.childEmails.filter(email => email.trim());
      
      const response = await fetch('https://gradeinsight.com:8083/api/auth/parentSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: formData.password,
          childEmails: validChildEmails
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful - redirect to login with success message
        navigate('/ParentLogin', { 
          state: { 
            message: 'Account created successfully! Please log in.',
            email: email
          }
        });
      } else {
        setErrors({ form: data.message || 'Failed to create account' });
      }

    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = validatePassword(formData.password);

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
          
          {/* Info Message */}
          <div 
            style={{ 
              color: '#6ee7b7', 
              backgroundColor: 'rgba(110, 231, 183, 0.1)', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid rgba(110, 231, 183, 0.3)',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            Welcome! Set up your account for <strong>{email}</strong>
          </div>

          {/* Form Error Display */}
          {errors.form && (
            <div 
              style={{ 
                color: '#fca5a5', 
                backgroundColor: 'rgba(252, 165, 165, 0.1)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                border: '1px solid rgba(252, 165, 165, 0.3)',
                fontSize: '14px'
              }}
            >
              {errors.form}
            </div>
          )}

          {/* Password Field */}
          <div className={loginStyles.formGroup}>
            <input
              id="password"
              name="password"
              className={`${loginStyles.formInput} ${errors.password ? loginStyles.inputError : ''}`}
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create your password"
              disabled={isLoading}
            />
            {errors.password && (
              <span style={{ color: '#fca5a5', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                {errors.password}
              </span>
            )}
            
            {/* Password Requirements */}
            {formData.password && (
              <div style={{ 
                marginTop: '3px', 
                padding: '5px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '6px',
                fontSize: '11px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#6ee7b7' }}>
                  Password Requirements:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <div style={{ color: requirements.length ? '#34d399' : '#86efac' }}>
                    {requirements.length ? '✓' : '○'} 8+ characters
                  </div>
                  <div style={{ color: requirements.uppercase ? '#34d399' : '#86efac' }}>
                    {requirements.uppercase ? '✓' : '○'} Uppercase
                  </div>
                  <div style={{ color: requirements.lowercase ? '#34d399' : '#86efac' }}>
                    {requirements.lowercase ? '✓' : '○'} Lowercase
                  </div>
                  <div style={{ color: requirements.number ? '#34d399' : '#86efac' }}>
                    {requirements.number ? '✓' : '○'} Number
                  </div>
                  <div style={{ 
                    color: requirements.special ? '#34d399' : '#86efac',
                    gridColumn: '1 / -1'
                  }}>
                    {requirements.special ? '✓' : '○'} Special character
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className={loginStyles.formGroup}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              className={`${loginStyles.formInput} ${errors.confirmPassword ? loginStyles.inputError : ''}`}
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span style={{ color: '#fca5a5', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Children Emails Section */}
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            <div style={{ 
              color: '#6ee7b7', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '5px',
              textAlign: 'center'
            }}>
              Add Your Children's Email Addresses
            </div>
            
            {errors.childEmails && (
              <span style={{ color: '#fca5a5', fontSize: '12px', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                {errors.childEmails}
              </span>
            )}

            {formData.childEmails.map((childEmail, index) => (
              <div key={index} className={loginStyles.formGroup} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <input
                    className={`${loginStyles.formInput} ${errors[`childEmail${index}`] ? loginStyles.inputError : ''}`}
                    type="email"
                    value={childEmail}
                    onChange={(e) => handleChildEmailChange(index, e.target.value)}
                    placeholder={`Child ${index + 1} email`}
                    disabled={isLoading}
                    style={{ flex: 1 }}
                  />
                  {formData.childEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChildEmailField(index)}
                      disabled={isLoading}
                      style={{
                        background: 'rgba(252, 165, 165, 0.2)',
                        border: '1px solid rgba(252, 165, 165, 0.4)',
                        color: '#fca5a5',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(252, 165, 165, 0.3)'}
                      onMouseOut={(e) => e.target.style.background = 'rgba(252, 165, 165, 0.2)'}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {errors[`childEmail${index}`] && (
                  <span style={{ color: '#fca5a5', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {errors[`childEmail${index}`]}
                  </span>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addChildEmailField}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'rgba(110, 231, 183, 0.1)',
                border: '1px solid rgba(110, 231, 183, 0.3)',
                color: '#6ee7b7',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(110, 231, 183, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(110, 231, 183, 0.1)'}
            >
              + Add Another Child
            </button>
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default ParentSignup;