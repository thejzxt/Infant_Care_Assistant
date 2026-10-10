# database.py
import sqlite3

def init_db():
    conn = sqlite3.connect('infant_care.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            user_id TEXT PRIMARY KEY,
            last_intent TEXT,
            step_index INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

def get_session(user_id):
    conn = sqlite3.connect('infant_care.db')
    cursor = conn.cursor()
    cursor.execute("SELECT last_intent, step_index FROM sessions WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row if row else (None, 0)

def update_session(user_id, intent, step):
    conn = sqlite3.connect('infant_care.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO sessions (user_id, last_intent, step_index)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET last_intent=?, step_index=?
    ''', (user_id, intent, step, intent, step))
    conn.commit()
    conn.close()