import { useState, useEffect } from 'react';

interface OfflineUser {
  id: string;
  name: string;
  role: 'admin' | 'cashier' | 'waiter' | 'kitchen';
  createdAt: string;
}

export function useOfflineAuth() {
  const [user, setUser] = useState<OfflineUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing offline user
    const savedUser = localStorage.getItem('pos_offline_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('pos_offline_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (name: string, role: OfflineUser['role'] = 'admin') => {
    const newUser: OfflineUser = {
      id: `offline_${Date.now()}`,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('pos_offline_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('pos_offline_user');
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}