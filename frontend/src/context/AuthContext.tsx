// @refresh reset
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/client';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'WORKER' | 'ADMIN';
  address?: string;
  pincode?: string;
  profilePicture?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.data) {
        const fetchedUser = res.data.data;
        // Map backend profile_image to profilePicture
        if (fetchedUser.profile_image) {
          fetchedUser.profilePicture = fetchedUser.profile_image;
        }

        // Preserve locally uploaded profile picture on refresh
        try {
          const storedStr = localStorage.getItem('user');
          if (storedStr) {
            const stored = JSON.parse(storedStr);
            if (stored.profilePicture && !fetchedUser.profilePicture) {
              fetchedUser.profilePicture = stored.profilePicture;
            }
          }
        } catch (e) {}
        
        setUser(fetchedUser);
        localStorage.setItem('user', JSON.stringify(fetchedUser));
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      // If 401, the interceptor handles logout
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // We could also call /auth/logout API here
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
