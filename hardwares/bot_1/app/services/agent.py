import json
import re
import asyncio
import uuid
import time
from .llm import llm_service
from .rag import rag_service
from .router import router_service
from .sync import PATIENT_ID
from ..database.db import get_db

class SwasthaAgent:
    def __init__(self):
        # --- Session Management ---
        self.sessions = {} # {user_id: {"id": uuid, "last_active": timestamp}}
        self.SESSION_TIMEOUT = 1800 # 30 minutes in seconds

        # --- System Prompts (Multi-Language Intelligence) ---
        self.PROMPT_QA_NE = (
            "तपाईं एक अनुभवी र दयालु नेपाली स्वास्थ्य सहायक हुनुहुन्छ।\n"
            "नियमहरू:\n"
            "१. केवल शुद्ध नेपाली भाषा र देवनागरी लिपिमा जवाफ दिनुहोस्।\n"
            "२. जवाफ प्राकृतिक, व्याकरणिय रूपमा सही र आत्मीय हुनुपर्छ।\n"
            "३. प्रयोगकर्तालाई सम्मानका साथ 'तपाईं' वा 'हजुर' भन्नुहोस्।\n"
            "४. रोमन नेपाली वा अंग्रेजी शब्दहरूको अनावश्यक प्रयोग नगर्नुहोस्।\n"
            "५. उपलब्ध गराइएको सन्दर्भ वा 'Patient Profile Context' बाट जवाफ दिन प्राथमिकता दिनुहोस्। यदि जानकारी सन्दर्भमा छैन भने, आफ्नो सामान्य ज्ञान प्रयोग गरी प्रयोगकर्तालाई सीधा र मद्दतकारी जवाफ दिनुहोस्। 'म मद्दत गर्न सक्दिन' वा 'यो जानकारी उपलब्ध छैन' भनी जवाफ दिन अस्वीकार नगर्नुहोस्।\n"
            "६. यदि प्रयोगकर्ताले आफ्नो नाम, रोग, वा स्वास्थ्य अवस्था (Conditions) को बारेमा सोध्छन् भने, उपलब्ध गराइएको 'Patient Profile Context' हेरेर सीधा र स्पष्ट जवाफ दिनुहोस्। कुनै पनि हालतमा 'म एआई हुँ, व्यक्तिगत सल्लाह दिन सक्दिन' भनी अस्वीकार नगर्नुहोस्। यो उनीहरूकै व्यक्तिगत रेकर्ड हो।\n"
            "७. जवाफमा कुनै पनि तारा चिन्ह (जैसे *, **), हेडर (#), वा अन्य कुनै मार्कडाउन चिन्हहरू प्रयोग नगर्नुहोस्। केवल साधारण पाठमा (plain text) जवाफ दिनुहोस्।"
        )
        self.PROMPT_GENERAL_NE = (
            "तपाईं 'स्वस्थ साथी' (Swastha Sathi) हुनुहुन्छ — एक न्यानो, सहयोगी र उच्च स्तरको नेपाली स्वास्थ्य सहायक।\n"
            "तपाईंको उद्देश्य प्रयोगकर्तासँग प्राकृतिक र आत्मीय नेपालीमा कुराकानी गर्नु हो।\n"
            "नियमहरू:\n"
            "१. व्याकरणिय रूपमा शुद्ध र सुन्नमा मिठो नेपाली देवनागरी प्रयोग गर्नुहोस्।\n"
            "२. प्रयोगकर्ताको मुड र स्वास्थ्यको बारेमा सोध्नुहोस्।\n"
            "३. कुराकानीलाई व्यक्तिगत र मित्रवत बनाउनुहोस्।\n"
            "४. यदि प्रयोगकर्ताले आफ्नो नाम, रोग, वा स्वास्थ्य अवस्था (Conditions) को बारेमा सोध्छन् भने, उपलब्ध गराइएको 'Patient Profile Context' हेरेर सीधा र स्पष्ट जवाफ दिनुहोस्। कुनै पनि हालतमा 'म एआई हुँ, व्यक्तिगत सल्लाह दिन सक्दिन' भनी अस्वीकार नगर्नुहोस्। यो उनीहरूकै व्यक्तिगत रेकर्ड हो।\n"
            "५. जवाफमा कुनै पनि तारा चिन्ह (जैसे *, **), हेडर (#), वा अन्य कुनै मार्कडाउन चिन्हहरू प्रयोग नगर्नुहोस्। केवल साधारण पाठमा (plain text) जवाफ दिनुहोस्।"
        )
        
        self.PROMPT_QA_EN = (
            "You are a kind and friendly health assistant. Reply only in English.\n"
            "Always address the user warmly and show concern for their well-being.\n"
            "Prioritize answering from the provided context or Patient Profile Context. If the answer is not in the context, use your general knowledge as a helpful assistant to answer the question directly. Do NOT refuse to answer, and do NOT say you cannot help or that the context doesn't contain the info.\n"
            "If the user asks about their own medical conditions, diseases, name, or medicines, answer directly using the provided Patient Profile Context. Do NOT refuse to answer, and do NOT give a generic AI refusal disclaimer like 'I am an AI and cannot give medical advice', as you are simply reading back their own recorded profile information.\n"
            "Strict Rule: Use ONLY plain text. Absolutely NO markdown, no bolding with **, no asterisks, no hash headers, no bullet points using * or -."
        )
        self.PROMPT_GENERAL_EN = (
            "You are Swastha Sathi, a warm, caring, and friendly health assistant.\n"
            "Your goal is to make the user feel supported and cared for.\n"
            "Strict rules:\n"
            "1. Reply ONLY in plain English. Absolutely NO markdown, no bolding with **, no asterisks, no hash headers, no bullet points using * or -.\n"
            "2. If the user asks about their own medical conditions, diseases, name, or medicines, answer directly using the provided Patient Profile Context. Do NOT refuse to answer, and do NOT give a generic AI refusal disclaimer like 'I am an AI and cannot give medical advice', as you are simply reading back their own recorded profile information.\n"
            "3. Be proactive: ask the user how they are feeling, if they've taken their medicine, and if they need anything.\n"
            "4. Use the user's name if you know it to make the conversation personal."
        )

    async def _clean_stream_generator(self, stream):
        """Clean common markdown markers on the fly from a generator stream."""
        async for chunk in stream:
            clean_chunk = chunk.replace("**", "").replace("*", "").replace("__", "").replace("_", "").replace("`", "")
            clean_chunk = re.sub(r'^#+\s*', '', clean_chunk, flags=re.MULTILINE)
            clean_chunk = re.sub(r'^[*-]\s*', '', clean_chunk, flags=re.MULTILINE)
            yield clean_chunk

    def _get_patient_profile(self, user_id):
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM patient_profile WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                conditions = json.loads(row["conditions"]) if row["conditions"] else []
                return {
                    "name": row["name"] or "",
                    "conditions": conditions
                }
        except Exception as e:
            print(f"Error fetching patient profile: {e}")
        return {"name": "", "conditions": []}

    async def is_confirmation(self, text):
        prompt = f"के प्रयोगकर्ताले पुष्टि गर्दैछन् वा 'हुन्छ' भन्दैछन्? पाठ: \"{text}\"। केवल 'yes' वा 'no' मा जवाफ दिनुहोस्।"
        resp = (await llm_service.generate_response(prompt, num_predict=10)).strip().lower()
        return "yes" in resp

    async def is_rejection(self, text):
        prompt = f"के प्रयोगकर्ताले अस्वीकार गर्दैछन् वा 'हुँदैन' भन्दैछन्? पाठ: \"{text}\"। केवल 'yes' वा 'no' मा जवाफ दिनुहोस्।"
        resp = (await llm_service.generate_response(prompt, num_predict=10)).strip().lower()
        return "yes" in resp

    def _get_session_id(self, user_id):
        """Gets existing session ID or creates a new one if timed out."""
        now = time.time()
        if user_id in self.sessions:
            session = self.sessions[user_id]
            if now - session["last_active"] < self.SESSION_TIMEOUT:
                session["last_active"] = now
                return session["id"]
        
        # New session
        new_id = str(uuid.uuid4())
        self.sessions[user_id] = {"id": new_id, "last_active": now}
        return new_id

    def is_active(self, threshold=600):
        """Checks if any session has been active within the last 'threshold' seconds."""
        now = time.time()
        for session in self.sessions.values():
            if now - session["last_active"] < threshold:
                return True
        return False

    async def _save_chat(self, user_id, role, content):
        """Saves a message to the local chat_history table with session_id."""
        try:
            session_id = self._get_session_id(user_id)
            conn = get_db()
            conn.execute(
                "INSERT INTO chat_history (user_id, session_id, role, content) VALUES (?, ?, ?, ?)", 
                (user_id, session_id, role, content)
            )
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Failed to save chat: {e}")

    async def _get_user_info(self, user_id):
        """Fetch user name and basic info if available."""
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM medicines WHERE user_id = ? LIMIT 1", (user_id,))
            row = cursor.fetchone()
            conn.close()
            # Default to Prashant if no records yet
            return {"name": "प्रशान्त अधिकारी"} if user_id == PATIENT_ID else None
        except:
            return None

    def clean_markdown(self, text):
        """Final safety layer: Strips all common markdown symbols from the text."""
        if not text: return ""
        # Remove bold/italic asterisks
        text = text.replace("**", "").replace("*", "")
        # Remove markdown headers
        text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
        # Remove markdown lists
        text = re.sub(r'^[*-]\s*', '', text, flags=re.MULTILINE)
        # Remove markdown underscores
        text = text.replace("__", "").replace("_", "")
        # Remove any lingering backticks
        text = text.replace("`", "")
        return text.strip()

    async def _log_mood(self, user_id, session_id, message, response):
        """Analyzes and logs mood for the current interaction."""
        try:
            prompt = f"Analyze user mood from message: \"{message}\". Reply with one word (e.g., Happy, Sad, Anxious, Neutral) and an intensity score 1-10. Format: MOOD: <word>, SCORE: <number>."
            analysis = await llm_service.generate_response(prompt, num_predict=20)
            
            mood_match = re.search(r'MOOD:\s*(\w+)', analysis, re.I)
            score_match = re.search(r'SCORE:\s*(\d+)', analysis, re.I)
            
            if mood_match and score_match:
                mood = mood_match.group(1).capitalize()
                intensity = int(score_match.group(1))
                
                conn = get_db()
                conn.execute(
                    "INSERT INTO mood_logs (user_id, session_id, mood, intensity) VALUES (?, ?, ?, ?)",
                    (user_id, session_id, mood, intensity)
                )
                conn.commit()
                conn.close()
                print(f"DEBUG: Logged mood: {mood} ({intensity}) for session {session_id}")
        except Exception as e:
            print(f"Mood Logging Error: {e}")

    async def run_chat_stream(self, user_id, message, history=None):
        target_user_id = PATIENT_ID if user_id == "web-user" else user_id
        session_id = self._get_session_id(user_id)
        
        print(f"DEBUG: Processing message: '{message}' for user: {user_id} (Target: {target_user_id}, Session: {session_id})")
        user_info = await self._get_user_info(target_user_id)
        user_name = user_info["name"] if user_info else None

        await self._save_chat(user_id, "user", message)
        
        lang_task = asyncio.create_task(llm_service.detect_language(message))
        intent_task = asyncio.create_task(router_service.classify(message))
        
        lang = await lang_task
        intent = await intent_task
        print(f"DEBUG: Language: {lang}, Intent: {intent}")

        profile = self._get_patient_profile(target_user_id)
        profile_context = ""
        if profile["name"] or profile["conditions"]:
            cond_str = ", ".join(profile["conditions"]) if profile["conditions"] else "None"
            profile_context = f"\nPatient Profile Context:\nName: {profile['name']}\nMedical Conditions/Diseases: {cond_str}\n"

        final_res = ""

        # Identity check
        is_prashant = "prashant" in message.lower() or "प्रशान्त" in message
        is_adhikari = "adhikari" in message.lower() or "अधिकारी" in message
        is_stating_name = any(kw in message.lower() for kw in ["name", "नाम", "हुँ", "हो", "am", "is"])

        if is_prashant and is_stating_name:
            final_res = f"नमस्ते प्रशान्त अधिकारी ज्यू! तपाईंलाई फेरि भेट्दा धेरै खुसी लाग्यो। आज तपाईंलाई कस्तो छ? के तपाईंले समयमा औषधि खानुभयो?" if lang == "ne" else f"Hello Prashant Adhikari! It's wonderful to see you. How are you feeling today? Have you taken your medicines yet?"
            yield final_res
            await self._save_chat(user_id, "assistant", final_res)
            asyncio.create_task(self._log_mood(target_user_id, session_id, message, final_res))
            return

        # Bot Identity check
        is_asking_bot_name = any(kw in message for kw in ["your name", "तिम्रो नाम", "तपाईंको नाम", "तपाई को हो", "who are you"])
        if is_asking_bot_name:
            final_res = "मेरो नाम स्वस्थ साथी (Swastha Sathi) हो। म तपाईंको स्वास्थ्य सहायक हुँ। आज म तपाईंलाई कसरी सहयोग गर्न सक्छु?" if lang == "ne" else "My name is Swastha Sathi. I am your health assistant. How can I help you today?"
            yield final_res
            await self._save_chat(user_id, "assistant", final_res)
            return
        
        # --- MEDICINE QUERY ---
        if intent == "MEDICINE_QUERY":
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM medicines WHERE user_id = ?", (target_user_id,))
                rows = cursor.fetchall()
                conn.close()
                
                meds = []
                for r in rows:
                    try:
                        schedule = json.loads(r["schedule"]) if r["schedule"] else []
                        meds.append({"name": r["name"], "dosage": r["dosage"], "schedule": schedule})
                    except:
                        meds.append({"name": r["name"], "dosage": r["dosage"], "schedule": []})
                
                if meds:
                    # Check for time-specific query
                    target_time = None
                    time_match = re.search(r'(\d+)\s*(?:baje|बजे|am|pm)', message.lower())
                    if time_match:
                        target_hour = int(time_match.group(1))
                        # Basic mapping for filtering (simple hour match)
                        target_time = f"{target_hour:02d}:00"
                        # Handle common offsets or 12h/24h if needed, but for now exact or simple baje

                    filtered_meds = meds
                    if target_time:
                        # Try to find meds matching that hour
                        filtered_meds = [m for m in meds if any(s.get('time', '').startswith(f"{target_hour:02d}:") or s.get('time', '').startswith(f"{target_hour+12:02d}:") for s in m['schedule'])]
                    
                    if not filtered_meds and target_time:
                        res = f"माफ गर्नुहोस्, {target_hour} बजे खाने कुनै औषधिको रेकord छैन।" if lang == "ne" else f"Sorry, I don't have any records for medicine at {target_hour} o'clock."
                        yield res
                        await self._save_chat(user_id, "assistant", res)
                        return

                    if lang == "ne":
                        # Translate medicine list to Nepali
                        med_text = "\n".join([f"- {m['name']} ({m['dosage']}) - {', '.join([s.get('time', '') for s in m['schedule']])}" for m in filtered_meds])
                        translate_prompt = f"TASK: Translate the following medicine list to pure Nepali Devanagari. \nRULES:\n1. Output ONLY translated data.\n2. NO symbols like * or -.\n3. Include NAME, DOSAGE, and NATURAL TIME.\n4. NATURAL TIME RULE: 08:00 must be 'बिहानको ८ बजे', 21:00 must be 'बेलुकाको ९ बजे'. Use 'बिहानको' (Morning), 'दिउँसोको' (Afternoon), or 'बेलुकाको' (Evening) for all times.\n5. NO English words or numbers (use Devanagari digits if possible, e.g., ८ instead of 8).\n\nLIST:\n{med_text}"
                        translated_meds_raw = await llm_service.generate_response(translate_prompt, system_prompt="Strict Nepali Translator. Use only Devanagari script.")
                        
                        clean_lines = []
                        for line in translated_meds_raw.split('\n'):
                            if re.search(r'[\u0900-\u097F]', line):
                                clean_line = line.replace('*', '').replace('-', '').replace('•', '').strip()
                                if clean_line: clean_lines.append(clean_line)
                        
                        translated_meds = "\n".join(clean_lines)
                        
                        time_desc = f"{target_hour} बजे"
                        if target_hour < 12: time_desc = f"बिहानको {target_hour} बजे"
                        elif target_hour >= 18: time_desc = f"बेलुकाको {target_hour-12 if target_hour > 12 else target_hour} बजे"
                        
                        intro = f"नमस्ते {user_name or 'हजुर'}, यहाँ तपाईंका {time_desc if target_time else ''}का औषधिहरू छन्:" if target_time else f"नमस्ते {user_name or 'हजुर'}, यहाँ तपाईंका औषधिहरू छन्:"
                        final_res = f"{intro}\n{translated_meds.strip()}"
                        final_res += "\n\n" + "के तपाईंले आजका यी औषधिहरू खानुभयो?"
                    else:
                        med_lines = "\n".join([f"- {m['name']} ({m['dosage']}) - {', '.join([s.get('time', '') for s in m['schedule']])}" for m in filtered_meds])
                        intro = f"Hello {user_name or ''}, here are your {target_hour if target_time else ''} o'clock medicines:" if target_time else f"Hello {user_name or ''}, here are your medicines:"
                        final_res = f"{intro}\n{med_lines}\n\nHave you taken these doses yet?"
                else:
                    final_res = "अहिले मसँग तपाईंको कुनै औषधिको रेकर्ड छैन। के म डाक्टरलाई सम्पर्क गरूँ?" if lang == "ne" else "I don't have any medicine records for you right now. Should I contact your doctor?"
                
                yield final_res
                await self._save_chat(user_id, "assistant", final_res)
                asyncio.create_task(self._log_mood(target_user_id, session_id, message, final_res))
                return
            except Exception as e:
                print(f"Medicine Query Error: {e}")
                yield "माफ गर्नुहोस्, रेकर्ड हेर्दा समस्या भयो।" if lang == "ne" else "Sorry, I had trouble accessing your records."
                return

        # --- HEALTH QA (RAG) ---
        elif intent == "HEALTH_QA":
            relevant_chunks = rag_service.retrieve(message)
            if not relevant_chunks:
                # If no RAG context, try to answer from general knowledge using history
                system_prompt = self.PROMPT_GENERAL_NE if lang == "ne" else self.PROMPT_GENERAL_EN
                system_prompt = f"{system_prompt}\n{profile_context}"
                chat_messages = (history or [])[-10:] # Keep last 10 messages for context
                chat_messages.append({"role": "user", "content": message})
                
                async for chunk in self._clean_stream_generator(llm_service.chat_stream(chat_messages, system_prompt=system_prompt)):
                    final_res += chunk
                    yield chunk
                
                clean_res = self.clean_markdown(final_res)
                await self._save_chat(user_id, "assistant", clean_res)
                asyncio.create_task(self._log_mood(target_user_id, session_id, message, clean_res))
                return
            
            raw_context = "\n\n".join([c["content"] for c in relevant_chunks])
            context = "\n".join([line.strip() for line in raw_context.split('\n') if not line.strip().startswith('प्र:')])
            system_prompt = self.PROMPT_QA_NE if lang == "ne" else self.PROMPT_QA_EN
            system_prompt = f"{system_prompt}\n{profile_context}\nContext for answering:\n{context}"
            
            # Build messages without system messages at the start so that llm_service injects system_prompt properly
            chat_messages = []
            if history:
                chat_messages.extend(history[-6:]) # Last 3 exchanges
            chat_messages.append({"role": "user", "content": message})
            
            async for chunk in self._clean_stream_generator(llm_service.chat_stream(chat_messages, system_prompt=system_prompt)):
                final_res += chunk
                yield chunk
            
            clean_res = self.clean_markdown(final_res)
            await self._save_chat(user_id, "assistant", clean_res)
            asyncio.create_task(self._log_mood(target_user_id, session_id, message, clean_res))

        # --- OBJECT QUERY ---
        elif intent == "OBJECT_QUERY":
            obj_name_prompt = f"Identify object name from: \"{message}\". Reply ONLY with name."
            obj_name_raw = (await llm_service.generate_response(obj_name_prompt, num_predict=20)).strip().lower()
            obj_name = obj_name_raw.split('\n')[0].split(':')[-1].strip().rstrip('.')
            
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM objects WHERE user_id = ? AND name LIKE ? ORDER BY time DESC LIMIT 1", (target_user_id, f"%{obj_name}%"))
                row = cursor.fetchone()
                conn.close()
                if row:
                    final_res = f"भेटियो: {obj_name} {row['location']} मा छ।" if lang == "ne" else f"Found it: {obj_name} is at {row['location']}."
                else:
                    final_res = f"माफ गर्नुहोस्, {obj_name} को रेकर्ड छैन।" if lang == "ne" else f"Sorry, no record of {obj_name}."
                yield final_res
                await self._save_chat(user_id, "assistant", final_res)
                return
            except:
                yield "Database error."
                return

        # --- OBJECT SAVE ---
        elif intent == "OBJECT_SAVE":
            extract_prompt = f"Extract OBJECT and LOCATION from: \"{message}\". Format: OBJECT: <name>, LOCATION: <loc>."
            extraction = await llm_service.generate_response(extract_prompt, num_predict=40)
            obj_name = re.search(r'OBJECT:\s*(.*)', extraction, re.I)
            obj_loc = re.search(r'LOCATION:\s*(.*)', extraction, re.I)
            if obj_name and obj_loc:
                name, loc = obj_name.group(1).strip(), obj_loc.group(1).strip()
                try:
                    conn = get_db()
                    conn.execute("INSERT INTO objects (user_id, name, location) VALUES (?, ?, ?)", (target_user_id, name, loc))
                    conn.commit()
                    conn.close()
                    final_res = f"बचत भयो: {name} {loc} मा।" if lang == "ne" else f"Saved: {name} at {loc}."
                    yield final_res
                    await self._save_chat(user_id, "assistant", final_res)
                except: yield "Save failed."
            else: yield "Extraction failed."
            return

        # --- GENERAL ---
        else:
            system_prompt = self.PROMPT_GENERAL_NE if lang == "ne" else self.PROMPT_GENERAL_EN
            system_prompt = f"{system_prompt}\n{profile_context}"
            chat_messages = (history or [])[-10:] # Keep last 10 messages for context
            chat_messages.append({"role": "user", "content": message})
            
            async for chunk in self._clean_stream_generator(llm_service.chat_stream(chat_messages, system_prompt=system_prompt)):
                if chunk.startswith("Error:"):
                    final_res = "माफ गर्नुहोस्, मेरो दिमाग अहिले अलि थाकेको छ। फेरि प्रयास गर्नुहोस्।" if lang == "ne" else "I'm sorry, my brain is a bit tired right now. Please try again."
                    yield final_res
                    break
                final_res += chunk
                yield chunk
            
            if not final_res.strip():
                final_res = "माफ गर्नुहोस्, मैले बुझिन। फेरि भन्नुहुन्छ कि?" if lang == "ne" else "I'm sorry, I didn't quite catch that. Could you repeat it?"
                yield final_res
            
            clean_res = self.clean_markdown(final_res)
            await self._save_chat(user_id, "assistant", clean_res)
            asyncio.create_task(self._log_mood(target_user_id, session_id, message, clean_res))

    async def generate_report(self, user_id, history=None):
        """Generate a daily health report by analyzing chat history."""
        try:
            chat_history = history or []
            conversation_text = "\n".join([f"{'User' if m.get('role') == 'patient' else 'Assistant'}: {m.get('content', '')}" for m in chat_history[-30:]]) if chat_history else "No history."
            
            mood_prompt = f"Rate mood 1-10 based on:\n{conversation_text}\nReply with ONLY a number."
            mood_raw = (await llm_service.generate_response(mood_prompt, num_predict=10)).strip()
            mood_score = next((int(c) for c in mood_raw if c.isdigit()), 5)
            
            report_prompt = f"Write 5-sentence wellness summary for:\n{conversation_text}\nRules: English, no markdown."
            report = await llm_service.generate_response(report_prompt, system_prompt="Wellness writer. Plain text only.")
            report = re.sub(r'[*#-]', '', report)
            
            return {"report": report.strip(), "moodScore": mood_score}
        except Exception as e:
            return {"report": f"Error: {str(e)}", "moodScore": 5}

swastha_agent = SwasthaAgent()
