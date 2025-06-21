import React from 'react';
import { MessageCircle } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="w-10 h-10 text-green-600" />
            <span className="text-2xl font-bold text-slate-800">WhatsApp Commerce</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
          <p className="mt-2 text-slate-600">{subtitle}</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>&copy; 2025 WhatsApp Commerce. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;