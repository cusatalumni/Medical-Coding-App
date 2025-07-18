
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  paymentSuccess: boolean;
  login: (user: User) => void;
  logout: () => void;
  setPaymentSuccess: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [paymentSuccess, setPaymentSuccessState] = useState<boolean>(false);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setPaymentSuccessState(false);
  };

  const setPaymentSuccess = (status: boolean) => {
    setPaymentSuccessState(status);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, paymentSuccess, setPaymentSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
