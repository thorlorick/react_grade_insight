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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

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
        // If we get any response (even 400), the auth worked
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
    setMessage({ type: '', text: '' });
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
        setMessage({ type: 'success', text: 'Access code created successfully!' });
        setGeneratedCode(data);
        setEmail('');
        setNotes('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmailText = () => {
    const emailText = `Hello,

Thank you for your purchase! Here is your access code for Grade Insight:

Access Code: ${generatedCode.code}

To create your account, please visit:
${generatedCode.signupUrl}

Enter the access code above when prompted to complete your signup.

If you have any questions, please don't hesitate to reach out.

Best regards,
Grade Insight Team`;

    navigator.clipboard.writeText(emailText);
    setMessage({ type: 'success', text: 'Email text copied to clipboard!' });
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
        <LoginContainer title="Generate Access Code">
          {message.text && (
            <div 
              style={{ 
                color: message.type === 'success' ? '#2e7d32' : '#d32f2f', 
                backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee', 
                padding: '12px', 
                borderRadius: '4px', 
                marginBottom: '16px',
                border: message.type === 'success' ? '1px solid #a5d6a7' : '1px solid #ffcdd2',
                fontSize: '14px'
              }}
            >
              {message.text}
            </div>
          )}

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

          {generatedCode && (
            <div className={styles.codeResult}>
              <h3 style={{ color: '#6ee7b7', marginBottom: '16px' }}>Access Code Created!</h3>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#a7f3d0' }}>Code:</strong>
                <div className={styles.codeDisplay}>{generatedCode.code}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#a7f3d0' }}>Email:</strong>
                <div className={styles.codeDisplay}>{generatedCode.email}</div>
              </div>
              <button 
                className={styles.copyBtn}
                onClick={copyEmailText}
              >
                Copy Email Template
              </button>
            </div>
          )}
        </LoginContainer>
      </BackgroundContainer>
    </div>
  );
};

export default AdminPanel;