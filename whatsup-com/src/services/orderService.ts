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
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order } from '../utils/types';

export class OrderService {
  private static ORDERS_COLLECTION = 'orders';

  // Create new order
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const orderRef = doc(collection(db, this.ORDERS_COLLECTION));
      const order: Order = {
        ...orderData,
        id: orderRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(orderRef, {
        ...order,
        createdAt: Timestamp.fromDate(order.createdAt),
        updatedAt: Timestamp.fromDate(order.updatedAt)
      });

      return order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  // Get order by ID
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, this.ORDERS_COLLECTION, orderId));
      
      if (orderDoc.exists()) {
        const data = orderDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Order;
      }
      
      return null;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  // Get orders by seller
  static async getSellerOrders(sellerId: string, status?: Order['status']): Promise<Order[]> {
    try {
      let q = query(
        collection(db, this.ORDERS_COLLECTION),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(
          collection(db, this.ORDERS_COLLECTION),
          where('sellerId', '==', sellerId),
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
          updatedAt: data.updatedAt?.toDate()
        } as Order;
      });
    } catch (error) {
      console.error('Get seller orders error:', error);
      throw error;
    }
  }

  // Get all orders (for admin)
  static async getAllOrders(status?: Order['status'], limitCount: number = 50): Promise<Order[]> {
    try {
      let q = query(
        collection(db, this.ORDERS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (status) {
        q = query(
          collection(db, this.ORDERS_COLLECTION),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Order;
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      await updateDoc(doc(db, this.ORDERS_COLLECTION, orderId), {
        status,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  // Update entire order
  static async updateOrder(orderId: string, updates: Partial<Order>) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, this.ORDERS_COLLECTION, orderId), updateData);
      return true;
    } catch (error) {
      console.error('Update order error:', error);
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string) {
    try {
      await updateDoc(doc(db, this.ORDERS_COLLECTION, orderId), {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  // Delete order
  static async deleteOrder(orderId: string) {
    try {
      await deleteDoc(doc(db, this.ORDERS_COLLECTION, orderId));
      return true;
    } catch (error) {
      console.error('Delete order error:', error);
      throw error;
    }
  }

  // Get order statistics for seller
  static async getSellerOrderStats(sellerId: string) {
    try {
      const orders = await this.getSellerOrders(sellerId);
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, order) => sum + order.total, 0)
      };

      return stats;
    } catch (error) {
      console.error('Get seller order stats error:', error);
      throw error;
    }
  }

  // Get recent orders for seller
  static async getRecentSellerOrders(sellerId: string, limitCount: number = 10): Promise<Order[]> {
    try {
      const q = query(
        collection(db, this.ORDERS_COLLECTION),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Order;
      });
    } catch (error) {
      console.error('Get recent seller orders error:', error);
      throw error;
    }
  }
}

export const orderService = OrderService;