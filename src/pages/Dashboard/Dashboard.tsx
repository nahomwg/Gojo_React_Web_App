import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Home, BarChart3, Eye, MessageCircle } from 'lucide-react';
import { Listing } from '../../types';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalMessages: 0
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'agent') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (listingsError) throw listingsError;
      setListings(listingsData || []);

      // Fetch stats
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', user.id);

      setStats({
        totalListings: totalListings || 0,
        totalViews: Math.floor(Math.random() * 1000) + 100, // Mock data
        totalMessages: totalMessages || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statsData = [
    { label: 'Active Listings', value: stats.totalListings.toString(), icon: Home, color: 'text-blue-600' },
    { label: 'Total Views', value: stats.totalViews.toString(), icon: Eye, color: 'text-green-600' },
    { label: 'Messages', value: stats.totalMessages.toString(), icon: MessageCircle, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/add-listing"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 justify-center"
            >
              <Plus className="h-5 w-5" />
              Add New Listing
            </Link>
            <Link
              to="/my-listings"
              className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
            >
              <Home className="h-5 w-5" />
              Manage Listings
            </Link>
            <Link
              to="/messages"
              className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
            >
              <MessageCircle className="h-5 w-5" />
              Messages
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
            <Link
              to="/my-listings"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {listings.length === 0 ? (
              <div className="text-center py-8">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No listings yet</p>
                <Link
                  to="/add-listing"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={listing.photos[0] || 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg'}
                      alt={listing.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{listing.title}</h3>
                      <p className="text-sm text-gray-600">{listing.location}</p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatPrice(listing.price)}/month
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/listing/${listing.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;