// src/contexts/AuthContext.jsx
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} role - User role (admin or client)
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user - Current authenticated user
 * @property {boolean} loading - Loading state
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
 * @property {Function} register - Register function
 * @property {Function} updateProfile - Update profile function
 * @property {boolean} isAuthenticated - Authentication state
 */
import React, { createContext, useState, useEffect } from 'react';

// Create an authentication context
export const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateProfile: () => {},
  isAuthenticated: false,
});

// AuthProvider component to wrap the app with auth context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('eqhuma_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Session validation error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    try {
      // Simulate API login for now
      const { email, password } = credentials;
      
      // In a real implementation, you would call an API endpoint
      // For demo purposes, we'll accept any email/password with some minimal validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Mock user data - in a real implementation, this would come from your API
      let role = 'client';
      if (email.includes('admin')) {
        role = 'admin';
      } else if (email.includes('socio')) {
        role = 'socio';
      }
      
      const userData = {
        id: '123',
        email,
        name: email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
      };
      
      // Save user to localStorage
      localStorage.setItem('eqhuma_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('eqhuma_user');
    setUser(null);
  };
  
  // Register function
  const register = async (userData) => {
    try {
      // Simulate API registration
      const { email, password, name } = userData;
      
      if (!email || !password || !name) {
        throw new Error('Name, email, and password are required');
      }
      
      // Mock user registration - would be an API call in a real implementation
      const newUser = {
        id: Date.now().toString(),
        email,
        name,
        role: 'client', // Default role for new users
        createdAt: new Date().toISOString(),
      };
      
      // Save user to localStorage
      localStorage.setItem('eqhuma_user', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };
  
  // Update profile function
  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Update user data - would be an API call in a real implementation
      const updatedUser = { ...user, ...updates };
      
      // Save updated user to localStorage
      localStorage.setItem('eqhuma_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Provide auth context to children
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      updateProfile,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;