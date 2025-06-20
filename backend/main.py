from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import os

app = FastAPI()

DATABASE_URL = os.environ["DATABASE_URL"]

conn = psycopg2.connect(DATABASE_URL)

@app.get("/recommend-average/")
def get_recommendations_by_average(song_ids: list[str], limit: int = 10):
    """
    Get song recommendations based on the average embedding of multiple songs.
    This is useful for playlist-based recommendations.
    """
    with conn.cursor() as cur:
        # Find songs similar to the average embedding of the provided songs
        cur.execute("""
            SELECT track_id, track_name, artist_name, track_external_urls,
                   embedding <-> (
                       SELECT AVG(embedding) 
                       FROM b25.songs 
                       WHERE track_id = ANY(%s)
                   ) AS distance
            FROM b25.songs
            WHERE track_id != ALL(%s)  -- Exclude the input songs
            ORDER BY distance
            LIMIT %s
        """, (song_ids, song_ids, limit))
        
        recommendations = cur.fetchall()
        
        return recommendations

@app.get("/search-advanced/")
def search_songs_advanced(query: str, limit: int = 20):
    """
    Advanced search using PostgreSQL full-text search capabilities.
    Provides better ranking and relevance scoring.
    """
    with conn.cursor() as cur:
        # Use full-text search with tsvector for better matching
        cur.execute("""
            SELECT 
                track_id, 
                track_name, 
                artist_name, 
                track_external_urls,
                ts_rank(
                    to_tsvector('english', track_name || ' ' || artist_name), 
                    plainto_tsquery('english', %s)
                ) AS relevance_score
            FROM b25.songs
            WHERE 
                to_tsvector('english', track_name || ' ' || artist_name) @@ plainto_tsquery('english', %s)
            ORDER BY relevance_score DESC, track_name
            LIMIT %s
        """, (query, query, limit))
        
        results = cur.fetchall()
        return results

@app.get("/")
def root():
    return {"status": "running"}
