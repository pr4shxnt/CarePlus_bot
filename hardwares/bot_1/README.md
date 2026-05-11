# CarePlus Unified Server

This is a consolidated FastAPI server that replaces:
1. Express Static Server (Port 3000)
2. FastAPI AI Agent Server (Port 8000)
3. Piper TTS Server (Port 5000)

## Features
- Serves the web interface from `/`
- AI Health Assistant at `/api/chat/agent`
- Health reporting at `/api/report`
- Piper TTS at `/tts`
- Integrated SQLite database for medicines and objects.

## How to run
1. Ensure Ollama is running on port 11434.
2. Install dependencies: `pip install -r requirements.txt`
3. Start the server: `python -m careplus.main`
   (Running from the project root)

## Architecture
- `main.py`: Entry point, combines all routes.
- `app/services`: AI logic, RAG, and LLM services.
- `app/database`: Database connection and initialization.
- `models`: Piper ONNX models.
- `public`: Static web assets.
- `data`: Knowledge base and SQLite database.
