from .llm import llm_service

class RouterService:

    # Medicine keywords — defined once, reused
    MEDICINE_KEYWORDS = {"medicine", "tablet", "dabaai", "ausadhi", "औषधि", "दबाई", "digene", "syrup"}

    # If message contains a medicine keyword + one of these → MEDICINE_QUERY (strict)
    MEDICINE_QUERY_MARKERS = {
        # Interrogative / listing queries
        "मेरो", "मेरा", "कुन", "कुन कुन", "कति", "कस्तो",
        "बाँकी", "बाकी", "खान बाँकी", "खान बाकी",
        "खाएको छैन", "नखाएको", "के हो", "के के",
        "list", "show", "which", "what medicine", "my medicine",
        "कहिले", "schedule", "remind", "कसरी",
        # Intake report words — user just says they took medicine (unspecified)
        "खाएँ", "खाए", "खायो", "खाइसकेँ", "खाइसकेको", "खाइसकें",
        "लिएँ", "लिए", "लियो", "सकेँ", "सकें",
        "took", "taken", "finished", "done",
    }

    async def classify(self, message):
        msg_lower = message.lower().strip()

        # ─── PRIORITY 0: MEDICINE CHECK (must run first) ───────────────────────
        # If a medicine keyword is present, check intent immediately — before any
        # other fast-paths can steal it (e.g. "आज कुन" → time_query stealing
        # "आज कुन कुन औषधि खान बाँकी छ").
        if any(kw in msg_lower for kw in self.MEDICINE_KEYWORDS):
            if any(kw in msg_lower for kw in self.MEDICINE_QUERY_MARKERS):
                return "MEDICINE_QUERY"
            if any(kw in msg_lower for kw in ["add", "save", "thap", "थप", "khanchu", "khana"]):
                return "MEDICINE_ADD"
            # औषधि in any other context (e.g. "मैले औषधि खाएँ") → GENERAL
            return "GENERAL"

        # ─── 1. GREETINGS / IDENTITY / SHORT MESSAGES ──────────────────────────
        greetings = {
            "hi", "hello", "hey", "namaste", "नमस्ते", "सन्चै", "हजुर",
            "सुन", "सुन त", "सुन न", "सुन्नुहोस्", "सुन्नुहोस् न"
        }
        identity_keywords = {
            "नाम", "हुँ", "हो", "name", "who am i", "i am", "who are you",
            "केयर प्लस", "care plus", "care+", "careplus", "care +"
        }
        if msg_lower in greetings or any(kw in msg_lower for kw in identity_keywords) or len(msg_lower.split()) <= 2:
            return "GENERAL"

        # ─── 1b. TIME / DATE queries → GENERAL ─────────────────────────────────
        time_query_keywords = {
            # Nepali time queries
            "कति बज्यो", "कति बजे", "अहिले कति बज्यो", "अहिले कति बजे",
            "अहिले कति", "बज्यो", "बजे के", "समय के", "समय कति",
            "अहिले समय", "समय बताउ", "समय बताउनुस्", "कति घण्टा",
            # Nepali date/day queries (specific compound phrases only)
            "आज के बार", "आज कुन बार", "आजको मिति", "आजको दिन",
            "कुन दिन", "के बार", "कुन बार", "आज के हो", "आजको",
            "कुन महिना", "कुन साल", "मिति के",
            # Nepali time-of-day
            "बिहान कति", "दिउँसो कति", "बेलुका कति", "राति कति",
            "बिहान भयो", "दिउँसो भयो", "साँझ भयो", "राति भयो",
            # Calendar queries
            "जोर्जियन", "gregorian", "ग्रेगोरियन",
            "बिक्रम", "सम्बत", "bikram", "sambat", "बि.सं", "वि.सं",
            "नेपाली क्यालेन्डर", "क्यालेन्डर", "calendar", "nepali date",
            "ad date", "bs date", "english date", "english calendar",
            # English time/date
            "what time", "what's the time", "whats the time", "current time",
            "what time is it", "time please", "tell me the time",
            "what day", "what day is it", "what day is today",
            "today's date", "what is today", "what is the date",
            "current date", "what month", "what year",
            "day of the week", "is it morning", "is it evening",
        }
        if any(kw in msg_lower for kw in time_query_keywords):
            return "GENERAL"

        # ─── 1c. GENERAL KNOWLEDGE topics → GENERAL ────────────────────────────
        general_knowledge_keywords = {
            # Astronomy / Space / Planets
            "ग्रह", "planet", "galaxy", "तारा", "star", "solar system", "सूर्य",
            "चन्द्रमा", "moon", "mars", "jupiter", "saturn", "venus", "mercury",
            "बृहस्पति", "शनि", "मंगल", "बुध", "शुक्र", "पृथ्वी", "earth",
            "नक्षत्र", "constellation", "universe", "ब्रह्माण्ड", "space", "orbit",
            "asteroid", "comet", "telescope", "nasa", "astronomy", "ज्योतिष",
            # Geography / Nature
            "देश", "country", "capital", "राजधानी", "महाद्वीप", "continent",
            "नदी", "river", "mountain", "पहाड", "ocean", "समुद्र", "jungle",
            "सगरमाथा", "everest", "himalaya", "हिमालय",
            # Science / History / General knowledge
            "विज्ञान", "science", "इतिहास", "history", "गणित", "math",
            "physics", "chemistry", "biology", "भूगोल", "geography",
            "राजनीति", "politics", "अर्थशास्त्र", "economics",
            # "Where is" phrased questions about non-physical things
            "कता पर्छ", "कहाँ पर्छ", "where is", "कता छ",
        }
        if any(kw in msg_lower for kw in general_knowledge_keywords):
            return "GENERAL"

        # ─── 2. HEALTH_QA (Symptoms / Diseases) ────────────────────────────────
        health_keywords = {
            "upachar", "bhayo", "dukhyo", "samsya", "vayo", "garne", "kasari",
            "दम", "ज्वरो", "खोकी", "दुखाई", "चोट", "घाउ",
            "asthma", "burn", "fever", "cough", "pain", "injury", "wound",
            "stomach", "headache", "sore", "cold", "flu", "pete",
            "दुख", "बिरामी", "अस्वस्थ", "टाउको", "छाती", "पेट", "घाँटी",
            "जिउ", "जीउ", "पोल्ने", "रोग",
            "chest", "hurt", "head", "back", "throat", "sick", "ill",
            "symptom", "disease", "condition", "illness"
        }
        if any(kw in msg_lower for kw in health_keywords):
            return "HEALTH_QA"

        # ─── 3. OBJECT_QUERY / SAVE (physical household objects) ───────────────
        object_keywords = {"kaha", "khoi", "kata", "कहाँ", "खोई", "find", "where", "lost"}
        if any(kw in msg_lower for kw in object_keywords):
            return "OBJECT_QUERY"

        save_keywords = {"rakheko", "rakhyo", "placed", "put", "kept", "left", "stored", "राखेको"}
        if any(kw in msg_lower for kw in save_keywords):
            return "OBJECT_SAVE"

        # ─── Default → GENERAL ─────────────────────────────────────────────────
        return "GENERAL"

router_service = RouterService()
