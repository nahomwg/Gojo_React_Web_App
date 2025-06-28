import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Home, Briefcase, Users, Shield, TrendingUp, ArrowRight, Calendar, MapPin, Star, CheckCircle } from 'lucide-react';
import { SearchFilters, Listing } from '../types';
import { supabase } from '../lib/supabase';
import ListingCard from '../components/Listing/ListingCard';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'residential' | 'commercial'>('all');
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
        .limit(12);

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

  const residentialTypes = [
    { type: 'apartment', name: 'Apartments', icon: Building2, description: 'Modern apartments for long-term living' },
    { type: 'house', name: 'Houses', icon: Home, description: 'Family homes with gardens and space' },
    { type: 'villa', name: 'Villas', icon: Star, description: 'Luxury villas with premium amenities' },
    { type: 'studio', name: 'Studios', icon: Home, description: 'Compact studios perfect for singles' },
    { type: 'condominium', name: 'Condominiums', icon: Building2, description: 'Secure condos with shared facilities' }
  ];

  const commercialTypes = [
    { type: 'office', name: 'Office Spaces', icon: Briefcase, description: 'Professional offices for businesses' },
    { type: 'shop', name: 'Retail Shops', icon: Building2, description: 'Prime retail locations for commerce' },
    { type: 'warehouse', name: 'Warehouses', icon: Building2, description: 'Storage and distribution facilities' }
  ];

  const filteredListings = featuredListings.filter(listing => {
    if (activeCategory === 'residential') {
      return ['apartment', 'house', 'villa', 'studio', 'condominium'].includes(listing.property_type || '');
    }
    if (activeCategory === 'commercial') {
      return ['office', 'shop', 'warehouse'].includes(listing.property_type || '');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Find your perfect
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                long-term rental
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover quality residential and commercial properties for rent in Addis Ababa. 
              From cozy apartments to professional office spaces.
            </p>

            {/* Category Tabs */}
            <div className="flex justify-center mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-xl border border-gray-200 dark:border-gray-700">
                {[
                  { id: 'all', label: 'All Properties', icon: Building2 },
                  { id: 'residential', label: 'Residential', icon: Home },
                  { id: 'commercial', label: 'Commercial', icon: Briefcase }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeCategory === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2">
                <div className="flex items-center">
                  <div className="flex-1 px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Search by location, subcity..."
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                        />
                      </div>
                      <div className="border-l border-gray-200 dark:border-gray-600 pl-4">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Property Type</label>
                        <select className="bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white text-sm">
                          <option value="">Any type</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="office">Office</option>
                        </select>
                      </div>
                      <div className="border-l border-gray-200 dark:border-gray-600 pl-4">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Budget</label>
                        <input
                          type="text"
                          placeholder="Max budget"
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'Properties Available', value: '500+', icon: Building2 },
                { label: 'Happy Tenants', value: '1,200+', icon: Users },
                { label: 'Verified Agents', value: '150+', icon: Shield },
                { label: 'Years Experience', value: '10+', icon: TrendingUp }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Browse by Property Type
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find the perfect space for your needs
            </p>
          </div>

          {/* Residential Properties */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Residential Properties</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {residentialTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => navigate(`/listings?propertyType=${type.type}`)}
                  className="group p-6 bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-200">
                    <type.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Commercial Properties */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Commercial Properties</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {commercialTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => navigate(`/listings?propertyType=${type.type}`)}
                  className="group p-6 bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-200">
                    <type.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Properties
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Hand-picked properties for quality and value
              </p>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all properties
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.slice(0, 8).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Gojo for Long-term Rentals?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We specialize in long-term rentals with comprehensive support for both tenants and property owners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Properties',
                description: 'All properties undergo thorough verification including legal documentation and quality inspection'
              },
              {
                icon: Users,
                title: 'Tenant Screening',
                description: 'Comprehensive background checks and references to ensure reliable, long-term tenants'
              },
              {
                icon: CheckCircle,
                title: 'Lease Management',
                description: 'Professional lease agreements and ongoing support throughout your rental period'
              },
              {
                icon: Building2,
                title: 'Property Maintenance',
                description: 'Regular maintenance coordination and 24/7 support for property-related issues'
              },
              {
                icon: TrendingUp,
                title: 'Market Insights',
                description: 'Data-driven pricing and market analysis to ensure fair rental rates'
              },
              {
                icon: Briefcase,
                title: 'Business Solutions',
                description: 'Specialized services for commercial properties including flexible lease terms'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-8 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            Ready to find your next property?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Whether you're looking for a new home or expanding your business, we have the perfect space for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/listings')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Browse Properties
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              List Your Property
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;