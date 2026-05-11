# CarePlus Innovation Project

CarePlus is an AI-powered Carebot system designed to assist people suffering from dementia. It provides loneliness companionship, mood tracking, agentic medicine/object tracking, and voice-based interaction.

This project was developed for the Semester 2 Innovation Project at Sunway College Kathmandu.

## 🏗 Project Architecture

The project is structured as a monorepo:

- **Unified AI Server (`hardwares/bot_1/`)**: The core FastAPI engine handling local AI (Gemma), RAG (Knowledge Base), and Piper TTS.
- **Backend Orchestrator (`server/`)**: A Bun-based TypeScript server for user management and cloud data persistence.
- **Mobile Application (`application/`)**: A React Native application for reminders and notifications.
- **Web Dashboard (`client/`)**: A Next.js application for remote monitoring and management.

---

## 💻 New Computer Setup Guide

Follow these instructions to set up the entire development environment.

### 1. Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v22.11.0 or higher
- **Bun**: Latest version (`curl -fsSL https://bun.sh/install | bash`)
- **Python**: v3.10 or higher
- **Ollama**: For running local LLMs ([ollama.com](https://ollama.com))
- **MongoDB**: Local instance or MongoDB Atlas URI
- **Git**

---

### 2. Local AI Setup (Ollama)

CarePlus relies on Ollama for local, private AI processing.

1.  **Install Ollama** and ensure it's running (`ollama serve`).
2.  **Pull the Model**:
    ```bash
    ollama pull gemma4:e2b
    ```
    *Note: The code defaults to `gemma4:e2b`. If you use a different model, update `hardwares/bot_1/app/services/llm.py`.*

---

### 3. Unified AI Server Setup (Python)

This server handles the voice interface, TTS, and AI logic.

1.  **Navigate to the directory**:
    ```bash
    cd hardwares/bot_1
    ```
2.  **Create and activate a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4. **Piper TTS Setup**:
    Piper is **required** for the Carebot to speak. You can install it in two ways:
    - **Option A (Easy)**: Install via pip:
      ```bash
      pip install piper-tts
      ```
    - **Option B (Binary)**: Download the standalone binary from [Piper GitHub](https://github.com/rhasspy/piper), extract it, and ensure the `piper` executable is in your system PATH or set the `PIPER_BIN` environment variable.

    *The required Nepali voice models are already included in `hardwares/bot_1/models/`.*
5.  **Initialize Database**:
    ```bash
    python -m app.database.db
    ```
6.  **Run the Server**:
    ```bash
    python main.py
    ```
    The server will be available at `http://localhost:3000`.

---

### 4. Backend Orchestrator Setup (Bun)

This service manages users and connects to MongoDB.

1.  **Navigate to the directory**:
    ```bash
    cd server
    ```
2.  **Install dependencies**:
    ```bash
    bun install
    ```
3.  **Environment Variables**:
    Create a `.env` file or set:
    ```bash
    export MONGO_URI="mongodb://localhost:27017/careplus"
    export PORT=3001
    ```
4.  **Run the Server**:
    ```bash
    bun run dev
    ```

---

### 5. Mobile Application Setup (React Native)

1.  **Navigate to the directory**:
    ```bash
    cd application
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the App**:
    - **Android**: `npm run android` (Requires Android Studio and Emulator)
    - **iOS**: `bundle install && cd ios && pod install && cd .. && npm run ios` (Requires macOS and Xcode)

---

### 6. Web Dashboard Setup (Next.js)

1.  **Navigate to the directory**:
    ```bash
    cd client
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the Client**:
    ```bash
    npm run dev -- -p 3002
    ```

---

## 🛠 Tech Stack Summary

| Component | Technology |
| :--- | :--- |
| **AI / LLM** | Ollama (Gemma), RAG |
| **Speech** | Web Speech API (STT), Piper (TTS) |
| **Core API** | FastAPI (Python 3.10+) |
| **Orchestrator** | Bun, TypeScript |
| **Mobile** | React Native |
| **Frontend** | Next.js, Vanilla JS/CSS |
| **Database** | SQLite (Local), MongoDB (Cloud) |

## 📜 License

Project developed for Sunway College Kathmandu. All rights reserved.
