import json
import re
import asyncio
import uuid
import time
from .llm import llm_service
from .rag import rag_service
from .router import router_service
from ..database.db import get_db

class SwasthaAgent:
    def __init__(self):
        # --- Session Management ---
        self.sessions = {} # {user_id: {"id": uuid, "last_active": timestamp}}
        self.SESSION_TIMEOUT = 1800 # 30 minutes in seconds

        # --- System Prompts (Multi-Language Intelligence) ---
        self.PROMPT_QA_NE = (
            "तपाईं एक नेपाली स्वास्थ्य सहायक हुनुहुन्छ।\n"
            "नियम: केवल शुद्ध नेपाली भाषा (देवनागरी लिपि) मा जवाफ दिनुहोस्।\n"
            "कुनै पनि अंग्रेजी शब्द (English), रोमन नेपाली (Romanized), वा अनावश्यक भूमिका नथप्नुहोस्।\n"
            "केभल सन्दर्भबाट प्रश्नको सिधा जवाफ मात्र दिनुहोस्।\n"
            "महत्त्वपूर्ण: कुनै पनि मार्कडाउन (Markdown) जस्तै bold (**), italic (*), वा सूची (-) प्रयोग नगर्नुहोस्। केबल सादा पाठ (Plain Text) मा जवाफ दिनुहोस्।"
        )
        self.PROMPT_GENERAL_NE = (
            "तपाईं 'स्वस्थ साथी' (Swastha Sathi) हुनुहुन्छ — एक मैत्रीपूर्ण नेपाली स्वास्थ्य सहायक।\n"
            "नियमहरू:\n"
            "१. केवल नेपाली देवनागरी लिपिमा जवाफ दिनुहोस्।\n"
            "२. छोटो, स्पष्ट र सहयोगी बन्नुहोस्।\n"
            "३. कुनै पनि मार्कडाउन (bold, italic) प्रयोग नगर्नुहोस्। केबल सादा पाठ प्रयोग गर्नुहोस्।"
        )
        
        self.PROMPT_QA_EN = (
            "You are a health assistant. Reply only in English. No Nepali or Romanized Nepali. "
            "Answer only from provided context. Add medical disclaimer at the end. "
            "STRICT RULE: Do NOT use any Markdown (no bold **, no italic *, no headers #, no lists). Use ONLY plain text."
        )
        self.PROMPT_GENERAL_EN = (
            "You are Swastha Sathi, a friendly assistant.\n"
            "Strict rules:\n"
            "1. Reply ONLY in plain English. No Nepali, no Romanized Nepali.\n"
            "2. NEVER use Markdown (no **, no *, no #). Use only plain text.\n"
            "3. Never assume the user is sick unless explicitly stated.\n"
            "Example:\n"
            "User: I am fine\n"
            "Assistant: Great to hear! How can I help you today?"
        )

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

    async def run_chat_stream(self, user_id, message, history=None):
        # Save user message
        await self._save_chat(user_id, "user", message)
        
        # Run detection and classification in parallel
        lang_task = asyncio.create_task(llm_service.detect_language(message))
        intent_task = asyncio.create_task(router_service.classify(message))
        
        lang = await lang_task
        intent = await intent_task
        
        # --- MEDICINE QUERY ---
        if intent == "MEDICINE_QUERY":
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM medicines WHERE user_id = ?", (user_id,))
                rows = cursor.fetchall()
                conn.close()
                meds = [{"name": r["name"], "dosage": r["dosage"], "schedule": json.loads(r["schedule"])} for r in rows]
                
                if meds:
                    res = ("यहाँ तपाईंका औषधिहरू छन्:\n" if lang == "ne" else "Here are your medicines:\n") + "\n".join([f"- **{m['name']}** ({m['dosage']}) - {', '.join([s['time'] for s in m['schedule']])}" for m in meds])
                else:
                    res = "तपाईंले अहिलेसम्म कुनै औषधि थप्नुभएको छैन।" if lang == "ne" else "You haven't added any medicines yet."
                
                full_res = ""
                for word in res.split():
                    full_res += word + " "
                    yield word + " "
                    await asyncio.sleep(0.01)
                
                await self._save_chat(user_id, "assistant", full_res.strip())
                return
            except:
                yield "Error accessing records."
                return

        # --- HEALTH QA (RAG) ---
        elif intent == "HEALTH_QA":
            relevant_chunks = rag_service.retrieve(message)
            if not relevant_chunks:
                res = "माफ गर्नुहोस्, मसँग जानकारी छैन।" if lang == "ne" else "Sorry, I don't have that info."
                yield res
                await self._save_chat(user_id, "assistant", res)
                return
            
            raw_context = "\n\n".join([c["content"] for c in relevant_chunks])
            context = "\n".join([line.strip() for line in raw_context.split('\n') if not line.strip().startswith('प्र:')])
            system_prompt = self.PROMPT_QA_NE if lang == "ne" else self.PROMPT_QA_EN
            prompt = f"{context}\n\n{message}"
            
            full_reply = ""
            async for chunk in llm_service.chat_stream([{"role": "user", "content": prompt}], system_prompt=system_prompt):
                full_reply += chunk
                yield chunk
            await self._save_chat(user_id, "assistant", full_reply)

        # --- OBJECT QUERY ---
        elif intent == "OBJECT_QUERY":
            obj_name_prompt = f"Identify object name from: \"{message}\". Reply ONLY with name."
            obj_name_raw = (await llm_service.generate_response(obj_name_prompt, num_predict=20)).strip().lower()
            obj_name = obj_name_raw.split('\n')[0].split(':')[-1].strip().rstrip('.')
            
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM objects WHERE user_id = ? AND name LIKE ? ORDER BY time DESC LIMIT 1", (user_id, f"%{obj_name}%"))
                row = cursor.fetchone()
                conn.close()
                if row:
                    res = f"भेटियो: **{obj_name}** **{row['location']}** मा छ।" if lang == "ne" else f"Found it: **{obj_name}** is at **{row['location']}**."
                else:
                    res = f"माफ गर्नुहोस्, **{obj_name}** को रेकर्ड छैन।" if lang == "ne" else f"Sorry, no record of **{obj_name}**."
                yield res
                await self._save_chat(user_id, "assistant", res)
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
                    conn.execute("INSERT INTO objects (user_id, name, location) VALUES (?, ?, ?)", (user_id, name, loc))
                    conn.commit()
                    conn.close()
                    res = f"बचत भयो: **{name}** **{loc}** मा।" if lang == "ne" else f"Saved: **{name}** at **{loc}**."
                    yield res
                    await self._save_chat(user_id, "assistant", res)
                except: yield "Save failed."
            else: yield "Extraction failed."
            return

        # --- GENERAL ---
        else:
            system_prompt = self.PROMPT_GENERAL_NE if lang == "ne" else self.PROMPT_GENERAL_EN
            chat_messages = history or []
            chat_messages.append({"role": "user", "content": message})
            
            full_reply = ""
            async for chunk in llm_service.chat_stream(chat_messages, system_prompt=system_prompt):
                full_reply += chunk
                yield chunk
            await self._save_chat(user_id, "assistant", full_reply)

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
