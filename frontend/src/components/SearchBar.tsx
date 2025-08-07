import React, { useState, useEffect, useCallback } from 'react';
import { SearchResult } from '../types';
import { searchSongs } from '../services/api';
import SongCard from './SongCard';

interface SearchBarProps {
  onAddToPlaylist: (song: SearchResult) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onAddToPlaylist }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchResults = await searchSongs(query, 10);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, performSearch]);



  const handleAddToPlaylist = (song: SearchResult) => {
    onAddToPlaylist(song);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs or artists..."
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-md"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          <div className="p-2 space-y-2">
            {results.map((song) => (
              <div key={song.track_id} className="animate-slide-up">
                <SongCard
                  song={song}
                  onAdd={() => handleAddToPlaylist(song)}
                  showAddButton={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-4 text-center text-gray-400">
          No songs found for "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchBar; 