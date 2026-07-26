import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [loading, setLoading] = useState(true);

  // On mount, if we have a token, fetch user data
  useEffect(() => {
    if (token) {
      api.getUser()
        .then(userData => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { user: userData, access_token: newToken } = await api.loginUser(email, password);
    localStorage.setItem('token', newToken);
    localStorage.setItem('isAdmin', 'false');
    setToken(newToken);
    setIsAdmin(false);
    setUser(userData);
    return userData;
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    const { user: userData, access_token: newToken } = await api.loginAdmin(email, password);
    localStorage.setItem('token', newToken);
    localStorage.setItem('isAdmin', 'true');
    setToken(newToken);
    setIsAdmin(true);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const { user: userData, access_token: newToken } = await api.registerUser(data);
    localStorage.setItem('token', newToken);
    localStorage.setItem('isAdmin', 'false');
    setToken(newToken);
    setIsAdmin(false);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = {
    user,
    token,
    isAdmin,
    loading,
    isAuthenticated: !!token,
    login,
    adminLogin,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
