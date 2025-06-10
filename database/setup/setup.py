import pandas as pd 
from gensim.models import Word2Vec
import psycopg2
from pgvector.psycopg2 import register_vector

def main():
    """
    inserting the vectors with the data to the pg
    """
    model =  Word2Vec.load("model/b25-CBOW-256-5-150v2.model")
    
    conn = psycopg2.connect("dbname=yourdb user=youruser password=yourpass host=localhost")
    register_vector(conn)
    cur = conn.cursor()

    df = pd.read_csv("csv/songs.csv")

    for key in model.wv:
        vector = model.wv[key]
        # take pair and put it into the vector store
        # also get the mapping from the database
        # insert all into postgres pg

        # need to decide on a database structure
        sql_command = f"INSERT INTO table_name (id, other_values, embedding) VALUES ({key}, {vector})"
        cur.execute(sql_command)

if __name__ == '__main__':
    main()