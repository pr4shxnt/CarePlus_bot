from .llm import llm_service

class RouterService:
    async def classify(self, message):
        msg_lower = message.lower().strip()
        
        # 1. Immediate Fast-Path (GREETINGS/IDENTITY/SMALL TALK)
        greetings = {
            "hi", "hello", "hey", "namaste", "नमस्ते", "सन्चै", "हजुर", 
            "सुन", "सुन त", "सुन न", "सुन्नुहोस्", "सुन्नुहोस् न"
        }
        identity_keywords = {"नाम", "हुँ", "हो", "name", "who am i", "i am", "who are you", "स्वस्थ साथी", "swastha sathi"}
        if msg_lower in greetings or any(kw in msg_lower for kw in identity_keywords) or len(msg_lower.split()) <= 1:
            return "GENERAL"

        # 2. HEALTH_QA (Symptoms/Diseases)
        health_keywords = {
            "upachar", "bhayo", "dukhyo", "samsya", "vayo", "garne", "kasari", "दम", "ज्वरो", "खोकी", "दुखाई", "चोट", "घाउ",
            "asthma", "burn", "fever", "cough", "pain", "injury", "wound", "stomach", "headache", "sore", "cold", "flu", "pete",
            "दुख", "बिरामी", "अस्वस्थ", "टाउको", "छाती", "पेट", "घाँटी", "जिउ", "जीउ", "पोल्ने", "रोग",
            "chest", "hurt", "head", "back", "throat", "sick", "ill", "symptom", "disease", "condition", "illness"
        }
        if any(kw in msg_lower for kw in health_keywords):
            return "HEALTH_QA"

        # 3. MEDICINE_ADD / QUERY
        medicine_keywords = {"medicine", "tablet", "dabaai", "ausadhi", "औषधि", "दबाई", "digene", "syrup"}
        if any(kw in msg_lower for kw in medicine_keywords):
            # Only classify as QUERY if it looks like a request for information
            # Added "बजे", "baje", "time" for time-specific queries
            if any(kw in msg_lower for kw in ["list", "what", "show", "मेरो औषधि", "कुन", "कहिले", "बजे", "baje", "time"]):
                return "MEDICINE_QUERY"
            if any(kw in msg_lower for kw in ["add", "save", "thap", "थप", "khanchu", "khana"]):
                return "MEDICINE_ADD"
            # Statements like "I forgot medicine" should stay GENERAL
            return "GENERAL"

        # 4. OBJECT_QUERY / SAVE
        object_keywords = {"kaha", "khoi", "kata", "कहाँ", "खोई", "find", "where", "lost"}
        if any(kw in msg_lower for kw in object_keywords):
            return "OBJECT_QUERY"
        
        save_keywords = {"rakheko", "rakhyo", "placed", "put", "kept", "left", "stored", "राखेको"}
        if any(kw in msg_lower for kw in save_keywords):
            return "OBJECT_SAVE"

        # 5. Fallback to LLM only if absolutely necessary
        # Try to use a smaller model if gemma3:4b is the default
        router_model = "gemma:e2b" if llm_service.model == "gemma3:4b" else llm_service.model
        prompt = f"Identify intent: HEALTH_QA, MEDICINE_ADD, MEDICINE_QUERY, OBJECT_SAVE, OBJECT_QUERY, or GENERAL. Message: \"{message}\". Reply ONLY with the label."
        label = await llm_service.generate_response(prompt, num_predict=10, model=router_model)
        
        valid_labels = ["HEALTH_QA", "MEDICINE_ADD", "MEDICINE_QUERY", "OBJECT_SAVE", "OBJECT_QUERY", "GENERAL"]
        for v in valid_labels:
            if v in label.upper(): return v
        return "GENERAL"

router_service = RouterService()
