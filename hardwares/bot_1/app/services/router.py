from .llm import llm_service

class RouterService:
    async def classify(self, message):
        msg_lower = message.lower().strip()
        
        # 1. Immediate Fast-Path (GREETINGS/SMALL TALK)
        greetings = {"hi", "hello", "hey", "namaste", "नमस्ते", "सन्चै", "हजुर"}
        if msg_lower in greetings or len(msg_lower.split()) <= 1:
            return "GENERAL"

        # 2. HEALTH_QA (Symptoms/Diseases)
        health_keywords = {
            "upachar", "bhayo", "dukhyo", "samsya", "vayo", "garne", "kasari", "दम", "ज्वरो", "खोकी", "दुखाई", "चोट", "घाउ",
            "asthma", "burn", "fever", "cough", "pain", "injury", "wound", "stomach", "headache", "sore", "cold", "flu", "pete"
        }
        if any(kw in msg_lower for kw in health_keywords):
            return "HEALTH_QA"

        # 3. MEDICINE_ADD / QUERY
        medicine_keywords = {"medicine", "tablet", "dabaai", "ausadhi", "औषधि", "दबाई", "digene", "syrup"}
        if any(kw in msg_lower for kw in medicine_keywords):
            if any(kw in msg_lower for kw in ["add", "save", "thap", "थप", "khanchu", "khana"]):
                return "MEDICINE_ADD"
            return "MEDICINE_QUERY"

        # 4. OBJECT_QUERY / SAVE
        object_keywords = {"kaha", "khoi", "kata", "कहाँ", "खोई", "find", "where", "lost", "mero", "मेरो"}
        if any(kw in msg_lower for kw in object_keywords):
            return "OBJECT_QUERY"
        
        save_keywords = {"rakheko", "rakhyo", "placed", "put", "kept", "left", "stored", "राखेको"}
        if any(kw in msg_lower for kw in save_keywords):
            return "OBJECT_SAVE"

        # 5. Fallback to LLM only if absolutely necessary
        # Try to use a smaller model if gemma3:4b is the default
        router_model = "gemma:2b" if llm_service.model == "gemma3:4b" else llm_service.model
        prompt = f"Identify intent: HEALTH_QA, MEDICINE_ADD, MEDICINE_QUERY, OBJECT_SAVE, OBJECT_QUERY, or GENERAL. Message: \"{message}\". Reply ONLY with the label."
        label = await llm_service.generate_response(prompt, num_predict=10, model=router_model)
        
        valid_labels = ["HEALTH_QA", "MEDICINE_ADD", "MEDICINE_QUERY", "OBJECT_SAVE", "OBJECT_QUERY", "GENERAL"]
        for v in valid_labels:
            if v in label.upper(): return v
        return "GENERAL"

router_service = RouterService()
