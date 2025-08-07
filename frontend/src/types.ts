export interface Song {
  track_id: string;
  track_name: string;
  artist_name: string;
  track_external_urls: string;
  distance?: number;
}

export interface SearchResult {
  track_id: string;
  track_name: string;
  artist_name: string;
  track_external_urls: string;
}

export interface PlaylistState {
  songs: Song[];
  recommendations: Song[];
  isLoading: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
} 