import { useState } from 'react'
import './App.css'

function App() {
  const addSongFromInput = () => {
    // logic here
  };
  const suggestSongs = () => {
    // Logic for suggesting songs (you can define this function)
    console.log('Suggesting songs...');
  };

  return (
    <>
    <div className="nav-section">
      <div className="search-bar">
        <input 
          list="song-suggestions" 
          type="text" 
          id="search-input" 
        />
        <datalist id="song-suggestions"></datalist>
        <button 
          id="search-button" 
          onClick={addSongFromInput}>+
        </button>
      </div>
    </div>

    <div>
      <div className="playlist-section">
        <h1 id="playlist_title">love songs</h1>
        <div className="playlist-container" id="playlist-div-id">
        </div>
      </div>
      <div className="suggestions-section">
        <button 
          className="search-button" 
          onClick={suggestSongs}
        >
          Suggest song
        </button>
        <div className="suggestion-container" id="suggestion-container-songs">
        </div>
      </div>
    </div>

    </>
  );
}

export default App
