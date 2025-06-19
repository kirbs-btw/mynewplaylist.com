SELECT track_id
FROM b25.songs
ORDER BY embedding <-> (SELECT embedding FROM b25.songs WHERE track_id = '1MDyUzZgyrdeQVmV1FU3WQ')::vector 
LIMIT 5;