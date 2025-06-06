-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE songs (
    id TEXT PRIMARY KEY,
    track_name TEXT,
    track_artist TEXT,
    release_date DATE,
    body TEXT,
    embedding VECTOR(256)
);

-- Create a HNSW index for efficient search
CREATE INDEX ON docs
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
