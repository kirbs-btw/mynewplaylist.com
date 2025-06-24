SELECT track_id, track_name, artist_name, track_external_urls,
       embedding <-> (
           SELECT AVG(embedding)
           FROM b25.songs
           WHERE track_id = ANY (ARRAY['1']::text[])
       ) AS distance
FROM b25.songs
WHERE track_id != ALL (ARRAY['1']::text[])
ORDER BY distance
LIMIT 5;