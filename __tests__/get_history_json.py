import requests
import json
import sys

def get_history(user_id, session_id=None, server_url="http://localhost:3000"):
    try:
        url = f"{server_url}/api/history?userId={user_id}"
        if session_id:
            url += f"&sessionId={session_id}"
        
        print(f"Fetching history from: {url}")
        
        response = requests.get(url)
        response.raise_for_status()
        
        history = response.json()
        
        print("\n--- Chat History (JSON) ---")
        print(json.dumps(history, indent=2))
        print("---------------------------\n")
        
        print(f"Total messages: {len(history)}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
    except json.JSONDecodeError:
        print("Error: Failed to parse response as JSON")

def list_sessions(user_id, server_url="http://localhost:3000"):
    try:
        url = f"{server_url}/api/history/sessions?userId={user_id}"
        print(f"Fetching sessions from: {url}")
        response = requests.get(url)
        response.raise_for_status()
        sessions = response.json()
        print("\n--- Chat Sessions ---")
        print(json.dumps(sessions, indent=2))
        print("----------------------\n")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--sessions":
        uid = sys.argv[2] if len(sys.argv) > 2 else "system-test-user"
        list_sessions(uid)
    else:
        uid = sys.argv[1] if len(sys.argv) > 1 else "system-test-user"
        sid = sys.argv[2] if len(sys.argv) > 2 else None
        get_history(uid, sid)
