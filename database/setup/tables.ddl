CREATE EXTENSION IF NOT EXISTS vector;
CREATE SCHEMA b25;

CREATE TABLE b25.songs(
    track_id TEXT PRIMARY KEY,
    track_name TEXT,
    artist_name TEXT,
    track_external_urls TEXT,
    embedding VECTOR(256)
);

CREATE INDEX ON b25.songs
USING hnsw (embedding vector_l2_ops)
WITH (m = 16, ef_construction = 200);

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'b25'
ORDER BY table_name, ordinal_position;