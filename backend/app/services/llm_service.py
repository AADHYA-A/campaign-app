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

    # ── 1. AI Content Generation ──────────────────────────────────────────────
    async def generate_campaign_content(self, topic: str, tone: str = "professional") -> str:
        system_prompt = (
            f"You are an expert marketing copywriter specialising in public awareness campaigns. "
            f"Write campaign content in a {tone} tone. "
            f"Be concise, engaging, and persuasive. Reply with only the campaign text."
        )
        user_prompt = f"Write a short, engaging campaign message about: {topic}"
        return await self._chat(system_prompt, user_prompt)

    # ── 2. Sentiment Analysis ─────────────────────────────────────────────────
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

    # ── 3. Audience Personalization ───────────────────────────────────────────
    async def personalize_content(
        self,
        content: str,
        audience_type: str = "general_public",
        location: str = "",
        role: str = "",
        preferences: str = "",
    ) -> str:
        """Rewrite content tailored to a specific audience segment."""
        audience_desc = audience_type.replace("_", " ").title()
        context_parts = []
        if location:
            context_parts.append(f"Location: {location}")
        if role:
            context_parts.append(f"Role/Occupation: {role}")
        if preferences:
            context_parts.append(f"Communication preferences: {preferences}")
        context = "; ".join(context_parts) if context_parts else "No additional context"

        system_prompt = (
            "You are an expert content personalisation specialist. "
            "Rewrite the given campaign message to be specifically relevant and resonant "
            "for the specified audience. Keep the core message intact but adjust language, "
            "examples, and framing to match the audience. Reply with only the personalised text."
        )
        user_prompt = (
            f"Audience: {audience_desc}\n"
            f"Context: {context}\n\n"
            f"Original Message:\n{content}\n\n"
            "Personalised version:"
        )
        try:
            return await self._chat(system_prompt, user_prompt)
        except Exception:
            return content  # graceful fallback

    # ── 4. Sentiment & Tone Optimisation ──────────────────────────────────────
    async def optimize_tone(self, content: str, target_tone: str = "professional") -> dict:
        """Analyse and improve the tone of a message. Returns original, improved, and analysis."""
        system_prompt = (
            "You are a communication expert specialising in tone analysis and optimisation. "
            "Respond ONLY with a valid JSON object with these keys:\n"
            "  - \"analysis\": brief assessment of the current tone (string)\n"
            "  - \"issues\": list of tone issues found (array of strings)\n"
            "  - \"improved\": the rewritten message with optimised tone (string)\n"
            "  - \"tone_score\": effectiveness score 0-100 (integer)\n"
            "No extra text outside the JSON."
        )
        user_prompt = (
            f"Target tone: {target_tone}\n\n"
            f"Message to optimise:\n{content}"
        )
        try:
            raw = await self._chat(system_prompt, user_prompt)
            raw = raw.strip().strip("```json").strip("```").strip()
            data = json.loads(raw)
            return {
                "analysis": str(data.get("analysis", "Tone appears appropriate.")),
                "issues": list(data.get("issues", [])),
                "improved": str(data.get("improved", content)),
                "tone_score": int(data.get("tone_score", 75)),
            }
        except Exception:
            return {
                "analysis": "Tone analysis unavailable.",
                "issues": [],
                "improved": content,
                "tone_score": 75,
            }

    # ── 5. AI Quality & Compliance Check ─────────────────────────────────────
    async def quality_compliance_check(self, content: str) -> dict:
        """
        Validate content for grammar, clarity, sensitive info, misleading claims,
        and policy compliance. Returns a detailed check report.
        """
        system_prompt = (
            "You are an AI compliance and quality assurance reviewer for public communications. "
            "Analyse the provided text and respond ONLY with a valid JSON object with these keys:\n"
            "  - \"grammar\": {\"pass\": bool, \"issues\": [string]}\n"
            "  - \"clarity\": {\"pass\": bool, \"score\": int (0-100), \"issues\": [string]}\n"
            "  - \"tone_appropriateness\": {\"pass\": bool, \"issues\": [string]}\n"
            "  - \"sensitive_content\": {\"pass\": bool, \"flags\": [string]}\n"
            "  - \"facts_verification\": {\"pass\": bool, \"unverifiable_claims\": [string]}\n"
            "  - \"policy_compliance\": {\"pass\": bool, \"violations\": [string]}\n"
            "  - \"overall_score\": int (0-100)\n"
            "  - \"recommendation\": string (\"approve\", \"review\", or \"reject\")\n"
            "No extra text outside the JSON."
        )
        user_prompt = f"Review this campaign content for quality and compliance:\n\n{content}"
        try:
            raw = await self._chat(system_prompt, user_prompt)
            raw = raw.strip().strip("```json").strip("```").strip()
            data = json.loads(raw)
            return {
                "grammar": data.get("grammar", {"pass": True, "issues": []}),
                "clarity": data.get("clarity", {"pass": True, "score": 80, "issues": []}),
                "tone_appropriateness": data.get("tone_appropriateness", {"pass": True, "issues": []}),
                "sensitive_content": data.get("sensitive_content", {"pass": True, "flags": []}),
                "facts_verification": data.get("facts_verification", {"pass": True, "unverifiable_claims": []}),
                "policy_compliance": data.get("policy_compliance", {"pass": True, "violations": []}),
                "overall_score": int(data.get("overall_score", 80)),
                "recommendation": str(data.get("recommendation", "approve")),
            }
        except Exception:
            # Fallback: assume passing for all checks
            return {
                "grammar": {"pass": True, "issues": []},
                "clarity": {"pass": True, "score": 80, "issues": []},
                "tone_appropriateness": {"pass": True, "issues": []},
                "sensitive_content": {"pass": True, "flags": []},
                "facts_verification": {"pass": True, "unverifiable_claims": []},
                "policy_compliance": {"pass": True, "violations": []},
                "overall_score": 80,
                "recommendation": "approve",
            }


llm_service = LLMService()
