import React, { useState, useCallback } from 'react';
import { Song, SearchResult } from './types';
import { getRecommendations } from './services/api';
import SearchBar from './components/SearchBar';
import PlaylistSection from './components/PlaylistSection';
import RecommendationsSection from './components/RecommendationsSection';

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const addToPlaylist = useCallback((song: SearchResult | Song) => {
    const songToAdd: Song = {
      track_id: song.track_id,
      track_name: song.track_name,
      artist_name: song.artist_name,
      track_external_urls: song.track_external_urls,
    };

    setPlaylist(prev => {
      // Check if song already exists in playlist
      if (prev.some(s => s.track_id === songToAdd.track_id)) {
        return prev;
      }
      return [...prev, songToAdd];
    });

    // Remove from recommendations if it was there
    setRecommendations(prev => prev.filter(s => s.track_id !== songToAdd.track_id));
  }, []);

  const removeFromPlaylist = useCallback((songId: string) => {
    setPlaylist(prev => prev.filter(song => song.track_id !== songId));
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (playlist.length === 0) return;

    setIsLoadingRecommendations(true);
    try {
      const songIds = playlist.map(song => song.track_id);
      const newRecommendations = await getRecommendations(songIds, 10);
      
      // Filter out songs that are already in the playlist
      const filteredRecommendations = newRecommendations.filter(
        rec => !playlist.some(song => song.track_id === rec.track_id)
      );
      
      setRecommendations(filteredRecommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [playlist]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="text-center py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            MyNewPlaylist
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Create amazing playlists with AI-powered recommendations
          </p>
          
          {/* Search Bar */}
          <SearchBar onAddToPlaylist={addToPlaylist} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Playlist Section */}
          <div>
            <PlaylistSection
              songs={playlist}
              onRemoveSong={removeFromPlaylist}
              onGetRecommendations={fetchRecommendations}
              isLoading={isLoadingRecommendations}
            />
          </div>

          {/* Recommendations Section */}
          <div>
            <RecommendationsSection
              recommendations={recommendations}
              onAddToPlaylist={addToPlaylist}
              isLoading={isLoadingRecommendations}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 border-t border-white/10">
        <p className="text-gray-400">
          A <a href="https://shade-technology.de/" className="text-white hover:text-gray-300">Shade Technology</a> product. Built with AI-powered music recommendations.
        </p>
      </footer>
    </div>
  );
};

export default App; 