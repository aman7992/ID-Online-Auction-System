import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('id_auction_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('id_auction_user', JSON.stringify(res.data));
        } catch (error) {
          console.error('Failed to load user session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = res.data;
    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('id_auction_token', receivedToken);
    localStorage.setItem('id_auction_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, phone, address) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      phone,
      address,
    });
    const { token: receivedToken, ...userData } = res.data;
    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('id_auction_token', receivedToken);
    localStorage.setItem('id_auction_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('id_auction_token');
    localStorage.removeItem('id_auction_user');
  };

  const updateProfile = async (updateData) => {
    const res = await api.put('/auth/profile', updateData);
    setUser((prev) => ({ ...prev, ...res.data }));
    localStorage.setItem('id_auction_user', JSON.stringify({ ...user, ...res.data }));
    return res.data;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isAuthenticated: !!user,
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
