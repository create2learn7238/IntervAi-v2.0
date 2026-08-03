import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('intervAi_token') || localStorage.getItem('interai_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('intervAi_user') || localStorage.getItem('interai_user');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, [token]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('intervAi_token', jwtToken);
    localStorage.setItem('intervAi_user', JSON.stringify(userData));
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('intervAi_user', JSON.stringify(newUserData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('intervAi_token');
    localStorage.removeItem('intervAi_user');
    localStorage.removeItem('interai_token');
    localStorage.removeItem('interai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
