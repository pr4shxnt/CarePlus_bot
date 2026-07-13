import asyncio
import httpx
import os
import logging
import uuid
from datetime import datetime, time
from ..database.db import get_db

logger = logging.getLogger("careplus.sync")

SERVER_URL = os.getenv("CENTRAL_SERVER_URL", "https://q4n8mbr4-4000.inc1.devtunnels.ms")
PATIENT_ID = os.getenv("PATIENT_ID", "664f1234567890abcdef1234") # MongoDB _id

def format_iso(ts_str):
    """Ensures a timestamp string is in valid ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)."""
    if not ts_str:
        return datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    # Replace space with T and ensure it ends with Z
    iso_ts = ts_str.replace(" ", "T")
    if "T" not in iso_ts: # Handle date-only if needed
        iso_ts += "T00:00:00"
    if not iso_ts.endswith("Z") and "+" not in iso_ts:
        iso_ts += "Z"
    return iso_ts

async def sync_history():
    """Syncs chat history to the central server, ensuring sessions are fully updated."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # 1. Identify all sessions that have at least one unsynced message OR unsynced analysis event
        cursor.execute("SELECT DISTINCT session_id FROM chat_history WHERE is_synced = 0")
        sessions_to_update = [row["session_id"] for row in cursor.fetchall()]
        
        if not sessions_to_update:
            conn.close()
            return

        async with httpx.AsyncClient() as client:
            headers = {"X-Bot-Api-Key": os.getenv("BOT_API_KEY", "CHANGE_THIS_TO_A_RANDOM_BOT_KEY")}
            
            for session_id in sessions_to_update:
                # 2. Fetch the FULL history
                cursor.execute("SELECT * FROM chat_history WHERE session_id = ? ORDER BY timestamp ASC", (session_id,))
                full_history = cursor.fetchall()
                
                # 3. Fetch mood logs for this session
                cursor.execute("SELECT * FROM mood_logs WHERE session_id = ?", (session_id,))
                mood_rows = cursor.fetchall()
                
                # 4. Fetch medicine logs for this session
                cursor.execute("SELECT * FROM medicine_logs WHERE session_id = ?", (session_id,))
                med_rows = cursor.fetchall()

                # Build analysis events
                analyses = []
                for m in mood_rows:
                    analyses.append({
                        "mood": m["mood"],
                        "mood_intensity": m["intensity"],
                        "medicine_log": [],
                        "forgotten_items": []
                    })
                
                # Link medicines to analyses (or just list them)
                med_list = [{"name": r["medicine_name"], "status": r["status"]} for r in med_rows]
                if med_list:
                    if not analyses:
                        analyses.append({"mood": "unknown", "mood_intensity": 5, "medicine_log": med_list, "forgotten_items": []})
                    else:
                        # Append meds to the last mood entry for simplicity
                        analyses[-1]["medicine_log"] = med_list

                payload = {
                    "patientId": PATIENT_ID,
                    "sessionId": session_id,
                    "startedAt": format_iso(full_history[0]["timestamp"]),
                    "endedAt": format_iso(full_history[-1]["timestamp"]),
                    "durationSeconds": 0,
                    "turns": [{"role": "user" if h["role"] == "user" else "assistant", "content": h["content"]} for h in full_history],
                    "analyses": analyses
                }
                
                response = await client.post(f"{SERVER_URL}/api/bot/sync", json=payload, headers=headers)
                
                if response.status_code in [200, 201]:
                    cursor.execute("UPDATE chat_history SET is_synced = 1 WHERE session_id = ?", (session_id,))
                    cursor.execute("UPDATE mood_logs SET is_synced = 1 WHERE session_id = ?", (session_id,))
                    cursor.execute("UPDATE medicine_logs SET is_synced = 1 WHERE session_id = ?", (session_id,))
                    conn.commit()
                    logger.info(f"Fully synced local data for session {session_id} ({len(full_history)} turns) for patient {PATIENT_ID}")
                else:
                    logger.error(f"Failed to sync session {session_id}: {response.text}")
                
                await asyncio.sleep(0.2)

        conn.close()
    except Exception as e:
        logger.error(f"History sync error: {e}")


def prune_local_data():
    """Prunes local chat history, mood logs, and medicine logs older than 7 days to prevent unbounded DB growth."""
    try:
        conn = get_db()
        conn.execute("DELETE FROM chat_history WHERE timestamp < datetime('now', '-7 days')")
        conn.execute("DELETE FROM mood_logs WHERE timestamp < datetime('now', '-7 days')")
        conn.execute("DELETE FROM medicine_logs WHERE timestamp < datetime('now', '-7 days')")
        conn.commit()
        conn.close()
        logger.info("Pruned local database records older than 7 days.")
    except Exception as e:
        logger.error(f"Error pruning local data: {e}")


async def sync_medicine_logs():
    """Syncs unsynced medicine intake logs to the central server (Legacy endpoint support)."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM medicine_logs WHERE is_synced = 0")
        rows = cursor.fetchall()

        if not rows:
            conn.close()
            return

        # Group by user_id for batch syncing
        user_logs = {}
        for row in rows:
            uid = row["user_id"]
            if uid not in user_logs:
                user_logs[uid] = []
            user_logs[uid].append({
                "id": row["id"],
                "medicineName": row["medicine_name"],
                "dosage": row["dosage"] or "",
                "scheduledTime": row["scheduled_time"] or "",
                "takenAt": format_iso(row["taken_at"]),
                "status": row["status"],
            })

        async with httpx.AsyncClient() as client:
            for user_id, logs in user_logs.items():
                payload = {"userId": user_id, "logs": logs}
                response = await client.post(f"{SERVER_URL}/api/medicine/log", json=payload)

                if response.status_code == 200:
                    ids = [item["id"] for item in logs]
                    cursor.execute(
                        f"UPDATE medicine_logs SET is_synced = 1 WHERE id IN ({','.join(['?'] * len(ids))})",
                        ids,
                    )
                    conn.commit()
                    logger.info(f"Synced {len(ids)} medicine logs for user {user_id}")
                else:
                    logger.error(f"Failed to sync medicine logs for user {user_id}: {response.text}")

        conn.close()
    except Exception as e:
        logger.error(f"Medicine sync error: {e}")


