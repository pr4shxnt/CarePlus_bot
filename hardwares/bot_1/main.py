from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, List
import base64
import tempfile
import os
import shutil
import logging
import json
import asyncio
from transformers import pipeline
import torch
from app.services.agent import swastha_agent
from app.database.db import init_db, get_db
from app.services.sync import start_sync_worker
from app.services.tts_service import synthesize_speech
from app.services.tts_queue import TtsQueue, TtsJob
from app.services.text_utils import split_sentences

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("careplus")

app = FastAPI(title="CarePlus Unified Server")

class PatientUpdate(BaseModel):
    type: str
    patientId: str
    medicines: List[dict]

@app.post("/api/update")
async def update_records(request: Request, update: PatientUpdate):
    """Endpoint for central server to push updates to the bot."""
    # Security check
    api_key = request.headers.get("X-Bot-Api-Key")
    if not api_key or api_key != os.getenv("BOT_API_KEY", "CHANGE_THIS_TO_A_RANDOM_BOT_KEY"):
        raise HTTPException(status_code=401, detail="Invalid bot API key")

    if update.type == "PATIENT_UPDATE":
        conn = None
        try:
            conn = get_db()
            # Clear old medicines for this patient and add new ones
            conn.execute("DELETE FROM medicines WHERE user_id = ?", (update.patientId,))
            for med in update.medicines:
                conn.execute(
                    "INSERT INTO medicines (user_id, name, dosage, schedule) VALUES (?, ?, ?, ?)",
                    (update.patientId, med["name"], med["dosage"], json.dumps([{"time": t} for t in med.get("times", [])]))
                )
            conn.commit()
            logger.info(f"Updated {len(update.medicines)} medicines for patient {update.patientId}")
            return {"success": True}
        except Exception as e:
            logger.error(f"Failed to update medicines: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if conn:
                conn.close()
    return {"success": False, "message": "Unknown update type"}

asr_pipeline = None

@app.on_event("startup")
async def startup_event():
    init_db()
    start_sync_worker()
    global asr_pipeline
    try:
        model_path = Path(__file__).resolve().parent / "models" / "whisper-small-nepali"
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        asr_pipeline = pipeline("automatic-speech-recognition", model=str(model_path), device=device)
        logger.info("Whisper model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

class TtsRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    userId: str
    message: str
    history: list = []

class MedicineLogEntry(BaseModel):
    medicineName: str
    dosage: Optional[str] = ""
    scheduledTime: Optional[str] = ""
    takenAt: Optional[str] = None
    status: Optional[str] = "taken"

class MedicineLogRequest(BaseModel):
    userId: str
    logs: List[MedicineLogEntry]

@app.get("/health")
async def health():
    return {"ok": True, "server": "CarePlus Unified"}

@app.post("/api/sync/now")
async def trigger_sync():
    """Manual trigger for testing sync."""
    from app.services.sync import sync_history
    await sync_history()
    return {"status": "Sync triggered"}

# WebSocket for streaming chat
@app.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    send_lock = asyncio.Lock()

    async def send_json_safe(payload):
        async with send_lock:
            await websocket.send_json(payload)

    async def tts_worker(tts_queue: TtsQueue):
        # Consumes sentence chunks FIFO and streams synthesized audio back as it's
        # ready, so playback of sentence 1 can start while sentence 2+ still stream.
        while True:
            job = await tts_queue.dequeue()
            if job.text is None:
                break
            try:
                audio_bytes = await synthesize_speech(job.text)
                await send_json_safe({
                    "type": "audio_chunk",
                    "seq": job.seq,
                    "text": job.text,
                    "audio_b64": base64.b64encode(audio_bytes).decode("ascii"),
                })
            except Exception as e:
                logger.error(f"TTS chunk synthesis failed (seq={job.seq}): {e}")
                await send_json_safe({"type": "audio_chunk_error", "seq": job.seq, "detail": str(e)})

    try:
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)
            user_id = request.get("userId", "web-user")
            message = request.get("message", "")
            history = request.get("history", [])

            if not message:
                continue

            tts_queue = TtsQueue()
            worker_task = asyncio.create_task(tts_worker(tts_queue))
            next_seq = 0

            full_reply = ""
            buffer = ""
            try:
                async for chunk in swastha_agent.run_chat_stream(user_id, message, history):
                    full_reply += chunk
                    buffer += chunk
                    await send_json_safe({"type": "token", "content": chunk})

                    sentences, buffer = split_sentences(buffer)
                    for sentence in sentences:
                        tts_queue.enqueue(TtsJob(seq=next_seq, text=sentence))
                        next_seq += 1

                leftover = buffer.strip()
                if leftover:
                    tts_queue.enqueue(TtsJob(seq=next_seq, text=leftover))
                    next_seq += 1
            finally:
                # Sentinel tells the worker to stop once it drains what's queued.
                tts_queue.enqueue(TtsJob(seq=-1, text=None))
                await worker_task

            await send_json_safe({"type": "done", "full_reply": full_reply, "total_audio_chunks": next_seq})

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await send_json_safe({"type": "error", "content": str(e)})

# Legacy AI Agent Endpoints (refactored to be async)
@app.post("/api/chat/agent")
async def agent_chat_endpoint(request: ChatRequest):
    if not request.userId or not request.message:
        raise HTTPException(status_code=400, detail="userId and message are required")
        
    response_gen = swastha_agent.run_chat_stream(request.userId, request.message, request.history)
    full_reply = ""
    async for chunk in response_gen:
        full_reply += chunk
    return {"reply": full_reply}

@app.post("/api/report")
async def report_endpoint(request: Request):
    data = await request.json()
    user_id = data.get("userId") or request.query_params.get("userId", "")
    history = data.get("history", [])
    
    if not user_id:
        raise HTTPException(status_code=400, detail="userId is required")
        
    result = await swastha_agent.generate_report(user_id, history)
    return result

@app.post("/api/medicine/log")
async def log_medicine_endpoint(request: MedicineLogRequest):
    """Log medicine intake events (taken, missed, skipped)."""
    if not request.userId or not request.logs:
        raise HTTPException(status_code=400, detail="userId and logs are required")
    
    conn = None
    try:
        conn = get_db()
        for entry in request.logs:
            conn.execute(
                "INSERT INTO medicine_logs (user_id, medicine_name, dosage, scheduled_time, taken_at, status) VALUES (?, ?, ?, ?, ?, ?)",
                (request.userId, entry.medicineName, entry.dosage, entry.scheduledTime, entry.takenAt, entry.status),
            )
        conn.commit()
        return {"success": True, "count": len(request.logs)}
    except Exception as e:
        logger.error(f"Medicine log error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# TTS Endpoint (refactored to be async)
@app.post("/tts")
async def tts(request: TtsRequest):
    try:
        audio_bytes = await synthesize_speech(request.text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return Response(content=audio_bytes, media_type="audio/wav")

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    if asr_pipeline is None:
        raise HTTPException(status_code=500, detail="Speech model is not loaded yet")
    suffix = Path(audio.filename or "").suffix or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp_audio:
        shutil.copyfileobj(audio.file, temp_audio)
        temp_path = temp_audio.name
    
    try:
        # Run inference in a thread so it doesn't block asyncio event loop
        def run_inference():
            return asr_pipeline(temp_path)
            
        result = await asyncio.to_thread(run_inference)
        transcript = result.get("text", "")
        return {"text": transcript.strip()}
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(temp_path)

# Serve static assets (js, css, etc.) from /public
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "public")), name="static_assets")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    fav = BASE_DIR / "public" / "favicon.ico"
    return FileResponse(str(fav)) if fav.exists() else Response(status_code=204)

# Catch-all: serve index.html for the root and any unmatched GET
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    # If a real file exists in public/, serve it directly
    target = BASE_DIR / "public" / full_path
    if target.is_file():
        return FileResponse(str(target))
    # Otherwise fall back to index.html (SPA behaviour)
    return FileResponse(str(BASE_DIR / "public" / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
