from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import subprocess
import tempfile
import os
import shutil
import logging
import json
import asyncio
from app.services.agent import swastha_agent
from app.database.db import init_db

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("careplus")

app = FastAPI(title="CarePlus Unified Server")

# Initialize database
init_db()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Piper TTS configuration
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = BASE_DIR / "models" / "ne_NP-chitwan-medium.onnx"
DEFAULT_CONFIG = BASE_DIR / "models" / "ne_NP-chitwan-medium.onnx.json"

MODEL_PATH = Path(os.getenv("PIPER_MODEL", str(DEFAULT_MODEL)))
CONFIG_PATH = Path(os.getenv("PIPER_CONFIG", str(DEFAULT_CONFIG)))

class TtsRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    userId: str
    message: str
    history: list = []

@app.get("/health")
async def health():
    return {"ok": True, "server": "CarePlus Unified"}

# WebSocket for streaming chat
@app.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)
            user_id = request.get("userId", "web-user")
            message = request.get("message", "")
            history = request.get("history", [])

            if not message:
                continue

            full_reply = ""
            async for chunk in swastha_agent.run_chat_stream(user_id, message, history):
                full_reply += chunk
                await websocket.send_json({"type": "token", "content": chunk})
            
            await websocket.send_json({"type": "done", "full_reply": full_reply})
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.send_json({"type": "error", "content": str(e)})

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

# TTS Endpoint (refactored to be async)
@app.post("/tts")
async def tts(request: TtsRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text for TTS cannot be empty")

    if not MODEL_PATH.exists() or not CONFIG_PATH.exists():
        raise HTTPException(status_code=500, detail="Piper model/config not found")

    # Priority logic for finding the piper executable
    piper_env = os.getenv("PIPER_BIN")
    piper_venv_python = Path(__file__).resolve().parents[1] / "piperapi" / "tts-env" / "bin" / "python"
    
    if piper_env and Path(piper_env).exists():
        piper_cmd = [piper_env]
    elif piper_venv_python.exists():
        # Use python -m piper to bypass broken shebangs in moved venvs
        piper_cmd = [str(piper_venv_python), "-m", "piper"]
    else:
        piper_path = shutil.which("piper")
        if piper_path:
            piper_cmd = [piper_path]
        else:
            raise HTTPException(status_code=500, detail="Piper executable not found.")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
        output_path = Path(temp_audio.name)

    try:
        def run_piper():
            full_cmd = piper_cmd + [
                "--model", str(MODEL_PATH),
                "--config", str(CONFIG_PATH),
                "--output_file", str(output_path),
            ]
            return subprocess.run(
                full_cmd,
                input=request.text,
                capture_output=True,
                text=True,
                check=True,
            )
        
        await asyncio.to_thread(run_piper)
    except subprocess.CalledProcessError as exc:
        logger.error(f"Piper failed: {exc.stderr}")
        output_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Piper failed: {exc.stderr}")
    except Exception as exc:
        logger.exception("Piper CLI failed")
        output_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Piper error: {str(exc)}")

    return FileResponse(path=str(output_path), media_type="audio/wav", filename="tts.wav")

app.mount("/", StaticFiles(directory=str(BASE_DIR / "public"), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
