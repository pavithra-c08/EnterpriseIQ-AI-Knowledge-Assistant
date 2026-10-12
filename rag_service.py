import faiss
import pickle
import numpy as np
from llm.provider import generate_answer

from sentence_transformers import SentenceTransformer
print("===================================")
print("RAG_SERVICE.PY LOADED")
print("===================================")

# ==================================
# LOAD EMBEDDING MODEL ONCE
# ==================================

embedding_model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)


def answer_question(
    question,
    conversation_context=""
):
    print(">>> RAG_SERVICE answer_question() CALLED <<<")

    # ==================================
    # GREETING HANDLER
    # ==================================

    clean_question = question.lower().strip()

    if (
        clean_question.startswith("hi")
        or clean_question.startswith("hello")
        or clean_question.startswith("hey")
        or clean_question.startswith("good morning")
        or clean_question.startswith("good afternoon")
        or clean_question.startswith("good evening")
    ):
        return {
            "answer": "Hello! How can I help you with your uploaded documents today?",
            "sources": []
        }

    # ==================================
    # LOAD FAISS INDEX
    # ==================================

    index = faiss.read_index(
        "vector_db/faiss_index.bin"
    )

    # ==================================
    # LOAD CHUNKS
    # ==================================

    with open(
        "vector_db/chunks.pkl",
        "rb"
    ) as f:
        metadata = pickle.load(f)

    # ==================================
    # LOAD BM25
    # ==================================

    with open(
        "vector_db/bm25.pkl",
        "rb"
    ) as f:
        bm25 = pickle.load(f)

    # ==================================
    # EMBED QUESTION
    # ==================================

    question_embedding = embedding_model.encode(
        [question],
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # ==================================
    # FAISS SEARCH
    # ==================================

    faiss_scores, faiss_indices = index.search(
        np.array(
            question_embedding,
            dtype=np.float32
        ),
        k=8
    )
# ==================================
# FAISS DEBUG
# ==================================

    print("\n===== FAISS SCORES =====")
    print(faiss_scores)

    print("\n===== FAISS INDICES =====")
    print(faiss_indices)
    # ==================================
    # BM25 SEARCH
    # ==================================

    tokenized_query = question.lower().split()

    bm25_scores = bm25.get_scores(
        tokenized_query
    )

    bm25_indices = np.argsort(
        bm25_scores
    )[::-1][:8]

    # ==================================
    # HYBRID RANKING
    # ==================================

    scores = {}

    for rank, idx in enumerate(
        faiss_indices[0]
    ):

        idx = int(idx)

        if idx < 0:
            continue

        scores[idx] = (
            scores.get(idx, 0)
            + (8 - rank)
        )

    for rank, idx in enumerate(
        bm25_indices
    ):

        idx = int(idx)

        scores[idx] = (
            scores.get(idx, 0)
            + (8 - rank)
        )

    sorted_results = sorted(
        scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    top_indices = []

    for idx, score in sorted_results:

        if score >= 10:
            top_indices.append(idx)

        if len(top_indices) >= 5:
            break

    if len(top_indices) == 0:

        top_indices = [
            idx
            for idx, score
            in sorted_results[:3]
        ]
    # ==================================
    # DEBUG TOP INDICES
    # ==================================

    print("\n===== TOP INDICES =====")

    for idx in top_indices:

        print("\nINDEX:", idx)

        print(
            "SOURCE:",
            metadata[idx]["source"]
        )

        print(
            metadata[idx]["text"][:300]
        )

        print(
            "\n--------------------"
        )

    # ==================================
    # RETRIEVE CHUNKS
    # ==================================

    retrieved_chunks = []

    for idx in top_indices:

        if 0 <= idx < len(metadata):

            retrieved_chunks.append(
                metadata[idx]
            )
    retrieved_chunks = retrieved_chunks[:3]

    # ==================================
    # DEBUG
    # ==================================

    print("\nQUESTION:")
    print(question)

    print("\n===== RETRIEVED CHUNKS =====")

    for chunk in retrieved_chunks:

        print(
            f"\nSOURCE: {chunk['source']}"
        )

        print(
            chunk["text"][:1000]
        )

        print(
            "\n--------------------\n"
        )

    # ==================================
    # BUILD CONTEXT
    # ==================================

    context = "\n\n".join(
        [
            chunk["text"]
            for chunk in retrieved_chunks
        ]
    )

    print(
        "\n===== CONTEXT SENT TO MODEL ====="
    )

    print(context)

    # ==================================
    # PROMPT
    # ==================================


    prompt = f"""
You are an EnterpriseIQ Assistant.

Use ONLY the information in the provided document context.

Rules:

- Use the document context as the primary source.
- Use the previous conversation to understand references like:
  he, she, they, it, this person, that employee, etc.
- Do not make up information.
- If the answer is not found in the document context, reply exactly:

I could not find that information in the uploaded documents.

Previous Conversation:

{conversation_context}

Document Context:

{context}

Current Question:

{question}

Answer:
"""

    print("\n===== CONVERSATION CONTEXT =====")
    print(conversation_context)
   

    # ==================================
    # OLLAMA
    # ==================================

    
    answer = generate_answer(prompt)
    

    # ==================================
    # SOURCE CITATION
    # ==================================

    sources = []

    for chunk in retrieved_chunks:

        source = chunk["source"]

        if source not in sources:

            sources.append(source)

    return {
        "answer": answer,
        "sources": sources
    }


if __name__ == "__main__":

    while True:

        question = input(
            "\nAsk a question: "
        )

        if question.lower() == "exit":
            break

        result = answer_question(
            question
        )

        print("\nAnswer:")
        print(result["answer"])

        print("\nSources:")
        print(result["sources"])