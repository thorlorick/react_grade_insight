// src/components/ProtectedStudentRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { checkStudentAuth } from '../api/studentApi';

const ProtectedStudentRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authResult = await checkStudentAuth();
        setIsAuthenticated(authResult.isAuthenticated);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Verifying authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/StudentLogin" replace />;
  }

  return children;
};

export default ProtectedStudentRoute;