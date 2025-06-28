import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Home, DollarSign, Bed, Bath, Maximize, Building2, Star, Wifi, Car, Shield, Zap, Briefcase, Users, Clock, Printer, Coffee } from 'lucide-react';
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
  square_meters: string;
  property_type: string;
  type: 'residential' | 'business';
  features: string[];
  business_features: string[];
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
    square_meters: '',
    property_type: 'apartment',
    type: 'residential',
    features: [],
    business_features: [],
    photos: [],
    coordinates: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  const toggleBusinessFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      business_features: prev.business_features.includes(feature)
        ? prev.business_features.filter(f => f !== feature)
        : [...prev.business_features, feature]
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
      const listingData: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        subcity: formData.subcity,
        price: parseInt(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        property_type: formData.property_type,
        type: formData.type,
        features: formData.features,
        photos: formData.photos,
        user_id: user.id
      };

      // Add type-specific fields
      if (formData.type === 'residential') {
        if (formData.area_sqm) {
          listingData.area_sqm = parseFloat(formData.area_sqm);
        }
      } else {
        listingData.square_meters = parseInt(formData.square_meters);
        listingData.business_features = formData.business_features;
      }

      const { data, error } = await supabase
        .from('listings')
        .insert(listingData);

      if (error) throw error;

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const residentialTypes = [
    { value: 'apartment', label: 'Apartment', icon: Building2, description: 'Multi-unit residential building' },
    { value: 'house', label: 'House', icon: Home, description: 'Single-family detached home' },
    { value: 'villa', label: 'Villa', icon: Star, description: 'Luxury residential property' },
    { value: 'condominium', label: 'Condominium', icon: Building2, description: 'Owned unit in shared building' },
    { value: 'studio', label: 'Studio', icon: Home, description: 'Single-room living space' }
  ];

  const commercialTypes = [
    { value: 'office', label: 'Office Space', icon: Briefcase, description: 'Professional workspace' },
    { value: 'shop', label: 'Retail Shop', icon: Building2, description: 'Commercial retail space' },
    { value: 'warehouse', label: 'Warehouse', icon: Building2, description: 'Storage and distribution facility' }
  ];

  const subcities = [
    'Addis Ketema', 'Akaky Kaliti', 'Arada', 'Bole', 'Gullele', 
    'Kirkos', 'Kolfe Keranio', 'Lideta', 'Nifas Silk-Lafto', 'Yeka'
  ];

  const residentialFeatures = [
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

  const businessFeatures = [
    { name: 'High-Speed Internet', icon: Wifi },
    { name: 'Parking Spaces', icon: Car },
    { name: '24/7 Security', icon: Shield },
    { name: 'Backup Generator', icon: Zap },
    { name: 'Conference Rooms', icon: Users },
    { name: 'Reception Area', icon: Building2 },
    { name: 'Air Conditioning', icon: Home },
    { name: 'Elevator Access', icon: Building2 },
    { name: 'Flexible Hours', icon: Clock },
    { name: 'Printing Services', icon: Printer },
    { name: 'Kitchen/Break Room', icon: Coffee },
    { name: 'Storage Space', icon: Building2 }
  ];

  const steps = [
    { id: 1, title: 'Property Category', description: 'Choose between residential or commercial' },
    { id: 2, title: 'Property Type', description: 'Select the specific type of property' },
    { id: 3, title: 'Location', description: 'Where is your property located?' },
    { id: 4, title: 'Property Details', description: 'Tell us about your property' },
    { id: 5, title: 'Features & Amenities', description: 'What amenities does your property have?' },
    { id: 6, title: 'Photos', description: 'Add photos of your property' },
    { id: 7, title: 'Pricing', description: 'Set your rental price' }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.type;
      case 2: return formData.property_type;
      case 3: return formData.location && formData.subcity;
      case 4: 
        const basicFields = formData.title && formData.description && formData.bathrooms;
        if (formData.type === 'residential') {
          return basicFields && formData.bedrooms;
        } else {
          return basicFields && formData.square_meters;
        }
      case 5: return true; // Features are optional
      case 6: return formData.photos.length > 0;
      case 7: return formData.price;
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
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
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

          {/* Step 1: Property Category */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setFormData(prev => ({ ...prev, type: 'residential', property_type: 'apartment' }))}
                className={`p-8 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  formData.type === 'residential'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                }`}
              >
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Home className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Residential Property</h3>
                <p className="text-gray-600 dark:text-gray-400">Apartments, houses, villas, and other residential spaces for long-term living</p>
              </button>

              <button
                onClick={() => setFormData(prev => ({ ...prev, type: 'business', property_type: 'office' }))}
                className={`p-8 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  formData.type === 'business'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Business Property</h3>
                <p className="text-gray-600 dark:text-gray-400">Offices, shops, warehouses, and other commercial spaces for business use</p>
              </button>
            </div>
          )}

          {/* Step 2: Property Type */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {formData.type === 'residential' ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Residential Properties
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {residentialTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, property_type: type.value }))}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                          formData.property_type === type.value
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <type.icon className="h-6 w-6 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{type.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Business Properties
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {commercialTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, property_type: type.value }))}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                          formData.property_type === type.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <type.icon className="h-6 w-6 mx-auto mb-3 text-gray-600 dark:text-gray-400" />
                        <p className="font-medium text-gray-900 dark:text-white">{type.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcity *
                </label>
                <select
                  name="subcity"
                  value={formData.subcity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

          {/* Step 4: Property Details */}
          {currentStep === 4 && (
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
                  placeholder={formData.type === 'residential' ? "e.g., Modern 2-Bedroom Apartment in Bole" : "e.g., Professional Office Space in CMC"}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.type === 'residential' ? (
                  <>
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
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Maximize className="h-4 w-4 inline mr-1" />
                        Area (m²)
                      </label>
                      <input
                        type="number"
                        name="area_sqm"
                        value={formData.area_sqm}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        Rooms/Spaces
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Maximize className="h-4 w-4 inline mr-1" />
                        Square Meters *
                      </label>
                      <input
                        type="number"
                        name="square_meters"
                        value={formData.square_meters}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Features */}
          {currentStep === 5 && (
            <div className="space-y-8">
              {formData.type === 'residential' ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Residential Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {residentialFeatures.map((feature) => (
                      <button
                        key={feature.name}
                        onClick={() => toggleFeature(feature.name)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.features.includes(feature.name)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <feature.icon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {businessFeatures.map((feature) => (
                      <button
                        key={feature.name}
                        onClick={() => toggleBusinessFeature(feature.name)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.business_features.includes(feature.name)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <feature.icon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Photos */}
          {currentStep === 6 && (
            <PhotoUpload
              photos={formData.photos}
              onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
            />
          )}

          {/* Step 7: Pricing */}
          {currentStep === 7 && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <DollarSign className="h-16 w-16 text-blue-500 mx-auto mb-4" />
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
                  placeholder={formData.type === 'residential' ? "15000" : "25000"}
                  className="w-full pl-16 pr-4 py-4 text-2xl font-semibold text-center border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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