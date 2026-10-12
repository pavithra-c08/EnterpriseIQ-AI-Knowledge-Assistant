# find_projects.py

import pickle

with open(
    "vector_db/chunks.pkl",
    "rb"
) as f:

    metadata = pickle.load(f)

for i, chunk in enumerate(metadata):

    if chunk["source"] == "Dinith_Pamunuwatte_CV.pdf":

        print("\n====================")
        print("INDEX:", i)
        print("====================")
        print(chunk["text"])