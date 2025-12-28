import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isLoggedIn()) {
        try {
          const data = await api.getCurrentUser();
          setUser(data.user);
        } catch (err) {
          console.error('인증 확인 실패:', err);
          api.logout();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const register = async (username, password) => {
    setError(null);
    try {
      const data = await api.register(username, password);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const data = await api.login(username, password);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isLoggedIn: !!user,
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
