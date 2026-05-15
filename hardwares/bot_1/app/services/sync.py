import asyncio
import httpx
import os
import logging
from datetime import datetime, time
from ..database.db import get_db

logger = logging.getLogger("careplus.sync")

SERVER_URL = os.getenv("CENTRAL_SERVER_URL", "http://localhost:3000")
BOT_ID = os.getenv("BOT_ID", "bot_1")

async def sync_history():
    """Syncs unsynced chat history to the central server."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chat_history WHERE is_synced = 0")
        rows = cursor.fetchall()
        
        if not rows:
            conn.close()
            return

        # Group by user_id for batch syncing
        user_histories = {}
        for row in rows:
            uid = row["user_id"]
            if uid not in user_histories:
                user_histories[uid] = []
            user_histories[uid].append({
                "id": row["id"],
                "sessionId": row["session_id"],
                "role": row["role"],
                "content": row["content"],
                "timestamp": row["timestamp"]
            })

        async with httpx.AsyncClient() as client:
            for user_id, history in user_histories.items():
                payload = {
                    "userId": user_id,
                    "botId": BOT_ID,
                    "history": history
                }
                response = await client.post(f"{SERVER_URL}/api/history/sync", json=payload)
                
                if response.status_code == 200:
                    ids = [item["id"] for item in history]
                    cursor.execute(f"UPDATE chat_history SET is_synced = 1 WHERE id IN ({','.join(['?']*len(ids))})", ids)
                    conn.commit()
                    logger.info(f"Synced {len(ids)} messages for user {user_id}")
                else:
                    logger.error(f"Failed to sync for user {user_id}: {response.text}")

        conn.close()
    except Exception as e:
        logger.error(f"Sync error: {e}")


async def sync_medicine_logs():
    """Syncs unsynced medicine intake logs to the central server."""
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
                "takenAt": row["taken_at"],
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


async def sync_scheduler():
    """Background task to run sync daily at midnight, only when bot is inactive."""
    from .agent import swastha_agent # Avoid circular import
    
    while True:
        now = datetime.now()
        
        # Check if we are in the midnight window (00:00 to 00:59)
        if now.hour == 0:
            # Check if bot is active (threshold of 10 minutes)
            if not swastha_agent.is_active(threshold=600):
                logger.info("Midnight reached and bot is inactive. Starting sync...")
                await sync_history()
                await sync_medicine_logs()
                # Successfully synced or no data, wait until the hour passes
                # Calculate seconds until 01:00 AM
                sleep_seconds = 3600 - (now.minute * 60 + now.second)
                await asyncio.sleep(sleep_seconds + 5) 
            else:
                logger.info("Midnight reached but bot is active. Retrying in 5 minutes...")
                await asyncio.sleep(300) # Wait 5 minutes and try again while still in 00:xx hour
        else:
            # Not midnight yet, check every 15 minutes
            await asyncio.sleep(900)

def start_sync_worker():
    asyncio.create_task(sync_scheduler())
