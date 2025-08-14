import { Song } from '../types';

// Analytics service for tracking user behavior
class AnalyticsService {
  private sessionId: string | null = null;
  private sessionStartTime: number = 0;
  private pageViewStartTime: number = 0;
  private currentPage: string = '';

  constructor() {
    this.init();
  }

  private init() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = Date.now();
    
    // Start session tracking
    this.startSession();
    
    // Track page visibility changes
    this.trackPageVisibility();
    
    // Track beforeunload for session end
    this.trackSessionEnd();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async startSession() {
    try {
      const response = await fetch('/analytics/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.sessionId,
          referrer: document.referrer,
          is_mobile: this.isMobileDevice(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.session_id;
        localStorage.setItem('analytics_session_id', this.sessionId);
      }
    } catch (error) {
      console.warn('Failed to start analytics session:', error);
    }
  }

  private async endSession() {
    if (!this.sessionId) return;
    
    try {
      await fetch('/analytics/session/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: this.sessionId }),
      });
    } catch (error) {
      console.warn('Failed to end analytics session:', error);
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private trackPageVisibility() {
    let hidden: string | undefined;
    let visibilityChange: string | undefined;

    if (typeof document.hidden !== 'undefined') {
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof (document as any).msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof (document as any).webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    if (hidden && visibilityChange) {
      document.addEventListener(visibilityChange, () => {
        if (document[hidden as keyof Document]) {
          // Page hidden, track view duration
          this.trackPageViewDuration();
        } else {
          // Page visible, start new page view timer
          this.pageViewStartTime = Date.now();
        }
      });
    }
  }

  private trackSessionEnd() {
    window.addEventListener('beforeunload', () => {
      this.trackPageViewDuration();
      this.endSession();
    });
  }

  // Public methods
  public trackPageView(pagePath: string, pageTitle?: string) {
    if (this.currentPage === pagePath) return; // Avoid duplicate tracking
    
    // Track previous page view duration
    if (this.currentPage) {
      this.trackPageViewDuration();
    }
    
    this.currentPage = pagePath;
    this.pageViewStartTime = Date.now();
    
    this.sendPageView(pagePath, pageTitle);
  }

  private async sendPageView(pagePath: string, pageTitle?: string) {
    if (!this.sessionId) return;
    
    try {
      await fetch('/analytics/pageview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          page_path: pagePath,
          page_title: pageTitle || document.title,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.warn('Failed to track pageview:', error);
    }
  }

  private trackPageViewDuration() {
    if (!this.currentPage || this.pageViewStartTime === 0) return;
    
    const duration = (Date.now() - this.pageViewStartTime) / 1000; // Convert to seconds
    
    if (duration > 0) {
      this.sendPageViewDuration(duration);
    }
  }

  private async sendPageViewDuration(duration: number) {
    if (!this.sessionId) return;
    
    try {
      await fetch('/analytics/pageview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          page_path: this.currentPage,
          page_title: document.title,
          referrer: document.referrer,
          view_duration: duration,
        }),
      });
    } catch (error) {
      console.warn('Failed to track page view duration:', error);
    }
  }

  public trackPlaylistCreation(songCount: number, isPublic: boolean = false) {
    if (!this.sessionId) return;
    
    this.sendPlaylistCreation({
      session_id: this.sessionId,
      song_count: songCount,
      is_public: isPublic,
    });
  }

  private async sendPlaylistCreation(data: any) {
    try {
      await fetch('/analytics/playlist/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to track playlist creation:', error);
    }
  }

  public trackSongInteraction(
    trackId: string, 
    interactionType: 'add' | 'remove' | 'play' | 'like' | 'dislike',
    playlistId?: string,
    positionInPlaylist?: number
  ) {
    if (!this.sessionId) return;
    
    this.sendSongInteraction({
      session_id: this.sessionId,
      playlist_id: playlistId,
      track_id: trackId,
      interaction_type: interactionType,
      position_in_playlist: positionInPlaylist,
    });
  }

  private async sendSongInteraction(data: any) {
    try {
      await fetch('/analytics/song/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to track song interaction:', error);
    }
  }

  public trackSearchQuery(
    query: string, 
    resultsCount: number, 
    clickedSongId?: string,
    searchDuration?: number
  ) {
    if (!this.sessionId) return;
    
    this.sendSearchQuery({
      session_id: this.sessionId,
      query_text: query,
      results_count: resultsCount,
      clicked_song_id: clickedSongId,
      search_duration: searchDuration,
      search_type: 'text',
    });
  }

  private async sendSearchQuery(data: any) {
    try {
      await fetch('/analytics/search/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to track search query:', error);
    }
  }

  public trackRecommendations(
    sourceSongIds: string[],
    recommendedSongIds: string[],
    acceptedSongIds?: string[],
    rejectedSongIds?: string[],
    playlistId?: string,
    responseTime?: number
  ) {
    if (!this.sessionId) return;
    
    this.sendRecommendations({
      session_id: this.sessionId,
      playlist_id: playlistId,
      source_song_ids: sourceSongIds,
      recommended_song_ids: recommendedSongIds,
      accepted_song_ids: acceptedSongIds || [],
      rejected_song_ids: rejectedSongIds || [],
      recommendation_algorithm: 'embedding_average',
      response_time: responseTime,
    });
  }

  private async sendRecommendations(data: any) {
    try {
      await fetch('/analytics/recommendations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to track recommendations:', error);
    }
  }

  public trackError(errorType: string, errorMessage: string, stackTrace?: string) {
    if (!this.sessionId) return;
    
    this.sendError({
      session_id: this.sessionId,
      error_type: errorType,
      error_message: errorMessage,
      stack_trace: stackTrace,
      user_agent: navigator.userAgent,
      page_path: this.currentPage,
    });
  }

  private async sendError(data: any) {
    try {
      await fetch('/analytics/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to track error:', error);
    }
  }

  public trackPerformance(metricName: string, metricValue: number, metricUnit: string = 'ms') {
    if (!this.sessionId) return;
    
    this.sendPerformance({
      session_id: this.sessionId,
      metric_name: metricName,
      metric_value: metricValue,
      metric_unit: metricUnit,
      page_path: this.currentPage,
    });
  }

  private async sendPerformance(data: any) {
    try {
      await fetch('/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to track performance:', error);
    }
  }

  // Utility methods for common tracking scenarios
  public trackSongAddedToPlaylist(song: Song, playlistLength: number) {
    this.trackSongInteraction(song.track_id, 'add', undefined, playlistLength);
  }

  public trackSongRemovedFromPlaylist(song: Song, playlistLength: number) {
    this.trackSongInteraction(song.track_id, 'remove', undefined, playlistLength);
  }

  public trackPlaylistUpdated(songCount: number) {
    this.trackPlaylistCreation(songCount);
  }

  public trackSearchWithResults(query: string, resultsCount: number) {
    this.trackSearchQuery(query, resultsCount);
  }

  public trackRecommendationsGenerated(
    sourceSongs: Song[], 
    recommendations: Song[], 
    acceptedSongs: Song[] = [],
    rejectedSongs: Song[] = []
  ) {
    this.trackRecommendations(
      sourceSongs.map(s => s.track_id),
      recommendations.map(s => s.track_id),
      acceptedSongs.map(s => s.track_id),
      rejectedSongs.map(s => s.track_id)
    );
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Export individual tracking functions for convenience
export const trackPageView = (pagePath: string, pageTitle?: string) => 
  analytics.trackPageView(pagePath, pageTitle);

export const trackSongAdded = (song: Song, playlistLength: number) => 
  analytics.trackSongAddedToPlaylist(song, playlistLength);

export const trackSongRemoved = (song: Song, playlistLength: number) => 
  analytics.trackSongRemovedFromPlaylist(song, playlistLength);

export const trackPlaylistUpdated = (songCount: number) => 
  analytics.trackPlaylistUpdated(songCount);

export const trackSearch = (query: string, resultsCount: number) => 
  analytics.trackSearchWithResults(query, resultsCount);

export const trackRecommendations = (
  sourceSongs: Song[], 
  recommendations: Song[], 
  acceptedSongs: Song[] = [],
  rejectedSongs: Song[] = []
) => analytics.trackRecommendationsGenerated(sourceSongs, recommendations, acceptedSongs, rejectedSongs);

export default analytics;
