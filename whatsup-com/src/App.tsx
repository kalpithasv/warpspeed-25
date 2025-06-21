import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageSellers from './pages/admin/ManageSellers';
import Settings from './pages/admin/Settings';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerProfile from './pages/seller/SellerProfile';
import ProductForm from './pages/seller/ProductForm';
import ProductDetail from './pages/seller/ProductDetail';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/registration-pending" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Pending</h2>
              <p className="text-slate-600 mb-6">Your seller registration has been submitted successfully. Please wait for admin approval.</p>
              <p className="text-sm text-slate-500">You will receive an email once your account is approved.</p>
            </div>
          </div>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/sellers" element={<ManageSellers />} />
        <Route path="/admin/settings" element={<Settings />} />
        
        {/* Seller Routes */}
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/products" element={<SellerProducts />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
        {/* Product Management Routes */}
        <Route path="/seller/products/new" element={<ProductForm />} />
        <Route path="/seller/products/:id" element={<ProductDetail />} />
        <Route path="/seller/products/:id/edit" element={<ProductForm />} />
        
        
        {/* Catch all route - 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
              <p className="text-xl text-slate-600 mb-8">Page not found</p>
              <a href="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;