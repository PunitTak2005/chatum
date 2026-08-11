import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, BACKEND_URL } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [serverUrl, setServerUrl] = useState(BACKEND_URL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedUser();
  }, []);

  const loadSavedUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('chatum_user');
      const savedUrl = await AsyncStorage.getItem('chatum_server_url');
      if (savedUrl) setServerUrl(savedUrl);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (err) {
      console.error('Error loading stored user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, avatar, customUrl) => {
    setIsLoading(true);
    try {
      const targetUrl = customUrl || serverUrl;
      const res = await api.login(username, avatar, targetUrl);
      if (res.success && res.user) {
        setUser(res.user);
        setServerUrl(targetUrl);
        await AsyncStorage.setItem('chatum_user', JSON.stringify(res.user));
        await AsyncStorage.setItem('chatum_server_url', targetUrl);
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Server connection error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('chatum_user');
  };

  return (
    <AuthContext.Provider value={{ user, serverUrl, setServerUrl, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
