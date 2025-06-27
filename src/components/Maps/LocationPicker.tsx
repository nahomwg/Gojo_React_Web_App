import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Search } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLocation?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLocation = '' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchInput, setSearchInput] = useState(initialLocation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo-key',
        version: 'weekly',
        libraries: ['places']
      });

      const google = await loader.load();
      
      if (!mapRef.current) return;

      // Default to Addis Ababa center
      const addisAbaba = { lat: 9.0320, lng: 38.7469 };
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: addisAbaba,
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const markerInstance = new google.maps.Marker({
        position: addisAbaba,
        map: mapInstance,
        draggable: true,
        title: 'Property Location'
      });

      // Add click listener to map
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          markerInstance.setPosition({ lat, lng });
          reverseGeocode(lat, lng);
        }
      });

      // Add drag listener to marker
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          reverseGeocode(lat, lng);
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setLoading(false);
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      setError('Failed to load map. Please check your internet connection.');
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setSearchInput(address);
        onLocationSelect({ address, lat, lng });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const searchLocation = async () => {
    if (!map || !searchInput.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ 
        address: searchInput,
        region: 'ET' // Bias results to Ethiopia
      });

      if (response.results[0]) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        map.setCenter({ lat, lng });
        map.setZoom(15);
        
        if (marker) {
          marker.setPosition({ lat, lng });
        }
        
        onLocationSelect({ 
          address: response.results[0].formatted_address, 
          lat, 
          lng 
        });
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for location. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  if (loading) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for a location in Addis Ababa..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={searchLocation}
          className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors duration-200 font-medium"
        >
          Search
        </button>
      </div>

      {/* Map Container */}
      <div className="h-96 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
        <p className="font-medium mb-2">How to set your property location:</p>
        <ul className="space-y-1">
          <li>• Search for your address in the search bar above</li>
          <li>• Click on the map to place the marker</li>
          <li>• Drag the marker to fine-tune the exact location</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationPicker;