import pandas as pd 
from gensim.models import Word2Vec
import psycopg2
from pgvector.psycopg2 import register_vector

def main():
    """
    inserting the vectors with the data to the pg
    """

    conn = psycopg2.connect("dbname=vectordemo user=postgres password=secret host=localhost")
    register_vector(conn)
    cur = conn.cursor()
    print("CONNECTED TO DATABASE")
    
    model =  Word2Vec.load("model/b25-CBOW-256-5-150v2.model")
    print("MODEL LOADED")

    df = pd.read_csv("csv/songs.csv")
    print("SONGS LOADED")

    max = len(model.wv)
    count = 0
    for idx, key in enumerate(model.wv.key_to_index):
        vector = str(list(model.wv[key]))
        row = df[df['track_id'] == key].iloc[0]

        sql_command = "INSERT INTO b25.songs (track_id, track_name, artist_name, track_external_urls, embedding) VALUES (%s, %s, %s, %s, %s)"
        cur.execute(sql_command, (row['track_id'], row['track_name'], row['artist_name'], row['track_external_urls'] , vector))
        count += 1
        print(f"loaded {count}/{max} - inserted id: {key}")

        if idx % 100 == 0:
            conn.commit()
    conn.commit()
if __name__ == '__main__':
    main()