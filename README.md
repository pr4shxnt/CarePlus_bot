# CarePlus Innovation Project

Welcome to the most ambitious dementia care assistant ever built in a student project. CarePlus is an AI-powered companion that blends emotional support, practical reminders, medication tracking, and natural voice interaction into one intelligent system.

This solution was created for the Semester 2 Innovation Project at Sunway College Kathmandu.

## 🚀 Project Architecture

This repo is a powerful monorepo containing four major systems:

- **Unified AI Server (`hardwares/bot_1/`)**: The brain of the operation. A FastAPI-based engine that runs local AI with Gemma, manages a knowledge retrieval system, and powers speech via Piper TTS.
- **Backend Orchestrator (`server/`)**: A modern Bun + TypeScript backend that handles user accounts, data sync, and cloud persistence.
- **Mobile App (`application/`)**: A React Native client built for reminders, notifications, and caregiver support on the go.
- **Web Dashboard (`client/`)**: A Next.js control center for remote monitoring, history review, and system oversight.

---

## 💻 One-Click Development Setup

Use this guide to get the entire environment running end-to-end.

### 1. Prerequisites

Install the following before you begin:

- **Node.js**: v22.11.0 or higher
- **Bun**: Latest stable release (`curl -fsSL https://bun.sh/install | bash`)
- **Python**: v3.10 or higher
- **Ollama**: For local LLM inference ([ollama.com](https://ollama.com))
- **MongoDB**: Local instance or MongoDB Atlas URI
- **Git**

---

### 2. Local AI Setup (Ollama)

CarePlus depends on Ollama for private, on-device AI processing.

1.  **Install Ollama** and make sure the daemon is running using `ollama serve`.
2.  **Pull the model**:
    ```bash
    ollama pull gemma4:e2b
    ```
    _If you choose a different model, update the default in `hardwares/bot_1/app/services/llm.py`._

---

### 3. Unified AI Server Setup (Python)

This server is the heart of CarePlus: speech, reasoning, and context management.

1.  **Go to the directory**:
    ```bash
    cd hardwares/bot_1
    ```
2.  **Create and activate a Python virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install the project dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Piper TTS**:
    Piper makes CarePlus speak naturally. Choose one:
    - **Option A (quick install)**:
      ```bash
      pip install piper-tts
      ```
    - **Option B (manual install)**: Download the standalone binary from [Piper GitHub](https://github.com/rhasspy/piper), extract it, and either add `piper` to your PATH or set `PIPER_BIN`.

    _Nepali TTS models are already included in `hardwares/bot_1/models/`._

5.  **Initialize the local database**:
    ```bash
    python -m app.database.db
    ```
6.  **Launch the AI server**:
    ```bash
    python main.py
    ```
    The service will start on `http://localhost:3000`.

---

### 4. Backend Orchestrator Setup (Bun)

The orchestrator coordinates user management and data persistence.

1.  **Change to the server folder**:
    ```bash
    cd server
    ```
2.  **Install Bun dependencies**:
    ```bash
    bun install
    ```
3.  **Set environment variables**:
    ```bash
    export MONGO_URI="mongodb://localhost:27017/careplus"
    export PORT=3001
    ```
4.  **Run the backend**:
    ```bash
    bun run dev
    ```

---

### 5. Mobile Application Setup (React Native)

This app handles reminders, notifications, and mobile caregiver tools.

1.  **Open the application folder**:
    ```bash
    cd application
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the app**:
    - **Android**: `npm run android` (requires Android Studio/emulator)
    - **iOS**: `bundle install && cd ios && pod install && cd .. && npm run ios` (requires macOS/Xcode)

---

### 6. Web Dashboard Setup (Next.js)

This dashboard is the command hub for monitoring and managing CarePlus remotely.

1.  **Enter the dashboard folder**:
    ```bash
    cd client
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the web app**:
    ```bash
    npm run dev -- -p 3002
    ```

---

## 🛠 Tech Stack Summary

| Component        | Technology                        |
| :--------------- | :-------------------------------- |
| **AI / LLM**     | Ollama (Gemma), RAG               |
| **Speech**       | Web Speech API (STT), Piper (TTS) |
| **Core API**     | FastAPI (Python 3.10+)            |
| **Orchestrator** | Bun, TypeScript                   |
| **Mobile**       | React Native                      |
| **Dashboard**    | Next.js                           |
| **Database**     | SQLite (local), MongoDB (cloud)   |

## 📜 License

Built for Sunway College Kathmandu. All rights reserved.
git --version