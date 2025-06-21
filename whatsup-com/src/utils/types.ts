export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Seller {
  uid: string;
  email: string;
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  category: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  whatsappConnected?: boolean;
  qrCode?: string;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  sellerId: string;
  customerPhone: string;
  customerName: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}