// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Seller } from '../utils/types';

export class UserService {
  private static USERS_COLLECTION = 'users';

  // Create seller profile
  static async createSeller(uid: string, sellerData: Omit<Seller, 'uid'>) {
    try {
      const userData: Seller = {
        ...sellerData,
        uid,
        createdAt: sellerData.createdAt || new Date()
      };

      await setDoc(doc(db, this.USERS_COLLECTION, uid), {
        ...userData,
        role: 'seller',
        createdAt: Timestamp.fromDate(userData.createdAt)
      });

      return userData;
    } catch (error) {
      console.error('Create seller error:', error);
      throw error;
    }
  }

  // Get user data
  static async getUserData(uid: string): Promise<User | Seller | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          lastLogin: data.lastLogin?.toDate()
        } as User | Seller;
      }
      
      return null;
    } catch (error) {
      console.error('Get user data error:', error);
      throw error;
    }
  }

  // Update user data
  static async updateUserData(uid: string, updates: Partial<User | Seller>) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      // Convert Date objects to Timestamps
      if (updates.approvedAt) {
        updateData.approvedAt = Timestamp.fromDate(updates.approvedAt);
      }

      await updateDoc(doc(db, this.USERS_COLLECTION, uid), updateData);
      return true;
    } catch (error) {
      console.error('Update user data error:', error);
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(uid: string) {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, uid), {
        lastLogin: Timestamp.now()
      });
    } catch (error) {
      console.error('Update last login error:', error);
      throw error;
    }
  }

  // Get all sellers with status filter
  static async getSellers(status?: 'pending' | 'approved' | 'rejected' | 'suspended'): Promise<Seller[]> {
    try {
      let q = query(
        collection(db, this.USERS_COLLECTION), 
        where('role', '==', 'seller'),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(
          collection(db, this.USERS_COLLECTION),
          where('role', '==', 'seller'),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          lastLogin: data.lastLogin?.toDate()
        } as Seller;
      });
    } catch (error) {
      console.error('Get sellers error:', error);
      throw error;
    }
  }

  // Approve seller
  static async approveSeller(sellerId: string, adminId: string) {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, sellerId), {
        status: 'approved',
        approvedAt: Timestamp.now(),
        approvedBy: adminId,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Approve seller error:', error);
      throw error;
    }
  }

  // Reject seller
  static async rejectSeller(sellerId: string, adminId: string) {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, sellerId), {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
        rejectedBy: adminId,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Reject seller error:', error);
      throw error;
    }
  }

  // Suspend seller
  static async suspendSeller(sellerId: string, adminId: string) {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, sellerId), {
        status: 'suspended',
        suspendedAt: Timestamp.now(),
        suspendedBy: adminId,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Suspend seller error:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(uid: string) {
    try {
      await deleteDoc(doc(db, this.USERS_COLLECTION, uid));
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
}

export const userService = UserService;