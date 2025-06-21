import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { userService, productService, orderService } from '../../services';

interface DashboardStats {
  totalSellers: number;
  pendingSellers: number;
  approvedSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSellers: 0,
    pendingSellers: 0,
    approvedSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load sellers data
      const [allSellers, pendingSellers, approvedSellers] = await Promise.all([
        userService.getSellers(),
        userService.getSellers('pending'),
        userService.getSellers('approved')
      ]);

      // Load products data
      const { products } = await productService.getAllProducts(100);
      
      // Load orders data
      const orders = await orderService.getAllOrders(undefined, 100);
      
      // Calculate revenue
      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);

      setStats({
        totalSellers: allSellers.length,
        pendingSellers: pendingSellers.length,
        approvedSellers: approvedSellers.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Sellers',
      value: stats.totalSellers,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingSellers,
      icon: Clock,
      color: 'orange',
      change: `${stats.pendingSellers} waiting`
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'purple',
      change: '+15%'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'emerald',
      change: '+23%'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    orange: 'bg-orange-500 text-orange-600', 
    green: 'bg-green-500 text-green-600',
    purple: 'bg-purple-500 text-purple-600',
    emerald: 'bg-emerald-500 text-emerald-600'
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white"
        >
          <h1 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h1>
          <p className="text-green-100">Here's what's happening with your WhatsApp commerce platform today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const [bgColor,] = colorClasses[card.color as keyof typeof colorClasses].split(' ');
            
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-800">{card.value}</h3>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {card.change}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Sellers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200"
          >
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Pending Seller Approvals</h3>
                  <p className="text-sm text-slate-500">Review and approve new merchant applications</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stats.pendingSellers > 0 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {stats.pendingSellers} pending
                  </span>
                  <button 
                    onClick={() => window.location.href = '/admin/sellers'}
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                  >
                    View All <Eye className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {stats.pendingSellers > 0 ? (
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-slate-800">
                        {stats.pendingSellers} seller{stats.pendingSellers > 1 ? 's' : ''} awaiting approval
                      </p>
                      <p className="text-sm text-slate-600">Applications ready for review</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/admin/sellers'}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Review Now
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-slate-800 mb-1">All caught up!</h4>
                  <p className="text-sm text-slate-500">No pending seller approvals.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-slate-200"
          >
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
              <p className="text-sm text-slate-500">Latest platform updates</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, title: 'New seller approved', desc: 'Electronics Store', color: 'green' },
                  { icon: Package, title: 'Products updated', desc: '25 new items', color: 'blue' },
                  { icon: ShoppingCart, title: 'Order milestone', desc: '1000+ orders', color: 'purple' },
                  { icon: Users, title: 'New application', desc: 'Fashion Store', color: 'orange' }
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  const colors = {
                    green: 'bg-green-100 text-green-600',
                    blue: 'bg-blue-100 text-blue-600',
                    purple: 'bg-purple-100 text-purple-600',
                    orange: 'bg-orange-100 text-orange-600'
                  };
                  
                  return (
                    <div key={index} className="flex items-center p-2 rounded-lg hover:bg-slate-50">
                      <div className={`p-1.5 rounded-lg ${colors[activity.color as keyof typeof colors]}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.desc}</p>
                      </div>
                      <span className="text-xs text-slate-400">{2 + index}h ago</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Review Sellers', desc: 'Approve pending applications', href: '/admin/sellers', icon: Users, color: 'blue' },
              { title: 'Manage Products', desc: 'Monitor product catalog', href: '/admin/products', icon: Package, color: 'green' },
              { title: 'Platform Settings', desc: 'Configure system', href: '/admin/settings', icon: SettingsIcon, color: 'purple' }
            ].map((item, index) => {
              const Icon = item.icon;
              const colors = {
                blue: 'bg-blue-500',
                green: 'bg-green-500', 
                purple: 'bg-purple-500'
              };
              
              return (
                <button
                  key={index}
                  onClick={() => window.location.href = item.href}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-all text-left group"
                >
                  <div className={`w-10 h-10 ${colors[item.color as keyof typeof colors]} rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-medium text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;