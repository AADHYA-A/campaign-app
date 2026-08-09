import os
import json
import asyncio
import requests

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:latest")


class LLMService:
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = OLLAMA_MODEL

    def _chat_sync(self, system_prompt: str, user_prompt: str) -> str:
        """Blocking Ollama HTTP call — must be run via asyncio.to_thread from async context."""
        response = requests.post(
            f"{self.base_url}/api/chat",
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "stream": False,
            },
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        return data["message"]["content"].strip()

    async def _chat(self, system_prompt: str, user_prompt: str) -> str:
        """Async wrapper — offloads the blocking requests call to a thread pool."""
        try:
            return await asyncio.to_thread(self._chat_sync, system_prompt, user_prompt)
        except requests.exceptions.ConnectionError:
            raise RuntimeError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Make sure Ollama is running (`ollama serve`)."
            )
        except Exception as e:
            raise RuntimeError(f"Ollama request failed: {e}")

    async def generate_campaign_content(self, topic: str, tone: str = "professional") -> str:
        system_prompt = (
            f"You are an expert marketing copywriter. "
            f"Write campaign content in a {tone} tone. "
            f"Be concise, engaging, and persuasive. Reply with only the campaign text."
        )
        user_prompt = f"Write a short, engaging campaign message about: {topic}"
        return await self._chat(system_prompt, user_prompt)

    async def analyze_sentiment(self, text: str) -> dict:
        system_prompt = (
            "You are a sentiment analysis assistant. "
            "Respond ONLY with a valid JSON object with two keys: "
            '"sentiment" (one of: positive, neutral, negative) and '
            '"confidence" (a float between 0 and 1). No extra text.'
        )
        user_prompt = f"Analyse the sentiment of this text:\n\n{text}"
        try:
            raw = await self._chat(system_prompt, user_prompt)
            raw = raw.strip().strip("```json").strip("```").strip()
            data = json.loads(raw)
            return {
                "sentiment": str(data.get("sentiment", "positive")).lower(),
                "confidence": float(data.get("confidence", 0.9)),
            }
        except Exception:
            return {"sentiment": "positive", "confidence": 0.9}


llm_service = LLMService()
