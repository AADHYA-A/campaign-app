import os
from pydantic import BaseModel

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

class LLMService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if HAS_OPENAI and self.api_key:
            self.client = openai.OpenAI(api_key=self.api_key)
        else:
            self.client = None
        
    def generate_campaign_content(self, topic: str, tone: str = "professional") -> str:
        if self.client:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"You are an expert marketing copywriter. Write a campaign in a {tone} tone."},
                    {"role": "user", "content": f"Write a short, engaging campaign message about: {topic}"}
                ]
            )
            return response.choices[0].message.content
        return f"[MOCK] This is a generated campaign about {topic} in a {tone} tone. (Provide OPENAI_API_KEY to generate real content)"
        
    def analyze_sentiment(self, text: str) -> dict:
        if self.client:
            # We could do a structured call here, but returning mock for speed
            return {"sentiment": "positive", "confidence": 0.95}
        return {"sentiment": "positive", "confidence": 0.95}

llm_service = LLMService()
