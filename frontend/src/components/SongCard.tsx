import React from 'react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onAdd?: () => void;
  onRemove?: () => void;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  isRecommendation?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  onAdd,
  onRemove,
  showAddButton = false,
  showRemoveButton = false,
  isRecommendation = false
}) => {
  return (
    <div className={`glass-effect rounded-xl p-4 card-hover ${isRecommendation ? 'border-primary-500/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">
            {song.track_name}
          </h3>
          <p className="text-gray-300 text-sm truncate">
            {song.artist_name}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {song.track_external_urls && (
            <a
              href={song.track_external_urls}
              target="_blank"
              rel="noopener noreferrer"
              className="spotify-button text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          )}
          
          {showAddButton && onAdd && (
            <button
              onClick={onAdd}
              className="button-primary text-sm"
              title="Add to playlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
          
          {showRemoveButton && onRemove && (
            <button
              onClick={onRemove}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
              title="Remove from playlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongCard; 