import json

async def pull_configuration():
    """Fetches the latest patient configuration (medicines, info) from the server."""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "X-Bot-Api-Key": os.getenv("BOT_API_KEY", "CHANGE_THIS_TO_A_RANDOM_BOT_KEY"),
                "X-Patient-Id": PATIENT_ID
            }
            response = await client.get(f"{SERVER_URL}/api/bot/config", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    config = data["data"]
                    medicines = config.get("medicines", [])
                    name = config.get("name", "")
                    conditions = config.get("conditions", [])
                    
                    conn = get_db()
                    # Refresh medicines
                    conn.execute("DELETE FROM medicines WHERE user_id = ?", (PATIENT_ID,))
                    for med in medicines:
                        conn.execute(
                            "INSERT INTO medicines (user_id, name, dosage, schedule) VALUES (?, ?, ?, ?)",
                            (PATIENT_ID, med["name"], med["dosage"], json.dumps([{"time": t} for t in med.get("times", [])]))
                        )
                    
                    # Update patient profile
                    conn.execute(
                        "INSERT OR REPLACE INTO patient_profile (user_id, name, conditions) VALUES (?, ?, ?)",
                        (PATIENT_ID, name, json.dumps(conditions))
                    )
                    conn.commit()
                    conn.close()
                    logger.info(f"Pulled and updated {len(medicines)} medicines and patient profile from server.")
                else:
                    logger.error(f"Failed to parse config response: {data.get('error')}")
            else:
                logger.error(f"Failed to fetch config: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Config pull error: {e}")

async def push_daily_summary():
    """Aggregates all of today's activity into a final 'Daily Summary' session at 11 PM."""
    try:
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).strftime("%Y-%m-%d %H:%M:%S")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Gather ALL messages from today
        cursor.execute("SELECT * FROM chat_history WHERE timestamp >= ? ORDER BY timestamp ASC", (today_start,))
        all_history = cursor.fetchall()
        
        if not all_history:
            conn.close()
            return

        # Gather ALL mood and medicine logs from today
        cursor.execute("SELECT * FROM mood_logs WHERE timestamp >= ?", (today_start,))
        all_moods = cursor.fetchall()
        
        cursor.execute("SELECT * FROM medicine_logs WHERE timestamp >= ?", (today_start,))
        all_meds = cursor.fetchall()

        # Create a unique ID for the daily summary session
        daily_session_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"daily-{PATIENT_ID}-{datetime.now().strftime('%Y-%m-%d')}"))
        
        analyses = []
        for m in all_moods:
            analyses.append({
                "mood": m["mood"],
                "mood_intensity": m["intensity"],
                "medicine_log": [],
                "forgotten_items": []
            })
        
        med_list = [{"name": r["medicine_name"], "status": r["status"]} for r in all_meds]
        if med_list:
            if not analyses:
                analyses.append({"mood": "Summary", "mood_intensity": 5, "medicine_log": med_list, "forgotten_items": []})
            else:
                analyses[-1]["medicine_log"] = med_list

        payload = {
            "patientId": PATIENT_ID,
            "sessionId": daily_session_id,
            "startedAt": format_iso(all_history[0]["timestamp"]),
            "endedAt": format_iso(all_history[-1]["timestamp"]),
            "durationSeconds": 0,
            "turns": [{"role": "user" if h["role"] == "user" else "assistant", "content": h["content"]} for h in all_history],
            "analyses": analyses
        }

        async with httpx.AsyncClient() as client:
            headers = {"X-Bot-Api-Key": os.getenv("BOT_API_KEY", "CHANGE_THIS_TO_A_RANDOM_BOT_KEY")}
            response = await client.post(f"{SERVER_URL}/api/bot/sync", json=payload, headers=headers)
            if response.status_code in [200, 201]:
                logger.info(f"Daily summary pushed successfully for {today_start.split()[0]}")
            else:
                logger.error(f"Failed to push daily summary: {response.text}")
                
        conn.close()
    except Exception as e:
        logger.error(f"Daily summary error: {e}")

async def sync_scheduler():
    """Background task to run high-frequency synchronization and daily reports."""
    from .agent import swastha_agent # Avoid circular import
    
    # Run an initial pull on startup
    await pull_configuration()
    
    last_config_pull = datetime.now()
    last_daily_push_date = ""
    
    while True:
        try:
            now = datetime.now()
            today_str = now.strftime("%Y-%m-%d")
            
            # 1. Every Minute: Push History and Logs
            if not swastha_agent.is_active(threshold=10):
                await sync_history()
                await sync_medicine_logs()
                prune_local_data()
            
            # 2. Every Hour: Pull Configuration
            if (now - last_config_pull).total_seconds() >= 3600:
                await pull_configuration()
                last_config_pull = now
                
            # 3. Daily at 11 PM (23:00): Push Daily Summary
            if now.hour == 23 and last_daily_push_date != today_str:
                logger.info("11 PM reached. Generating daily report...")
                await push_daily_summary()
                last_daily_push_date = today_str
                
        except Exception as e:
            logger.error(f"Sync loop error: {e}")
            
        # Wait 60 seconds before next iteration
        await asyncio.sleep(60)

def start_sync_worker():
    asyncio.create_task(sync_scheduler())
