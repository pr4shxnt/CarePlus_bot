import os
import re

class RAGService:
    def __init__(self, kb_dir="data/kb"):
        self.kb_dir = kb_dir
        self.chunks = []
        self._load_chunks()

    def _load_chunks(self):
        if not os.path.exists(self.kb_dir):
            return
            
        for filename in os.listdir(self.kb_dir):
            if filename.endswith(".txt"):
                with open(os.path.join(self.kb_dir, filename), "r", encoding="utf-8") as f:
                    content = f.read()
                    # Improved chunking: Keep Q&A together by splitting on the section separators
                    file_chunks = re.split(r'────────────────────────────────────|════════════════════════════════════', content)
                    for chunk in file_chunks:
                        if chunk.strip():
                            self.chunks.append({
                                "content": chunk.strip(),
                                "source": filename
                            })

    def retrieve(self, query, top_k=3):
        # Enhanced keyword matching: stop words and weighting
        stop_words = [
            "is", "the", "a", "an", "on", "in", "my", "me", "how", "what", "where",
            "छ", "छन्", "हो", "होइन", "मेरो", "मैले", "के", "कसरी", "कता", "कहाँ", "अनि", "र", "वा",
            "त", "नै", "पनि", "तपाईं", "तपाई", "हजुर", "तिमी"
        ]
        
        raw_keywords = query.lower().split()
        keywords = [kw.strip('.,?!()') for kw in raw_keywords if kw not in stop_words]
        
        # If all words were stop words, use raw keywords
        if not keywords:
            keywords = raw_keywords

        # Total possible weight if every keyword matched — used below to require a
        # chunk cover a meaningful share of the query, not just one incidental word
        # (e.g. a mundane "mild headache" mention matching a KB entry about
        # concussions purely because both contain the word "head").
        total_weight = sum(len(kw) * 1.5 for kw in keywords)

        scored_chunks = []
        for chunk in self.chunks:
            score = 0
            matched = 0
            content_lower = chunk["content"].lower()
            # Clean punctuation to get exact words for short keywords
            chunk_words = set(re.sub(r'[.,?!()\'"“”\n\-\—\_]', ' ', content_lower).split())

            for kw in keywords:
                if len(kw) >= 3:
                    if kw in content_lower:
                        # Higher weight for longer words
                        score += (len(kw) * 1.5)
                        matched += 1
                else:
                    if kw in chunk_words:
                        score += (len(kw) * 1.5)
                        matched += 1
            if score > 0:
                scored_chunks.append((score, matched, chunk))

        # Sort by score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        # Require the chunk to cover a real share of the query's keywords, not just
        # one coincidental overlap — avoids dragging in an unrelated (and often more
        # severe-sounding) KB entry off a single shared word.
        min_ratio = 0.34
        results = [
            chunk for score, matched, chunk in scored_chunks
            if score > 0 and (total_weight == 0 or (score / total_weight) >= min_ratio) and matched >= min(2, len(keywords))
        ]
        return results[:top_k]

rag_service = RAGService()
