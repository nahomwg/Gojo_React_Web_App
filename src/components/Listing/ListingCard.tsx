import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, DollarSign, Heart, MessageCircle, User, Bath, Maximize, Building2, Star } from 'lucide-react';
import { Listing } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface ListingCardProps {
  listing: Listing;
  onSaveToggle?: () => void;
  isSaved?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onSaveToggle, isSaved = false }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSaveToggle = async () => {
    if (!user || user.role !== 'renter') return;
    
    setSaving(true);
    try {
      if (isSaved) {
        // Remove from saved
        await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);
      } else {
        // Add to saved
        await supabase
          .from('saved_listings')
          .insert({
            user_id: user.id,
            listing_id: listing.id
          });
      }
      onSaveToggle?.();
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPropertyTypeColor = (type: string) => {
    const residential = ['apartment', 'house', 'villa', 'studio', 'condominium'];
    const commercial = ['office', 'shop', 'warehouse'];
    
    if (residential.includes(type)) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    if (commercial.includes(type)) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPropertyTypeIcon = (type: string) => {
    const residential = ['apartment', 'house', 'villa', 'studio', 'condominium'];
    return residential.includes(type) ? '🏠' : '🏢';
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transform hover:scale-[1.02]">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={listing.photos[0] || 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg'}
          alt={listing.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Save button for renters */}
        {user && user.role === 'renter' && (
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
              isSaved 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:shadow-lg'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Property Type Badge */}
        {listing.property_type && (
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize backdrop-blur-sm shadow-lg ${getPropertyTypeColor(listing.property_type)}`}>
              {getPropertyTypeIcon(listing.property_type)} {listing.property_type}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <span className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg">
            {formatPrice(listing.price)}/month
          </span>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg">
            Long-term
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Link to={`/listing/${listing.id}`} className="block group/link">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors duration-200 line-clamp-2">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
          <span className="text-sm font-medium">
            {listing.subcity && `${listing.subcity}, `}{listing.location}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-green-500" />
              <span className="font-medium">{listing.bedrooms} bed</span>
            </div>
            {listing.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{listing.bathrooms} bath</span>
              </div>
            )}
            {listing.area_sqm && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4 text-purple-500" />
                <span className="font-medium">{listing.area_sqm}m²</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {listing.description}
        </p>

        {/* Features */}
        {listing.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {listing.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium"
              >
                {feature}
              </span>
            ))}
            {listing.features.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2.5 py-1">
                +{listing.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Agent info and actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {listing.user?.photo_url ? (
              <img
                src={listing.user.photo_url}
                alt={listing.user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">{listing.user?.name || 'Agent'}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Property Agent</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user && user.role === 'renter' && (
              <Link
                to={`/message/${listing.user_id}?listing=${listing.id}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 transform hover:scale-110"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
            )}
            <Link
              to={`/listing/${listing.id}`}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;