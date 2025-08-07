import React from 'react';
import { Song } from '../types';
import SongCard from './SongCard';

interface RecommendationsSectionProps {
  recommendations: Song[];
  onAddToPlaylist: (song: Song) => void;
  isLoading: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  onAddToPlaylist,
  isLoading
}) => {
  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AI Recommendations</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <span className="text-primary-400 text-sm font-medium">Powered by AI</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing your playlist and finding similar songs...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No recommendations yet</h3>
          <p className="text-gray-400">Add some songs to your playlist and click "Get Recommendations"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((song, index) => (
            <div key={song.track_id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <SongCard
                song={song}
                onAdd={() => onAddToPlaylist(song)}
                showAddButton={true}
                isRecommendation={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection; 