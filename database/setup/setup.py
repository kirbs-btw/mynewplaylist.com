import pandas as pd 
from gensim.models import Word2Vec

def main():
    model =  Word2Vec.load("model/b25-CBOW-256-5-150v2.model")
    
    for kv in model.wv:
        ...
        # take pair and put it into the vector store
        # also get the mapping from the database
        # insert all into postgres pg

if __name__ == '__main__':
    main()