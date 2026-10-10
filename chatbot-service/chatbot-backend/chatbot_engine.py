import requests

def get_reply(user_id, message):

    # AI personality (VERY IMPORTANT)
    prompt = f"""
You are an intelligent Infant Care Assistant chatbot.

Rules:
- Give safe baby-care advice.
- Be calm and supportive.
- If emergency symptoms appear, tell user to contact a doctor.
- Keep answers short and clear for parents.
- If the question is NOT related to infant care, you MUST reply EXACTLY:
"Sorry, I am designed only to help with infant care and baby-related questions."

Parent message:
{message}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        data = response.json()
        return data["response"]

    except Exception as e:
        print("Ollama Error:", e)
        return "⚠️ AI brain is not responding. Please try again."