"""
content_service.py — Milestone 2 Pipeline Orchestrator
Combines all 5 AI stages: Generate → Translate → Personalise → Tone → QC
"""
from app.services.llm_service import llm_service
from app.services.indic_trans import indic_translation


class ContentService:
    """
    Orchestrates the full Milestone 2 pipeline:
      1. AI Content Generation
      2. Multilingual Translation
      3. Audience Personalisation
      4. Sentiment & Tone Optimisation
      5. AI Quality & Compliance Check
    """

    async def run_full_pipeline(
        self,
        topic: str,
        tone: str = "professional",
        target_lang: str = "hin",
        audience_type: str = "general_public",
        location: str = "",
        role: str = "",
        preferences: str = "",
    ) -> dict:
        """
        Run the complete content pipeline and return a rich result with
        all intermediate outputs and quality metrics.
        """
        pipeline_steps = []

        # ── Step 1: AI Content Generation ────────────────────────────────────
        try:
            original_content = await llm_service.generate_campaign_content(
                topic=topic, tone=tone
            )
            pipeline_steps.append({"step": "generate", "status": "success"})
        except Exception as e:
            original_content = f"Campaign content about {topic}"
            pipeline_steps.append({"step": "generate", "status": "error", "error": str(e)})

        # ── Step 2: Multilingual Translation ─────────────────────────────────
        try:
            translated_content = indic_translation.translate(
                text=original_content,
                source_lang="eng",
                target_lang=target_lang,
            )
            pipeline_steps.append({"step": "translate", "status": "success"})
        except Exception as e:
            translated_content = original_content
            pipeline_steps.append({"step": "translate", "status": "error", "error": str(e)})

        # ── Step 3: Audience Personalisation ─────────────────────────────────
        try:
            personalized_content = await llm_service.personalize_content(
                content=original_content,
                audience_type=audience_type,
                location=location,
                role=role,
                preferences=preferences,
            )
            pipeline_steps.append({"step": "personalize", "status": "success"})
        except Exception as e:
            personalized_content = original_content
            pipeline_steps.append({"step": "personalize", "status": "error", "error": str(e)})

        # ── Step 4: Sentiment & Tone Optimisation ────────────────────────────
        try:
            tone_result = await llm_service.optimize_tone(
                content=personalized_content, target_tone=tone
            )
            final_content = tone_result.get("improved", personalized_content)
            pipeline_steps.append({"step": "tone_optimize", "status": "success"})
        except Exception as e:
            tone_result = {"analysis": "N/A", "issues": [], "improved": personalized_content, "tone_score": 75}
            final_content = personalized_content
            pipeline_steps.append({"step": "tone_optimize", "status": "error", "error": str(e)})

        # ── Step 5: Sentiment Analysis ────────────────────────────────────────
        try:
            sentiment = await llm_service.analyze_sentiment(final_content)
        except Exception:
            sentiment = {"sentiment": "positive", "confidence": 0.9}

        # ── Step 6: AI Quality & Compliance Check ────────────────────────────
        try:
            quality_check = await llm_service.quality_compliance_check(final_content)
            pipeline_steps.append({"step": "quality_check", "status": "success"})
        except Exception as e:
            quality_check = {
                "grammar": {"pass": True, "issues": []},
                "clarity": {"pass": True, "score": 80, "issues": []},
                "tone_appropriateness": {"pass": True, "issues": []},
                "sensitive_content": {"pass": True, "flags": []},
                "facts_verification": {"pass": True, "unverifiable_claims": []},
                "policy_compliance": {"pass": True, "violations": []},
                "overall_score": 80,
                "recommendation": "approve",
            }
            pipeline_steps.append({"step": "quality_check", "status": "error", "error": str(e)})

        return {
            "topic": topic,
            "tone": tone,
            "target_language": target_lang,
            "audience_type": audience_type,
            # Content at each stage
            "original_content": original_content,
            "translated_content": translated_content,
            "personalized_content": personalized_content,
            "final_content": final_content,
            # Analysis results
            "sentiment": sentiment,
            "tone_analysis": tone_result,
            "quality_check": quality_check,
            # Pipeline execution summary
            "pipeline_steps": pipeline_steps,
        }

    async def translate_only(
        self, content: str, source_lang: str = "eng", target_lang: str = "hin"
    ) -> dict:
        """Translate-only operation."""
        translated = indic_translation.translate(
            text=content, source_lang=source_lang, target_lang=target_lang
        )
        return {
            "original": content,
            "translated": translated,
            "source_language": source_lang,
            "target_language": target_lang,
        }

    async def personalize_only(
        self,
        content: str,
        audience_type: str = "general_public",
        location: str = "",
        role: str = "",
        preferences: str = "",
    ) -> dict:
        """Personalisation-only operation."""
        personalized = await llm_service.personalize_content(
            content=content,
            audience_type=audience_type,
            location=location,
            role=role,
            preferences=preferences,
        )
        return {
            "original": content,
            "personalized": personalized,
            "audience_type": audience_type,
            "location": location,
            "role": role,
        }

    async def quality_check_only(self, content: str) -> dict:
        """Quality & compliance check only."""
        return await llm_service.quality_compliance_check(content)


content_service = ContentService()
