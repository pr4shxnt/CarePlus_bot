import unittest
import requests
import time
import subprocess
import os
import signal

# Configuration
BOT_URL = "http://localhost:5000"
SERVER_URL = "http://localhost:3000"
USER_ID = "system-test-user"

class TestSystemIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # This is a place where we could potentially start the servers
        # but for this environment, we expect them to be running or we mock the flow.
        pass

    def test_end_to_end_history_sync(self):
        """
        Test flow: 
        1. Send chat to Bot
        2. Bot saves locally
        3. Trigger Sync
        4. Server receives data
        5. Client fetches from Server
        """
        # Diagnostic Check
        print("--- Diagnostic Check ---")
        for port in [3000, 5000]:
            try:
                r = requests.get(f"http://localhost:{port}/health", timeout=2)
                data = r.json()
                if "server" in data and "CarePlus Unified" in data["server"]:
                    print(f"Port {port}: CarePlus Bot (bot_1)")
                elif "status" in data and data.get("databaseConnected") is not None:
                    print(f"Port {port}: Central Server (orchestrator)")
                else:
                    print(f"Port {port}: Unknown Service ({data})")
            except Exception as e:
                print(f"Port {port}: Nothing running or error ({e})")
        print("------------------------\n")

        try:
            # 1. Send chat to Bot
            print(f"Sending chat to Bot at {BOT_URL} (this may take a while if LLM is slow)...")
            chat_resp = requests.post(f"{BOT_URL}/api/chat/agent", json={
                "userId": USER_ID,
                "message": "Hello, I have a headache."
            }, timeout=30)
            
            if chat_resp.status_code == 404:
                self.fail(f"Bot returned 404 for /api/chat/agent at {BOT_URL}. "
                          f"Check if the Orchestrator is accidentally running on this port.")
            
            self.assertEqual(chat_resp.status_code, 200, f"Chat failed with status {chat_resp.status_code}: {chat_resp.text}")
            print("Chat successful.")

            # 2. Trigger Sync on Bot
            print("Triggering manual sync on Bot...")
            sync_resp = requests.post(f"{BOT_URL}/api/sync/now", timeout=10)
            self.assertEqual(sync_resp.status_code, 200)
            print("Sync triggered.")

            # 3. Check Server for History
            print(f"Checking history on Server at {SERVER_URL}...")
            hist_resp = requests.get(f"{SERVER_URL}/api/history?userId={USER_ID}", timeout=10)
            self.assertEqual(hist_resp.status_code, 200)
            
            history = hist_resp.json()
            self.assertTrue(isinstance(history, list), "Response should be a JSON array")
            self.assertTrue(len(history) >= 2, "Should have at least user message and bot reply")
            
            # 4. Test Backend-side Filtering (Retrieval Logic)
            print("Testing backend-side filtering (limit=1)...")
            limit_resp = requests.get(f"{SERVER_URL}/api/history?userId={USER_ID}&limit=1", timeout=10)
            self.assertEqual(limit_resp.status_code, 200)
            limit_history = limit_resp.json()
            self.assertEqual(len(limit_history), 1, "Backend should have limited retrieval to 1")
            
            # Verify JSON schema of a message object
            msg = limit_history[0]
            required_keys = ["userId", "sessionId", "role", "content", "timestamp", "botId"]
            for key in required_keys:
                self.assertIn(key, msg, f"JSON message missing key: {key}")
            
            # 5. Verify Session Linking
            print("Checking session linking...")
            sessions_resp = requests.get(f"{SERVER_URL}/api/history/sessions?userId={USER_ID}", timeout=10)
            self.assertEqual(sessions_resp.status_code, 200)
            sessions = sessions_resp.json()
            self.assertTrue(len(sessions) >= 1, "Should have at least one session")
            self.assertIn("_id", sessions[0], "Session object should have _id (sessionId)")
            self.assertIn("messageCount", sessions[0], "Session object should have messageCount")
            
            print("History JSON retrieval, backend filtering, and session linking verified.")

        except requests.exceptions.ConnectionError:
            self.skipTest("Servers not running. Start bot_1 and server to run full system test.")

if __name__ == "__main__":
    unittest.main()
