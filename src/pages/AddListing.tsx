import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Home, DollarSign, Bed, Bath, Maximize, Building2, Star, Wifi, Car, Shield, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PhotoUpload from '../components/Upload/PhotoUpload';
import LocationPicker from '../components/Maps/LocationPicker';

interface ListingFormData {
  title: string;
  description: string;
  location: string;
  subcity: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  property_type: string;
  features: string[];
  photos: string[];
  coordinates: { lat: number; lng: number } | null;
}

const AddListing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    location: '',
    subcity: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    property_type: 'apartment',
    features: [],
    photos: [],
    coordinates: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'agent') {
    return <Navigate to="/login" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      coordinates: { lat: location.lat, lng: location.lng }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          subcity: formData.subcity,
          price: parseInt(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area_sqm: parseFloat(formData.area_sqm),
          property_type: formData.property_type,
          features: formData.features,
          photos: formData.photos,
          user_id: user.id
        });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment', icon: Building2 },
    { value: 'house', label: 'House', icon: Home },
    { value: 'villa', label: 'Villa', icon: Star },
    { value: 'condominium', label: 'Condominium', icon: Building2 },
    { value: 'office', label: 'Office Space', icon: Building2 },
    { value: 'shop', label: 'Shop/Retail', icon: Building2 },
    { value: 'warehouse', label: 'Warehouse', icon: Building2 },
    { value: 'studio', label: 'Studio', icon: Home }
  ];

  const subcities = [
    'Addis Ketema', 'Akaky Kaliti', 'Arada', 'Bole', 'Gullele', 
    'Kirkos', 'Kolfe Keranio', 'Lideta', 'Nifas Silk-Lafto', 'Yeka'
  ];

  const commonFeatures = [
    { name: 'WiFi', icon: Wifi },
    { name: 'Parking', icon: Car },
    { name: 'Security', icon: Shield },
    { name: 'Generator', icon: Zap },
    { name: 'Water Tank', icon: Home },
    { name: 'Furnished', icon: Home },
    { name: 'Air Conditioning', icon: Home },
    { name: 'Balcony', icon: Home },
    { name: 'Garden', icon: Home },
    { name: 'Elevator', icon: Building2 },
    { name: 'Kitchen Appliances', icon: Home },
    { name: 'Laundry', icon: Home }
  ];

  const steps = [
    { id: 1, title: 'Property Type', description: 'What type of property are you listing?' },
    { id: 2, title: 'Location', description: 'Where is your property located?' },
    { id: 3, title: 'Property Details', description: 'Tell us about your property' },
    { id: 4, title: 'Features', description: 'What amenities does your property have?' },
    { id: 5, title: 'Photos', description: 'Add photos of your property' },
    { id: 6, title: 'Pricing', description: 'Set your rental price' }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.property_type;
      case 2: return formData.location && formData.subcity;
      case 3: return formData.title && formData.description && formData.bedrooms && formData.bathrooms && formData.area_sqm;
      case 4: return true; // Features are optional
      case 5: return formData.photos.length > 0;
      case 6: return formData.price;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Step 1: Property Type */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData(prev => ({ ...prev, property_type: type.value }))}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    formData.property_type === type.value
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <type.icon className="h-8 w-8 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">{type.label}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcity *
                </label>
                <select
                  name="subcity"
                  value={formData.subcity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Subcity</option>
                  {subcities.map(subcity => (
                    <option key={subcity} value={subcity}>{subcity}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Location *
                </label>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={formData.location}
                />
              </div>
            </div>
          )}

          {/* Step 3: Property Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Modern 2-Bedroom Apartment in Bole"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your property in detail..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Bed className="h-4 w-4 inline mr-1" />
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Bath className="h-4 w-4 inline mr-1" />
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Maximize className="h-4 w-4 inline mr-1" />
                    Area (m²) *
                  </label>
                  <input
                    type="number"
                    name="area_sqm"
                    value={formData.area_sqm}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Features */}
          {currentStep === 4 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {commonFeatures.map((feature) => (
                <button
                  key={feature.name}
                  onClick={() => toggleFeature(feature.name)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.features.includes(feature.name)
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <feature.icon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Photos */}
          {currentStep === 5 && (
            <PhotoUpload
              photos={formData.photos}
              onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
            />
          )}

          {/* Step 6: Pricing */}
          {currentStep === 6 && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <DollarSign className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Set your monthly rent
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You can always change this later
                </p>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
                  ETB
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  placeholder="15000"
                  className="w-full pl-16 pr-4 py-4 text-2xl font-semibold text-center border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;