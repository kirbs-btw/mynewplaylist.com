CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE SCHEMA b25;

CREATE TABLE b25.songs(
    track_id TEXT PRIMARY KEY,
    track_name TEXT,
    artist_name TEXT,
    track_external_urls TEXT,
    relevance INT,
    embedding VECTOR(256)
);

CREATE INDEX  songs_embedding_idx ON b25.songs
USING hnsw (embedding vector_l2_ops)
WITH (m = 16, ef_construction = 200);
CREATE INDEX IF NOT EXISTS songs_track_name_trgm_idx ON b25.songs USING gin (track_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_artist_name_trgm_idx ON b25.songs USING gin (artist_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS songs_textsearch_idx
ON b25.songs
USING gin (
  to_tsvector('english', track_name || ' ' || artist_name)
);
