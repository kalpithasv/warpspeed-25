/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, AlertCircle, UserIcon } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../utils/types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'seller' as 'admin' | 'seller'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success && result.userData) {
        // Check if user role matches selected role
        if ((result.userData as User).role !== formData.role) {
          setError(`This account is registered as ${(result.userData as User).role}, not ${formData.role}`);
          setIsLoading(false);
          return;
        }

        // Check seller status
        if ((result.userData as User).role === 'seller') {
          const seller = result.userData as any;
          if (seller.status === 'pending') {
            navigate('/auth/registration-pending');
            return;
          } else if (seller.status === 'rejected') {
            setError('Your seller account has been rejected. Please contact admin.');
            setIsLoading(false);
            return;
          } else if (seller.status === 'suspended') {
            setError('Your seller account has been suspended. Please contact admin.');
            setIsLoading(false);
            return;
          }
        }

        // Redirect based on role
        if ((result.userData as User).role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/seller/dashboard');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Login Type Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Login as
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'seller'})}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.role === 'seller' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <UserIcon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Seller</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'admin'})}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.role === 'admin' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Lock className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Admin</span>
            </button>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-slate-600">Remember me</span>
          </label>
          <Link to="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            `Sign in as ${formData.role === 'admin' ? 'Admin' : 'Seller'}`
          )}
        </motion.button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-slate-600">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-green-600 hover:text-green-700 font-medium">
              Register as Seller
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;