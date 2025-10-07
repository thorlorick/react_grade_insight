import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import setPasswordStyles from './SetPassword.module.css';

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/StudentLogin');
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const requirements = validatePassword(formData.password);
      if (!Object.values(requirements).every(req => req)) {
        newErrors.password = 'Password does not meet requirements';
      }
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
      const response = await fetch('https://gradeinsight.com:8083/api/auth/setStudentPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password: formData.password })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/StudentLogin', { 
          state: { 
            message: 'Password created successfully! Please log in with your new password.',
            email
          }
        });
      } else {
        setErrors({ form: data.message || 'Failed to set password' });
      }
    } catch (error) {
      console.error('Set password error:', error);
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = validatePassword(formData.password);
  const isPasswordValid = formData.password && Object.values(requirements).every(req => req);

  return (
    <div className={setPasswordStyles.body}>
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
        <LoginContainer title="Set Your Password">

          <div className={setPasswordStyles.infoMessage}>
            Welcome! Please create a secure password for <strong>{email}</strong>
          </div>

          {errors.form && (
            <div className={setPasswordStyles.errorMessage}>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={setPasswordStyles.formGroup}>
              <div className={setPasswordStyles.passwordInputWrapper}>
                <input
                  id="password"
                  name="password"
                  className={`${setPasswordStyles.formInput} ${errors.password ? setPasswordStyles.inputError : ''}`}
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={setPasswordStyles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                {errors.password && (
                  <span className={setPasswordStyles.fieldError}>
                    {errors.password}
                  </span>
                )}
              </div>
            </div>

            <div className={setPasswordStyles.formGroup}>
              <div className={setPasswordStyles.passwordInputWrapper}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`${setPasswordStyles.formInput} ${errors.confirmPassword ? setPasswordStyles.inputError : ''}`}
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={setPasswordStyles.togglePassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                {errors.confirmPassword && (
                  <span className={setPasswordStyles.fieldError}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            {/* Password Requirements - Always visible when typing */}
            {formData.password && (
              <div className={`${setPasswordStyles.passwordRequirementsPopup} ${isPasswordValid ? setPasswordStyles.allRequirementsMet : ''}`}>
                <div className={setPasswordStyles.requirementsTitle}>
                  {isPasswordValid ? '✓ Password meets all requirements' : 'Password Requirements:'}
                </div>
                <div className={`${setPasswordStyles.requirement} ${requirements.length ? setPasswordStyles.met : ''}`}>
                  {requirements.length ? '✓' : '○'} At least 8 characters
                </div>
                <div className={`${setPasswordStyles.requirement} ${requirements.uppercase ? setPasswordStyles.met : ''}`}>
                  {requirements.uppercase ? '✓' : '○'} One uppercase letter
                </div>
                <div className={`${setPasswordStyles.requirement} ${requirements.lowercase ? setPasswordStyles.met : ''}`}>
                  {requirements.lowercase ? '✓' : '○'} One lowercase letter
                </div>
                <div className={`${setPasswordStyles.requirement} ${requirements.number ? setPasswordStyles.met : ''}`}>
                  {requirements.number ? '✓' : '○'} One number
                </div>
                <div className={`${setPasswordStyles.requirement} ${requirements.special ? setPasswordStyles.met : ''}`}>
                  {requirements.special ? '✓' : '○'} One special character (!@#$%^&*)
                </div>
              </div>
            )}

            <button 
              className={`${setPasswordStyles.loginButton} ${
                !isLoading && isPasswordValid && formData.password === formData.confirmPassword 
                  ? setPasswordStyles.buttonReady 
                  : setPasswordStyles.buttonDisabled
              }`}
              type="submit"
              disabled={isLoading || !isPasswordValid || formData.password !== formData.confirmPassword}
            >
              {isLoading ? 'Setting Password...' : 'Set Password'}
            </button>
          </form>

        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default SetPassword;