import os
from dotenv import load_dotenv

load_dotenv()

MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "ollama")

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5:3b"
)

HF_MODEL = os.getenv(
    "HF_MODEL",
    "Qwen/Qwen2.5-3B-Instruct"
)

HF_TOKEN = os.getenv("HF_TOKEN")