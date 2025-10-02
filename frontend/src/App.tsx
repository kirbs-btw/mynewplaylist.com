import React, { useCallback, useMemo, useState } from 'react';
import { Song, SearchResult } from './types';
import { getRecommendations } from './services/api';
import SearchBar from './components/SearchBar';
import PlaylistSection from './components/PlaylistSection';
import RecommendationsSection from './components/RecommendationsSection';
import { useAuth } from './auth/AuthContext';

const App: React.FC = () => {
  const {
    user,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signOut,
    recommendationLimit,
    accessToken,
    isSupabaseReady
  } = useAuth();

  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const isAuthenticated = Boolean(user);

  const addToPlaylist = useCallback((song: SearchResult | Song) => {
    const songToAdd: Song = {
      track_id: song.track_id,
      track_name: song.track_name,
      artist_name: song.artist_name,
      track_external_urls: song.track_external_urls
    };

    setPlaylist(prev => {
      if (prev.some(s => s.track_id === songToAdd.track_id)) {
        return prev;
      }
      return [...prev, songToAdd];
    });

    setRecommendations(prev => prev.filter(s => s.track_id !== songToAdd.track_id));
  }, []);

  const removeFromPlaylist = useCallback((songId: string) => {
    setPlaylist(prev => prev.filter(song => song.track_id !== songId));
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (playlist.length === 0) {
      return;
    }

    setIsLoadingRecommendations(true);
    setRecommendationError(null);

    try {
      const songIds = playlist.map(song => song.track_id);
      const newRecommendations = await getRecommendations(
        songIds,
        recommendationLimit,
        accessToken ?? undefined
      );

      const filteredRecommendations = newRecommendations.filter(
        rec => !playlist.some(song => song.track_id === rec.track_id)
      );

      setRecommendations(filteredRecommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to get recommendations. Please try again.';
      setRecommendationError(message);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [playlist, recommendationLimit, accessToken]);

  const planLabel = useMemo(() => {
    if (!isSupabaseReady) {
      return 'Guest mode active. Configure Supabase to enable Google sign-in and higher limits.';
    }

    return isAuthenticated
      ? `Signed in as ${user?.email ?? 'Google user'}. Enjoy up to ${recommendationLimit} AI picks per request.`
      : `Guest mode: up to ${recommendationLimit} AI-powered recommendations. Sign in with Google for more.`;
  }, [isAuthenticated, isSupabaseReady, recommendationLimit, user]);

  const handleSignIn = useCallback(async () => {
    setRecommendationError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to start Google sign-in. Check your configuration and try again.';
      setRecommendationError(message);
    }
  }, [signInWithGoogle]);

  const handleSignOut = useCallback(async () => {
    setRecommendationError(null);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign-out failed:', error);
      setRecommendationError('Unable to sign out. Please try again.');
    }
  }, [signOut]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <header className="text-center py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">MyNewPlaylist.com</h1>
            <p className="text-xl text-gray-300">
              Create amazing playlists with AI-powered recommendations
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            {isSupabaseReady ? (
              isAuthenticated ? (
                <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-full py-2 px-4">
                  <span className="text-sm text-gray-200">
                    {user?.email ?? 'Google account'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="button-secondary text-sm py-1 px-3"
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="button-primary text-sm py-2 px-6"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? 'Preparing sign-in...' : 'Continue with Google'}
                </button>
              )
            ) : (
              <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 text-sm rounded-lg py-3 px-4">
                Authentication is not configured yet. Update your Supabase keys to unlock Google sign-in.
              </div>
            )}

            <p className="text-gray-300 text-sm text-center max-w-xl">{planLabel}</p>
          </div>

          <SearchBar onAddToPlaylist={addToPlaylist} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <PlaylistSection
              songs={playlist}
              onRemoveSong={removeFromPlaylist}
              onGetRecommendations={fetchRecommendations}
              isLoading={isLoadingRecommendations}
            />
            <p className="text-gray-400 text-sm text-center lg:text-left">
              Each request returns up to {recommendationLimit}{' '}
              {isAuthenticated ? 'recommendations for signed-in listeners.' : 'recommendations in guest mode.'}
            </p>
          </div>

          <div>
            <RecommendationsSection
              recommendations={recommendations}
              onAddToPlaylist={addToPlaylist}
              isLoading={isLoadingRecommendations}
              errorMessage={recommendationError}
            />
          </div>
        </div>
      </main>

      <footer className="text-center py-8 px-4 border-t border-white/10">
        <p className="text-gray-400">
          A <a href="https://shade-technology.de/" className="text-white hover:text-gray-300">Shade Technology</a>{' '}
          product. Built with AI-powered music recommendations.
        </p>
      </footer>
    </div>
  );
};

export default App;
