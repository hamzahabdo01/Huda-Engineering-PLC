import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const authToken = localStorage.getItem('admin_auth_token');
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would be an API call
    const mockCredentials = {
      email: 'admin@hudaengineering.com',
      password: 'admin123'
    };

    // Check if there are any saved admin users
    const savedAdmins = localStorage.getItem('admin_users');
    let validCredentials = [mockCredentials];
    
    if (savedAdmins) {
      const parsedAdmins = JSON.parse(savedAdmins);
      validCredentials = [...validCredentials, ...parsedAdmins];
    }

    const isValid = validCredentials.some(
      cred => cred.email === email && cred.password === password
    );

    if (isValid) {
      localStorage.setItem('admin_auth_token', 'mock_token_' + Date.now());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const savedAdmins = localStorage.getItem('admin_users');
      let admins = [];
      
      if (savedAdmins) {
        admins = JSON.parse(savedAdmins);
        if (admins.some((admin: any) => admin.email === email)) {
          return false; // User already exists
        }
      }

      // Add new admin
      const newAdmin = { email, password, name };
      admins.push(newAdmin);
      localStorage.setItem('admin_users', JSON.stringify(admins));
      
      // Auto-login after signup
      localStorage.setItem('admin_auth_token', 'mock_token_' + Date.now());
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_auth_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};