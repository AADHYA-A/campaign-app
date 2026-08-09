import os
from deep_translator import GoogleTranslator

class IndicTranslationService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self._load_model()

    def _load_model(self):
        print("Using GoogleTranslator for translations")

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translates text from source_lang to target_lang.
        Supported languages: hin, pan, ben, guj, mar, kan, mal, tam, tel, urd, eng
        """
        if source_lang == target_lang:
            return text
            
        lang_map = {
            "eng": "en",
            "hin": "hi",
            "ben": "bn",
            "guj": "gu",
            "mar": "mr",
            "kan": "kn",
            "mal": "ml",
            "tam": "ta",
            "tel": "te",
            "urd": "ur",
            "pan": "pa"
        }
        
        sl = lang_map.get(source_lang, source_lang)
        tl = lang_map.get(target_lang, target_lang)
        
        try:
            translator = GoogleTranslator(source=sl, target=tl)
            return translator.translate(text)
        except Exception as e:
            print(f"Translation failed: {e}")
            return f"[Failed to translate to {target_lang}]: {text}"

indic_translation = IndicTranslationService()
