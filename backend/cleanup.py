import sqlite3
import os
from datetime import datetime, timedelta, date

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "focusflow.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ─── Calculate and store weekly summaries ────────────────────
def summarize_weeks():
    conn = get_connection()
    cur = conn.cursor()

    today = date.today()

    # Get all distinct weeks that have session data older than today
    cur.execute("""
        SELECT 
            DATE(start_time, 'weekday 1', '-7 days') as week_start,
            DATE(start_time, 'weekday 1', '-1 day') as week_end,
            DATE(start_time) as day,
            SUM(CASE WHEN is_productive = 1 THEN duration_seconds ELSE 0 END) as prod_secs,
            SUM(CASE WHEN is_productive = 0 AND is_game = 0 AND is_neutral = 0 THEN duration_seconds ELSE 0 END) as nonprod_secs,
            SUM(CASE WHEN is_game = 1 THEN duration_seconds ELSE 0 END) as game_secs,
            SUM(CASE WHEN is_neutral = 1 THEN duration_seconds ELSE 0 END) as neutral_secs
        FROM sessions
        WHERE DATE(start_time) < ?
        AND duration_seconds IS NOT NULL
        GROUP BY week_start, day
    """, (today.isoformat(),))

    rows = cur.fetchall()

    # Group by week
    weeks = {}
    for row in rows:
        week_start = row["week_start"]
        week_end = row["week_end"]
        if week_start not in weeks:
            weeks[week_start] = {
                "week_end": week_end,
                "days": 0,
                "prod_secs": 0,
                "nonprod_secs": 0,
                "game_secs": 0,
                "neutral_secs": 0
            }
        weeks[week_start]["days"] += 1
        weeks[week_start]["prod_secs"] += row["prod_secs"] or 0
        weeks[week_start]["nonprod_secs"] += row["nonprod_secs"] or 0
        weeks[week_start]["game_secs"] += row["game_secs"] or 0
        weeks[week_start]["neutral_secs"] += row["neutral_secs"] or 0

    # Write weekly averages
    inserted = 0
    for week_start, data in weeks.items():
        days = data["days"]
        if days == 0:
            continue

        avg_prod = round((data["prod_secs"] / days) / 3600, 2)
        avg_nonprod = round((data["nonprod_secs"] / days) / 3600, 2)
        avg_game = round((data["game_secs"] / days) / 3600, 2)
        avg_neutral = round((data["neutral_secs"] / days) / 3600, 2)
        total = avg_prod + avg_nonprod + avg_game + avg_neutral
        pct = round((avg_prod / total * 100), 1) if total > 0 else 0

        cur.execute("""
            INSERT OR IGNORE INTO weekly_summary
            (week_start, week_end, avg_productive_hours, avg_nonproductive_hours,
             avg_game_hours, avg_neutral_hours, productive_pct)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (week_start, data["week_end"], avg_prod, avg_nonprod, avg_game, avg_neutral, pct))
        inserted += 1

    conn.commit()
    conn.close()
    print(f"[Cleanup] {inserted} weekly summaries written.")
    return inserted

# ─── Delete raw sessions older than 30 days ──────────────────
def delete_old_sessions():
    conn = get_connection()
    cur = conn.cursor()

    cutoff = (date.today() - timedelta(days=30)).isoformat()
    cur.execute("""
        DELETE FROM sessions
        WHERE DATE(start_time) < ?
    """, (cutoff,))

    deleted = cur.rowcount
    conn.commit()
    conn.close()
    print(f"[Cleanup] {deleted} old sessions deleted.")
    return deleted

# ─── Full cleanup run ─────────────────────────────────────────
def run_cleanup():
    print(f"[Cleanup] Starting monthly cleanup — {datetime.now()}")
    summarize_weeks()
    delete_old_sessions()
    print(f"[Cleanup] Done.")

# ─── Scheduler — runs once a day ─────────────────────────────
def start_cleanup_scheduler():
    import schedule
    import time
    import threading

    def job():
        run_cleanup()

    schedule.every().day.at("00:01").do(job)

    def run():
        while True:
            schedule.run_pending()
            time.sleep(60)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
    print("[Cleanup] Scheduler started — runs daily at midnight.")

# ─── Test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Running cleanup manually...")
    run_cleanup()