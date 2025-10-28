CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE SCHEMA IF NOT EXISTS b25;

-- Canonical schema used by the backend
CREATE TABLE IF NOT EXISTS b25.songs (
    track_id TEXT PRIMARY KEY,
    track_name TEXT,
    artist_name TEXT,
    track_external_urls TEXT,
    relevance INT,
    embedding VECTOR(256)
);

-- Vector index for similarity search
CREATE INDEX IF NOT EXISTS songs_embedding_idx ON b25.songs
USING hnsw (embedding vector_l2_ops)
WITH (m = 16, ef_construction = 200);

-- Text search indexes
CREATE INDEX IF NOT EXISTS songs_track_name_trgm_idx ON b25.songs USING gin (track_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_artist_name_trgm_idx ON b25.songs USING gin (artist_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_textsearch_idx ON b25.songs USING gin (
  to_tsvector('english', track_name || ' ' || artist_name)
);

-- Waitlist signups for product launch
CREATE TABLE IF NOT EXISTS b25.waitlist_signups (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);