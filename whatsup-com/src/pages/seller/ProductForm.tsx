import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Package, 
  IndianRupee,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services';
import type { Seller } from '../../utils/types';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
}

const ProductForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    images: [],
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const seller = user as Seller;

  const categories = [
    'Electronics',
    'Clothing & Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Health & Beauty',
    'Toys & Games',
    'Food & Beverages',
    'Automotive',
    'Office Supplies',
    'Pet Supplies',
    'Jewelry & Accessories'
  ];

  useEffect(() => {
    if (isEdit && id) {
      loadProduct();
    }
  }, [isEdit, id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await productService.getProduct(id!);
      if (product && product.sellerId === seller?.uid) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          images: product.images || [],
          isActive: product.isActive
        });
      } else {
        setError('Product not found or you do not have permission to edit it.');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required.');
      return;
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0.');
      return;
    }
    if (formData.stock < 0) {
      setError('Stock cannot be negative.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    try {
      setSaving(true);

      if (isEdit && id) {
        await productService.updateProduct(id, formData);
      } else {
        await productService.addProduct(seller.uid, formData);
      }

      navigate('/seller/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const addImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-2xl font-bold text-slate-900">
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-slate-600">
                {isEdit ? 'Update your product details' : 'Add a new product to your catalog'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Product Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your product..."
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Product Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Product Images
                </h3>

                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Image Preview Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length === 0 && (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No images added yet</p>
                      <p className="text-sm text-slate-400">Add image URLs to showcase your product</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing & Inventory */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2" />
                  Pricing & Inventory
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Status</h3>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Active Product</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formData.isActive ? 'Product is visible to customers' : 'Product is hidden from customers'}
                </p>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEdit ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
};

export default ProductForm;