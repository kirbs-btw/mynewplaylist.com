import React from 'react';
import { Song } from '../types';
import SongCard from './SongCard';

interface PlaylistSectionProps {
  songs: Song[];
  onRemoveSong: (songId: string) => void;
  onGetRecommendations: () => void;
  isLoading: boolean;
}

const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  songs,
  onRemoveSong,
  onGetRecommendations,
  isLoading
}) => {
  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Your Playlist</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300 text-sm">
            {songs.length} song{songs.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onGetRecommendations}
            disabled={songs.length === 0 || isLoading}
            className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Getting Recommendations...</span>
              </div>
            ) : (
              <span>Get Recommendations</span>
            )}
          </button>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Your playlist is empty</h3>
          <p className="text-gray-400">Search for songs above to start building your playlist</p>
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map((song, index) => (
            <div key={song.track_id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <SongCard
                song={song}
                onRemove={() => onRemoveSong(song.track_id)}
                showRemoveButton={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistSection; 