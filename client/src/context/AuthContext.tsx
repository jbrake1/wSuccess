import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.ts';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(response => setUser(response.data))
        .catch(() => logout());
    }
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
