import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, DollarSign, Heart, MessageCircle, User, Bath, Maximize, Building2 } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
      {/* Image */}
      <div className="relative">
        <img
          src={listing.photos[0] || 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg'}
          alt={listing.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Save button for renters */}
        {user && user.role === 'renter' && (
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
              isSaved 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Property Type Badge */}
        {listing.property_type && (
          <div className="absolute top-4 left-4">
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
              {listing.property_type}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
            {formatPrice(listing.price)}/month
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Link to={`/listing/${listing.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm">
            {listing.subcity && `${listing.subcity}, `}{listing.location}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{listing.bedrooms} bed</span>
            </div>
            {listing.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{listing.bathrooms} bath</span>
              </div>
            )}
            {listing.area_sqm && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{listing.area_sqm}m²</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {listing.description}
        </p>

        {/* Features */}
        {listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {listing.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {feature}
              </span>
            ))}
            {listing.features.length > 3 && (
              <span className="text-xs text-gray-500">
                +{listing.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Agent info and actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {listing.user?.photo_url ? (
              <img
                src={listing.user.photo_url}
                alt={listing.user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-900">{listing.user?.name || 'Agent'}</p>
              <p className="text-gray-500 text-xs">Property Agent</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user && user.role === 'renter' && (
              <Link
                to={`/message/${listing.user_id}?listing=${listing.id}`}
                className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
            )}
            <Link
              to={`/listing/${listing.id}`}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
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