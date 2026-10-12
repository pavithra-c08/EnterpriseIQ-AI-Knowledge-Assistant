import pickle

with open("vector_db/chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

print("Total Chunks:", len(chunks))

for i, chunk in enumerate(chunks):

    if chunk["source"] == "Dinith_Pamunuwatte_CV.pdf":

        print(f"\n--- CHUNK {i} ---")
        print(chunk["text"])
        print("\n" + "=" * 80)