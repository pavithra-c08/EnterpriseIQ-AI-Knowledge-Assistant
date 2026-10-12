from config import MODEL_PROVIDER

from llm.ollama_provider import (
    generate_answer as ollama_generate
)

from llm.huggingface_provider import (
    generate_answer as hf_generate
)


def generate_answer(prompt: str):

    if MODEL_PROVIDER == "ollama":
        print("Using Ollama Provider")
        return ollama_generate(prompt)

    elif MODEL_PROVIDER == "huggingface":
        print("Using Hugging Face Provider")
        return hf_generate(prompt)

    raise ValueError(
        f"Unsupported MODEL_PROVIDER: {MODEL_PROVIDER}"
    )