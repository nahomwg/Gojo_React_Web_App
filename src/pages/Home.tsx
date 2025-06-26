import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Search, Shield, FileText, Users } from 'lucide-react';
import NaturalSearchBar from '../components/Search/NaturalSearchBar';
import { SearchFilters } from '../types';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.propertyType) params.set('propertyType', filters.propertyType);

    navigate(`/listings?${params.toString()}`);
  };

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find your perfect home using natural language. Just describe what you want!'
    },
    {
      icon: Shield,
      title: 'Scam Protection',
      description: 'Our AI helps identify suspicious listings to keep you safe from fraud.'
    },
    {
      icon: FileText,
      title: 'Instant Contracts',
      description: 'Generate professional lease agreements in seconds with our AI assistant.'
    },
    {
      icon: Users,
      title: 'Verified Agents',
      description: 'Connect with trusted real estate agents in Addis Ababa.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <HomeIcon className="h-16 w-16 text-primary-600" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect Home in
            <span className="text-primary-600 block">Addis Ababa</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Discover long-term rental properties with smart search, AI-powered contracts, 
            and scam protection. Your dream home is just a conversation away.
          </p>

          {/* Search Bar */}
          <div className="mb-16">
            <NaturalSearchBar onSearch={handleSearch} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">500+</div>
              <div className="text-gray-600">Active Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">50+</div>
              <div className="text-gray-600">Verified Agents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">1000+</div>
              <div className="text-gray-600">Happy Tenants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Gojo?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing property rental in Ethiopia with cutting-edge technology 
              and local expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied renters who found their perfect home through Gojo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/listings')}
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Browse Properties
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;