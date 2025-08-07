import { Song, SearchResult } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const searchSongs = async (query: string, limit: number = 50): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search-advanced/?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export const getRecommendations = async (songIds: string[], limit: number = 10): Promise<Song[]> => {
  try {
    const songIdsParam = songIds.map(id => `song_ids=${encodeURIComponent(id)}`).join('&');
    const response = await fetch(`${API_BASE_URL}/recommend-average/?${songIdsParam}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Recommendation failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
}; 