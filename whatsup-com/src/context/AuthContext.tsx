/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { AuthService } from '../services/authService';
import { userService } from '../services/userService';
import type { User, Seller } from '../utils/types';

interface AuthContextType {
  user: User | Seller | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; message: string; userData?: User | Seller}>;
  registerSeller: (formData: {
    email: string;
    password: string;
    businessName: string;
    ownerName: string;
    phone: string;
    address: string;
    category: string;
    description?: string;
  }) => Promise<{success: boolean; message: string}>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{success: boolean; message: string}>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid);
      setFirebaseUser(firebaseUser);
      setError(null);

      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await userService.getUserData(firebaseUser.uid);
          console.log('User data loaded:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Computed values
  const isAuthenticated = !!firebaseUser;
  const isAdmin = (user as User)?.role === 'admin';
  const isSeller = (user as User)?.role === 'seller';

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const result = await AuthService.login(email, password);
      // Don't manually set user here - let the auth state listener handle it
      return {
        success: result.success,
        message: result.message,
        userData: result.userData
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  };

  // Register seller function
  const registerSeller = async (formData: {
    email: string;
    password: string;
    businessName: string;
    ownerName: string;
    phone: string;
    address: string;
    category: string;
    description?: string;
  }) => {
    try {
      const result = await AuthService.registerSeller(formData);
      return {
        success: result.success,
        message: result.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();
      // Don't manually clear user state - let the auth state listener handle it
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const result = await AuthService.resetPassword(email);
      return {
        success: result.success,
        message: result.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password reset failed'
      };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const userData = await userService.getUserData(firebaseUser.uid);
        setUser(userData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
        setError('Failed to refresh user data');
      }
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isSeller,
    login,
    registerSeller,
    logout,
    resetPassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};