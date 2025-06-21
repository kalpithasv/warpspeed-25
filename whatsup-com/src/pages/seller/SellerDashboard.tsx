/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  DollarSign,
  Users,
  Star,
  Calendar,
  Activity,
  ShoppingCart
} from 'lucide-react';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../hooks/useAuth';
import { productService, orderService } from '../../services';
import type { Seller } from '../../utils/types';

interface SellerDashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  averageOrderValue: number;
}

const SellerDashboard: React.FC = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [stats, setStats] = useState<SellerDashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    averageOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const seller = user as Seller;

  useEffect(() => {
    if (isAuthenticated && isSeller && seller?.uid) {
      loadDashboardData();
    }
  }, [isAuthenticated, isSeller, seller?.uid]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load products
      const products = await productService.getSellerProducts(seller.uid);
      
      // Load orders
      const orders = await orderService.getSellerOrders(seller.uid);
      
      // Load recent orders
      const recent = await orderService.getRecentSellerOrders(seller.uid, 5);
      
      // Calculate stats
      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthRevenue = orders
        .filter(order => 
          order.status === 'delivered' && 
          new Date(order.createdAt) >= thisMonth
        )
        .reduce((sum, order) => sum + order.total, 0);

      const averageOrderValue = orders.length > 0 
        ? totalRevenue / orders.filter(o => o.status === 'delivered').length 
        : 0;

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
        totalRevenue,
        thisMonthRevenue,
        averageOrderValue
      });

      setRecentOrders(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subValue: `${stats.activeProducts} active`,
      icon: Package,
      color: 'blue',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subValue: `${stats.pendingOrders} pending`,
      icon: ShoppingBag,
      color: 'green',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      subValue: 'All time',
      icon: DollarSign,
      color: 'emerald',
      change: '+23%',
      changeType: 'increase'
    },
    {
      title: 'This Month',
      value: `₹${stats.thisMonthRevenue.toLocaleString()}`,
      subValue: 'Current month',
      icon: TrendingUp,
      color: 'purple',
      change: '+45%',
      changeType: 'increase'
    },
    {
      title: 'Avg Order Value',
      value: `₹${Math.round(stats.averageOrderValue).toLocaleString()}`,
      subValue: 'Per order',
      icon: Activity,
      color: 'orange',
      change: '+5%',
      changeType: 'increase'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  if (!isAuthenticated || !isSeller) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-600">You need to be an approved seller to access this dashboard.</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (seller?.status !== 'approved') {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Approval Pending</h2>
            <p className="text-slate-600 mb-4">
              Your seller application is currently under review. You'll be able to access your dashboard once approved by our admin team.
            </p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              seller?.status === 'pending' 
                ? 'bg-orange-100 text-orange-800'
                : seller?.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              Status: {seller?.status?.charAt(0).toUpperCase() + seller?.status?.slice(1)}
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600">Loading your dashboard...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {seller?.ownerName || 'Seller'}! 👋
            </h1>
            <p className="text-blue-100">
              Here's how your business <strong>{seller?.businessName}</strong> is performing today.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.changeType === 'increase' ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {card.change}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-800">{card.value}</h3>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-xs text-slate-500">{card.subValue}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200"
          >
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Recent Orders</h3>
                  <p className="text-sm text-slate-500">Latest customer orders</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {stats.pendingOrders} pending
                  </span>
                  <button 
                    onClick={() => window.location.href = '/seller/orders'}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    View All <Eye className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-slate-500">
                            {order.items?.length || 0} items • ₹{order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'pending' 
                            ? 'bg-orange-100 text-orange-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-medium text-slate-800 mb-1">No orders yet</h4>
                  <p className="text-sm text-slate-500">Orders will appear here once customers start buying.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-slate-200"
          >
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
              <p className="text-sm text-slate-500">Common tasks</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { 
                    icon: Plus, 
                    title: 'Add New Product', 
                    desc: 'List a new item', 
                    href: '/seller/products/new',
                    color: 'green'
                  },
                  { 
                    icon: ShoppingBag, 
                    title: 'Manage Orders', 
                    desc: `${stats.pendingOrders} pending`, 
                    href: '/seller/orders',
                    color: 'blue'
                  },
                  { 
                    icon: Package, 
                    title: 'Update Inventory', 
                    desc: `${stats.totalProducts} products`, 
                    href: '/seller/products',
                    color: 'purple'
                  },
                  { 
                    icon: Users, 
                    title: 'Business Profile', 
                    desc: 'Update settings', 
                    href: '/seller/profile',
                    color: 'orange'
                  }
                ].map((action, index) => {
                  const Icon = action.icon;
                  const colors = {
                    green: 'bg-green-100 text-green-600',
                    blue: 'bg-blue-100 text-blue-600',
                    purple: 'bg-purple-100 text-purple-600',
                    orange: 'bg-orange-100 text-orange-600'
                  };
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.location.href = action.href}
                      className="w-full flex items-center p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-left group"
                    >
                      <div className={`p-2 rounded-lg ${colors[action.color as keyof typeof colors]} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-slate-800">{action.title}</p>
                        <p className="text-sm text-slate-500">{action.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Business Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Business Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">Business Rating</h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">4.8</p>
              <p className="text-sm text-slate-500">Based on customer reviews</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">Member Since</h4>
              <p className="text-lg font-bold text-green-600 mb-1">
                {new Date(seller?.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-500">Trusted seller</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">Growth Rate</h4>
              <p className="text-2xl font-bold text-purple-600 mb-1">+23%</p>
              <p className="text-sm text-slate-500">This month vs last</p>
            </div>
          </div>
        </motion.div>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;