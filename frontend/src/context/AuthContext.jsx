import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chatum_user') || localStorage.getItem('pulsechat_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('chatum_token') || localStorage.getItem('pulsechat_token') || null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const loginWithUsername = async (username, avatar) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await api.login(username, avatar);
      if (response.success && response.user) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('chatum_user', JSON.stringify(response.user));
        localStorage.setItem('chatum_token', response.token);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (newUsername, newAvatar) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!user) throw new Error('Not logged in');
      const response = await api.updateProfile(user.username, newUsername, newAvatar);
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('chatum_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setAuthError(err.message || 'Profile update failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('chatum_user');
    localStorage.removeItem('chatum_token');
    localStorage.removeItem('pulsechat_user');
    localStorage.removeItem('pulsechat_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        authError,
        loginWithUsername,
        updateUserProfile,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
