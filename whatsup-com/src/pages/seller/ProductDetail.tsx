import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Package,
  IndianRupee,
  Tag,
  Calendar,
  Eye,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services';
import type { Product, Seller } from '../../utils/types';

const ProductDetail: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const seller = user as Seller;

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await productService.getProduct(id!);
      
      if (productData && productData.sellerId === seller?.uid) {
        setProduct(productData);
      } else {
        setError('Product not found or you do not have permission to view it.');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;

    try {
      setActionLoading(true);
      await productService.toggleActiveStatus(product.id, !product.isActive);
      await loadProduct();
    } catch (error) {
      console.error('Error toggling product status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        setActionLoading(true);
        await productService.deleteProduct(product.id);
        navigate('/seller/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        setActionLoading(false);
      }
    }
  };

  const copyProductUrl = () => {
    const url = `${window.location.origin}/product/${product?.id}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600">Loading product details...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (error || !product) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Product Not Found</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Link
              to="/seller/products"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/seller/products"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <p className="text-slate-600">Product Details</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={copyProductUrl}
              className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </button>
            <Link
              to={`/seller/products/${product.id}/edit`}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            >
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {product.images.map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  <Package className="w-16 h-16 text-slate-400" />
                </div>
              )}
            </motion.div>

            {/* Product Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Product Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <p className="text-slate-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <div className="flex items-center text-slate-600">
                      <Tag className="w-4 h-4 mr-2" />
                      {product.category}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Created</label>
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Updated</label>
                  <div className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Product Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    product.isActive
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-50`}
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : product.isActive ? (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      <span>Deactivate Product</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span>Activate Product</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Pricing & Inventory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Pricing & Inventory</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Price</span>
                  <div className="flex items-center font-bold text-lg text-slate-800">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {product.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Stock</span>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-slate-400" />
                    <span className={`font-semibold ${
                      product.stock < 10 ? 'text-orange-600' : 'text-slate-800'
                    }`}>
                      {product.stock} units
                    </span>
                  </div>
                </div>

                {product.stock < 10 && (
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700">Low stock warning</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to={`/product/${product.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Public Page
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete Product
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default ProductDetail;