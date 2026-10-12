from pathlib import Path
import fitz
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
import faiss
import pickle
import os


def build_index():

    uploads_folder = Path("uploads")

    all_chunks = []
    metadata = []

    os.makedirs(
        "vector_db",
        exist_ok=True
    )

    for pdf_file in uploads_folder.glob("*.pdf"):

        print(f"\nProcessing: {pdf_file.name}")

        doc = fitz.open(pdf_file)

        text = ""

        for page in doc:

            extracted = page.get_text()

            if extracted:
                text += extracted
                text += "\n"

        print(
            "Pages:",
            len(doc)
        )

        chunk_size = 1200
        chunk_overlap = 250

        for i in range(
            0,
            len(text),
            chunk_size - chunk_overlap
        ):

            chunk = text[
                i:i + chunk_size
            ]

            if len(chunk.strip()) < 50:
                continue

            all_chunks.append(chunk)

            metadata.append(
                {
                    "source": pdf_file.name,
                    "text": chunk
                }
            )

    print(
        "\nTotal Chunks:",
        len(all_chunks)
    )

    print("\nLoading BGE Embedding Model...")

    model = SentenceTransformer(
        "BAAI/bge-small-en-v1.5"
    )

    embeddings = model.encode(
        all_chunks,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    print(
        "Embedding Shape:",
        embeddings.shape
    )

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatIP(
        dimension
    )

    index.add(
        embeddings
    )

    faiss.write_index(
        index,
        "vector_db/faiss_index.bin"
    )

    with open(
        "vector_db/chunks.pkl",
        "wb"
    ) as f:

        pickle.dump(
            metadata,
            f
        )

    tokenized_chunks = [
        item["text"].lower().split()
        for item in metadata
    ]

    bm25 = BM25Okapi(
        tokenized_chunks
    )

    with open(
        "vector_db/bm25.pkl",
        "wb"
    ) as f:

        pickle.dump(
            bm25,
            f
        )

    print("\nBM25 saved!")
    print("FAISS saved!")
    print("Chunks saved!")
    print("Index build complete!")


if __name__ == "__main__":

    build_index()