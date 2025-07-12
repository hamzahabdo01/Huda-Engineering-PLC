import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user storage key
  const STORAGE_KEY = 'huda_admin_users';
  const CURRENT_USER_KEY = 'huda_current_admin';

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
      try {
        const parsedUser = JSON.parse(currentUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const getStoredUsers = (): User[] => {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (newUser: User) => {
    const users = getStoredUsers();
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      setIsLoading(false);
      return { success: false, message: 'User not found' };
    }

    // In a real app, you would hash and compare passwords properly
    // For demo purposes, we'll use a simple check
    const storedPassword = localStorage.getItem(`password_${user.id}`);
    if (storedPassword !== password) {
      setIsLoading(false);
      return { success: false, message: 'Invalid credentials' };
    }

    setUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setIsLoading(false);
    
    return { success: true, message: 'Login successful' };
  };

  const signup = async (email: string, password: string, fullName: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = getStoredUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      setIsLoading(false);
      return { success: false, message: 'User already exists' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      fullName,
      role: 'admin'
    };

    saveUser(newUser);
    // Store password separately (in a real app, this would be hashed)
    localStorage.setItem(`password_${newUser.id}`, password);
    
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    
    return { success: true, message: 'Account created successfully' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;