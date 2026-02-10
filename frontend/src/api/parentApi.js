// src/api/parentApi.js

const API_BASE_URL = '/api';

// Get parent's children
export const getParentChildren = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/children`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/parentLogin';
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching children data:', error);
    throw error;
  }
};

// Get grades for a specific child
export const getChildGrades = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/grades/${studentId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/parentLogin';
        return [];
      }
      if (response.status === 403) {
        throw new Error('Access denied to this student data');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching child grades:', error);
    throw error;
  }
};

// Get teacher notes for a specific child
export const getChildNotes = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/notes/${studentId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/parentLogin';
        return { notes: '' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teacher notes:', error);
    throw error;
  }
};

// Check if parent is authenticated
export const checkParentAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/parentCheck`, {
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
    console.error('Error checking parent authentication:', error);
    return { isAuthenticated: false };
  }
};

// Parent logout
export const logoutParent = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/parentLogout`, {
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
