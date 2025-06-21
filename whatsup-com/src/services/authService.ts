/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';
import { UserService } from './userService';
import type { Seller } from '../utils/types';

export class AuthService {
  // Register new seller
  static async registerSeller(formData: {
    email: string;
    password: string;
    businessName: string;
    ownerName: string;
    phone: string;
    address: string;
    category: string;
    description?: string;
  }) {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Create seller profile in Firestore
      const sellerData: Omit<Seller, 'uid'> = {
        email: formData.email,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        category: formData.category,
        description: formData.description,
        status: 'pending',
        createdAt: new Date()
      };

      await UserService.createSeller(userCredential.user.uid, sellerData);

      return {
        success: true,
        message: 'Registration successful! Your application is pending approval.',
        user: userCredential.user
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Login user
  static async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userData = await UserService.getUserData(userCredential.user.uid);
      
      if (!userData) {
        throw new Error('User data not found');
      }

      // Update last login
      await UserService.updateLastLogin(userCredential.user.uid);

      return {
        success: true,
        message: 'Login successful!',
        userData,
        firebaseUser: userCredential.user
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Logout user
  static async logout() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent!'
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Auth state change listener
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}