import { useState, useEffect } from 'react'
import './App.css'

// Define types for our data
interface Song {
  track_id: string;
  track_name: string;
  artist_name: string;
  track_external_urls: string;
  relevance_score?: number;
  distance?: number;
}

// Backend URL - automatically uses proxy in production or direct URL in development
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]); 
  // this could be the base for a user to export the whole playlist into the own spotify account stuff...
  // creating a link to a website where they can export
  // or using the api to create the playlist on a getmyplaylist.com account sth idk
  // ---> hard to let the user export it directly over
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search to make it smoother
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchSongs(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchSongs = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/search-advanced/?query=${encodeURIComponent(query)}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addSongToPlaylist = (song: Song) => {
    // Check if song is already in playlist
    if (!playlist.find(s => s.track_id === song.track_id)) {
      setPlaylist([...playlist, song]);
    }
    // Clear search after adding
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeSongFromPlaylist = (trackId: string) => {
    setPlaylist(playlist.filter(s => s.track_id !== trackId));
  };

  const suggestSongs = async () => {
    if (playlist.length === 0) {
      alert('Add some songs to your playlist first!');
      return;
    }

    const songIds = playlist.map(s => s.track_id);
    
    try {
      const response = await fetch(
        `${API_URL}/recommend-average/?${songIds.map(id => `song_ids=${id}`).join('&')}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const renderSongItem = (song: Song, isInPlaylist: boolean = false) => {
    console.log("Song Item:");
    console.log(song);
    let spotifyUrl = '';
    if (typeof song.track_external_urls === 'string') {
      spotifyUrl = song.track_external_urls.startsWith('http') 
        ? song.track_external_urls 
        : `https://open.spotify.com/track/${song.track_id}`;
    } else if (typeof song.track_external_urls === 'object' && song.track_external_urls) {
      spotifyUrl = song.track_external_urls;
    } else {
      spotifyUrl = `https://open.spotify.com/track/${song.track_id}`;
    }

    return (
      <div key={song.track_id} className="song-container">
        <div className="start-song-div">
          <span className="start-song-section">
            <strong>{song.track_name}</strong> - {song.artist_name}
          </span>
        </div>
        <div className="middle-song-div">
          <a 
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="middle-song-section"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Open in Spotify
          </a>
        </div>
        <div className="end-song-div">
          {isInPlaylist ? (
            <button 
              className="add-song-button end-song-section"
              onClick={() => removeSongFromPlaylist(song.track_id)}
              title="Remove from playlist"
            >
              −
            </button>
          ) : (
            <button 
              className="add-song-button end-song-section"
              onClick={() => addSongToPlaylist(song)}
              title="Add to playlist"
            >
              +
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="nav-section">
        <div className="search-bar">
          <input 
            list="song-suggestions" 
            type="text" 
            id="search-input"
            value={searchQuery}
            name="search-song"  
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs..."
            autoComplete="off"
          />
          <datalist id="song-suggestions">
            {searchResults.map((song) => (
              <option 
                key={song.track_id} 
                value={`${song.track_name} - ${song.artist_name}`}
                onClick={() => addSongToPlaylist(song)}
              />
            ))}
          </datalist>
          
          </div>
      </div>

      {/* Show search results dropdown */}
      {searchResults.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          top: '10vh', 
          left: '10%', 
          width: '80%', 
          backgroundColor: 'var(--mid-base)', 
          borderRadius: '10px',
          maxHeight: '30vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {searchResults.map(song => renderSongItem(song))}
        </div>
      )}

      <div>
        <div className="playlist-section">
          <h1 id="playlist_title">My Playlist ({playlist.length} songs)</h1>
          <div className="playlist-container" id="playlist-div-id">
            {playlist.length === 0 ? (
              <p style={{ color: 'var(--white-color)', marginTop: '2rem' }}>
                Search and add songs to your playlist
              </p>
            ) : (
              playlist.map(song => renderSongItem(song, true))
            )}
          </div>
        </div>
        <div className="suggestions-section">
          <button 
            className="search-button" 
            onClick={suggestSongs}
            disabled={playlist.length === 0}
            style={{
              backgroundColor: 'var(--secondary-color)',
              color: 'var(--dark-base)',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: playlist.length === 0 ? 'not-allowed' : 'pointer',
              opacity: playlist.length === 0 ? 0.5 : 1,
              marginBottom: '1rem',
              fontFamily: 'Gotham Htf',
              fontSize: '16px'
            }}
          >
            Suggest Songs
          </button>
          <div className="suggestion-container" id="suggestion-container-songs">
            {suggestions.length === 0 ? (
              <p style={{ color: 'var(--white-color)', marginTop: '2rem' }}>
                Add songs to your playlist and click "Suggest Songs" to get recommendations
              </p>
            ) : (
              suggestions.map(song => renderSongItem(song, false))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App

// NOTES:
// the search is feeling really of
// u have the suggestions and also the things to add in the song
// the website needs to point somehow to the shadetech base website
// there should be the possebility to transfer your whole playlist to spotify
// the names clutter up a lot when searching 
// - maybe for songs you don't find direktly pop up a second ui where the user can find the results better 
// - giving the user less suggestiosn to beginn with when doing the selection
// after about max 10 songs you are stuck in a certain part of the vectorstore and it is harder to find curveball songs for the playlist 
// so there is the need to change the strategies for suggestions along the time the suggestion button is hit or some shit
// or just take out every song that got suggested for following suggestions...