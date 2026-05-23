import sqlite3
import os
from pathlib import Path

DB_PATH = Path("data/swastha_sathi.db")

def get_db():
    os.makedirs(DB_PATH.parent, exist_ok=True)
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
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
