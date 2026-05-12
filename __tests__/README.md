# CarePlus System Tests

This directory contains end-to-end integration tests for the entire CarePlus ecosystem.

## 🧪 System Integration Test (`system_integration_test.py`)

This test verifies the data flow between the Local AI Bot (`bot_1`) and the Backend Orchestrator (`server`).

### Prerequisites

1.  **Start the Local Bot**:
    ```bash
    cd hardwares/bot_1
    python main.py
    ```
2.  **Start the Central Server**:
    ```bash
    cd server
    PORT=3001 bun run dev
    ```

### Running the Test

```bash
python3 __tests__/system_integration_test.py
```

### What it tests:
- **Chat Processing**: Sends a message to `bot_1`.
- **Local Persistence**: Bot saves the chat to its SQLite database, generating a unique `sessionId` locally.
- **Data Sync**: Triggers the sync mechanism to push local history to the server.
    - *Note: Automatic sync only happens at midnight when the bot has been inactive for at least 10 minutes.*
- **Cloud Persistence**: Verifies the server successfully received and stored the history in MongoDB.
- **API Availability**: Ensures the history can be retrieved via the server's history API.
