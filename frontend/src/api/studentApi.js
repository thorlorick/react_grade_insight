// src/api/studentApi.js

const API_BASE_URL = '/api';

// Get student's grade data
export const getStudentData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/data`, {
      method: 'GET',
      credentials: 'include', // Important for session cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/StudentLogin';
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student data:', error);
    throw error;
  }
};

// Get student profile information
export const getStudentProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/StudentLogin';
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    throw error;
  }
};

// Get student grade summary/statistics
export const getStudentSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/summary`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/StudentLogin';
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student summary:', error);
    throw error;
  }
};

// Check if student is authenticated
export const checkStudentAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/studentCheck`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { isAuthenticated: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking student authentication:', error);
    return { isAuthenticated: false };
  }
};

// Student logout
export const logoutStudent = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/studentLogout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }

};
