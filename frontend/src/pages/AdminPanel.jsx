import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const [codes, setCodes] = useState([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const adminPassword = localStorage.getItem('adminPassword');

  useEffect(() => {
    if (adminPassword) {
      setIsAuthenticated(true);
      loadCodes();
    }
  }, [adminPassword]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('https://gradeinsight.com:8083/api/admin/list-codes', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (response.ok) {
        localStorage.setItem('adminPassword', password);
        setIsAuthenticated(true);
        loadCodes();
      } else {
        setLoginError('Invalid password');
      }
    } catch (error) {
      setLoginError('Connection error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
    setCodes([]);
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
        loadCodes();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const response = await fetch('https://gradeinsight.com:8083/api/admin/list-codes', {
        headers: {
          'Authorization': `Bearer ${adminPassword}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setIsLoadingCodes(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Grade Insight Admin</h1>
          <p>Access Code Management</p>
        </div>
        
        <div className={styles.loginBox}>
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <button type="submit">Login</button>
            {loginError && <div className={styles.error}>{loginError}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Grade Insight Admin</h1>
        <p>Access Code Management</p>
      </div>

      <div className={styles.adminPanel}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>

        <h2>Generate Access Code</h2>

        {message.text && (
          <div className={message.type === 'success' ? styles.success : styles.error}>
            {message.text}
          </div>
        )}

        <form onSubmit={createCode}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Customer Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Paid $50 via PayPal on Oct 2, 2025"
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Generating...' : 'Generate Code'}
          </button>
        </form>

        {generatedCode && (
          <div className={styles.codeResult}>
            <h3>✅ Access Code Created!</h3>
            <div>
              <strong>Code:</strong>
              <div className={styles.codeDisplay}>{generatedCode.code}</div>
            </div>
            <div>
              <strong>Customer Email:</strong>
              <div className={styles.emailDisplay}>{generatedCode.email}</div>
            </div>
            <div>
              <strong>Signup URL:</strong>
              <div className={styles.urlDisplay}>{generatedCode.signupUrl}</div>
            </div>
            <button className={styles.copyBtn} onClick={copyEmailText}>
              Copy Email Template
            </button>
          </div>
        )}

        <div className={styles.codesList}>
          <h2>Recent Access Codes</h2>
          <button 
            onClick={loadCodes} 
            className={styles.refreshBtn}
            disabled={isLoadingCodes}
          >
            {isLoadingCodes ? 'Loading...' : 'Refresh List'}
          </button>

          {codes.length === 0 ? (
            <p>No codes yet</p>
          ) : (
            <div className={styles.tableContainer}>
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id}>
                      <td className={styles.codeCell}>{code.code}</td>
                      <td>{code.email}</td>
                      <td>{formatDate(code.created_at)}</td>
                      <td>
                        <span className={code.used ? styles.statusUsed : styles.statusUnused}>
                          {code.used ? 'Used' : 'Unused'}
                        </span>
                      </td>
                      <td>{code.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;