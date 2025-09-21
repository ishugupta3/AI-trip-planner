import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import axios from 'axios';

const PlaceAutocomplete = ({ value, onChange, placeholder = "Enter destination..." }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const debounceRef = useRef(null);
  const suggestionRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      // Using OpenStreetMap Nominatim API (completely free)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 8,
          extratags: 1,
          namedetails: 1
        },
        headers: {
          'User-Agent': 'AI-Trip-Planner/1.0'
        }
      });

      const formattedSuggestions = response.data
        .filter(place => place.type !== 'house' && place.type !== 'building') // Filter out specific addresses
        .map(place => ({
          label: place.display_name,
          value: place.display_name,
          city: place.address?.city || place.address?.town || place.address?.village || '',
          country: place.address?.country || '',
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          type: place.type,
          class: place.class
        }))
        .slice(0, 6); // Limit to 6 suggestions

      setSuggestions(formattedSuggestions);
      setShowSuggestions(formattedSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching places:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);

    // Call parent onChange
    onChange && onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
    onChange && onChange(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={suggestionRef}>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full"
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium text-gray-900 text-sm">
                {suggestion.city && suggestion.country 
                  ? `${suggestion.city}, ${suggestion.country}`
                  : suggestion.label.split(',').slice(0, 2).join(', ')
                }
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {suggestion.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaceAutocomplete;
