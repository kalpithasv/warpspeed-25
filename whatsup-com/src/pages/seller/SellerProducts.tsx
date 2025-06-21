/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Package,
  AlertTriangle,
  Tag,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  MoreVertical,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services';
import type { Product } from '../../utils/types';

const SellerProducts: React.FC = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const seller = user as any;

  useEffect(() => {
    if (isAuthenticated && isSeller && seller?.uid && seller?.status === 'approved') {
      loadProducts();
    }
  }, [isAuthenticated, isSeller, seller?.uid, seller?.status]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getSellerProducts(seller.uid);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
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

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      setActionLoading(productId);
      await productService.toggleActiveStatus(productId, !currentStatus);
      await loadProducts();
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
      await loadProducts();
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    inactive: products.filter(p => !p.isActive).length,
    lowStock: products.filter(p => p.stock < 10).length
  };

  if (!isAuthenticated || !isSeller || seller?.status !== 'approved') {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-600">You need to be an approved seller to manage products.</p>
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
            <p className="text-slate-600">Loading your products...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
            <p className="text-slate-600">Manage your product catalog</p>
          </div>
          
          <Link
            to="/seller/products/new"
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Products', value: stats.total, icon: Package, color: 'blue' },
            { title: 'Active', value: stats.active, icon: TrendingUp, color: 'green' },
            { title: 'Inactive', value: stats.inactive, icon: TrendingDown, color: 'gray' },
            { title: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'orange' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'bg-blue-500 text-blue-600',
              green: 'bg-green-500 text-green-600',
              gray: 'bg-gray-500 text-gray-600',
              orange: 'bg-orange-500 text-orange-600'
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
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
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {products.length === 0 ? 'No products yet' : 'No products found'}
              </h3>
              <p className="text-slate-500 mb-6">
                {products.length === 0 
                  ? 'Start building your catalog by adding your first product.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {products.length === 0 && (
                <Link
                  to="/seller/products/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-video bg-slate-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Stock Warning */}
                  {product.stock < 10 && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        Low Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 truncate flex-1">{product.name}</h3>
                    <div className="relative ml-2">
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-lg font-bold text-slate-800">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {product.price.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Package className="w-3 h-3 mr-1" />
                      Stock: {product.stock}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-xs text-slate-500">
                      <Tag className="w-3 h-3 mr-1" />
                      {product.category}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/seller/products/${product.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/seller/products/${product.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(product.id, product.isActive)}
                      disabled={actionLoading === product.id}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        product.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {actionLoading === product.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : product.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      <span>{product.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
                <p className="text-slate-600 text-center mb-6">
                  Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
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
    </SellerLayout>
  );
};

export default SellerProducts;