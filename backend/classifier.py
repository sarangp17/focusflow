import requests
import json
import sqlite3
import os
from urllib.parse import urlparse

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "focusflow.db")

# ─── Domain extractor ─────────────────────────────────────────
def extract_domain(url):
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.replace("www.", "")
        return domain.lower()
    except:
        return ""

def extract_youtube_id(url):
    try:
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(url)
        if "youtube.com" in parsed.netloc:
            qs = parse_qs(parsed.query)
            return qs.get("v", [None])[0]
        return None
    except:
        return None

# ─── Database helpers ─────────────────────────────────────────
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_rule(app_name=None, url=None):
    conn = get_connection()
    cur = conn.cursor()

    if url:
        domain = extract_domain(url)
        cur.execute("""
            SELECT rule_type, category, subcategory FROM app_rules
            WHERE LOWER(app_or_domain) = LOWER(?)
        """, (domain,))
        row = cur.fetchone()
        if row:
            conn.close()
            return dict(row)

    if app_name:
        cur.execute("""
            SELECT rule_type, category, subcategory FROM app_rules
            WHERE LOWER(?) LIKE '%' || LOWER(app_or_domain) || '%'
               OR LOWER(app_or_domain) LIKE '%' || LOWER(?) || '%'
        """, (app_name, app_name))
        row = cur.fetchone()
        if row:
            conn.close()
            return dict(row)

    conn.close()
    return None

def get_yt_cache(video_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT classification FROM yt_cache WHERE video_id = ?", (video_id,))
    row = cur.fetchone()
    conn.close()
    return row["classification"] if row else None

def save_yt_cache(video_id, title, classification):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT OR REPLACE INTO yt_cache (video_id, title, classification)
        VALUES (?, ?, ?)
    """, (video_id, title, classification))
    conn.commit()
    conn.close()

# ─── YouTube title scraper ────────────────────────────────────
def get_youtube_title(video_id):
    try:
        from bs4 import BeautifulSoup
        url = f"https://www.youtube.com/watch?v={video_id}"
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(resp.text, "html.parser")
        title_tag = soup.find("title")
        if title_tag:
            return title_tag.text.replace(" - YouTube", "").strip()
    except Exception as e:
        print(f"[Classifier] Failed to fetch YouTube title: {e}")
    return None

# ─── Ollama AI classifier ─────────────────────────────────────
def classify_with_ollama(title):
    try:
        prompt = f"""You are a productivity classifier. Based on the YouTube video title below, decide if it is PRODUCTIVE (educational, tutorial, lecture, coding, study, work-related, documentary, skill-building) or NONPRODUCTIVE (entertainment, music video, sports, comedy, movie, memes, gaming for fun, reaction videos).

Video title: "{title}"

Reply with exactly one word only: productive or nonproductive"""

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False
            },
            timeout=30
        )
        result = response.json()["response"].strip().lower()
        print(f"[Classifier] Ollama classified '{title}' → {result}")

        if "nonproductive" in result or "non-productive" in result or "non productive" in result:
            return "nonproductive"
        elif "productive" in result:
            return "productive"
        else:
            return "nonproductive"  # default to safe side
    except Exception as e:
        print(f"[Classifier] Ollama error: {e}")
        return "nonproductive"

# ─── Main classify function ───────────────────────────────────
def classify(app_name=None, url=None, tab_title=None):
    """
    Returns a dict:
    {
        is_productive: 0 or 1,
        is_game: 0 or 1,
        is_neutral: 0 or 1,
        category: str,
        subcategory: str,
        yt_video_id: str or None,
        yt_classification: str or None
    }
    """
    result = {
        "is_productive": 0,
        "is_game": 0,
        "is_neutral": 0,
        "category": "uncategorized",
        "subcategory": None,
        "yt_video_id": None,
        "yt_classification": None
    }

    # ── Step 1: Check if YouTube ──────────────────────────────
    if url and "youtube.com/watch" in url:
        video_id = extract_youtube_id(url)
        if video_id:
            result["yt_video_id"] = video_id

            # Check cache first
            cached = get_yt_cache(video_id)
            if cached:
                print(f"[Classifier] YouTube cache hit: {video_id} → {cached}")
                result["yt_classification"] = cached
                result["is_productive"] = 1 if cached == "productive" else 0
                result["category"] = "youtube"
                result["subcategory"] = cached
                return result

            # Scrape title and classify
            title = get_youtube_title(video_id) or tab_title or "Unknown"
            classification = classify_with_ollama(title)
            save_yt_cache(video_id, title, classification)

            result["yt_classification"] = classification
            result["is_productive"] = 1 if classification == "productive" else 0
            result["category"] = "youtube"
            result["subcategory"] = classification
            return result

    # ── Step 2: Check rule-based (URL domain) ─────────────────
    rule = get_rule(app_name=app_name, url=url)
    if rule:
        rule_type = rule["rule_type"]
        result["category"] = rule.get("category") or "uncategorized"
        result["subcategory"] = rule.get("subcategory")

        if rule_type == "always_productive":
            result["is_productive"] = 1
        elif rule_type == "always_game":
            result["is_game"] = 1
        elif rule_type == "neutral":
            result["is_neutral"] = 1
        # always_nonproductive → all stay 0
        return result

    # ── Step 3: Unknown — mark uncategorized ──────────────────
    return result


# ─── Test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Testing classifier...\n")

    tests = [
        ("Visual Studio Code", None, None),
        ("Brave", "https://www.netflix.com/browse", "Netflix"),
        ("Brave", "https://github.com/user/repo", "GitHub"),
        ("Brave", "https://www.youtube.com/watch?v=OPIi1__T7bA", "YouTube"),
        ("Brave", "https://www.amazon.in/product", "Amazon"),
        ("Brave", "https://leetcode.com/problems/two-sum", "LeetCode"),
    ]

    for app, url, title in tests:
        print(f"Testing: {app} | {url}")
        result = classify(app_name=app, url=url, tab_title=title)
        print(f"Result: {result}\n")