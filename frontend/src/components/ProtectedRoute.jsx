// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType = 'any', redirectTo = '/home' }) => {
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isAuthenticated: false,
    userType: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check both teacher and student authentication
      const [teacherResponse, studentResponse] = await Promise.all([
        fetch('/api/auth/teacherCheck', { credentials: 'include' }),
        fetch('/api/auth/studentCheck', { credentials: 'include' })
      ]);

      const teacherData = await teacherResponse.json();
      const studentData = await studentResponse.json();

      if (teacherData.isAuthenticated) {
        setAuthStatus({
          isLoading: false,
          isAuthenticated: true,
          userType: 'teacher'
        });
      } else if (studentData.isAuthenticated) {
        setAuthStatus({
          isLoading: false,
          isAuthenticated: true,
          userType: 'student'
        });
      } else {
        setAuthStatus({
          isLoading: false,
          isAuthenticated: false,
          userType: null
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthStatus({
        isLoading: false,
        isAuthenticated: false,
        userType: null
      });
    }
  };

  // Show loading while checking authentication
  if (authStatus.isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect
  if (!authStatus.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If specific user type is required, check it
  if (userType !== 'any' && authStatus.userType !== userType) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
