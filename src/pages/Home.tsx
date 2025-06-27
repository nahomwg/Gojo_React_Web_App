import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Users, Shield, Sparkles, ArrowRight, Calendar, MapPin, Heart } from 'lucide-react';
import { SearchFilters, Listing } from '../types';
import { supabase } from '../lib/supabase';
import ListingCard from '../components/Listing/ListingCard';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setFeaturedListings(data || []);
    } catch (error) {
      console.error('Error fetching featured listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/listings');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const quickSearches = [
    'Apartments in Bole',
    'Houses in Yeka',
    'Office spaces',
    'Furnished apartments'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Find your next
              <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                stay in Addis
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover amazing places to stay for your long-term rental needs in Ethiopia's capital
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 p-2">
                <div className="flex items-center">
                  <div className="flex-1 px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Where</label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Search destinations"
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                        />
                      </div>
                      <div className="border-l border-gray-200 dark:border-gray-600 pl-4">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">When</label>
                        <input
                          type="text"
                          placeholder="Add dates"
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                        />
                      </div>
                      <div className="border-l border-gray-200 dark:border-gray-600 pl-4">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Who</label>
                        <input
                          type="text"
                          placeholder="Add guests"
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Searches */}
            <div className="flex flex-wrap gap-3 justify-center">
              {quickSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    setSearchQuery(search);
                    navigate(`/listings?search=${encodeURIComponent(search)}`);
                  }}
                  className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:border-rose-300 dark:hover:border-rose-500 transition-all duration-200 hover:shadow-lg transform hover:scale-105 text-sm font-medium"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Live anywhere
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Keep calm & travel on
              </p>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium"
            >
              Show all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-700 rounded-2xl p-4 animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-600 h-48 rounded-xl mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Browse by property type
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Apartments', image: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg', count: '120+ properties' },
              { name: 'Houses', image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg', count: '80+ properties' },
              { name: 'Offices', image: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg', count: '45+ properties' },
              { name: 'Shops', image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg', count: '30+ properties' }
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(`/listings?propertyType=${category.name.toLowerCase()}`)}
                className="group relative overflow-hidden rounded-2xl aspect-square"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.count}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why choose Gojo?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We make finding your perfect home in Addis Ababa simple and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Properties',
                description: 'All properties are verified by our team to ensure quality and authenticity'
              },
              {
                icon: Users,
                title: 'Trusted Community',
                description: 'Connect with verified property owners and trusted tenants in Addis Ababa'
              },
              {
                icon: Sparkles,
                title: 'Smart Matching',
                description: 'Our AI helps match you with properties that fit your preferences and budget'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to find your perfect home?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of happy renters who found their ideal property through Gojo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/listings')}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start searching
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              List your property
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;