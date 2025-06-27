import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 10 
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setUploading(true);
    
    try {
      // Convert files to base64 URLs for demo purposes
      // In production, you would upload to Supabase Storage
      const newPhotos = await Promise.all(
        acceptedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      onPhotosChange([...photos, ...newPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [photos, onPhotosChange, maxPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading || photos.length >= maxPhotos
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        } ${uploading || photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-rose-500 animate-spin mb-4" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
          )}
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {uploading ? 'Uploading photos...' : 'Add photos of your property'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop photos here, or click to select files'
            }
          </p>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>• Upload up to {maxPhotos} photos</p>
            <p>• JPG, PNG, or WebP format</p>
            <p>• Maximum 10MB per photo</p>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={photo}
                  alt={`Property photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Main Photo Indicator */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Main Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photo Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {photos.length} of {maxPhotos} photos uploaded
      </div>
    </div>
  );
};

export default PhotoUpload;