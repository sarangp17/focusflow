import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "focusflow.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            window_title TEXT,
            url TEXT,
            tab_title TEXT,
            category TEXT,
            is_productive INTEGER NOT NULL DEFAULT 0,
            is_game INTEGER NOT NULL DEFAULT 0,
            is_neutral INTEGER NOT NULL DEFAULT 0,
            yt_video_id TEXT,
            yt_classification TEXT,
            start_time DATETIME NOT NULL,
            end_time DATETIME,
            duration_seconds INTEGER
        );

        CREATE TABLE IF NOT EXISTS yt_cache (
            video_id TEXT PRIMARY KEY,
            title TEXT,
            classification TEXT NOT NULL,
            cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS weekly_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_start DATE NOT NULL,
            week_end DATE NOT NULL,
            avg_productive_hours REAL,
            avg_nonproductive_hours REAL,
            avg_game_hours REAL,
            avg_neutral_hours REAL,
            productive_pct REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS app_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_or_domain TEXT NOT NULL UNIQUE,
            rule_type TEXT NOT NULL,
            category TEXT,
            subcategory TEXT
        );

        CREATE TABLE IF NOT EXISTS tab_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            tab_title TEXT,
            domain TEXT,
            is_productive INTEGER DEFAULT 0,
            visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            duration_seconds INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_time);
        CREATE INDEX IF NOT EXISTS idx_sessions_productive ON sessions(is_productive);
        CREATE INDEX IF NOT EXISTS idx_tab_history_domain ON tab_history(domain);
    """)

    seed_app_rules(cur)
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

def seed_app_rules(cur):
    productive_apps = [
        ("Microsoft Word", "always_productive", "office", "writing"),
        ("Microsoft Excel", "always_productive", "office", "spreadsheet"),
        ("Microsoft PowerPoint", "always_productive", "office", "presentation"),
        ("Notepad", "always_productive", "office", "writing"),
        ("Notepad++", "always_productive", "office", "writing"),
        ("Obsidian", "always_productive", "office", "writing"),
        ("Notion", "always_productive", "office", "productivity"),
        ("Code", "always_productive", "coding", "editor"),
        ("VSCode", "always_productive", "coding", "editor"),
        ("pycharm", "always_productive", "coding", "editor"),
        ("intellij", "always_productive", "coding", "editor"),
        ("android studio", "always_productive", "coding", "editor"),
        ("eclipse", "always_productive", "coding", "editor"),
        ("sublime text", "always_productive", "coding", "editor"),
        ("vim", "always_productive", "coding", "editor"),
        ("terminal", "always_productive", "coding", "terminal"),
        ("cmd", "always_productive", "coding", "terminal"),
        ("powershell", "always_productive", "coding", "terminal"),
        ("postman", "always_productive", "coding", "tool"),
        ("figma", "always_productive", "design", "ui"),
        ("photoshop", "always_productive", "design", "editing"),
        ("illustrator", "always_productive", "design", "editing"),
        ("premiere", "always_productive", "design", "video"),
        ("after effects", "always_productive", "design", "video"),
        ("davinci resolve", "always_productive", "design", "video"),
        ("blender", "always_productive", "design", "3d"),
        ("canva", "always_productive", "design", "ui"),
        ("zoom", "always_productive", "communication", "meeting"),
        ("slack", "always_productive", "communication", "team"),
        ("teams", "always_productive", "communication", "meeting"),
        ("github.com", "always_productive", "coding", "platform"),
        ("gitlab.com", "always_productive", "coding", "platform"),
        ("leetcode.com", "always_productive", "coding", "practice"),
        ("hackerrank.com", "always_productive", "coding", "practice"),
        ("codeforces.com", "always_productive", "coding", "practice"),
        ("codechef.com", "always_productive", "coding", "practice"),
        ("replit.com", "always_productive", "coding", "platform"),
        ("stackoverflow.com", "always_productive", "coding", "reference"),
        ("coursera.org", "always_productive", "study", "platform"),
        ("udemy.com", "always_productive", "study", "platform"),
        ("khanacademy.org", "always_productive", "study", "platform"),
        ("classroom.google.com", "always_productive", "study", "platform"),
        ("nptel.ac.in", "always_productive", "study", "platform"),
    ]

    nonproductive_apps = [
        ("netflix.com", "always_nonproductive", "ott", "streaming"),
        ("primevideo.com", "always_nonproductive", "ott", "streaming"),
        ("hotstar.com", "always_nonproductive", "ott", "streaming"),
        ("disneyplus.com", "always_nonproductive", "ott", "streaming"),
        ("sonyliv.com", "always_nonproductive", "ott", "streaming"),
        ("zee5.com", "always_nonproductive", "ott", "streaming"),
        ("jioCinema.com", "always_nonproductive", "ott", "streaming"),
        ("instagram.com", "always_nonproductive", "social", "social_media"),
        ("twitter.com", "always_nonproductive", "social", "social_media"),
        ("x.com", "always_nonproductive", "social", "social_media"),
        ("facebook.com", "always_nonproductive", "social", "social_media"),
        ("snapchat.com", "always_nonproductive", "social", "social_media"),
        ("tiktok.com", "always_nonproductive", "social", "social_media"),
        ("reddit.com", "always_nonproductive", "social", "social_media"),
        ("Netflix", "always_nonproductive", "ott", "streaming"),
        ("Steam", "always_game", "game", "launcher"),
        ("EpicGames", "always_game", "game", "launcher"),
        ("amazon.in", "always_nonproductive", "shopping", "ecommerce"),
        ("amazon.com", "always_nonproductive", "shopping", "ecommerce"),
        ("flipkart.com", "always_nonproductive", "shopping", "ecommerce"),
    ]

    neutral_apps = [
        ("Spotify", "neutral", "music", "streaming"),
        ("VLC", "neutral", "media", "player"),
        ("Windows Media Player", "neutral", "media", "player"),
        ("Calculator", "neutral", "utility", "tool"),
        ("whatsapp.com", "neutral", "communication", "messaging"),
        ("telegram.org", "neutral", "communication", "messaging"),
    ]

    all_rules = productive_apps + nonproductive_apps + neutral_apps
    cur.executemany("""
        INSERT OR IGNORE INTO app_rules (app_or_domain, rule_type, category, subcategory)
        VALUES (?, ?, ?, ?)
    """, all_rules)

if __name__ == "__main__":
    initialize_db()
    print("All tables created and seed data inserted.")