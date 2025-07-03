import pandas as pd 
from gensim.models import Word2Vec

def format_vector(vec):
    return "[" + ", ".join(f"{x:.6f}" for x in vec) + "]"

def main():
    """
    inserting the vectors with the data to the pg
    """

    model =  Word2Vec.load("model/b25-CBOW-256-5-150v3.model")
    print("MODEL LOADED")

    df = pd.read_csv("csv/songs.csv")
    df = df[["track_id","track_name","track_external_urls","artist_name"]]

    df['track_id'] = df['track_id'].astype(str)
    print("SONGS LOADED")

    valid_ids = set(model.wv.key_to_index)
    filtered_df = df[df['track_id'].isin(valid_ids)].copy()

    # Assign clean, comma-separated stringified vectors
    filtered_df['embedding'] = filtered_df['track_id'].map(lambda tid: format_vector(model.wv[tid]))

    print("EMBEDDINGS ADDED")

    filtered_df.to_csv("combined_csv/songs_with_embeddings.csv", index=False, encoding="utf-8", errors="ignore")

if __name__ == '__main__':
    main()