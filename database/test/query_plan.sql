EXPLAIN ANALYZE
SELECT track_id
FROM b25.songs
ORDER BY embedding <-> (SELECT embedding FROM b25.songs LIMIT 1)::vector
LIMIT 5;