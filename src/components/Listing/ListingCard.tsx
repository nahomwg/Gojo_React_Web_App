import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, DollarSign, Heart, MessageCircle, User } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
      {/* Image */}
      <div className="relative">
        <img
          src={listing.photos[0] || 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg'}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Save button for renters */}
        {user && user.role === 'renter' && (
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isSaved 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
            {formatPrice(listing.price)}/month
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/listing/${listing.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm">{listing.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{listing.bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{formatPrice(listing.price)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Features */}
        {listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
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
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {listing.user?.photo_url ? (
              <img
                src={listing.user.photo_url}
                alt={listing.user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-gray-400" />
            )}
            <div className="text-xs text-gray-500">
              {listing.user?.name || 'Agent'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user && user.role === 'renter' && (
              <Link
                to={`/message/${listing.user_id}?listing=${listing.id}`}
                className="text-primary-600 hover:text-primary-700 p-1"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
            )}
            <Link
              to={`/listing/${listing.id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
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