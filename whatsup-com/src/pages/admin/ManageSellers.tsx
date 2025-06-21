/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Pause,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { userService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import type { Seller } from '../../utils/types';

const ManageSellers: React.FC = () => {
  const { firebaseUser, isAuthenticated } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSellers();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [sellers, selectedStatus, searchTerm]);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const sellersData = await userService.getSellers();
      setSellers(sellersData);
    } catch (error) {
      console.error('Error loading sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSellers = () => {
    let filtered = sellers;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(seller => seller.status === selectedStatus);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(seller =>
        seller.businessName.toLowerCase().includes(search) ||
        seller.ownerName.toLowerCase().includes(search) ||
        seller.email.toLowerCase().includes(search) ||
        seller.phone.includes(search)
      );
    }

    setFilteredSellers(filtered);
  };

  const handleSellerAction = async (sellerId: string, action: 'approve' | 'reject' | 'suspend') => {
    if (!firebaseUser || !isAuthenticated) {
        console.log("User not authenticated");
        return;
    };

    try {
      setActionLoading(sellerId);
      
      switch (action) {
        case 'approve':
          await userService.approveSeller(sellerId, firebaseUser.uid);
          break;
        case 'reject':
          await userService.rejectSeller(sellerId, firebaseUser.uid);
          break;
        case 'suspend':
          await userService.suspendSeller(sellerId, firebaseUser.uid);
          break;
      }

      await loadSellers();
      setShowModal(false);
      setSelectedSeller(null);
    } catch (error) {
      console.error(`Error ${action}ing seller:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800'
  };

  const statusCounts = {
    all: sellers.length,
    pending: sellers.filter(s => s.status === 'pending').length,
    approved: sellers.filter(s => s.status === 'approved').length,
    rejected: sellers.filter(s => s.status === 'rejected').length,
    suspended: sellers.filter(s => s.status === 'suspended').length
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Sellers</h1>
            <p className="text-slate-600">Review and manage seller applications</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-3 sm:mt-0">
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {statusCounts.pending} Pending
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {statusCounts.approved} Approved
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All ({statusCounts.all})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="approved">Approved ({statusCounts.approved})</option>
                <option value="rejected">Rejected ({statusCounts.rejected})</option>
                <option value="suspended">Suspended ({statusCounts.suspended})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sellers List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {filteredSellers.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No sellers found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Applied</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredSellers.map((seller, index) => (
                    <motion.tr
                      key={seller.uid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-medium text-sm">
                              {seller.ownerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{seller.ownerName}</div>
                            <div className="text-sm text-slate-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {seller.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{seller.businessName}</div>
                          <div className="text-sm text-slate-500 flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {seller.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[seller.status]}`}>
                          {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {seller.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleSellerAction(seller.uid, 'approve')}
                                disabled={actionLoading === seller.uid}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSellerAction(seller.uid, 'reject')}
                                disabled={actionLoading === seller.uid}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {seller.status === 'approved' && (
                            <button
                              onClick={() => handleSellerAction(seller.uid, 'suspend')}
                              disabled={actionLoading === seller.uid}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Seller Details Modal */}
      {showModal && selectedSeller && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Seller Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                    <p className="text-slate-900">{selectedSeller.ownerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                    <p className="text-slate-900">{selectedSeller.businessName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <p className="text-slate-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {selectedSeller.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <p className="text-slate-900 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {selectedSeller.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <p className="text-slate-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {selectedSeller.address}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <p className="text-slate-900 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-slate-400" />
                    {selectedSeller.category}
                  </p>
                </div>

                {selectedSeller.description && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{selectedSeller.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <span className={`px-2 py-1 text-sm font-medium rounded-full ${statusColors[selectedSeller.status]}`}>
                      {selectedSeller.status.charAt(0).toUpperCase() + selectedSeller.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Applied Date</label>
                    <p className="text-slate-900">{new Date(selectedSeller.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedSeller.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleSellerAction(selectedSeller.uid, 'reject')}
                      disabled={actionLoading === selectedSeller.uid}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      {actionLoading === selectedSeller.uid ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleSellerAction(selectedSeller.uid, 'approve')}
                      disabled={actionLoading === selectedSeller.uid}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === selectedSeller.uid ? 'Processing...' : 'Approve Seller'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageSellers;