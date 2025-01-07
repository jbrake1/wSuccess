import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

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

  // AI: begin do not edit
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(response => setUser(response.data))
        .catch(() => logout());
    }
  }, []);
  // AI: end do not edit

  // AI: begin do not edit
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
  // AI: end do not edit

  // AI: begin do not edit
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  // AI: end do not edit

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
