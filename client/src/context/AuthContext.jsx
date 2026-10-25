import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useToast } from './ToastContext';
import { useT } from './LanguageContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('abdull_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const t = useT();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('abdull_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
          }
        } catch (err) {
          console.warn('Failed to verify token:', err.message);
          localStorage.removeItem('abdull_token');
          localStorage.removeItem('abdull_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        localStorage.setItem('abdull_token', res.data.token);
        localStorage.setItem('abdull_user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        showToast(t('toast.welcomeBack', { name: res.data.name }), 'success');
        return res.data;
      }
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        localStorage.setItem('abdull_token', res.data.token);
        localStorage.setItem('abdull_user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        showToast(t('toast.accountCreated'), 'success');
        return res.data;
      }
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('abdull_token');
    localStorage.removeItem('abdull_user');
    setToken(null);
    setUser(null);
    showToast(t('toast.loggedOut'), 'info');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    const stored = JSON.parse(localStorage.getItem('abdull_user') || '{}');
    localStorage.setItem('abdull_user', JSON.stringify({ ...stored, ...updatedData }));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
