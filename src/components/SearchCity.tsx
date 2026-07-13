import React, { useState, useEffect, useRef } from 'react';
import { GeocodingResult } from '../types';
import { WeatherIcon } from './WeatherIcon';

interface SearchCityProps {
  onSelectCity: (city: GeocodingResult) => void;
  selectedCity: GeocodingResult | null;
}

export const SearchCity: React.FC<SearchCityProps> = ({ onSelectCity, selectedCity }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('weather_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  // Save a search to recents
  const saveToRecents = (city: GeocodingResult) => {
    try {
      const updated = [
        city,
        ...recentSearches.filter((item) => item.id !== city.id)
      ].slice(0, 5); // Limit to top 5
      setRecentSearches(updated);
      localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent search', e);
    }
  };

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query.trim()
          )}&count=5&format=json&language=en`
        );
        if (!response.ok) {
          throw new Error('Network response error');
        }
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setError('City not found');
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
        setError('Search Exception: Unable to fetch geocoding data.');
        setSuggestions([]);
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (city: GeocodingResult) => {
    onSelectCity(city);
    saveToRecents(city);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveRecent = (e: React.MouseEvent, cityId: number) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item.id !== cityId);
    setRecentSearches(updated);
    localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = query.trim().length < 2 ? recentSearches : suggestions;
    if (list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev + 1) % list.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev - 1 + list.length) % list.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < list.length) {
        handleSelect(list[highlightedIndex]);
      } else if (list.length > 0) {
        handleSelect(list[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto z-50">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
          <WeatherIcon name="Search" size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for cities (e.g., Tokyo, London)..."
          className="w-full pl-11 pr-12 py-3 bg-slate-100/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 backdrop-blur-md transition-all shadow-lg text-sm md:text-base font-sans"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <WeatherIcon name="X" size={16} />
          </button>
        )}
      </div>

      {/* Auto-suggest dropdown with custom Glassmorphism style */}
      {isOpen && (
        <div className="absolute w-full mt-2 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-4 text-xs text-indigo-500 font-mono gap-2">
              <WeatherIcon name="RefreshCw" className="animate-spin text-indigo-500" size={14} />
              <span>GEOLOCATING COORDINATES...</span>
            </div>
          )}

          {/* Search suggestions */}
          {!loading && query.trim().length >= 2 && (
            <div>
              {error ? (
                <div className="flex items-center gap-2 p-4 text-rose-500 dark:text-rose-400 text-sm">
                  <WeatherIcon name="AlertTriangle" size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                  <li className="px-4 py-2 text-[10px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-500">
                    Suggested Locations
                  </li>
                  {suggestions.map((city, index) => (
                    <li
                      key={city.id}
                      onClick={() => handleSelect(city)}
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors text-sm ${
                        highlightedIndex === index
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <WeatherIcon name="MapPin" size={14} className="text-indigo-400" />
                        <div>
                          <span className="font-semibold">{city.name}</span>
                          <span className="text-xs text-slate-400 ml-1">
                            {city.admin1 ? `${city.admin1}, ` : ''}
                            {city.country || ''}
                          </span>
                        </div>
                      </div>
                      {city.country_code && (
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                          {city.country_code}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          {/* Recent Searches */}
          {!loading && query.trim().length < 2 && (
            <div>
              {recentSearches.length > 0 ? (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  <li className="px-4 py-2 text-[10px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Recent Search History</span>
                    <span className="text-[9px] lowercase font-normal italic">click to switch</span>
                  </li>
                  {recentSearches.map((city, index) => (
                    <li
                      key={`recent-${city.id}`}
                      onClick={() => handleSelect(city)}
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors text-sm ${
                        highlightedIndex === index
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <WeatherIcon name="History" className="text-slate-400" size={14} />
                        <div>
                          <span className="font-semibold">{city.name}</span>
                          <span className="text-xs text-slate-400 ml-1">
                            {city.admin1 ? `${city.admin1}, ` : ''}
                            {city.country || ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {city.country_code && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 uppercase">
                            {city.country_code}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleRemoveRecent(e, city.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove from history"
                        >
                          <WeatherIcon name="X" size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  <WeatherIcon name="Sparkles" className="mx-auto mb-2 text-indigo-400/80 animate-pulse" size={20} />
                  <p>Type a city name to explore intelligent forecasts.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
