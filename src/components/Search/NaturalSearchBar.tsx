import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
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

  const exampleSearches = [
    "2-bedroom in Bole under 20K ETB",
    "Apartment near CMC",
    "3-bedroom house in Yeka",
    "Villa in Gulele"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-6">
                <Sparkles className="h-6 w-6 text-rose-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-2 py-6 text-lg bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex-shrink-0 m-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white p-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Search className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Example searches */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Try:</span>
        {exampleSearches.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            className="text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-rose-300 dark:hover:border-rose-500 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            "{example}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default NaturalSearchBar;