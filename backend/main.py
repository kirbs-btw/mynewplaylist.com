from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg
import os
from fastapi import Query
from fastapi.responses import JSONResponse

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Vite default port and fallback
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.environ["DATABASE_URL"]

conn = psycopg.connect(DATABASE_URL)

@app.get("/recommend-average/")
def get_recommendations_by_average(
    song_ids: list[str] = Query(..., description="List of song IDs"),
    limit: int = 10
):
    """
    Get song recommendations based on the average embedding of multiple songs.
    This is useful for playlist-based recommendations.
    """
    with conn.cursor() as cur:
        # Execute query with song_ids properly cast to text[]
        
        cur.execute("""
            SELECT track_id, track_name, artist_name, track_external_urls,
                   embedding <-> (
                       SELECT AVG(embedding) 
                       FROM b25.songs 
                       WHERE track_id = ANY(%s::text[])
                   ) AS distance
            FROM b25.songs
            WHERE track_id != ALL(%s::text[])  -- Exclude the input songs
            ORDER BY distance
            LIMIT %s
        """, (song_ids, song_ids, limit))
        
        rows = cur.fetchall()
        result = [
            {
                "track_id": r[0],
                "track_name": r[1],
                "artist_name": r[2],
                "track_external_urls": r[3],
                "distance": r[4]
            }
            for r in rows
        ]
        return JSONResponse(content=result)

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
