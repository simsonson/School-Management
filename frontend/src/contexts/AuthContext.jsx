import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // In a real app, you'd verify the token with the backend
          // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // const res = await axios.get('http://localhost:5000/api/auth/me');
          // setUser(res.data.data);
          
          // For now, parse user from localStorage to save time
          const storedUser = localStorage.getItem('user');
          if (storedUser) setUser(JSON.parse(storedUser));
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
