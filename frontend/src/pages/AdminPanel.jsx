import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const [studentEmail, setStudentEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const [loginAttempts, setLoginAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

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
      const response = await fetch('/api/admin/create-code', {
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
    } catch {
      setLoginError('Connection error');
    }
  };

  const handleLogout = () => {
  localStorage.removeItem('adminPassword');
  setIsAuthenticated(false);
  setPassword('');
  window.location.href = 'https://gradeinsight.com';
};

  const createCode = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setGeneratedCode(null);

    try {
      const response = await fetch('/api/admin/create-code', {
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
    } catch {
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

  const resetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');

    try {
      const response = await fetch('/api/admin/reset-student-password', {
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

  const fetchContacts = async () => {
    if (showContacts) {
      setShowContacts(false);
      return;
    }
    
    setLoadingContacts(true);
    try {
      const res = await fetch('/api/admin/contact-emails', {
        headers: { 'Authorization': `Bearer ${adminPassword}` },
      });
      const data = await res.json();
      if (res.ok) {
        setContacts(data.rows);
        setShowContacts(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchLoginAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const response = await fetch('/api/admin/login-attempts', {
        headers: {
          'Authorization': `Bearer ${adminPassword}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setLoginAttempts(data.attempts);
      }
    } catch (err) {
      console.error('Failed to fetch login attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Login view
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/images/insightBG.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          opacity: 0.3,
          zIndex: 0
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '300',
              color: '#6ee7b7',
              textAlign: 'center',
              marginBottom: '32px',
              letterSpacing: '-0.01em'
            }}>Admin Login</h1>

            {loginError && (
              <div style={{
                color: '#f87171',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '14px'
              }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#d1fae5',
                  fontSize: '1rem',
                  marginBottom: '20px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#a7f3d0',
                  padding: '14px 24px',
                  fontSize: '1rem',
                  fontWeight: '400',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main admin view
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Blurred background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/images/insightBG.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px)',
        opacity: 0.2,
        zIndex: 0
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(15, 15, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#6ee7b7',
            margin: 0,
            letterSpacing: '0.05em'
          }}>GRADE INSIGHT ADMIN</h1>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '8px 20px',
              fontSize: '0.875rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        
        {/* Generate Access Code Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '300',
            color: '#6ee7b7',
            marginTop: 0,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.75rem' }}>🎫</span>
            Generate Access Code
          </h2>

          {error && (
            <div style={{
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {!generatedCode ? (
            <form onSubmit={createCode}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  color: '#a7f3d0',
                  fontSize: '0.875rem',
                  marginBottom: '8px'
                }}>Customer Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#d1fae5',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: '#a7f3d0',
                  fontSize: '0.875rem',
                  marginBottom: '8px'
                }}>Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Paid $50 via PayPal"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#d1fae5',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.3) 0%, rgba(52, 211, 153, 0.15) 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  color: '#6ee7b7',
                  padding: '14px 24px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? 'Generating...' : 'Generate Code'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                border: '2px solid rgba(52, 211, 153, 0.4)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    color: '#a7f3d0',
                    fontSize: '0.875rem',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>Access Code</label>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '1.5rem',
                    color: '#67e8f9',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    letterSpacing: '0.1em'
                  }}>
                    {generatedCode.code}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#a7f3d0',
                    fontSize: '0.875rem',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>Email</label>
                  <div style={{
                    color: '#d1fae5',
                    fontSize: '1rem'
                  }}>
                    {generatedCode.email}
                  </div>
                </div>
              </div>

              <button
                onClick={copyEmailText}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.3) 0%, rgba(52, 211, 153, 0.15) 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  color: '#6ee7b7',
                  padding: '12px 24px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                📋 Copy Email Template
              </button>

              <button
                onClick={resetForm}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#a7f3d0',
                  padding: '12px 24px',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Generate Another Code
              </button>
            </div>
          )}
        </div>

        {/* Reset Student Password Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '300',
            color: '#6ee7b7',
            marginTop: 0,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.75rem' }}>🔑</span>
            Reset Student Password
          </h2>

          <form onSubmit={resetPassword}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#d1fae5',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!studentEmail}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#a7f3d0',
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: '500',
                borderRadius: '8px',
                cursor: studentEmail ? 'pointer' : 'not-allowed',
                opacity: studentEmail ? 1 : 0.5,
                transition: 'all 0.3s ease'
              }}
            >
              Reset Password
            </button>
          </form>

          {resetMessage && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              background: resetMessage.startsWith('✅') ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: resetMessage.startsWith('✅') ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: resetMessage.startsWith('✅') ? '#6ee7b7' : '#f87171'
            }}>
              {resetMessage}
            </div>
          )}
        </div>

        {/* Contact Emails Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '300',
            color: '#6ee7b7',
            marginTop: 0,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.75rem' }}>📧</span>
            Contact Emails
          </h2>

          <button
            onClick={fetchContacts}
            disabled={loadingContacts}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#a7f3d0',
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: loadingContacts ? 'not-allowed' : 'pointer',
              opacity: loadingContacts ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {loadingContacts ? 'Loading...' : showContacts ? 'Hide Emails' : 'Show Emails'}
          </button>

          {showContacts && (
            <div style={{
              marginTop: '20px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {contacts.length === 0 ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#9ca3af'
                }}>
                  No contact emails yet.
                </div>
              ) : (
                contacts.map((c, idx) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '16px 20px',
                      borderBottom: idx < contacts.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}
                  >
                    <div style={{
                      color: '#d1fae5',
                      fontSize: '1rem',
                      marginBottom: '4px'
                    }}>
                      {c.email}
                    </div>
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '0.75rem'
                    }}>
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Login Attempts Card - REPLACES FIRST PLACEHOLDER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '300',
            color: '#6ee7b7',
            marginTop: 0,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.75rem' }}>🔐</span>
            Recent Login Attempts
          </h2>

          <button
            onClick={fetchLoginAttempts}
            disabled={loadingAttempts}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#a7f3d0',
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: loadingAttempts ? 'not-allowed' : 'pointer',
              opacity: loadingAttempts ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
          >
            {loadingAttempts ? 'Loading...' : 'Load Login Attempts'}
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loginAttempts.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '24px' }}>
                Click the button above to load login attempts
              </p>
            ) : (
              loginAttempts.map((attempt) => (
                <div key={attempt.id} style={{
                  background: attempt.success 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${attempt.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>Username</p>
                    <p style={{ 
                    margin: '4px 0 0 0', 
                    fontWeight: '600', 
                    color: '#d1fae5',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                       }}>{attempt.username}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>IP Address</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: '500', fontFamily: 'monospace', fontSize: '0.875rem', color: '#d1fae5' }}>
                      {attempt.ip_address}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>Time</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: '500', fontSize: '0.875rem', color: '#d1fae5' }}>
                      {new Date(attempt.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div style={{
                    background: attempt.success ? '#22c55e' : '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}>
                    {attempt.success ? '✓ Success' : '✗ Failed'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Remaining Placeholder */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Placeholder 2 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            opacity: 0.6
          }}>
            <span style={{ fontSize: '3rem', marginBottom: '12px' }}>👥</span>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              textAlign: 'center',
              margin: 0
            }}>User Management</p>
            <p style={{
              color: '#6b7280',
              fontSize: '0.75rem',
              textAlign: 'center',
              margin: '8px 0 0 0'
            }}>Coming Soon</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminPanel;





