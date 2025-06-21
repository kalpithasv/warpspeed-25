/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  X,
  Calendar,
  User,
  Phone,
  IndianRupee,
  MessageSquare,
  Download
} from 'lucide-react';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services';
import type { Order, Seller } from '../../utils/types';

const SellerOrders: React.FC = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const seller = user as Seller;

  useEffect(() => {
    if (isAuthenticated && isSeller && seller?.uid && seller?.status === 'approved') {
      loadOrders();
    }
  }, [isAuthenticated, isSeller, seller?.uid, seller?.status]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getSellerOrders(seller.uid);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.customerPhone?.toLowerCase().includes(search) ||
        order.products?.some(item => item.productName?.toLowerCase().includes(search))
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      setActionLoading(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      
      // Close modal if it's the selected order
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'confirmed':
        return CheckCircle;
      case 'shipped':
        return Truck;
      case 'delivered':
        return Package;
      case 'cancelled':
        return X;
      default:
        return ShoppingBag;
    }
  };

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

  if (!isAuthenticated || !isSeller || seller?.status !== 'approved') {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ShoppingBag className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-600">You need to be an approved seller to view orders.</p>
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
            <p className="text-slate-600">Loading your orders...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="text-slate-600">Manage customer orders and track deliveries</p>
          </div>
          
          <div className="mt-3 sm:mt-0 flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { title: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'blue' },
            { title: 'Pending', value: stats.pending, icon: Clock, color: 'orange' },
            { title: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'blue' },
            { title: 'Shipped', value: stats.shipped, icon: Truck, color: 'purple' },
            { title: 'Delivered', value: stats.delivered, icon: Package, color: 'green' },
            { title: 'Cancelled', value: stats.cancelled, icon: X, color: 'red' },
            { title: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'emerald' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'bg-blue-500 text-blue-600',
              orange: 'bg-orange-500 text-orange-600',
              purple: 'bg-purple-500 text-purple-600',
              green: 'bg-green-500 text-green-600',
              red: 'bg-red-500 text-red-600',
              emerald: 'bg-emerald-500 text-emerald-600'
            };
            
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">{stat.title}</p>
                    <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${colors[stat.color as keyof typeof colors].split(' ')[0]}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {orders.length === 0 ? 'No orders yet' : 'No orders found'}
              </h3>
              <p className="text-slate-500">
                {orders.length === 0 
                  ? 'Orders will appear here once customers start placing them.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-200">
              {filteredOrders.map((order, index) => {
                const StatusIcon = getStatusIcon(order.status);
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <StatusIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-slate-900">
                                Order #{order.id.slice(-8)}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {order.customerName || 'Customer'}
                              </div>
                              <div className="flex items-center font-medium text-slate-700">
                                <IndianRupee className="w-3 h-3 mr-1" />
                                {order.total.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="ml-13">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {order.products?.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                {item.quantity}x {item.productName}
                              </span>
                            ))}
                            {order.products && order.products.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                                +{order.products.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Customer Info */}
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            {order.customerPhone && (
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {order.customerPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Quick Status Actions */}
                        {order.status === 'pending' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                              disabled={actionLoading === order.id}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              disabled={actionLoading === order.id}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'shipped')}
                            disabled={actionLoading === order.id}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          >
                            Mark Shipped
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            disabled={actionLoading === order.id}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* WhatsApp Contact */}
                        {order.customerPhone && (
                          <button
                            onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`, '_blank')}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Contact on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Loading Indicator */}
                    {actionLoading === order.id && (
                      <div className="mt-3 flex items-center text-sm text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating order status...
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50" 
                onClick={() => setShowOrderModal(false)} 
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg max-w-2xl w-full p-6 relative z-10 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Order #{selectedOrder.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status & Actions */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {selectedOrder.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                            disabled={actionLoading === selectedOrder.id}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            Confirm Order
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                            disabled={actionLoading === selectedOrder.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            Cancel Order
                          </button>
                        </>
                      )}
                      
                      {selectedOrder.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                          disabled={actionLoading === selectedOrder.id}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      
                      {selectedOrder.status === 'shipped' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                          disabled={actionLoading === selectedOrder.id}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
                        <p className="text-slate-900">{selectedOrder.customerName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-slate-900">{selectedOrder.customerPhone || 'Not provided'}</p>
                          {selectedOrder.customerPhone && (
                            <button
                              onClick={() => window.open(`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}`, '_blank')}
                              className="text-green-600 hover:text-green-700"
                              title="Contact on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.products?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.productName}</p>
                              <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900">₹{item.price.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">Total Amount</span>
                      <span className="text-xl font-bold text-slate-900">₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </SellerLayout>
  );
};

export default SellerOrders;