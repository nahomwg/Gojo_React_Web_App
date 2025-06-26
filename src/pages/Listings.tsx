import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List } from 'lucide-react';
import NaturalSearchBar from '../components/Search/NaturalSearchBar';
import ListingCard from '../components/Listing/ListingCard';
import { Listing, SearchFilters } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { user } = useAuth();

  useEffect(() => {
    // Parse URL params into filters
    const urlFilters: SearchFilters = {};
    if (searchParams.get('location')) urlFilters.location = searchParams.get('location')!;
    if (searchParams.get('minPrice')) urlFilters.minPrice = parseInt(searchParams.get('minPrice')!);
    if (searchParams.get('maxPrice')) urlFilters.maxPrice = parseInt(searchParams.get('maxPrice')!);
    if (searchParams.get('bedrooms')) urlFilters.bedrooms = parseInt(searchParams.get('bedrooms')!);
    
    setFilters(urlFilters);
    fetchListings(urlFilters);
  }, [searchParams]);

  useEffect(() => {
    if (user && user.role === 'renter') {
      fetchSavedListings();
    }
  }, [user]);

  const fetchListings = async (filters: SearchFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false });

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_listings')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setSavedListings(new Set(data.map(item => item.listing_id)));
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    }
  };

  const handleSearch = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms.toString());

    setSearchParams(params);
  };

  const handleSaveToggle = () => {
    fetchSavedListings();
  };

  const locations = ['Addis Ababa', 'Bole', 'Yeka', 'Kirkos', 'Kolfe', 'Gulele', 'Arada'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <NaturalSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            
            <div className="text-sm text-gray-600">
              {listings.length} properties found
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select 
                  value={filters.location || ''}
                  onChange={(e) => handleSearch({ ...filters, location: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location.toLowerCase()}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <select 
                  value={filters.bedrooms || ''}
                  onChange={(e) => handleSearch({ ...filters, bedrooms: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (ETB)</label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleSearch({ ...filters, minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Min price"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (ETB)</label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleSearch({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Max price"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">No properties found</div>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {listings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                isSaved={savedListings.has(listing.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;