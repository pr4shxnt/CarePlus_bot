import json
import httpx
import asyncio

class LLMService:
    def __init__(self, model="gemma4:e2b", base_url="http://localhost:11434"):
        self.model = model
        self.base_url = f"{base_url}/api"
        # Persistent client for connection pooling
        self.client = httpx.AsyncClient(timeout=60.0, limits=httpx.Limits(max_connections=10))

    async def warm_up(self):
        """Pre-loads the model into memory."""
        try:
            await self.client.post(f"{self.base_url}/show", json={"name": self.model})
            # Also send an empty prompt to force load
            await self.client.post(f"{self.base_url}/generate", json={"model": self.model, "prompt": "", "keep_alive": -1})
        except: pass

    async def generate_response(self, prompt, system_prompt=None, model=None, num_predict=512):
        payload = {
            "model": model or self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7, "num_predict": num_predict}
        }
        if system_prompt: payload["system"] = system_prompt
        try:
            response = await self.client.post(f"{self.base_url}/generate", json=payload)
            return response.json().get("response", "")
        except Exception as e:
            return f"Error: {str(e)}"

    async def chat_stream(self, messages, system_prompt=None, model=None, num_predict=512):
        payload = {
            "model": model or self.model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": 0.7, "num_predict": num_predict}
        }
        if system_prompt:
            if not messages or messages[0].get("role") != "system":
                messages.insert(0, {"role": "system", "content": system_prompt})
        
        try:
            async with self.client.stream("POST", f"{self.base_url}/chat", json=payload) as response:
                async for line in response.aiter_lines():
                    if not line: continue
                    chunk = json.loads(line)
                    if "message" in chunk and "content" in chunk["message"]:
                        yield chunk["message"]["content"]
                    if chunk.get("done"): break
        except Exception as e:
            yield f"Error: {str(e)}"

    async def detect_language(self, text):
        import re
        # Immediate check for Devanagari
        if re.search(r'[\u0900-\u097F]', text):
            return "ne"
        
        roman_nepali_keywords = {
            "mero", "tapai", "chha", "xa", "cha", "ko", "ma", "yo", 
            "hunuhuncha", "garnu", "bhayo", "vayo", "kata", "kaha", "ke", "ho", 
            "khoi", "rakheko", "rakhe", "xaina", "chaina", "thik", "thikxa"
        }
        words = set(text.lower().replace('?', ' ').replace('.', ' ').split())
        hits = len(words.intersection(roman_nepali_keywords))
        
        return "ne" if (hits >= 1 and len(words) <= 4) or hits >= 2 else "en"

llm_service = LLMService()
