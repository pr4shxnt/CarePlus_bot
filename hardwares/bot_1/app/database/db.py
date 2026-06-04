import sqlite3
import os
from pathlib import Path

DB_PATH = Path("data/care_plus.db")
OLD_DB_PATH = Path("data/swastha_sathi.db")

def get_db():
    os.makedirs(DB_PATH.parent, exist_ok=True)
    if OLD_DB_PATH.exists() and not DB_PATH.exists():
        try:
            OLD_DB_PATH.rename(DB_PATH)
            print("Renamed old db file swastha_sathi.db to care_plus.db")
        except Exception as e:
            print(f"Failed to rename old database: {e}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Migration: Check if medicines table has user_id
    try:
        cursor.execute("SELECT user_id FROM medicines LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating medicines table: dropping old version.")
        cursor.execute("DROP TABLE IF EXISTS medicines")

    # Migration: Check if mood_logs table has user_id
    try:
        cursor.execute("SELECT user_id FROM mood_logs LIMIT 1")
    except sqlite3.OperationalError:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='mood_logs'")
        if cursor.fetchone():
            print("Migrating mood_logs table: dropping old version to align with user_id schema.")
            cursor.execute("DROP TABLE IF EXISTS mood_logs")

    # Migration: Check if session_id exists in other tables
    for table in ['chat_history', 'medicine_logs', 'mood_logs']:
        try:
            cursor.execute(f"SELECT session_id FROM {table} LIMIT 1")
        except sqlite3.OperationalError:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                print(f"Migrating {table} table: adding session_id column.")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN session_id TEXT")
        
        try:
            cursor.execute(f"SELECT is_synced FROM {table} LIMIT 1")
        except sqlite3.OperationalError:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                print(f"Migrating {table} table: adding is_synced column.")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN is_synced INTEGER DEFAULT 0")
    
    # Medicines table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT,
        schedule TEXT
    )
    ''')
    
    # Objects table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Chat history table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        session_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_synced INTEGER DEFAULT 0
    )
    ''')

    # Medicine intake logs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS medicine_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        session_id TEXT,
        medicine_name TEXT NOT NULL,
        dosage TEXT DEFAULT '',
        scheduled_time TEXT DEFAULT '',
        taken_at TIMESTAMP,
        status TEXT DEFAULT 'taken' CHECK(status IN ('taken', 'missed', 'skipped')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_synced INTEGER DEFAULT 0
    )
    ''')

    # Mood logs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mood_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        session_id TEXT,
        mood TEXT NOT NULL,
        intensity INTEGER DEFAULT 5,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_synced INTEGER DEFAULT 0
    )
    ''')

    # Patient profile table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS patient_profile (
        user_id TEXT PRIMARY KEY,
        name TEXT,
        conditions TEXT
    )
    ''')
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
