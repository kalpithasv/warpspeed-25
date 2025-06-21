/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Package,
  AlertTriangle,
  Tag,
  IndianRupee,
  User,
  Calendar,
  Ban,
  CheckCircle
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { productService, userService } from '../../services';
import type { Product, Seller } from '../../utils/types';

const ManageProducts: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, categoryFilter, sellerFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products and sellers in parallel
      const [productsData, sellersData] = await Promise.all([
        productService.getAllProducts(500), // Get more products for admin view
        userService.getSellers('approved') // Only approved sellers
      ]);
      
      setProducts(productsData.products);
      setSellers(sellersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.isActive : !product.isActive
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Seller filter
    if (sellerFilter !== 'all') {
      filtered = filtered.filter(product => product.sellerId === sellerFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        getSellerName(product.sellerId).toLowerCase().includes(search)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      setActionLoading(productId);
      await productService.toggleActiveStatus(productId, !currentStatus);
      await loadData();
    } catch (error) {
      console.error('Error toggling product status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(selectedProduct.id);
      await productService.deleteProduct(selectedProduct.id);
      await loadData();
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getSellerName = (sellerId: string) => {
    const seller = sellers.find(s => s.uid === sellerId);
    return seller?.businessName || 'Unknown Seller';
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    inactive: products.filter(p => !p.isActive).length,
    lowStock: products.filter(p => p.stock < 10).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-slate-600">Loading products...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
            <p className="text-slate-600">Monitor and manage all products across sellers</p>
          </div>
          
          <div className="mt-3 sm:mt-0 text-sm text-slate-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { title: 'Total Products', value: stats.total, icon: Package, color: 'blue' },
            { title: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
            { title: 'Inactive', value: stats.inactive, icon: Ban, color: 'gray' },
            { title: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'orange' },
            { title: 'Total Value', value: `₹${stats.totalValue.toLocaleString()}`, icon: IndianRupee, color: 'purple' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'bg-blue-500 text-blue-600',
              green: 'bg-green-500 text-green-600',
              gray: 'bg-gray-500 text-gray-600',
              orange: 'bg-orange-500 text-orange-600',
              purple: 'bg-purple-500 text-purple-600'
            };
            
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${colors[stat.color as keyof typeof colors].split(' ')[0]}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between space-y-3 xl:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Sellers</option>
                {sellers.map(seller => (
                  <option key={seller.uid} value={seller.uid}>{seller.businessName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {products.length === 0 ? 'No products found' : 'No products match your filters'}
              </h3>
              <p className="text-slate-500">
                {products.length === 0 
                  ? 'Products will appear here once sellers start adding them.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {product.name}
                            </div>
                            <div className="text-sm text-slate-500 truncate">
                              {product.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-900">{getSellerName(product.sellerId)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-600">{product.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm font-medium text-slate-900">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          {product.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          product.stock < 10 ? 'text-orange-600' : 'text-slate-900'
                        }`}>
                          {product.stock} units
                        </span>
                        {product.stock < 10 && (
                          <div className="text-xs text-orange-500">Low stock</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/product/${product.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                            title="View Product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(product.id, product.isActive)}
                            disabled={actionLoading === product.id}
                            className={`p-1 rounded transition-colors disabled:opacity-50 ${
                              product.isActive
                                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-100'
                            }`}
                            title={product.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {actionLoading === product.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : product.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Info */}
        {filteredProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div className="text-sm text-slate-500">
                Total inventory value: ₹{stats.totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50" 
                onClick={() => setShowDeleteModal(false)} 
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg max-w-md w-full p-6 relative z-10"
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
                  Delete Product
                </h3>
                <p className="text-slate-600 text-center mb-2">
                  Are you sure you want to delete "{selectedProduct.name}"?
                </p>
                <p className="text-sm text-slate-500 text-center mb-6">
                  Seller: {getSellerName(selectedProduct.sellerId)}
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    disabled={actionLoading === selectedProduct.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === selectedProduct.id ? 'Deleting...' : 'Delete Product'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default ManageProducts;