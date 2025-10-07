import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [error, setError] = useState('');

  // New states for password reset feature
  const [studentEmail, setStudentEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const adminPassword = localStorage.getItem('adminPassword');

  useEffect(() => {
    if (adminPassword) {
      setIsAuthenticated(true);
    }
  }, [adminPassword]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('https://gradeinsight.com:8083/api/admin/create-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ email: 'test@test.com', notes: 'auth test' })
      });

      if (response.ok || response.status === 400) {
        localStorage.setItem('adminPassword', password);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        setLoginError('Invalid password');
      } else {
        setLoginError('Connection error');
      }
    } catch (error) {
      setLoginError('Connection error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
    navigate('/admin');
  };

  const createCode = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setGeneratedCode(null);

    try {
      const response = await fetch('https://gradeinsight.com:8083/api/admin/create-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({ email, notes })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data);
      } else {
        setError(data.message || 'Failed to create code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmailText = () => {
    const emailText = `Hello,

Thank you for your purchase! Here is your access code for Grade Insight:

Access Code: ${generatedCode.code}

To create your account, please visit:
https://gradeinsight.com/signupPageForTeachers

Enter the access code above when prompted to complete your signup.

If you have any questions, please don't hesitate to reach out.

Best regards,
Grade Insight Team`;

    navigator.clipboard.writeText(emailText);
  };

  const resetForm = () => {
    setGeneratedCode(null);
    setEmail('');
    setNotes('');
    setError('');
  };

  // 🔹 NEW: Reset password by email
  const resetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');

    try {
      const response = await fetch('https://gradeinsight.com:8083/api/admin/reset-student-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({ email: studentEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage(`✅ ${data.message}`);
        setStudentEmail('');
      } else {
        setResetMessage(`❌ ${data.message}`);
      }
    } catch {
      setResetMessage('❌ Network error');
    }
  };

  // Login view
  if (!isAuthenticated) {
    return (
      <div className={styles.body}>
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
          <LoginContainer title="Admin Login">
            {loginError && (
              <div 
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
                {loginError}
              </div>
            )}

            <div className={styles.formGroup}>
              <input
                type="password"
                id="password"
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>

            <button 
              className={styles.loginButton}
              type="submit"
              onClick={handleLogin}
            >
              Login
            </button>
          </LoginContainer>
        </BackgroundContainer>
      </div>
    );
  }

  // Main admin panel view
  return (
    <div className={styles.body}>
      <Navbar
        brand="Grade Insight"
        links={[
          { to: '/TeacherLogin', label: 'Teachers' },
          { to: '/StudentLogin', label: 'Students' },
          { to: '/ParentLogin', label: 'Parents' },
          { to: '/contact', label: 'Contact Us' },
          { onClick: handleLogout, label: 'Logout', isButton: true }
        ]}
      />
      <BackgroundContainer image="/images/insightBG.jpg">
        <LoginContainer>
          {error && (
            <div 
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
              {error}
            </div>
          )}

          {!generatedCode ? (
            <>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  id="email"
                  className={styles.formInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Customer Email"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <textarea
                  id="notes"
                  className={styles.formInput}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optional, e.g., Paid $50 via PayPal)"
                  disabled={isSubmitting}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <button 
                className={styles.loginButton}
                type="submit"
                onClick={createCode}
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Generating...' : 'Generate Code'}
              </button>
            </>
          ) : (
            <div className={styles.codeResult}>
              <h3 style={{ color: '#6ee7b7', marginBottom: '16px', textAlign: 'center' }}>Access Code Created!</h3>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#a7f3d0', display: 'block', marginBottom: '8px' }}>Code:</strong>
                <div className={styles.codeDisplay}>{generatedCode.code}</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#a7f3d0', display: 'block', marginBottom: '8px' }}>Email:</strong>
                <div className={styles.codeDisplay}>{generatedCode.email}</div>
              </div>
              <button 
                className={styles.copyBtn}
                onClick={copyEmailText}
              >
                Copy Email Template
              </button>
              <button 
                className={styles.loginButton}
                onClick={resetForm}
                style={{ marginTop: '12px' }}
              >
                Generate Another Code
              </button>
            </div>
          )}

          {/* 🔹 Password Reset Section (by email) */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #333', paddingTop: '24px' }}>
            <h3 style={{ color: '#6ee7b7', marginBottom: '12px' }}>Reset Student Password</h3>
            <input
              type="email"
              placeholder="Enter student email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className={styles.formInput}
              style={{ marginBottom: '12px' }}
            />
            <button
              className={styles.loginButton}
              onClick={resetPassword}
              disabled={!studentEmail}
            >
              Reset Password
            </button>
            {resetMessage && (
              <div style={{ color: resetMessage.startsWith('✅') ? '#6ee7b7' : '#f87171', marginTop: '8px' }}>
                {resetMessage}
              </div>
            )}
          </div>
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default AdminPanel;
