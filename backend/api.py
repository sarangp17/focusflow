from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "focusflow.db")

# ─── Database helper ──────────────────────────────────────────
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ─── Today's stats ────────────────────────────────────────────
@app.route("/stats/today", methods=["GET"])
def stats_today():
    conn = get_connection()
    cur = conn.cursor()
    today = datetime.now().date().isoformat()

    cur.execute("""
        SELECT
            ROUND(SUM(CASE WHEN is_productive = 1 THEN duration_seconds ELSE 0 END) / 3600.0, 2) as productive_hours,
            ROUND(SUM(CASE WHEN is_productive = 0 AND is_game = 0 AND is_neutral = 0 THEN duration_seconds ELSE 0 END) / 3600.0, 2) as nonproductive_hours,
            ROUND(SUM(CASE WHEN is_game = 1 THEN duration_seconds ELSE 0 END) / 3600.0, 2) as game_hours,
            ROUND(SUM(CASE WHEN is_neutral = 1 THEN duration_seconds ELSE 0 END) / 3600.0, 2) as neutral_hours,
            ROUND(SUM(duration_seconds) / 3600.0, 2) as total_hours
        FROM sessions
        WHERE DATE(start_time) = ?
        AND duration_seconds IS NOT NULL
    """, (today,))

    row = cur.fetchone()

    productive = row["productive_hours"] or 0
    nonproductive = row["nonproductive_hours"] or 0
    game = row["game_hours"] or 0
    neutral = row["neutral_hours"] or 0
    total = row["total_hours"] or 0
    pct = round((productive / total * 100), 1) if total > 0 else 0

    # Top apps today
    cur.execute("""
        SELECT app_name,
               ROUND(SUM(duration_seconds) / 3600.0, 2) as hours,
               is_productive
        FROM sessions
        WHERE DATE(start_time) = ?
        AND duration_seconds IS NOT NULL
        GROUP BY app_name
        ORDER BY hours DESC
        LIMIT 8
    """, (today,))
    top_apps = [dict(r) for r in cur.fetchall()]

    # Top sites today
    cur.execute("""
        SELECT 
            REPLACE(REPLACE(url, 'https://', ''), 'http://', '') as site,
            ROUND(SUM(duration_seconds) / 3600.0, 2) as hours,
            is_productive
        FROM sessions
        WHERE DATE(start_time) = ?
        AND url IS NOT NULL
        AND duration_seconds IS NOT NULL
        GROUP BY site
        ORDER BY hours DESC
        LIMIT 8
    """, (today,))
    top_sites = [dict(r) for r in cur.fetchall()]

    conn.close()

    return jsonify({
        "date": today,
        "productive_hours": productive,
        "nonproductive_hours": nonproductive,
        "game_hours": game,
        "neutral_hours": neutral,
        "total_hours": total,
        "productive_pct": pct,
        "top_apps": top_apps,
        "top_sites": top_sites
    })

# ─── Weekly stats ─────────────────────────────────────────────
@app.route("/stats/weekly", methods=["GET"])
def stats_weekly():
    conn = get_connection()
    cur = conn.cursor()

    days = []
    for i in range(6, -1, -1):
        day = (datetime.now() - timedelta(days=i)).date().isoformat()
        cur.execute("""
            SELECT
                ROUND(SUM(CASE WHEN is_productive = 1 THEN duration_seconds ELSE 0 END) / 3600.0, 2) as productive_hours,
                ROUND(SUM(CASE WHEN is_productive = 0 AND is_game = 0 AND is_neutral = 0 THEN duration_seconds ELSE 0 END) / 3600.0, 2) as nonproductive_hours,
                ROUND(SUM(CASE WHEN is_game = 1 THEN duration_seconds ELSE 0 END) / 3600.0, 2) as game_hours
            FROM sessions
            WHERE DATE(start_time) = ?
            AND duration_seconds IS NOT NULL
        """, (day,))
        row = cur.fetchone()
        days.append({
            "date": day,
            "productive_hours": row["productive_hours"] or 0,
            "nonproductive_hours": row["nonproductive_hours"] or 0,
            "game_hours": row["game_hours"] or 0
        })

    conn.close()
    return jsonify({"weekly": days})

# ─── Per app breakdown ────────────────────────────────────────
@app.route("/stats/apps", methods=["GET"])
def stats_apps():
    conn = get_connection()
    cur = conn.cursor()
    today = datetime.now().date().isoformat()

    cur.execute("""
        SELECT app_name, category,
               ROUND(SUM(duration_seconds) / 3600.0, 2) as hours,
               is_productive, is_game, is_neutral
        FROM sessions
        WHERE DATE(start_time) = ?
        AND duration_seconds IS NOT NULL
        GROUP BY app_name
        ORDER BY hours DESC
    """, (today,))

    apps = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"apps": apps})

# ─── History (weekly summaries) ───────────────────────────────
@app.route("/stats/history", methods=["GET"])
def stats_history():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM weekly_summary
        ORDER BY week_start DESC
        LIMIT 12
    """)
    history = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"history": history})

# ─── Live status ──────────────────────────────────────────────
@app.route("/status", methods=["GET"])
def status():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT app_name, window_title, url, is_productive, category, start_time
        FROM sessions
        ORDER BY id DESC
        LIMIT 1
    """)
    row = cur.fetchone()
    conn.close()

    if row:
        return jsonify({
            "status": "tracking",
            "current_app": row["app_name"],
            "current_url": row["url"],
            "is_productive": row["is_productive"],
            "category": row["category"],
            "since": row["start_time"]
        })
    return jsonify({"status": "idle"})

# ─── Tab history ──────────────────────────────────────────────
@app.route("/stats/tabs", methods=["GET"])
def stats_tabs():
    conn = get_connection()
    cur = conn.cursor()
    today = datetime.now().date().isoformat()

    cur.execute("""
        SELECT app_name, url, tab_title, is_productive, category,
               ROUND(duration_seconds / 60.0, 1) as duration_minutes
        FROM sessions
        WHERE DATE(start_time) = ?
        AND url IS NOT NULL
        AND duration_seconds IS NOT NULL
        ORDER BY duration_seconds DESC
        LIMIT 20
    """, (today,))

    tabs = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify({"tabs": tabs})

# ─── Entry point ──────────────────────────────────────────────
if __name__ == "__main__":
    print("FocusFlow API running on http://localhost:5000")
    app.run(port=5000, debug=False)