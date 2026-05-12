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
    
    conn.commit()
    
    # Migration: Add session_id to chat_history if missing
    try:
        cursor.execute("ALTER TABLE chat_history ADD COLUMN session_id TEXT")
        conn.commit()
    except sqlite3.OperationalError:
        # Column already exists
        pass
        
    conn.close()

if __name__ == "__main__":
    init_db()
