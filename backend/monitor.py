from cleanup import start_cleanup_scheduler
from classifier import classify
import time
import sqlite3
import pygetwindow as gw
from pynput import mouse, keyboard
from datetime import datetime
import threading
import os
import asyncio
import websockets
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "focusflow.db")

# ─── Idle tracking ───────────────────────────────────────────
last_activity_time = time.time()
IDLE_THRESHOLD = 60  # seconds

def on_activity(*args):
    global last_activity_time
    last_activity_time = time.time()

def is_idle():
    return (time.time() - last_activity_time) > IDLE_THRESHOLD

def start_activity_listeners():
    mouse_listener = mouse.Listener(
        on_move=on_activity,
        on_click=on_activity,
        on_scroll=on_activity
    )
    keyboard_listener = keyboard.Listener(on_press=on_activity)
    mouse_listener.daemon = True
    keyboard_listener.daemon = True
    mouse_listener.start()
    keyboard_listener.start()

# ─── Database helpers ─────────────────────────────────────────
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# def get_rule(app_name, url=None):
#     conn = get_connection()
#     cur = conn.cursor()

#     # Check URL/domain first
#     if url:
#         domain = extract_domain(url)
#         cur.execute("""
#             SELECT rule_type, category, subcategory FROM app_rules
#             WHERE LOWER(app_or_domain) = LOWER(?)
#         """, (domain,))
#         row = cur.fetchone()
#         if row:
#             conn.close()
#             return row

#     # Check app name (partial match)
#     cur.execute("""
#         SELECT rule_type, category, subcategory FROM app_rules
#         WHERE LOWER(?) LIKE '%' || LOWER(app_or_domain) || '%'
#            OR LOWER(app_or_domain) LIKE '%' || LOWER(?) || '%'
#     """, (app_name, app_name))
#     row = cur.fetchone()
#     conn.close()
#     return row

def extract_domain(url):
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc.replace("www.", "")
        return domain
    except:
        return url

def open_session(app_name, window_title, url=None, tab_title=None):
    # Get classification
    result = classify(app_name=app_name, url=url, tab_title=tab_title)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO sessions
        (app_name, window_title, url, tab_title, category, is_productive, is_game, is_neutral,
         yt_video_id, yt_classification, start_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        app_name,
        window_title,
        url,
        tab_title,
        result["category"],
        result["is_productive"],
        result["is_game"],
        result["is_neutral"],
        result.get("yt_video_id"),
        result.get("yt_classification"),
        datetime.now().isoformat()
    ))
    session_id = cur.lastrowid
    conn.commit()
    conn.close()

    # Log what was classified
    status = "✓ PRODUCTIVE" if result["is_productive"] else (
             "🎮 GAME" if result["is_game"] else (
             "~ NEUTRAL" if result["is_neutral"] else "✗ NON-PRODUCTIVE"))
    print(f"[{status}] {app_name} → {url or window_title}")

    return session_id

def close_session(session_id):
    if session_id is None:
        return
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE sessions
        SET end_time = ?,
            duration_seconds = CAST((julianday(?) - julianday(start_time)) * 86400 AS INTEGER)
        WHERE id = ?
    """, (datetime.now().isoformat(), datetime.now().isoformat(), session_id))
    conn.commit()
    conn.close()

# ─── WebSocket server ─────────────────────────────────────────
latest_tab = {"url": None, "title": None}

async def websocket_handler(websocket):
    global latest_tab
    print("FocusFlow: Browser extension connected!")
    try:
        async for message in websocket:
            data = json.loads(message)
            latest_tab["url"] = data.get("url")
            latest_tab["title"] = data.get("title")
            print(f"Tab received: {data.get('url')}")
    except websockets.exceptions.ConnectionClosed:
        print("FocusFlow: Browser extension disconnected.")

async def start_websocket_server():
    async with websockets.serve(websocket_handler, "localhost", 8765):
        print("FocusFlow: WebSocket server running on port 8765")
        await asyncio.Future()

def run_websocket_in_thread():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(start_websocket_server())

# ─── Active window ────────────────────────────────────────────
def get_active_window():
    try:
        win = gw.getActiveWindow()
        if win is None:
            return None, None
        title = win.title

        # Extract browser name
        browsers = ["Google Chrome", "Brave", "Firefox", "Microsoft Edge", "Opera"]
        for browser in browsers:
            if browser in title:
                return title, browser

        # For other apps extract last part after " - "
        parts = title.split(" - ")
        app_name = parts[-1].strip() if len(parts) > 1 else title
        return title, app_name
    except:
        return None, None

# ─── Main monitor loop ────────────────────────────────────────
current_session_id = None
current_app = None

def monitor_loop():
    global current_session_id, current_app

    print("FocusFlow monitor started. Tracking your screen...")

    while True:
        if is_idle():
            if current_session_id is not None:
                print("Idle detected — pausing session.")
                close_session(current_session_id)
                current_session_id = None
                current_app = None
            time.sleep(2)
            continue

        window_title, app_name = get_active_window()

        if not app_name:
            time.sleep(2)
            continue

        # Use latest tab URL if active window is a browser
        url = None
        tab_title = None
        browsers = ["Google Chrome", "Brave", "Firefox", "Microsoft Edge", "Opera"]
        if app_name in browsers:
            url = latest_tab.get("url")
            tab_title = latest_tab.get("title")

        # App or URL switched — close old session, open new one
        current_key = f"{app_name}::{url}"
        if current_key != current_app:
            close_session(current_session_id)
            current_session_id = open_session(app_name, window_title, url, tab_title)
            current_app = current_key
            print(f"Tracking: {app_name} → {url or window_title}")

        time.sleep(2)

# ─── Entry point ──────────────────────────────────────────────
if __name__ == "__main__":
    start_activity_listeners()
    start_cleanup_scheduler()

    # Start WebSocket server in background thread
    ws_thread = threading.Thread(target=run_websocket_in_thread, daemon=True)
    ws_thread.start()

    monitor_loop()