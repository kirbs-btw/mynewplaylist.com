SELECT SUM(count - 1) AS total_duplicates
FROM (
    SELECT COUNT(*) as count
    FROM b25.songs
    GROUP BY track_name, artist_name
    HAVING COUNT(*) > 1
) AS duplicates;