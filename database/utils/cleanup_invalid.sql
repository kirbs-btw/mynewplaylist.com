-- removing badly encoded rows - search will not work for them

DELETE FROM b25.songs
WHERE track_name LIKE '%�%'
   OR artist_name LIKE '%�%';