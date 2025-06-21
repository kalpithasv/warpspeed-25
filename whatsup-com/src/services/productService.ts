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
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '../utils/types';

export class ProductService {
  private static PRODUCTS_COLLECTION = 'products';

  // Add new product
  static async addProduct(sellerId: string, productData: Omit<Product, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>) {
    try {
      const productRef = doc(collection(db, this.PRODUCTS_COLLECTION));
      const product: Product = {
        ...productData,
        id: productRef.id,
        sellerId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(productRef, {
        ...product,
        createdAt: Timestamp.fromDate(product.createdAt),
        updatedAt: Timestamp.fromDate(product.updatedAt)
      });

      return product;
    } catch (error) {
      console.error('Add product error:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, this.PRODUCTS_COLLECTION, productId));
      
      if (productDoc.exists()) {
        const data = productDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Product;
      }
      
      return null;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  // Get products by seller
  static async getSellerProducts(sellerId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.PRODUCTS_COLLECTION),
        where('sellerId', '==', sellerId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Product;
      });
    } catch (error) {
      console.error('Get seller products error:', error);
      throw error;
    }
  }

  // Get all products (for admin)
  static async getAllProducts(pageSize: number = 20, lastDoc?: DocumentSnapshot): Promise<{products: Product[], lastDoc?: DocumentSnapshot}> {
    try {
      let q = query(
        collection(db, this.PRODUCTS_COLLECTION),
        orderBy('updatedAt', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(
          collection(db, this.PRODUCTS_COLLECTION),
          orderBy('updatedAt', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Product;
      });

      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        products,
        lastDoc: lastDocument
      };
    } catch (error) {
      console.error('Get all products error:', error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(searchTerm: string, category?: string): Promise<Product[]> {
    try {
      let q = query(
        collection(db, this.PRODUCTS_COLLECTION),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      );

      if (category) {
        q = query(
          collection(db, this.PRODUCTS_COLLECTION),
          where('isActive', '==', true),
          where('category', '==', category),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Product;
      });

      // Client-side filtering for name/description search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return products.filter(product => 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      }

      return products;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }

  // Update product
  static async updateProduct(productId: string, updates: Partial<Product>) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, this.PRODUCTS_COLLECTION, productId), updateData);
      return true;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string) {
    try {
      await deleteDoc(doc(db, this.PRODUCTS_COLLECTION, productId));
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  // Update product stock
  static async updateStock(productId: string, newStock: number) {
    try {
      await updateDoc(doc(db, this.PRODUCTS_COLLECTION, productId), {
        stock: newStock,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Update stock error:', error);
      throw error;
    }
  }

  // Toggle product active status
  static async toggleActiveStatus(productId: string, isActive: boolean) {
    try {
      await updateDoc(doc(db, this.PRODUCTS_COLLECTION, productId), {
        isActive,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Toggle active status error:', error);
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.PRODUCTS_COLLECTION),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Product;
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  }
}

export const productService = ProductService;