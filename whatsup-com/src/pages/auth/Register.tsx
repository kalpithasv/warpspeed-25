/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Store, User, Phone, MapPin, Tag, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
    const navigate = useNavigate();
    const { registerSeller } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        ownerName: '',
        phone: '',
        address: '',
        category: '',
        description: ''
    });

    const categories = [
        'Electronics', 'Fashion', 'Food & Beverages', 'Beauty & Health',
        'Home & Garden', 'Sports', 'Books', 'Toys', 'Automotive', 'Other'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (!formData.phone.match(/^\+?[\d\s-()]+$/)) {
            setError('Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...registrationData } = formData;
            // Check password and confirm password match
            if (registrationData.password !== confirmPassword) {
                setError('Passwords do not match');
                setIsLoading(false);
                return;
            }
            const result = await registerSeller(registrationData);

            if (result.success) {
                navigate('/auth/registration-pending');
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (error: any) {
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Become a Seller"
            subtitle="Join our platform and start selling through WhatsApp"
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
                        placeholder="your@email.com"
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
                            minLength={6}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                            placeholder="Create a strong password"
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
                    <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters long</p>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-slate-300'
                                }`}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                        />
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                        )}
                    </div>
                </div>

                {/* Business Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Store className="w-4 h-4 inline mr-1" />
                        Business Name
                    </label>
                    <input
                        type="text"
                        name="businessName"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your business name"
                        value={formData.businessName}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Owner Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Owner Name
                    </label>
                    <input
                        type="text"
                        name="ownerName"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your full name"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Business Address
                    </label>
                    <input
                        type="text"
                        name="address"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your business address"
                        value={formData.address}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-1" />
                        Business Category
                    </label>
                    <select
                        name="category"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={formData.category}
                        onChange={handleInputChange}
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Business Description (Optional)
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Brief description of your business"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
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
                            <span>Creating Account...</span>
                        </div>
                    ) : (
                        'Create Seller Account'
                    )}
                </motion.button>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-slate-600">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Register;