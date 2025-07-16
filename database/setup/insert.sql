-- need to insert the data into the container first
-- docker cp /home/lipka/mynewplaylist.com/database/setup/combined_csvsongs_with_embeddings_v3.csv vector-db-prod:/tmp/songs.csv
-- docker exec -it vector-db-prod psql -U postgres -d vectordemo

SET client_encoding = 'UTF8';
\COPY b25.songs(track_id,track_name,track_external_urls,artist_name,embedding) FROM '/tmp/songs.csv' DELIMITER ',' CSV HEADER;

-- docker exec -it vector-db-prod /bin/bash
-- rm -r /tmp/songs.csv