import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SearchFilters } from '../../types';

interface NaturalSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
}

const NaturalSearchBar: React.FC<NaturalSearchBarProps> = ({ 
  onSearch, 
  placeholder = "Find your perfect home in Addis Ababa..." 
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock AI processing for demo - in production, this would call OpenAI API
  const processNaturalLanguage = async (text: string): Promise<SearchFilters> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const filters: SearchFilters = {};
    const lowercaseText = text.toLowerCase();

    // Extract location
    const locations = ['bole', 'yeka', 'kirkos', 'kolfe', 'gulele', 'arada', 'addis ketema', 'akaky', 'nifas silk', 'lideta'];
    const foundLocation = locations.find(loc => lowercaseText.includes(loc));
    if (foundLocation) {
      filters.location = foundLocation;
    }

    // Extract bedrooms
    const bedroomMatch = text.match(/(\d+)[\s-]*(bedroom|br|bed)/i);
    if (bedroomMatch) {
      filters.bedrooms = parseInt(bedroomMatch[1]);
    }

    // Extract price
    const priceMatch = text.match(/(\d+)[\s]*(k|thousand|etb|birr)/i);
    if (priceMatch) {
      const price = parseInt(priceMatch[1]);
      const multiplier = priceMatch[2].toLowerCase().includes('k') ? 1000 : 1;
      filters.maxPrice = price * multiplier;
    }

    // Extract under/below price
    const underMatch = text.match(/under|below|less than\s*(\d+)[\s]*(k|thousand|etb|birr)/i);
    if (underMatch) {
      const price = parseInt(underMatch[1]);
      const multiplier = underMatch[2].toLowerCase().includes('k') ? 1000 : 1;
      filters.maxPrice = price * multiplier;
    }

    // Extract property type
    if (lowercaseText.includes('apartment')) filters.propertyType = 'apartment';
    if (lowercaseText.includes('house')) filters.propertyType = 'house';
    if (lowercaseText.includes('villa')) filters.propertyType = 'villa';
    if (lowercaseText.includes('condo')) filters.propertyType = 'condominium';

    setIsLoading(false);
    return filters;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const filters = await processNaturalLanguage(query);
      onSearch(filters);
    } catch (error) {
      console.error('Error processing search:', error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 pr-14 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Example searches */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-gray-500">Try:</span>
        {[
          "2-bedroom in Bole under 20K ETB",
          "Apartment near CMC",
          "3-bedroom house in Yeka",
          "Villa in Gulele"
        ].map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            "{example}"
          </button>
        ))}
      </div>
    </form>
  );
};

export default NaturalSearchBar;