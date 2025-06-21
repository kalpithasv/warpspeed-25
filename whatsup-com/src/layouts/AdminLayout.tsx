import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      name: 'Manage Sellers',
      href: '/admin/sellers',
      icon: Users,
      description: 'Approve & Monitor'
    },
    {
      name: 'Manage Products',
      href: '/admin/products',
      icon: Package,
      description: 'Catalog Management'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'System Configuration'
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.href === location.pathname);
    return currentNav?.name || 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-slate-200 lg:translate-x-0 lg:inset-0 lg:h-screen lg:sticky lg:top-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-slate-800">WhatsApp Admin</h1>
                <p className="text-xs text-slate-500">Management Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                      ${active
                        ? 'bg-green-100 text-green-700 border-l-2 border-green-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${active ? 'text-green-700' : 'text-slate-700'}`}>
                        {item.name}
                      </div>
                      <div className={`text-xs ${active ? 'text-green-600' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-slate-200">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center w-full p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">Admin</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 bg-white shadow-sm border-b border-slate-200"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
                <p className="text-sm text-slate-500">Manage your WhatsApp commerce platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 w-56 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </motion.button>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Close Button */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed top-4 right-4 z-50 lg:hidden p-2 bg-white rounded-full shadow-lg"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;