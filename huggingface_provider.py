from huggingface_hub import InferenceClient

from config import HF_TOKEN
from config import HF_MODEL


client = InferenceClient(
    token=HF_TOKEN
)


def generate_answer(prompt: str):

    response = client.chat.completions.create(
        model=HF_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=512
    )

    return response.choices[0].message.content