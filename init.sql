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
